// Provider registry — the v2 contract.
//
// Each media type maps to an ORDERED list of provider entries. Providers are
// tried in order; the first to return a non-null result wins, which keeps
// resolution deterministic (same request -> same provider -> same file ->
// reproducible renders). heygen-CLI is always first for the types it serves.
//
// An entry exposes any of three capability methods — search / generate /
// process — plus { name, enabled, gated? }. Disabled entries are the seams for
// work that is decided-but-not-shipped: the `fal` aggregator and Iconify wait on
// the Bin bundling decision (B-Q2); voice generation waits on B-Q1; the local
// slot is filled by U2/U4. They live in the registry (so enabling them later is
// a flag flip, not a refactor) but are skipped by getProviders() until enabled.

import { bgmProvider } from "./bgm-provider.mjs";
import { sfxProvider } from "./sfx-provider.mjs";
import { imageProvider, iconProvider } from "./image-provider.mjs";
import { brandProvider } from "./brand-provider.mjs";

const on = (name, caps) => ({ name, enabled: true, ...caps });
const off = (name, gated, caps = {}) => ({ name, enabled: false, gated, ...caps });

// heygen-first for everything it serves. Aggregator (fal) / Iconify / local /
// voice slots are present but gated — see the file header.
const REGISTRY = {
  bgm: [
    on("heygen.audio.sounds", { search: bgmProvider.search }),
    off("fal", "B-Q2"), // aggregator music generation
    off("local", "U2"), // local model generation
  ],
  sfx: [
    on("heygen.audio.sounds", { search: sfxProvider.search }),
    off("fal", "B-Q2"),
    off("local", "U2"),
  ],
  image: [
    on("heygen.asset.search", { search: imageProvider.search }),
    off("fal", "B-Q2"), // aggregator image generation (Flux)
    off("local", "U2"),
  ],
  icon: [
    on("heygen.asset.search", { search: iconProvider.search }),
    off("iconify", "B-Q2"), // 200k+ open icons, fallback after heygen
  ],
  voice: [
    off("heygen.tts", "B-Q1"), // voice/TTS generation gated on Bin
    off("local", "U2"),
  ],
  brand: [
    // Local design spec, not heygen — reads frame.md / design.md tokens.
    on("design_spec", { search: brandProvider.search }),
  ],
};

function listFor(type) {
  const list = REGISTRY[type];
  if (!list) throw new Error(`unknown media type: ${type}`);
  return list;
}

/** Ordered providers for a type. Disabled (gated) entries are excluded unless asked for. */
export function getProviders(type, { includeDisabled = false } = {}) {
  const list = listFor(type);
  return includeDisabled ? list.slice() : list.filter((p) => p.enabled);
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
  return { ...first, type };
}

/**
 * Run a capability across an explicit ordered provider list. Tries each in
 * order, returns the first non-null result, skips providers that don't expose
 * the capability. Pure over its input — the unit-testable core of the cascade.
 */
export async function runProviders(providers, capability, intent, ctx) {
  for (const p of providers) {
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
