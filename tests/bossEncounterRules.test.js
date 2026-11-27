import test from "node:test";
import assert from "node:assert/strict";
import {
  BOSS_ATTENDANT_MAX_ACTIVE,
  BOSS_ATTENDANT_WAVE_SIZE,
  getBossAttendantWaveSize,
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
