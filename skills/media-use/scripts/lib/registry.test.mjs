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

test("heygen is the only external provider: no fal / elevenlabs / iconify remain", () => {
  for (const t of listTypes()) {
    for (const p of getProviders(t)) {
      assert.ok(
        /^heygen/.test(p.name) || p.name === "design_spec",
        `${t} lists non-heygen provider: ${p.name}`,
      );
    }
  }
});

test("voice: free HeyGen TTS is the sole provider", () => {
  const ps = getProviders("voice");
  assert.equal(ps[0].name, "heygen.tts", "free HeyGen TTS comes first");
  assert.equal(ps[0].paid ?? false, false, "HeyGen TTS is free (same credential as catalog)");
  assert.equal(typeof ps[0].generate, "function");
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
