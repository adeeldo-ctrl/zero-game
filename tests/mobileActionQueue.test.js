import test from "node:test";
import assert from "node:assert/strict";
import { MOBILE_ACTION_BUTTONS, enqueueMobileAction, consumeMobileAction } from "../src/mobileActionQueue.js";

test("mobile action queue accepts each pending action once", () => {
  const queue = [];
  assert.equal(enqueueMobileAction(queue, "special1"), true);
  assert.equal(enqueueMobileAction(queue, "special1"), false);
  assert.deepEqual(queue, ["special1"]);
});

test("mobile action queue stays bounded during rapid multi-touch input", () => {
  const queue = [];
  for (let index = 0; index < 20; index++) {
    enqueueMobileAction(queue, `action-${index}`, 6);
  }
  assert.equal(queue.length, 6);
  assert.deepEqual(queue, ["action-14", "action-15", "action-16", "action-17", "action-18", "action-19"]);
});

test("consuming an action removes only its matching queued entry", () => {
  const queue = ["jump", "special1", "special3"];
  assert.equal(consumeMobileAction(queue, "special1"), true);
  assert.equal(consumeMobileAction(queue, "special1"), false);
  assert.deepEqual(queue, ["jump", "special3"]);
});

test("mobile layout exposes EXTRA 1, EXTRA 2 and EXTRA 3 as separate buttons", () => {
  const extras = MOBILE_ACTION_BUTTONS.filter(({ action }) => action.startsWith("special"));
  assert.deepEqual(extras.map(({ action, label }) => [action, label]), [
    ["special1", "EXTRA 1"],
    ["special2", "EXTRA 2"],
    ["special3", "EXTRA 3"]
  ]);
  assert.equal(new Set(extras.map(({ x, y }) => `${x},${y}`)).size, 3);
});

test("all mobile action hit areas remain inside the 960x540 game viewport", () => {
  for (const button of MOBILE_ACTION_BUTTONS) {
    assert.ok(button.x - button.radius >= 0, `${button.action} left edge`);
    assert.ok(button.x + button.radius <= 960, `${button.action} right edge`);
    assert.ok(button.y - button.radius >= 0, `${button.action} top edge`);
    assert.ok(button.y + button.radius <= 540, `${button.action} bottom edge`);
  }
});
