import test from "node:test";
import assert from "node:assert/strict";
import { enqueueMobileAction, consumeMobileAction } from "../src/mobileActionQueue.js";

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
