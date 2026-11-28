import test from "node:test";
import assert from "node:assert/strict";
import {
  PREMIUM_ENEMY_REGIONS,
  PREMIUM_ENEMY_ARCHETYPES,
  PREMIUM_BOSSES,
  getPremiumEnemyRegion,
  getPremiumStageEnemyRoster,
  getPremiumBoss,
} from "../src/premiumCampaignData.js";

const APPROVED_REGULAR_ENEMY_IDS = [
  "spirit-pouncer", "icicle-hopper", "jelly-vault", "bark-bruiser",
  "spore-caster", "caramel-mauler", "moss-scout", "vine-vault",
  "acorn-leaper", "candy-copter", "eclipse-summoner", "temple-breaker",
  "jade-shellback", "root-burrower", "mire-burrower", "licorice-sniper",
  "shadow-moss-scout", "iron-bark-bruiser", "golden-acorn-leaper",
  "prism-jelly-vault", "molten-caramel-mauler", "storm-candy-copter",
  "frostfire-icicle-hopper", "crystal-spore-caster", "thorn-root-burrower",
  "ember-spirit-pouncer", "toxic-vine-vault", "solar-jade-shellback",
  "plasma-mire-burrower", "void-licorice-sniper", "astral-eclipse-summoner",
  "frost-temple-breaker",
].sort();

const EXPECTED_REGION_STAGES = [
  ["emerald-forest", 1, 10],
  ["candy-orchard", 11, 20],
  ["frost-citadel", 21, 30],
  ["moonlit-jungle", 31, 40],
  ["starfall-realm", 41, 50],
];

test("active campaign contains exactly the 32 approved regular enemy identities", () => {
  assert.equal(PREMIUM_ENEMY_ARCHETYPES.length, 32);
  assert.deepEqual(
    PREMIUM_ENEMY_ARCHETYPES.map((enemy) => enemy.id).sort(),
    APPROVED_REGULAR_ENEMY_IDS,
  );
  assert.equal(new Set(PREMIUM_ENEMY_ARCHETYPES.map((enemy) => enemy.id)).size, 32);
});

test("each ten-stage region owns an exclusive regular-enemy pool", () => {
  assert.equal(PREMIUM_ENEMY_REGIONS.length, 5);
  const assigned = [];

  PREMIUM_ENEMY_REGIONS.forEach((region, index) => {
    const [expectedId, firstStage, lastStage] = EXPECTED_REGION_STAGES[index];
    assert.equal(region.id, expectedId);
    assert.deepEqual(region.stages, [firstStage, lastStage]);
    assert.ok(region.enemies.length > 0);
    assigned.push(...region.enemies.map((enemy) => enemy.id));

    for (let stage = firstStage; stage <= lastStage; stage += 1) {
      assert.equal(getPremiumEnemyRegion(stage).id, expectedId);
      const roster = getPremiumStageEnemyRoster(stage);
      assert.ok(roster.length >= 2);
      assert.ok(roster.every((enemy) => region.enemies.some((owned) => owned.id === enemy.id)));
    }
  });

  assert.equal(new Set(assigned).size, 32);
  assert.deepEqual(assigned.sort(), APPROVED_REGULAR_ENEMY_IDS);
});

test("five distinct bosses appear only at the end of their matching ten-stage region", () => {
  assert.equal(PREMIUM_BOSSES.length, 5);
  assert.deepEqual(
    PREMIUM_BOSSES.map((boss) => [boss.id, boss.stage]),
    [
      ["gatekeeper", 10],
      ["iron-comet", 20],
      ["gale-talon", 30],
      ["suncrest", 40],
      ["void-sovereign", 50],
    ],
  );
  for (const boss of PREMIUM_BOSSES) assert.equal(getPremiumBoss(boss.stage)?.id, boss.id);
  for (const stage of [1, 9, 11, 19, 21, 29, 31, 39, 41, 49]) {
    assert.equal(getPremiumBoss(stage), null);
  }
});
