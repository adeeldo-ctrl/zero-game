import test from "node:test";
import assert from "node:assert/strict";
import {
  canKickElementBall,
  canRollingBallHitTarget,
  isRollingBallOutOfBounds,
  calculateRollingBallMotion,
  ROLLING_BALL_MAX_SPEED,
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

test("rolling ball accelerates along a platform and its spin follows travel distance", () => {
  const slow = calculateRollingBallMotion({ velocityX: 390, direction: 1, deltaMs: 16, grounded: true });
  const fast = calculateRollingBallMotion({ velocityX: slow.velocityX, direction: 1, deltaMs: 100, grounded: true });
  assert.ok(slow.velocityX > 390);
  assert.ok(fast.velocityX > slow.velocityX);
  assert.ok(fast.velocityX <= ROLLING_BALL_MAX_SPEED);
  assert.ok(slow.rotationDelta > 0);
});

test("rolling ball keeps momentum while falling between platforms", () => {
  const falling = calculateRollingBallMotion({ velocityX: 520, direction: 1, deltaMs: 16, grounded: false });
  assert.ok(falling.velocityX > 500);
  assert.ok(falling.rotationDelta > 0);
});

test("rolling ball turns around after striking a side boundary", () => {
  const left = calculateRollingBallMotion({ velocityX: -600, direction: -1, deltaMs: 16, blockedLeft: true });
  const right = calculateRollingBallMotion({ velocityX: 600, direction: 1, deltaMs: 16, blockedRight: true });
  assert.ok(left.velocityX > 0);
  assert.ok(right.velocityX < 0);
});

test("rolling snowballs are cleaned up after leaving the arena", () => {
  assert.equal(isRollingBallOutOfBounds(-91), true);
  assert.equal(isRollingBallOutOfBounds(1051), true);
  assert.equal(isRollingBallOutOfBounds(480), false);
});
