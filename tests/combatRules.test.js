import test from "node:test";
import assert from "node:assert/strict";
import { getBossPhase, isValidJumpStomp } from "../src/combatRules.js";

test("boss phases change at 60 percent and 25 percent health", () => {
  assert.equal(getBossPhase(100, 100), 1);
  assert.equal(getBossPhase(60, 100), 2);
  assert.equal(getBossPhase(25, 100), 3);
  assert.equal(getBossPhase(0, 100), 3);
  assert.equal(getBossPhase(0, 0), 1);
});

test("valid top-down jump stomps are detected without treating side contact as a stomp", () => {
  const topDown = { heroBottom: 300, enemyTop: 310, heroY: 270, enemyY: 340, velocityY: 180 };
  assert.equal(isValidJumpStomp(topDown), true);
  assert.equal(isValidJumpStomp({ ...topDown, heroY: 330 }), false);
  assert.equal(isValidJumpStomp({ ...topDown, velocityY: -180 }), false);
  assert.equal(isValidJumpStomp({ ...topDown, isBoss: true }), false);
});
