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


test("music and SFX volume settings persist between audio instances", async () => {
  const { createGameAudio } = await import("../src/gameAudio.js");
  const previousStorage = globalThis.localStorage;
  const values = new Map();
  globalThis.localStorage = {
    getItem: (key) => values.has(key) ? values.get(key) : null,
    setItem: (key, value) => values.set(key, String(value)),
  };
  try {
    const first = createGameAudio();
    first.setMusicVolume(0.25);
    first.setSfxVolume(0.5);
    first.setMusicEnabled(false);
    first.setSfxEnabled(false);
    const second = createGameAudio();
    assert.equal(second.getMusicVolume(), 0.25);
    assert.equal(second.getSfxVolume(), 0.5);
    assert.equal(second.isMusicEnabled(), false);
    assert.equal(second.isSfxEnabled(), false);
  } finally {
    if (previousStorage === undefined) delete globalThis.localStorage;
    else globalThis.localStorage = previousStorage;
  }
});
