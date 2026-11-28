import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PREMIUM_ENEMY_ARCHETYPES, PREMIUM_BOSSES } from "../src/premiumCampaignData.js";

const assetsRoot = resolve("src/assets");
const approval = JSON.parse(readFileSync(resolve(assetsRoot, "enemies/prepared-reference/approved-artwork.json"), "utf8"));
const enemyFiles = approval.runtimeEnemyMapping;
const bossFiles = {
  gatekeeper: "bosses/prepared-reference/gatekeeper.png",
  "iron-comet": "bosses/prepared-reference/iron-comet.png",
  "gale-talon": "bosses/prepared-reference/gale-talon.png",
  suncrest: "bosses/prepared-reference/suncrest.png",
  "void-sovereign": "bosses/prepared-reference/void-sovereign.png",
};

function assertOriginalPng(relativePath) {
  const bytes = readFileSync(resolve(assetsRoot, relativePath));
  assert.ok(bytes.length > 24, relativePath + " is empty or truncated");
  assert.deepEqual(
    [...bytes.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
    relativePath + " must be a PNG file",
  );
  assert.ok(bytes.readUInt32BE(16) >= 32, relativePath + " width is too small");
  assert.ok(bytes.readUInt32BE(20) >= 32, relativePath + " height is too small");
}

test("all 32 enemy identities map one-to-one to different original PNG images", () => {
  const expectedIds = PREMIUM_ENEMY_ARCHETYPES.map(({ id }) => id).sort();
  const mappedIds = Object.keys(enemyFiles).sort();
  const mappedFiles = Object.values(enemyFiles);
  assert.deepEqual(mappedIds, expectedIds);
  assert.equal(mappedFiles.length, 32);
  assert.equal(new Set(mappedFiles).size, 32);
  assert.equal(approval.approved.length, 32);
  assert.deepEqual([...mappedFiles].sort(), [...approval.approved].sort());
  for (const file of mappedFiles) assertOriginalPng("enemies/prepared-reference/" + file);
});

test("all five bosses use separate original PNG artwork, not regular enemy images", () => {
  const expectedIds = PREMIUM_BOSSES.map(({ id }) => id).sort();
  assert.deepEqual(Object.keys(bossFiles).sort(), expectedIds);
  const enemySources = new Set(Object.values(enemyFiles));
  for (const [bossId, file] of Object.entries(bossFiles)) {
    assert.ok(!enemySources.has(file.split("/").pop()), bossId + " must not reuse an enemy PNG");
    assertOriginalPng(file);
  }
});
