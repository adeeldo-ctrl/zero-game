import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PREMIUM_ENEMY_ARCHETYPES, PREMIUM_BOSSES } from "../../premiumCampaignData.js";

const artDirection = JSON.parse(
  readFileSync(new URL("./reference-art-direction.json", import.meta.url), "utf8"),
);

test("enemy reference art direction covers every campaign archetype exactly once", () => {
  const mapped = artDirection.regions.flatMap((region) =>
    region.enemies.map(([enemyId, cropRef]) => ({ regionId: region.id, enemyId, cropRef })),
  );
  const expectedIds = PREMIUM_ENEMY_ARCHETYPES.map((enemy) => enemy.id).sort();
  const actualIds = mapped.map((entry) => entry.enemyId).sort();

  assert.deepEqual(actualIds, expectedIds);
  assert.equal(new Set(actualIds).size, actualIds.length);
  assert.ok(mapped.every((entry) => /^\d{2}_[a-z0-9-]+$/.test(entry.cropRef)));
});

test("boss art direction covers all five existing boss identities", () => {
  const expectedIds = PREMIUM_BOSSES.map((boss) => boss.id).sort();
  const actualIds = artDirection.bosses.map((boss) => boss.id).sort();

  assert.deepEqual(actualIds, expectedIds);
  assert.ok(artDirection.bosses.every((boss) => boss.direction.length > 30));
});
