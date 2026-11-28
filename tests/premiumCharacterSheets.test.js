import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PREMIUM_ENEMY_ARCHETYPES, PREMIUM_BOSSES } from "../src/premiumCampaignData.js";

const root = resolve("src/assets/generated-character-sheets");
const manifest = JSON.parse(readFileSync(resolve(root, "manifest.json"), "utf8"));
const enemyStates = ["idle", "move", "attack", "hit", "defeat"];
const bossStates = ["entrance", "idle", "move", "attack-primary", "attack-secondary", "special", "hit", "phase-change", "defeat"];

test("all 32 approved enemy identities have their own complete animation sheet", () => {
  const enemies = manifest.characters.filter((entry) => entry.kind === "enemy");
  assert.equal(enemies.length, 32);
  assert.deepEqual(enemies.map((entry) => entry.id).sort(), PREMIUM_ENEMY_ARCHETYPES.map((entry) => entry.id).sort());
  assert.equal(new Set(enemies.map((entry) => entry.id)).size, 32);
  for (const entry of enemies) {
    const file = resolve(root, entry.file);
    assert.ok(existsSync(file), entry.id + " sheet is missing");
    const svg = readFileSync(file, "utf8");
    assert.equal((svg.match(/data-frame="/g) || []).length, 40, entry.id + " must contain 40 frames");
    for (const state of enemyStates) {
      assert.equal((svg.match(new RegExp('data-state="' + state + '"', "g")) || []).length, 8, entry.id + " " + state);
    }
  }
});

test("all five bosses have distinct nine-state animation sheets", () => {
  const bosses = manifest.characters.filter((entry) => entry.kind === "boss");
  assert.equal(bosses.length, 5);
  assert.deepEqual(bosses.map((entry) => entry.id).sort(), PREMIUM_BOSSES.map((entry) => entry.id).sort());
  assert.equal(new Set(bosses.map((entry) => entry.id)).size, 5);
  for (const entry of bosses) {
    const file = resolve(root, entry.file);
    assert.ok(existsSync(file), entry.id + " sheet is missing");
    const svg = readFileSync(file, "utf8");
    assert.equal((svg.match(/data-frame="/g) || []).length, 72, entry.id + " must contain 72 frames");
    for (const state of bossStates) {
      assert.equal((svg.match(new RegExp('data-state="' + state + '"', "g")) || []).length, 8, entry.id + " " + state);
    }
  }
});
