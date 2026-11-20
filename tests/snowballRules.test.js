import test from "node:test";
import assert from "node:assert/strict";
import {
  canKickElementBall,
  canRollingBallHitTarget,
  isRollingBallOutOfBounds,
} from "../src/snowballRules.js";

test("only a nearby frozen non-rolling enemy in front can be kicked", () => {
  const base = { active: true, frozen: true, rolling: false, dx: 80, dy: 20, facing: 1 };
  assert.equal(canKickElementBall(base), true);
  assert.equal(canKickElementBall({ ...base, frozen: false }), false);
  assert.equal(canKickElementBall({ ...base, rolling: true }), false);
  assert.equal(canKickElementBall({ ...base, active: false }), false);
  assert.equal(canKickElementBall({ ...base, dx: -80 }), false);
  assert.equal(canKickElementBall({ ...base, dx: 130 }), false);
  assert.equal(canKickElementBall({ ...base, dy: 100 }), false);
});

test("rolling snowball target collision uses the intended proximity envelope", () => {
  assert.equal(canRollingBallHitTarget(64, 72), true);
  assert.equal(canRollingBallHitTarget(65, 0), false);
  assert.equal(canRollingBallHitTarget(0, -73), false);
});

test("rolling snowballs are cleaned up after leaving the arena", () => {
  assert.equal(isRollingBallOutOfBounds(-91), true);
  assert.equal(isRollingBallOutOfBounds(1051), true);
  assert.equal(isRollingBallOutOfBounds(480), false);
});
