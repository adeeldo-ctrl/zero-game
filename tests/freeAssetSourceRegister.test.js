import test from "node:test";
import assert from "node:assert/strict";
import register from "../assets/FREE_ASSET_SOURCE_REGISTER.json" with { type: "json" };

test("free asset source register contains only permissive or public-domain art sources", () => {
  assert.equal(register.schemaVersion, 1);
  assert.ok(register.sources.length >= 4);
  for (const source of register.sources) {
    assert.ok(source.id);
    assert.ok(source.title);
    assert.ok(source.creator);
    assert.ok(source.url.startsWith("https://"));
    assert.ok(["CC0", "CC0-1.0"].includes(source.license));
    assert.ok(source.status);
    assert.ok(Array.isArray(source.contents));
    assert.ok(Array.isArray(source.animationStates));
  }
});

test("static and incomplete packs are never misrepresented as complete animation sheets", () => {
  const byId = Object.fromEntries(register.sources.map((source) => [source.id, source]));
  assert.deepEqual(byId["kenney-monster-builder"].animationStates, []);
  assert.deepEqual(byId["kenney-abstract-platformer"].animationStates, []);
  assert.equal(byId["spritecanvas-cc0-monsters"].status, "candidate-reviewed-not-imported");
  assert.ok(register.policy.includes("static image"));
});
