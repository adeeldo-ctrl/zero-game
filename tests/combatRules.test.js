import test from "node:test";
import assert from "node:assert/strict";
import { getBossPhase } from "../src/combatRules.js";

test("boss phases change at 60 percent and 25 percent health", () => {
  assert.equal(getBossPhase(100, 100), 1);
  assert.equal(getBossPhase(60, 100), 2);
  assert.equal(getBossPhase(25, 100), 3);
  assert.equal(getBossPhase(0, 100), 3);
  assert.equal(getBossPhase(0, 0), 1);
});
