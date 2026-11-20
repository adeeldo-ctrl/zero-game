import test from "node:test";
import assert from "node:assert/strict";
import { STAGES, getStage } from "../src/gameData.js";

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
      assert.ok(p.y >= 190 && p.y <= 420,
        `stage ${stage.number}: platform is within playable vertical range`);
    }
    signatures.add(JSON.stringify(stage.platforms));
  }
  assert.equal(signatures.size, 50, "all stage layouts must be distinct");
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

test("the final four milestone bosses cover the four requested original archetypes", () => {
  const styles = STAGES.filter((stage) => stage.boss).map((stage) => stage.boss.style);
  assert.ok(styles.some((style) => style.includes("boxing")));
  assert.ok(styles.some((style) => style.includes("agile")));
  assert.ok(styles.some((style) => style.includes("master")));
  assert.ok(styles.some((style) => style.includes("final")));
});
