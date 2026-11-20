import test from "node:test";
import assert from "node:assert/strict";
import {
  SPECIAL_MOVE_COOLDOWN_MS,
  getSpecialCooldownStatus,
  getBossPhase,
} from "../src/combatRules.js";

test("each special move uses a 1.45 second cooldown", () => {
  assert.equal(SPECIAL_MOVE_COOLDOWN_MS, 1450);
  assert.deepEqual(getSpecialCooldownStatus(0, 100), {
    ready: true, remainingMs: 0, remainingSeconds: 0,
  });
  assert.deepEqual(getSpecialCooldownStatus(2000, 1000), {
    ready: false, remainingMs: 1000, remainingSeconds: 1,
  });
  assert.equal(getSpecialCooldownStatus(2450, 1000).remainingSeconds, 2);
});

test("boss phases change at 60 percent and 25 percent health", () => {
  assert.equal(getBossPhase(100, 100), 1);
  assert.equal(getBossPhase(60, 100), 2);
  assert.equal(getBossPhase(25, 100), 3);
  assert.equal(getBossPhase(0, 100), 3);
  assert.equal(getBossPhase(0, 0), 1);
});
