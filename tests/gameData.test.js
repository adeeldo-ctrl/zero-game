import test from "node:test";
import assert from "node:assert/strict";
import { STAGES, getStage } from "../src/gameData.js";
import { PREMIUM_ENEMY_REGIONS, PREMIUM_ENEMY_ARCHETYPES, PREMIUM_BOSSES, PREMIUM_STAGE_MUSIC, getPremiumStageEnemyRoster, getPremiumEnemyFrameIndex } from "../src/premiumCampaignData.js";
import { getStageThemeSequence } from "../src/gameAudio.js";

test("campaign contains exactly 50 deterministic stages", () => {
  assert.equal(STAGES.length, 50);
  assert.deepEqual(getStage(1), STAGES[0]);
  assert.deepEqual(getStage(50), STAGES[49]);
});

test("every stage has its own authored multi-level platform layout", () => {
  const signatures = new Set();
  for (const stage of STAGES) {
    assert.equal(stage.platforms.length, 4, `stage ${stage.number}`);
    for (const p of stage.platforms) {
      assert.ok(p.x - p.width / 2 >= 0 && p.x + p.width / 2 <= 960,
        `stage ${stage.number}: platform stays inside arena`);
      assert.ok(p.y >= 160 && p.y <= 420,
        `stage ${stage.number}: platform is within playable vertical range`);
    }
    signatures.add(JSON.stringify(stage.platforms));
  }
  assert.equal(signatures.size, 50, "all stage layouts must be distinct");
});

test("all fifty stages use distinct deterministic enemy spawn lanes", () => {
  const signatures = new Set();
  for (const stage of STAGES) {
    assert.equal(stage.enemySpawnPositions.length, stage.enemyCount, `stage ${stage.number} spawn count`);
    assert.deepEqual(stage.enemySpawnPositions, [...stage.enemySpawnPositions].sort((a, b) => a - b));
    assert.ok(stage.enemySpawnPositions.every((x) => x >= 48 && x <= 912),
      `stage ${stage.number} spawn positions stay inside safe arena bounds`);
    assert.equal(new Set(stage.enemySpawnPositions).size, stage.enemySpawnPositions.length,
      `stage ${stage.number} has no duplicate spawn lane`);
    if (!stage.isBossStage) signatures.add(JSON.stringify(stage.enemySpawnPositions));
  }
  assert.equal(signatures.size, 45, "every normal stage has a distinct deterministic spawn pattern");
});

test("stage definitions do not change when read repeatedly", () => {
  const first = JSON.stringify(getStage(17));
  for (let i = 0; i < 20; i++) assert.equal(JSON.stringify(getStage(17)), first);
});


test("50 stages are distributed across ten distinct themed worlds", () => {
  assert.equal(new Set(STAGES.map((stage) => stage.world)).size, 10);
  for (let worldIndex = 0; worldIndex < 10; worldIndex++) {
    const worldStages = STAGES.filter((stage) => stage.worldIndex === worldIndex);
    assert.equal(worldStages.length, 5, `world ${worldIndex} has five stages`);
    assert.equal(new Set(worldStages.map((stage) => stage.name)).size, 5);
  }
});

test("every stage has a themed palette and a unique stage identity", () => {
  assert.equal(new Set(STAGES.map((stage) => stage.name)).size, 50);
  for (const stage of STAGES) {
    assert.ok(Number.isInteger(stage.worldIndex));
    assert.ok(stage.worldIndex >= 0 && stage.worldIndex < 10);
    assert.ok(stage.background.platform !== undefined);
    assert.ok(stage.background.accent !== undefined);
  }
});

test("the final four milestone bosses appear in the requested order", () => {
  const styles = [20, 30, 40, 50].map((number) => getStage(number).boss.style);
  assert.match(styles[0], /boxing/);
  assert.match(styles[1], /agile/);
  assert.match(styles[2], /master/);
  assert.match(styles[3], /final/);
});


import {
  CHANCES_PER_CAMPAIGN,
  HEARTS_PER_CHANCE,
  createCampaignLives,
  loseCampaignHeart,
  getStageTransitionDirection,
} from "../src/campaignRules.js";

test("a new campaign starts with exactly three chances and three hearts", () => {
  assert.deepEqual(createCampaignLives(), {
    chances: CHANCES_PER_CAMPAIGN,
    hearts: HEARTS_PER_CHANCE,
    gameOver: false,
  });
  assert.equal(CHANCES_PER_CAMPAIGN, 3);
  assert.equal(HEARTS_PER_CHANCE, 3);
});

test("each set of three lost hearts consumes exactly one chance", () => {
  let state = createCampaignLives();
  state = loseCampaignHeart(state);
  assert.deepEqual(state, { chances: 3, hearts: 2, gameOver: false, chanceLost: false });
  state = loseCampaignHeart(state);
  state = loseCampaignHeart(state);
  assert.deepEqual(state, { chances: 2, hearts: 3, gameOver: false, chanceLost: true });
  for (let i = 0; i < 3; i++) state = loseCampaignHeart(state);
  assert.deepEqual(state, { chances: 1, hearts: 3, gameOver: false, chanceLost: true });
  for (let i = 0; i < 3; i++) state = loseCampaignHeart(state);
  assert.deepEqual(state, { chances: 0, hearts: 0, gameOver: true, chanceLost: true });
  assert.deepEqual(loseCampaignHeart(state), { ...state, chanceLost: false });
});

