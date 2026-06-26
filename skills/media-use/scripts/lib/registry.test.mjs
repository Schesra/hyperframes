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
  const enabled = getProviders("bgm");
  const all = getProviders("bgm", { includeDisabled: true });
  assert.ok(all.length > enabled.length, "expected gated providers to exist");
  assert.ok(
    enabled.every((p) => p.enabled),
    "enabled list must not contain disabled providers",
  );
});

test("gated providers carry a gate reason (B-Q1 / B-Q2 / U-id)", () => {
  const all = getProviders("bgm", { includeDisabled: true });
  const disabled = all.filter((p) => !p.enabled);
  assert.ok(disabled.length > 0, "bgm should have a disabled aggregator/local slot");
  assert.ok(
    disabled.every((p) => typeof p.gated === "string" && p.gated.length > 0),
    "every disabled provider names why it is gated",
  );
});

test("the aggregator slot exists for bgm but is disabled (B-Q2)", () => {
  const all = getProviders("bgm", { includeDisabled: true });
  const agg = all.find((p) => p.name === "fal");
  assert.ok(agg, "fal aggregator slot must be present (built, not shipped)");
  assert.equal(agg.enabled, false);
  assert.equal(agg.gated, "B-Q2");
});

test("voice generation is gated on B-Q1 (no enabled provider yet)", () => {
  assert.deepEqual(getProviders("voice"), []);
  const all = getProviders("voice", { includeDisabled: true });
  assert.ok(all.some((p) => p.gated === "B-Q1"));
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

// --- flip-to-enable: Bin's answer is a flag, not a code change ----------------

function withEnv(name, value, fn) {
  const prev = process.env[name];
  process.env[name] = value;
  try {
    return fn();
  } finally {
    if (prev === undefined) delete process.env[name];
    else process.env[name] = prev;
  }
}

test("MEDIA_USE_ENABLE_FAL=1 enables the fal aggregator after heygen — no code change", () => {
  withEnv("MEDIA_USE_ENABLE_FAL", "1", () => {
    const ps = getProviders("bgm");
    assert.equal(ps.length, 2);
    assert.match(ps[0].name, /^heygen/, "heygen stays first");
    assert.equal(ps[1].name, "fal");
    assert.equal(ps[1].enabled, true);
    assert.equal(typeof ps[1].generate, "function", "fal exposes generate when enabled");
  });
});

test("MEDIA_USE_ENABLE_ELEVENLABS=1 enables voice generation (B-Q1 flip)", () => {
  assert.deepEqual(getProviders("voice"), [], "off by default");
  withEnv("MEDIA_USE_ENABLE_ELEVENLABS", "1", () => {
    const ps = getProviders("voice");
    assert.ok(ps.some((p) => p.name === "elevenlabs" && typeof p.generate === "function"));
  });
});
