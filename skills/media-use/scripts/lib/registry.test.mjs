import { strict as assert } from "node:assert";
import { test } from "node:test";
import { getProviders, getProvider, listTypes, runProviders, runCapability } from "./registry.mjs";

// --- registry shape -------------------------------------------------------

test("listTypes exposes the v2 media types", () => {
  const types = listTypes();
  for (const t of ["bgm", "sfx", "image", "icon", "voice", "brand"]) {
    assert.ok(types.includes(t), `missing type: ${t}`);
  }
});

test("heygen provider is first for every type it serves", () => {
  for (const t of ["bgm", "sfx", "image", "icon"]) {
    const first = getProviders(t)[0];
    assert.ok(first, `no enabled provider for ${t}`);
    assert.match(first.name, /^heygen/, `${t} first provider is ${first.name}`);
  }
});

test("getProviders filters disabled by default, includes them on request", () => {
  // icon still has a flag-gated provider (Iconify) — not yet approved.
  const enabled = getProviders("icon");
  const all = getProviders("icon", { includeDisabled: true });
  assert.ok(all.length > enabled.length, "expected a gated provider (iconify) to exist");
  assert.ok(
    enabled.every((p) => p.enabled),
    "enabled list must not contain disabled providers",
  );
});

test("still-gated providers carry a gate reason", () => {
  const disabled = getProviders("icon", { includeDisabled: true }).filter((p) => !p.enabled);
  assert.ok(disabled.length > 0, "iconify should still be gated");
  assert.ok(
    disabled.every((p) => typeof p.gated === "string" && p.gated.length > 0),
    "every disabled provider names why it is gated",
  );
});

test("fal is now an approved, enabled, paid provider after heygen (Bin: B-Q2)", () => {
  const ps = getProviders("bgm");
  assert.match(ps[0].name, /^heygen/, "heygen stays first (free)");
  const fal = ps.find((p) => p.name === "fal");
  assert.ok(fal, "fal is live");
  assert.equal(fal.enabled, true);
  assert.equal(fal.paid, true);
  assert.equal(typeof fal.generate, "function");
});

test("voice: HeyGen TTS is free + first, ElevenLabs is the paid fallback (Bin: B-Q1)", () => {
  const ps = getProviders("voice");
  assert.equal(ps[0].name, "heygen.tts", "free HeyGen TTS comes first");
  assert.equal(ps[0].paid ?? false, false, "HeyGen TTS is free (same credential as catalog)");
  assert.equal(typeof ps[0].generate, "function");
  const eleven = ps.find((p) => p.name === "elevenlabs");
  assert.ok(eleven && eleven.paid, "ElevenLabs is the paid fallback");
});

test("voice resolves by default (no --allow-paid) via free HeyGen TTS", async () => {
  // The regression M2 guarded against: voice must not be paid-only.
  const free = getProviders("voice").filter((p) => !p.paid);
  assert.ok(free.length > 0, "at least one free voice provider so resolve works by default");
});

test("getProvider returns the first provider with its type, throws for unknown", () => {
  const p = getProvider("bgm");
  assert.equal(p.type, "bgm");
  assert.equal(typeof p.search, "function");
  assert.throws(() => getProvider("unknown_type"), /unknown media type/);
});

test("getProviders throws for unknown type", () => {
  assert.throws(() => getProviders("nope"), /unknown media type/);
});

// --- deterministic capability execution (runProviders core) ---------------

test("runProviders calls providers in order and returns the first non-null", async () => {
  const calls = [];
  const providers = [
    {
      name: "a",
      enabled: true,
      search: async () => {
        calls.push("a");
        return null;
      },
    },
    {
      name: "b",
      enabled: true,
      search: async () => {
        calls.push("b");
        return { hit: "b" };
      },
    },
    {
      name: "c",
      enabled: true,
      search: async () => {
        calls.push("c");
        return { hit: "c" };
      },
    },
  ];
  const res = await runProviders(providers, "search", "x", {});
  assert.deepEqual(res, { hit: "b" });
  assert.deepEqual(calls, ["a", "b"], "must stop at first non-null, never call c");
});

test("runProviders skips providers missing the requested capability", async () => {
  const providers = [
    { name: "a", enabled: true /* no search */ },
    { name: "b", enabled: true, search: async () => ({ hit: "b" }) },
  ];
  const res = await runProviders(providers, "search", "x", {});
  assert.deepEqual(res, { hit: "b" });
});

test("runProviders returns null when no provider yields a result", async () => {
  const providers = [{ name: "a", enabled: true, search: async () => null }];
  assert.equal(await runProviders(providers, "search", "x", {}), null);
});

test("runCapability('bgm','process') is null — process slot is graceful when unfilled", async () => {
  assert.equal(await runCapability("bgm", "process", "x", {}), null);
});

// --- cost guard: paid providers are opt-in per call (free-first) -------------

test("runProviders skips paid providers unless ctx.allowPaid", async () => {
  let paidRan = false;
  const providers = [
    { name: "free", search: async () => null },
    {
      name: "paid",
      paid: true,
      search: async () => {
        paidRan = true;
        return { hit: "paid" };
      },
    },
  ];
  assert.equal(await runProviders(providers, "search", "x", {}), null, "paid skipped by default");
  assert.equal(paidRan, false);
  assert.deepEqual(await runProviders(providers, "search", "x", { allowPaid: true }), {
    hit: "paid",
  });
});

test("a free provider still wins over a paid one even when paid is allowed", async () => {
  const providers = [
    { name: "free", search: async () => ({ hit: "free" }) },
    { name: "paid", paid: true, search: async () => ({ hit: "paid" }) },
  ];
  assert.deepEqual(await runProviders(providers, "search", "x", { allowPaid: true }), {
    hit: "free",
  });
});

test("--local-only skips every network provider (even free remote ones)", async () => {
  let remoteRan = false;
  const providers = [
    {
      name: "heygen",
      network: true,
      search: async () => {
        remoteRan = true;
        return { hit: "net" };
      },
    },
    { name: "local", search: async () => ({ hit: "local" }) },
  ];
  assert.deepEqual(await runProviders(providers, "search", "x", { localOnly: true }), {
    hit: "local",
  });
  assert.equal(remoteRan, false, "the remote provider must not be called offline");
});
