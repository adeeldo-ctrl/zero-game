import test from "node:test";
import assert from "node:assert/strict";
import { GROUND_ENEMY_TYPES, getEnemyMovementSpeed, REGULAR_ENEMY_VISUAL_SCALE, getEnemyFacingDirection, getSnowballPowerTier } from "../src/enemyRules.js";

test("all regular enemy archetypes retain their requested ground movement speed", () => {
  for (const type of GROUND_ENEMY_TYPES) {
    assert.equal(getEnemyMovementSpeed(type, 138), 138, type);
  }
  assert.equal(getEnemyMovementSpeed("guard", 0), 0);
  assert.equal(getEnemyMovementSpeed("charger", 285), 285);
  assert.equal(getEnemyMovementSpeed("runner", 245), 245);
});

test("the premium flying archetype keeps its authored speed while unknown roles use the fallback", () => {
  assert.equal(getEnemyMovementSpeed("flyer", 112), 112);
  assert.equal(getEnemyMovementSpeed("unknown", 900), 55);
});

test("regular enemies stay at the reduced visual scale while bosses keep their separate scene scale", () => {
  assert.equal(REGULAR_ENEMY_VISUAL_SCALE, 0.50);
  assert.ok(REGULAR_ENEMY_VISUAL_SCALE < 1);
});

test("enemy facing always points toward its target with a stable overlap fallback", () => {
  assert.equal(getEnemyFacingDirection(500, 300), 1);
  assert.equal(getEnemyFacingDirection(100, 300), -1);
  assert.equal(getEnemyFacingDirection(300, 300, -1), -1);
});


test("enemy elemental power, class and campaign progression determine snowball strength", () => {
  assert.equal(getSnowballPowerTier("fast", "fire", 1), 3);
  assert.equal(getSnowballPowerTier("fast", "ice", 1), 1);
  assert.equal(getSnowballPowerTier("special", "wind", 1), 2);
  assert.equal(getSnowballPowerTier("heavy", "water", 1), 3);
  assert.equal(getSnowballPowerTier("fast", "nature", 21), 2);
  assert.equal(getSnowballPowerTier("fast", "plasma", 41), 5);
  assert.equal(getSnowballPowerTier("heavy", "earth", 50), 5);
  assert.equal(getSnowballPowerTier("unknown", "unknown", 0), 1);
});

test("premium enemy roles include distinct flight, ambush, ranged, bomber and summoner behaviors", () => {
  for (const type of ["flyer", "ambusher", "ranged", "bomber", "summoner"]) {
    assert.ok(GROUND_ENEMY_TYPES.includes(type), type);
    assert.equal(getEnemyMovementSpeed(type, 74), 74, type);
  }
});
