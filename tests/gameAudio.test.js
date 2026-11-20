import test from "node:test";
import assert from "node:assert/strict";
import { clampAudioVolume } from "../src/gameAudio.js";

test("audio volume is clamped between mute and full volume", () => {
  assert.equal(clampAudioVolume(-1), 0);
  assert.equal(clampAudioVolume(0), 0);
  assert.equal(clampAudioVolume(0.7), 0.7);
  assert.equal(clampAudioVolume(1), 1);
  assert.equal(clampAudioVolume(4), 1);
  assert.equal(clampAudioVolume("0.25"), 0.25);
  assert.equal(clampAudioVolume("invalid"), 0);
});
