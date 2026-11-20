import test from "node:test";
import assert from "node:assert/strict";
import { shouldHeroCollideWithPlatform, shouldDropThroughPlatform } from "../src/platformRules.js";

test("hero passes upward through every elevated platform", () => {
  assert.equal(shouldHeroCollideWithPlatform({
    velocityY: -470, heroBottom: 390, platformTop: 410,
  }), false);
});

test("hero lands on elevated platforms while descending from above", () => {
  assert.equal(shouldHeroCollideWithPlatform({
    velocityY: 180, heroBottom: 416, platformTop: 410,
  }), true);
});

test("DOWN plus JUMP drops through an elevated platform only while grounded", () => {
  assert.equal(shouldDropThroughPlatform({
    jumpPressed: true, downHeld: true, grounded: true, isGround: false,
  }), true);
  assert.equal(shouldDropThroughPlatform({
    jumpPressed: true, downHeld: false, grounded: true, isGround: false,
  }), false);
  assert.equal(shouldDropThroughPlatform({
    jumpPressed: true, downHeld: true, grounded: false, isGround: false,
  }), false);
});

test("permanent bottom ground remains solid and cannot be dropped through", () => {
  assert.equal(shouldHeroCollideWithPlatform({
    isGround: true, dropThroughActive: true, velocityY: 220,
    heroBottom: 540, platformTop: 518,
  }), true);
  assert.equal(shouldDropThroughPlatform({
    jumpPressed: true, downHeld: true, grounded: true, isGround: true,
  }), false);
});