test("all fifty stage transitions use a deterministic Snow Bros style entry direction", () => {
  for (let stage = 1; stage <= 50; stage++) {
    assert.equal(getStageTransitionDirection(stage), "up");
    assert.equal(getStageTransitionDirection(stage), getStageTransitionDirection(stage));
  }
});


test("all elevated platforms have a reachable route from the permanent floor", () => {
  for (const stage of STAGES) {
    const platforms = stage.platforms.map((platform) => ({
      left: platform.x - platform.width / 2,
      right: platform.x + platform.width / 2,
      y: platform.y,
    }));
    const reachable = new Set();
    let changed = true;
    while (changed) {
      changed = false;
      platforms.forEach((platform, index) => {
        if (reachable.has(index)) return;
        const sources = [
          { left: 0, right: 960, y: 518 },
          ...platforms.filter((_, sourceIndex) => reachable.has(sourceIndex)),
        ];
        const canReach = sources.some((source) => {
          const verticalRise = source.y - platform.y;
          const horizontalGap = Math.max(
            0,
            platform.left - source.right,
            source.left - platform.right,
          );
          return verticalRise > 0 && verticalRise <= 155 && horizontalGap <= 360;
        });
        if (canReach) {
          reachable.add(index);
          changed = true;
        }
      });
    }
    assert.equal(reachable.size, platforms.length,
      `stage ${stage.number}: every elevated platform must be reachable from the floor`);
  }
});

test("boss milestones are dedicated boss-only stages with unique arena layouts", () => {
  const bossStages = [10, 20, 30, 40, 50].map(getStage);
  assert.deepEqual(bossStages.map((stage) => stage.number), [10, 20, 30, 40, 50]);
  assert.deepEqual(bossStages.map((stage) => stage.boss.id), [
    "gatekeeper", "iron-comet", "gale-talon", "suncrest", "void-sovereign",
  ]);
  assert.equal(new Set(bossStages.map((stage) => stage.boss.id)).size, 5,
    "all five milestone bosses must have distinct identities");
  for (const stage of bossStages) {
    assert.equal(stage.stageType, "boss");
    assert.equal(stage.isBossStage, true);
    assert.equal(stage.enemyCount, 0);
    assert.deepEqual(stage.enemyTypes, []);
    assert.ok(stage.boss);
  }
  assert.equal(new Set(bossStages.map((stage) => JSON.stringify(stage.platforms))).size, 5);
  for (const stage of STAGES.filter((item) => !item.isBossStage)) {
    assert.equal(stage.stageType, "normal");
    assert.ok(stage.enemyCount > 0);
    assert.equal(stage.boss, null);
  }
});


test("campaign enemy powers rotate through all ten elemental identities", () => {
  const enemyPowers = new Set(STAGES.map((stage) => stage.enemyPowerType));
  assert.deepEqual(enemyPowers, new Set([
    "fire", "ice", "lightning", "water", "nature",
    "wind", "earth", "light", "shadow", "plasma",
  ]));
});


test("premium campaign defines five unique regional rosters of nine enemies", () => {
  assert.equal(PREMIUM_ENEMY_REGIONS.length, 5);
  const ids = PREMIUM_ENEMY_REGIONS.flatMap((region) => region.enemies.map((enemy) => enemy.id));
  assert.equal(ids.length, 45);
  assert.equal(new Set(ids).size, 45);
  for (let stage = 1; stage <= 50; stage++) {
    const roster = getPremiumStageEnemyRoster(stage);
    assert.ok(roster.length >= 2 && roster.length <= 9);
    assert.equal(new Set(roster.map((enemy) => enemy.id)).size, roster.length);
    assert.equal(getStage(stage).enemyRegionId, PREMIUM_ENEMY_REGIONS[Math.floor((stage - 1) / 10)].id);
  }
});

test("all five bosses and all 50 stage music cues have unique identities", () => {
  assert.equal(PREMIUM_BOSSES.length, 5);
  assert.equal(new Set(PREMIUM_BOSSES.map((boss) => boss.id)).size, 5);
  assert.equal(PREMIUM_STAGE_MUSIC.length, 50);
  assert.equal(new Set(PREMIUM_STAGE_MUSIC.map((track) => track.trackId)).size, 50);
  const sequences = Array.from({ length: 50 }, (_, index) => getStageThemeSequence(index + 1).join("-"));
  assert.equal(new Set(sequences).size, 50, "each stage has a distinct authored note sequence");
});

test("all 45 enemy archetypes have dedicated four-frame atlas ranges", () => {
  assert.equal(PREMIUM_ENEMY_ARCHETYPES.length, 45);
  const frameIndexes = PREMIUM_ENEMY_ARCHETYPES.map((enemy) => getPremiumEnemyFrameIndex(enemy.id));
  assert.deepEqual(frameIndexes, Array.from({ length: 45 }, (_, index) => index));
  assert.equal(new Set(frameIndexes).size, 45);
});
