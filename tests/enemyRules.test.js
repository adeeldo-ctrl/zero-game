import test from "node:test";
import assert from "node:assert/strict";
import { GROUND_ENEMY_TYPES, getEnemyMovementSpeed } from "../src/enemyRules.js";

test("all regular enemy archetypes retain their requested ground movement speed", () => {
  for (const type of GROUND_ENEMY_TYPES) {
    assert.equal(getEnemyMovementSpeed(type, 138), 138, type);
  }
  assert.equal(getEnemyMovementSpeed("guard", 0), 0);
  assert.equal(getEnemyMovementSpeed("charger", 285), 285);
  assert.equal(getEnemyMovementSpeed("runner", 245), 245);
});

test("unknown or removed airborne archetypes cannot override the grounded fallback", () => {
  assert.equal(getEnemyMovementSpeed("flyer", 112), 55);
  assert.equal(getEnemyMovementSpeed("unknown", 900), 55);
});
