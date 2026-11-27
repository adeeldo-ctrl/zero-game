import test from "node:test";
import assert from "node:assert/strict";
import {
  BOSS_ATTENDANT_MAX_ACTIVE,
  BOSS_ATTENDANT_WAVE_SIZE,
  getBossAttendantWaveSize,
  BOSS_SIGNATURE_PROFILES,
  getBossSignatureProfile,
  BOSS_ANIMATION_PROFILES,
} from "../src/bossEncounterRules.js";

test("boss attendants arrive in pairs and never exceed eight active", () => {
  assert.equal(BOSS_ATTENDANT_WAVE_SIZE, 2);
  assert.equal(BOSS_ATTENDANT_MAX_ACTIVE, 8);
  assert.equal(getBossAttendantWaveSize(0), 2);
  assert.equal(getBossAttendantWaveSize(2), 2);
  assert.equal(getBossAttendantWaveSize(4), 2);
  assert.equal(getBossAttendantWaveSize(6), 2);
  assert.equal(getBossAttendantWaveSize(7), 0);
  assert.equal(getBossAttendantWaveSize(8), 0);
});

test("attendant wave sizing handles invalid and over-cap counts safely", () => {
  assert.equal(getBossAttendantWaveSize(-4), 2);
  assert.equal(getBossAttendantWaveSize(10), 0);
  assert.equal(getBossAttendantWaveSize(3, 8, 2), 2);
  assert.equal(getBossAttendantWaveSize(2, 7, 2), 2);
});

test("five bosses have unique signature attack shapes, pacing and patterns", () => {
  const profiles = Object.entries(BOSS_SIGNATURE_PROFILES);
  assert.equal(profiles.length, 5);
  assert.equal(new Set(profiles.map(([, profile]) => profile.signature)).size, 5);
  assert.equal(new Set(profiles.map(([, profile]) => profile.shape)).size, 5);
  assert.equal(new Set(profiles.map(([, profile]) => profile.speed)).size, 5);
  for (const [bossId, profile] of profiles) {
    assert.equal(getBossSignatureProfile(bossId), profile);
    assert.equal(profile.counts.length, 3);
    assert.ok(profile.counts[0] < profile.counts[1] && profile.counts[1] < profile.counts[2]);
  }
  assert.equal(getBossSignatureProfile("unknown").signature, "stonequake");
});

test("each boss has its own idle and strike animation frame order and timing", () => {
  const profiles = Object.values(BOSS_ANIMATION_PROFILES);
  assert.equal(profiles.length, 5);
  assert.equal(new Set(profiles.map((profile) => profile.idleFrames.join(","))).size, 5);
  assert.equal(new Set(profiles.map((profile) => profile.strikeFrames.join(","))).size, 5);
  assert.equal(new Set(profiles.map((profile) => profile.strikeRate)).size, 5);
  for (const profile of profiles) {
    assert.equal(profile.idleFrames.length, 4);
    assert.equal(profile.strikeFrames.length, 4);
    assert.ok(profile.idleFrames.every((frame) => frame >= 0 && frame <= 3));
    assert.ok(profile.strikeFrames.every((frame) => frame >= 0 && frame <= 3));
  }
});
