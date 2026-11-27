import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PREMIUM_ENEMY_ARCHETYPES, PREMIUM_BOSSES } from "../../premiumCampaignData.js";

const artDirection = JSON.parse(
  readFileSync(new URL("./reference-art-direction.json", import.meta.url), "utf8"),
);

const cropManifest = JSON.parse(
  readFileSync(new URL("./reference-crop-manifest.json", import.meta.url), "utf8"),
);
const availableCropRefs = new Set(
  cropManifest.crops.map((crop) => crop.file.replace(/\.png$/i, "")),
);

test("enemy reference art direction covers every campaign archetype exactly once", () => {
  const mapped = artDirection.regions.flatMap((region) =>
    region.enemies.map(([enemyId, cropRef]) => ({ regionId: region.id, enemyId, cropRef })),
  );
  const expectedIds = PREMIUM_ENEMY_ARCHETYPES.map((enemy) => enemy.id).sort();
  const actualIds = mapped.map((entry) => entry.enemyId).sort();

  assert.deepEqual(actualIds, expectedIds);
  assert.equal(new Set(actualIds).size, actualIds.length);
  const collageRefs = mapped.filter((entry) => !entry.cropRef.startsWith("custom-"));
  const customRefs = mapped.filter((entry) => entry.cropRef.startsWith("custom-"));
  assert.ok(collageRefs.every((entry) => /^\d{2}_[a-z0-9-]+$/.test(entry.cropRef)));
  assert.equal(new Set(collageRefs.map((entry) => entry.cropRef)).size, 40);
  assert.equal(customRefs.length, 5);
  assert.equal(artDirection.additionalOriginalDesigns.length, 5);
  assert.deepEqual(
    customRefs.map((entry) => entry.cropRef).sort(),
    artDirection.additionalOriginalDesigns.map((entry) => entry.id).sort(),
  );
  assert.ok(collageRefs.every((entry) => availableCropRefs.has(entry.cropRef)));
});

test("collage manifest is reference-only and contains 48 named crops", () => {
  assert.equal(cropManifest.cropCount, 48);
  assert.equal(cropManifest.crops.length, 48);
  assert.ok(cropManifest.crops.every((crop) => crop.status === "reference-crop-only"));
  assert.ok(cropManifest.crops.every((crop) => crop.animationFrames === 0));
});

test("boss art direction covers all five existing boss identities", () => {
  const expectedIds = PREMIUM_BOSSES.map((boss) => boss.id).sort();
  const actualIds = artDirection.bosses.map((boss) => boss.id).sort();

  assert.deepEqual(actualIds, expectedIds);
  assert.ok(artDirection.bosses.every((boss) => boss.direction.length > 30));
  const bossSources = artDirection.bosses.map((boss) => boss.sourceImage);
  assert.equal(new Set(bossSources).size, 5);
  assert.deepEqual(bossSources.sort(), ["02_green-ice-monster", "09_pumpkin", "34_blue-ogre-a", "40_armored-lizard", "47_ice-knight"]);
  assert.ok(artDirection.bosses.every((boss) => boss.productionFrameSize === "160x160"));
  assert.ok(bossSources.every((source) => availableCropRefs.has(source)));
});
