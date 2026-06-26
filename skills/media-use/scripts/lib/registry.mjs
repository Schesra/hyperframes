// Provider registry — the v2 contract.
//
// Each media type maps to an ORDERED list of provider entries. Providers are
// tried in order; the first to return a non-null result wins, which keeps
// resolution deterministic (same request -> same provider -> same file ->
// reproducible renders). heygen-CLI is always first for the types it serves.
//
// An entry exposes any of three capability methods — search / generate /
// process — plus { name } and an enablement rule:
//   - always:true                  -> always enabled (heygen, local design spec)
//   - envFlag:"MEDIA_USE_ENABLE_X" -> enabled only when that env flag is set
// Flag-gated entries are decided-but-not-shipped seams: the `fal` aggregator and
// Iconify wait on the Bin bundling decision (B-Q2); voice (ElevenLabs / HeyGen
// TTS) waits on B-Q1. They are fully built — flipping the flag enables them with
// NO code change. `gated` records which decision gates them, for diagnostics.

import { bgmProvider } from "./bgm-provider.mjs";
import { sfxProvider } from "./sfx-provider.mjs";
import { imageProvider, iconProvider } from "./image-provider.mjs";
import { brandProvider } from "./brand-provider.mjs";
import { falGenerate } from "./aggregator-provider.mjs";
import { elevenlabsGenerate, heygenTtsGenerate } from "./voice-provider.mjs";

const A = (name, caps) => ({ name, always: true, ...caps }); // always-on (free)
const P = (name, caps) => ({ name, always: true, paid: true, ...caps }); // approved paid provider
const G = (name, envFlag, gated, caps = {}) => ({ name, envFlag, gated, ...caps }); // flag-gated

// heygen-first (free) for everything it serves; paid generators run only when the
// caller opts in (see runProviders / --allow-paid). fal + voice were approved by
// Bin (B-Q1/B-Q2) and are now live as paid providers. Iconify stays flag-gated —
// not yet built/approved.
const REGISTRY = {
  bgm: [
    A("heygen.audio.sounds", { search: bgmProvider.search }),
    P("fal", { generate: falGenerate("bgm") }),
  ],
  sfx: [
    A("heygen.audio.sounds", { search: sfxProvider.search }),
    P("fal", { generate: falGenerate("sfx") }),
  ],
  image: [
    A("heygen.asset.search", { search: imageProvider.search }),
    P("fal", { generate: falGenerate("image") }),
  ],
  icon: [
    A("heygen.asset.search", { search: iconProvider.search }),
    G("iconify", "MEDIA_USE_ENABLE_ICONIFY", "B-Q2"), // 200k+ open icons, fallback after heygen
  ],
  voice: [
    P("elevenlabs", { generate: elevenlabsGenerate }),
    P("heygen.tts", { generate: heygenTtsGenerate }),
  ],
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
 * Cost guard (X4): a `paid` provider runs only when `ctx.allowPaid` is set — so
 * free providers (heygen catalog) are always tried first and paid generation is
 * opt-in per call. The agent passes allowPaid when the user asked for it.
 */
export async function runProviders(providers, capability, intent, ctx) {
  for (const p of providers) {
    if (p.paid && !ctx?.allowPaid) continue; // free-first; paid is opt-in
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
