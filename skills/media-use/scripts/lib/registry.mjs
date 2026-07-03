// Provider registry — the v2 contract.
//
// Each media type maps to an ORDERED list of provider entries. Providers are
// tried in order; the first to return a non-null result wins, which keeps
// resolution deterministic (same request -> same provider -> same file ->
// reproducible renders). heygen-CLI is always first for the types it serves.
//
// An entry exposes any of three capability methods — search / generate /
// process — plus { name } and an enablement rule:
//   - always:true                  -> always enabled (heygen, design spec)
//   - envFlag:"MEDIA_USE_ENABLE_X" -> enabled only when that env flag is set
// The heygen CLI is the only external CLI media-use shells (third-party CLIs —
// fal/genmedia, elevenlabs-cli — were removed). Iconify is the one flag-gated
// seam: flipping MEDIA_USE_ENABLE_ICONIFY enables it with no code change.
// `gated` records which decision gates it, for diagnostics.

import { bgmProvider } from "./bgm-provider.mjs";
import { sfxProvider } from "./sfx-provider.mjs";
import { imageProvider, iconProvider } from "./image-provider.mjs";
import { brandProvider } from "./brand-provider.mjs";
import { heygenTtsGenerate } from "./voice-provider.mjs";

// Provider marker: `network` = hits a remote service (skipped by --local-only).
// HeyGen (catalog + TTS) uses the credential you already hold for the free
// catalog, so it is network-but-free.
const A = (name, caps) => ({ name, always: true, ...caps }); // always-on, local
const N = (name, caps) => ({ name, always: true, network: true, ...caps }); // remote, free
const G = (name, envFlag, gated, caps = {}) => ({ name, envFlag, gated, network: true, ...caps }); // remote, flag-gated

// heygen-CLI first (and currently only). All remote providers are skipped by
// --local-only. Iconify stays flag-gated (MEDIA_USE_ENABLE_ICONIFY) until approved.
const REGISTRY = {
  bgm: [N("heygen.audio.sounds", { search: bgmProvider.search })],
  sfx: [N("heygen.audio.sounds", { search: sfxProvider.search })],
  image: [N("heygen.asset.search", { search: imageProvider.search })],
  icon: [
    N("heygen.asset.search", { search: iconProvider.search }),
    G("iconify", "MEDIA_USE_ENABLE_ICONIFY", "B-Q2"), // 200k+ open icons, fallback after heygen
  ],
  voice: [N("heygen.tts", { generate: heygenTtsGenerate })],
  brand: [
    // Local design spec, not heygen — reads frame.md / design.md tokens.
    A("design_spec", { search: brandProvider.search }),
  ],
};

const isEnabled = (p) => p.always === true || (p.envFlag ? envSet(p.envFlag) : false);

function envSet(name) {
  const v = process.env[name];
  return v === "1" || v === "true";
}

function listFor(type) {
  const list = REGISTRY[type];
  if (!list) throw new Error(`unknown media type: ${type}`);
  return list;
}

// Add the computed `enabled` so callers/tests see a flat boolean.
const tag = (p) => ({ ...p, enabled: isEnabled(p) });

/** Ordered providers for a type. Disabled (flag-gated) entries are excluded unless asked for. */
export function getProviders(type, { includeDisabled = false } = {}) {
  const list = listFor(type).map(tag);
  return includeDisabled ? list : list.filter((p) => p.enabled);
}

/** All declared media types. */
export function listTypes() {
  return Object.keys(REGISTRY);
}

/**
 * Back-compat shim for the v1 single-provider API. Returns the first declared
 * provider for the type (tagged with `type`); throws for an unknown type.
 */
export function getProvider(type) {
  const first = listFor(type)[0] || {};
  return { ...tag(first), type };
}

/**
 * Run a capability across an explicit ordered provider list. Tries each in
 * order, returns the first non-null result, skips providers that don't expose
 * the capability. Pure over its input — the unit-testable core of the cascade.
 *
 * Offline guard: a `network` provider is skipped when `ctx.localOnly` is set,
 * leaving only the cache + local providers.
 */
export async function runProviders(providers, capability, intent, ctx) {
  for (const p of providers) {
    if (p.network && ctx?.localOnly) continue; // --local-only: cache + local only
    const fn = p[capability];
    if (typeof fn !== "function") continue;
    const res = await fn(intent, ctx);
    if (res) return res;
  }
  return null;
}

/** Run a capability over the enabled providers for a type (deterministic, heygen-first). */
export async function runCapability(type, capability, intent, ctx) {
  return runProviders(getProviders(type), capability, intent, ctx);
}
