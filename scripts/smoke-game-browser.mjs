import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";

const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
  cwd: process.cwd(),
  stdio: ["ignore", "pipe", "pipe"],
});
let serverOutput = "";
server.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
server.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch("http://127.0.0.1:4173");
      if (response.ok) { ready = true; break; }
    } catch { /* Vite is still starting. */ }
    if (server.exitCode !== null) break;
    await delay(500);
  }
  if (!ready) throw new Error(`Vite did not start. Server output:\n${serverOutput}`);

  browser = await chromium.launch({ headless: true, args: ["--no-sandbox", "--disable-dev-shm-usage"] });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(15000);
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.goto("http://127.0.0.1:4173", { waitUntil: "domcontentloaded" });
  const canvas = page.locator("#game-container canvas").last();
  await canvas.waitFor({ state: "visible", timeout: 15000 });
  const dimensions = await canvas.evaluate((node) => ({ width: node.width, height: node.height }));
  if (dimensions.width !== 960 || dimensions.height !== 540) {
    throw new Error(`Unexpected game canvas dimensions: ${JSON.stringify(dimensions)}`);
  }

  // Enter the campaign, choose one hero, and exercise live gameplay inputs.
  await page.mouse.click(480, 474);
  await delay(450);
  await page.mouse.click(120, 486);
  await delay(2600);
  await page.keyboard.press("Space");
  await page.keyboard.press("1");
  await page.keyboard.press("2");
  await page.keyboard.press("3");
  await page.keyboard.press("x");
  await delay(700);

  // Verify every equipped special move damages a live enemy through the real Phaser scene.
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene?.sys.isActive()) throw new Error("Game scene unavailable for special-move runtime test");
    scene.enemies.getChildren().forEach((enemy) => {
      enemy.getData("visual")?.destroy();
      enemy.getData("elementBall")?.destroy();
      enemy.destroy();
    });
    scene.projectiles.clear(true, true);
    scene.hero.setPosition(300, 450).setVelocity(0, 0);
    scene.facing = 1;
    // The initial keyboard smoke inputs may have started cooldowns; reset them
    // so this focused runtime assertion tests each move's actual hit behavior.
    scene.specialReadyAt = [0, 0, 0];
    const makeTarget = (x) => {
      const enemy = scene.enemies.create(x, 450, "enemy0");
      enemy.setCollideWorldBounds(true).setBounce(0);
      enemy.body.setAllowGravity(true);
      enemy.setData("frozen", false);
      enemy.setData("isTimeHunter", false);
      enemy.setData("aiType", "chaser");
      scene.createEnemyVisual(enemy, 0x8b4a3e, 0xffd36b);
      return enemy;
    };
    window.__ZERO_GAME_SPECIAL_TARGETS__ = [makeTarget(390), makeTarget(410), makeTarget(430)];
    scene.specialMove(0);
    const wave = scene.projectiles.getChildren().find((projectile) =>
      projectile.active && projectile.getData("specialAttack")
    );
    if (!wave) throw new Error("EXTRA 1 did not create its elemental wave projectile");
    // Invoke the same overlap callback used by Arcade Physics to make the
    // projectile-to-target damage assertion deterministic in headless Chromium.
    scene.hitEnemy(wave, window.__ZERO_GAME_SPECIAL_TARGETS__[0]);
    const waveTarget = window.__ZERO_GAME_SPECIAL_TARGETS__[0];
    const waveDamage = waveTarget.getData("visual")?.getData("damageParts");
    if (waveTarget.getData("hitCount") < 2 || !waveDamage ||
        waveDamage.hornR?.active || waveDamage.armR?.active) {
      throw new Error("EXTRA 1 wave did not apply the expected multi-hit damage through the hit pipeline");
    }
  });
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    const targets = window.__ZERO_GAME_SPECIAL_TARGETS__;
    scene.specialMove(1);
    const secondDamage = targets[1].getData("visual")?.getData("damageParts");
    if (targets[1].getData("hitCount") < 2 || !secondDamage ||
        secondDamage.hornR?.active || secondDamage.armR?.active) {
      throw new Error("EXTRA 2 did not apply its expected multi-hit damage");
    }
    scene.specialMove(2);
    const thirdDamage = targets[2].getData("visual")?.getData("damageParts");
    if (targets[2].getData("hitCount") < 2 || !thirdDamage ||
        thirdDamage.hornR?.active || thirdDamage.armR?.active) {
      throw new Error("EXTRA 3 did not apply its expected multi-hit damage");
    }
    if (scene.specialReadyAt.some((readyAt) => readyAt <= scene.time.now)) {
      throw new Error("Each of the three special moves must start its own cooldown");
    }
    targets.forEach((enemy) => {
      enemy.getData("visual")?.destroy();
      enemy.getData("elementBall")?.destroy();
      enemy.destroy();
    });
    const rollingEnemy = scene.enemies.create(360, 450, "enemy0");
    rollingEnemy.setCollideWorldBounds(true);
    rollingEnemy.body.setAllowGravity(false);
    rollingEnemy.setData("frozen", true);
    rollingEnemy.setData("rolling", false);
    rollingEnemy.setData("ballPalette", scene.getPowerPalette());
    rollingEnemy.setData("elementBall", scene.add.container(360, 450));
    const rollTarget = scene.enemies.create(410, 450, "enemy1");
    rollTarget.setCollideWorldBounds(true);
    rollTarget.body.setAllowGravity(true);
    rollTarget.setData("frozen", false);
    scene.hero.setPosition(300, 450);
    scene.facing = 1;
    if (!scene.kickNearestElementBall()) throw new Error("FIRE did not kick a nearby frozen elemental ball");
    if (!rollingEnemy.getData("rolling")) throw new Error("Kicked elemental ball did not enter rolling state");
    scene.updateRollingBall(rollingEnemy, 16);
    if (rollTarget.active) throw new Error("Rolling elemental ball did not hit and clear a nearby enemy");
    rollingEnemy.getData("elementBall")?.destroy();
    rollingEnemy.destroy();
  });

  // Exercise the integrated three-heart / three-chance damage and respawn flow.
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene?.sys.isActive()) throw new Error("Game scene unavailable for campaign lives test");
    scene.stageCleared = true;
    scene.enemies.getChildren().forEach((enemy) => enemy.getData("visual")?.destroy());
    scene.enemies.clear(true, true);
  });
  await delay(4200);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.stageCleared = false;
    scene.health = 3;
    scene.chances = 3;
    scene.chanceLossInProgress = false;
    scene.gameOver = false;
    const harmlessEnemy = { active: true, x: 500, getData: () => false };
    scene.lastDamage = -10000;
    scene.damageHero(scene.hero, harmlessEnemy);
    if (scene.health !== 2 || scene.chances !== 3) throw new Error("First hit did not remove exactly one heart");
    window.__ZERO_GAME_LIVES_TEST_ENEMY__ = harmlessEnemy;
  });
  await delay(700);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.lastDamage = -10000;
    scene.damageHero(scene.hero, window.__ZERO_GAME_LIVES_TEST_ENEMY__);
    if (scene.health !== 1 || scene.chances !== 3) throw new Error("Second hit did not remove exactly one heart");
  });
  await delay(700);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.lastDamage = -10000;
    scene.damageHero(scene.hero, window.__ZERO_GAME_LIVES_TEST_ENEMY__);
    if (scene.chances !== 2 || scene.health !== 3 || !scene.chanceLossInProgress) {
      throw new Error("Three lost hearts did not consume one chance and restore three hearts");
    }
    scene.lastDamage = -10000;
    scene.damageHero(scene.hero, window.__ZERO_GAME_LIVES_TEST_ENEMY__);
    if (scene.chances !== 2 || scene.health !== 3) {
      throw new Error("Repeated damage during chance-loss lock consumed another chance");
    }
  });
  await delay(1050);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (scene.chances !== 2 || scene.health !== 3 || scene.chanceLossInProgress ||
        !scene.hero.body.enable || scene.stageNumber !== 1 || scene.gameOver) {
      throw new Error("Campaign did not resume on the same stage with restored hearts");
    }
  });

  // Use the remaining two chances in the live scene and verify the true Game Over boundary.
  for (const expectedChances of [1, 0]) {
    await page.evaluate((expected) => {
      const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
      const harmlessEnemy = window.__ZERO_GAME_LIVES_TEST_ENEMY__;
      for (let hit = 0; hit < 3; hit++) {
        scene.lastDamage = -10000;
        scene.damageHero(scene.hero, harmlessEnemy);
      }
      if (scene.chances !== expected) {
        throw new Error("Expected " + expected + " remaining chance(s), received " + scene.chances);
      }
    }, expectedChances);
    if (expectedChances > 0) {
      await delay(1050);
      await page.evaluate(() => {
        const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
        if (scene.health !== 3 || scene.chanceLossInProgress || scene.gameOver) {
          throw new Error("A remaining chance did not restore three hearts and resume gameplay");
        }
      });
    }
  }
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene.gameOver || scene.chances !== 0 || scene.health !== 0) {
      throw new Error("The third lost chance did not end the campaign");
    }
    scene.startNewCampaign();
  });
  await page.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.sys.isActive() && scene.stageNumber === 1 && scene.stageConfig?.number === 1 &&
      !scene.gameStarted && !scene.gameOver && !scene.campaignActive && !scene.heroSelectionLocked &&
      scene.chances === 3 && scene.health === 3 && scene.hero?.body?.enable === true;
  }, undefined, { timeout: 10000 });
  await page.mouse.click(120, 486);
  await delay(1200);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene.campaignActive || !scene.heroSelectionLocked || scene.chances !== 3 ||
        scene.health !== 3 || scene.stageNumber !== 1 || !scene.hero.body.enable) {
      throw new Error("New campaign did not lock one hero selection and restore the full lives pool");
    }
  });

  // Exercise real Arcade Physics for pass-through, landing, drop-through and permanent floor.
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene?.sys.isActive()) throw new Error("Game scene unavailable for platform physics test");
    scene.stageCleared = true;
    scene.enemies.getChildren().forEach((enemy) => enemy.getData("visual")?.destroy());
    scene.enemies.clear(true, true);
  });
  // Let already-scheduled stage-one enemy entries expire while the stage is frozen.
  await delay(4200);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.stageCleared = false;
    scene.hero.setPosition(170, 462);
    scene.hero.setVelocity(0, -470);
    scene.jumpCount = 1;
    const platform = scene.platforms.getChildren().find((item) => item !== scene.groundPlatform && Math.abs(item.x - 170) < 2);
    if (!platform) throw new Error("Stage-one test platform not found");
    window.__ZERO_GAME_PLATFORM_TOP__ = platform.body.top;
  });
  await delay(450);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!(scene.hero.y < 420 && scene.hero.body.bottom <= window.__ZERO_GAME_PLATFORM_TOP__ + 16)) {
      throw new Error(`Hero did not pass upward through the elevated platform: y=${scene.hero.y}, bottom=${scene.hero.body.bottom}, platformTop=${window.__ZERO_GAME_PLATFORM_TOP__}, velocityY=${scene.hero.body.velocity.y}, worldPaused=${scene.physics.world.isPaused}`);
    }
  });
  await page.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.hero?.body?.blocked?.down === true;
  }, undefined, { timeout: 5000 });
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (Math.abs(scene.hero.body.bottom - window.__ZERO_GAME_PLATFORM_TOP__) > 8) {
      throw new Error("Hero did not land on the elevated platform from above");
    }
    scene.touch.down = true;
    scene.touch.jump = true;
  });
  await delay(80);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.touch.down = false;
    scene.touch.jump = false;
  });
  await page.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.hero?.body?.blocked?.down === true && scene.hero.y >= 455;
  }, undefined, { timeout: 5000 });
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (scene.hero.y < 455) throw new Error("DOWN + JUMP did not land on the permanent floor");
    scene.hero.setPosition(480, 462);
    scene.hero.setVelocity(0, 0);
    scene.jumpCount = 0;
  });
  await page.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.hero?.body?.blocked?.down === true;
  }, undefined, { timeout: 3000 });
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (Math.abs(scene.hero.y - 462) > 8) throw new Error("Hero did not settle on the permanent floor");
    scene.touch.down = true;
    scene.touch.jump = true;
  });
  await delay(80);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.touch.down = false;
    scene.touch.jump = false;
  });
  await delay(120);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!(scene.hero.y < 455)) {
      throw new Error("DOWN + JUMP incorrectly dropped the hero through the permanent ground instead of jumping upward");
    }
  });

  // Exercise the four requested boss visual archetypes without changing production game flow.
  await page.evaluate(() => {
    const game = window.__ZERO_GAME_TEST__;
    const scene = game?.scene.getScene("ZeroGameScene");
    if (!scene?.sys.isActive()) throw new Error("Development game test hook is unavailable");
    const originalStage = scene.stageConfig;
    const bosses = [
      { name: "Boxing Test", style: "boxing champion", color: 0x6259a7, element: "earth" },
      { name: "Agile Test", style: "agile claw acrobat", color: 0x8d405e, element: "wind" },
      { name: "Master Test", style: "disciplined martial arts master", color: 0xa64b3d, element: "fire" },
      { name: "Warlord Test", style: "final warlord", color: 0x493b76, element: "shadow" },
    ];
    for (const bossData of bosses) {
      scene.stageConfig = { ...originalStage, boss: { ...bossData, hp: 30, attack: "Test attack" } };
      scene.bossHealth = 30;
      scene.bossMaxHealth = 30;
      scene.bossDefeated = false;
      scene.spawnBoss();
      if (!scene.bossVisual?.active) throw new Error(`Boss visual failed: ${bossData.style}`);
      const expectedFirstAttack = bossData.style.includes("boxing") ? 0
        : bossData.style.includes("agile") ? 2
        : bossData.style.includes("master") ? 1 : 0;
      const boss = scene.boss;
      boss.body.blocked.down = true;
      boss.setData("wasAirborne", false);
      boss.setData("bossAttackState", "rest");
      boss.setData("bossAttackAt", 0);
      scene.updateBoss(boss, 16);
      if (boss.getData("bossAttackState") !== "tell" ||
          boss.getData("bossAttackKind") !== expectedFirstAttack) {
        throw new Error(`Boss attack pattern failed: ${bossData.style}`);
      }
      boss.setData("bossTellUntil", 0);
      scene.updateBoss(boss, 16);
      const state = boss.getData("bossAttackState");
      if (expectedFirstAttack === 0 && state !== "slam") {
        throw new Error(`Ground slam failed: ${bossData.style}`);
      }
      if (expectedFirstAttack === 1 && scene.bossShots.countActive() < 1) {
        throw new Error(`Energy volley failed: ${bossData.style}`);
      }
      if (expectedFirstAttack === 2 && state !== "dash") {
        throw new Error(`Dash attack failed: ${bossData.style}`);
      }
      boss.destroy();
      scene.bossVisual?.destroy();
      scene.bossShots.clear(true, true);
      scene.boss = null;
      scene.bossVisual = null;
    }
    scene.stageConfig = originalStage;
  });

  // Verify all three Snow Bros.-style stage entry directions complete and resume gameplay.
  for (const direction of ["down", "right", "left"]) {
    await page.evaluate((entryDirection) => {
      const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
      if (!scene?.sys.isActive()) throw new Error("Game scene unavailable during stage transition test");
      window.__ZERO_GAME_TRANSITION_DONE__ = false;
      scene.playStageEntryTransition(entryDirection, () => {
        scene.stageTransitionActive = false;
        scene.setMobileControlsVisible(true);
        window.__ZERO_GAME_TRANSITION_DONE__ = true;
      });
    }, direction);
    await page.waitForFunction(() => window.__ZERO_GAME_TRANSITION_DONE__ === true, { timeout: 7000 });
  }

  // Advance through the real scene-restart path and verify campaign identity/state persist.
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene) throw new Error("Game scene unavailable for campaign persistence test");
    window.__ZERO_GAME_PERSISTENCE__ = {
      heroId: scene.selectedHero?.id,
      chances: scene.chances,
      hearts: scene.health,
      landmarkSignature: scene.stageVariantLandmark?.getData("stageLandmarkSignature"),
    };
    scene.stageCleared = true;
    scene.stageAdvancePending = false;
    scene.advanceToNextStage();
  });
  await page.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.stageNumber === 2 && scene.stageConfig?.number === 2 &&
      scene.gameStarted && !scene.stageTransitionActive;
  }, undefined, { timeout: 10000 });
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    const before = window.__ZERO_GAME_PERSISTENCE__;
    if (scene.selectedHero?.id !== before.heroId) throw new Error("Selected hero changed during stage advance");
    if (scene.chances !== before.chances || scene.health !== before.hearts) {
      throw new Error("Campaign hearts/chances did not persist through stage advance");
    }
    if (!scene.heroSelectionLocked || !scene.campaignActive) {
      throw new Error("Hero selection/campaign lock did not persist");
    }
    const expectedStageOne = "world-0-stage-variant-0";
    const expectedStageTwo = "world-0-stage-variant-1";
    if (before.landmarkSignature !== expectedStageOne ||
        scene.stageVariantLandmark?.getData("stageLandmarkSignature") !== expectedStageTwo ||
        !scene.stageVariantLandmark.active) {
      throw new Error("Stage-specific landmark composition did not change with the stage");
    }
  });

  const campaignIdentity = await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return {
      heroId: scene.selectedHero?.id,
      chances: scene.chances,
      hearts: scene.health,
      landmarkSignatures: [
        window.__ZERO_GAME_PERSISTENCE__.landmarkSignature,
        scene.stageVariantLandmark?.getData("stageLandmarkSignature"),
      ],
    };
  });
  const landmarkSignatures = new Set(campaignIdentity.landmarkSignatures);
  if (landmarkSignatures.size !== 2) throw new Error("Stage 1 and stage 2 landmark compositions are not unique");

  // Walk the actual Phaser scene-restart path through every remaining stage.
  const visitedStages = [1, 2];
  for (let nextStage = 3; nextStage <= 50; nextStage++) {
    await page.evaluate(() => {
      const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
      if (!scene?.sys.isActive()) throw new Error("Game scene unavailable during 50-stage campaign sweep");
      scene.stageCleared = true;
      scene.stageAdvancePending = false;
      scene.advanceToNextStage();
    });
    await page.waitForFunction((number) => {
      const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
      return scene?.stageNumber === number && scene.stageConfig?.number === number &&
        scene.gameStarted && !scene.stageTransitionActive;
    }, nextStage, { timeout: 10000 });
    await page.waitForFunction(() => {
      const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
      return scene?.enemies?.getChildren().some((enemy) =>
        enemy.active && !enemy.getData("isBoss") && !enemy.getData("isTimeHunter")
      );
    }, undefined, { timeout: 3000 });
    const stageState = await page.evaluate(() => {
      const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
      return {
        number: scene.stageNumber,
        name: scene.stageConfig.name,
        world: scene.stageConfig.world,
        worldIndex: scene.stageConfig.worldIndex,
        variant: scene.stageConfig.background.stageVariant,
        landmarkSignature: scene.stageVariantLandmark?.getData("stageLandmarkSignature"),
        landmarkActive: !!scene.stageVariantLandmark?.active,
        platforms: scene.platforms.getChildren().length,
        boss: !!scene.stageConfig.boss,
        enemies: scene.enemies.getChildren().filter((enemy) =>
          enemy.active && !enemy.getData("isBoss") && !enemy.getData("isTimeHunter")
        ).map((enemy) => ({
          type: enemy.getData("aiType"),
          gravity: enemy.body.allowGravity,
          y: enemy.y,
        })),
        heroId: scene.selectedHero?.id,
        chances: scene.chances,
        hearts: scene.health,
        heroSelectionLocked: scene.heroSelectionLocked,
        campaignActive: scene.campaignActive,
      };
    });
    if (stageState.number !== nextStage || stageState.platforms !== 5) {
      throw new Error(`Stage ${nextStage} did not create its fixed arena and four elevated platforms`);
    }
    if (stageState.variant !== (nextStage - 1) % 5 ||
        stageState.worldIndex !== Math.floor((nextStage - 1) / 5)) {
      throw new Error(`Stage ${nextStage} theme/atmosphere identity is incorrect`);
    }
    const expectedLandmark = `world-${stageState.worldIndex}-stage-variant-${stageState.variant}`;
    if (!stageState.landmarkActive || stageState.landmarkSignature !== expectedLandmark) {
      throw new Error(`Stage ${nextStage} did not create its stage-specific landmark composition`);
    }
    landmarkSignatures.add(stageState.landmarkSignature);
    if (stageState.boss !== (nextStage % 10 === 0)) {
      throw new Error(`Stage ${nextStage} boss milestone is incorrect`);
    }
    if (stageState.heroId !== campaignIdentity.heroId ||
        stageState.chances !== campaignIdentity.chances ||
        stageState.hearts !== campaignIdentity.hearts ||
        !stageState.heroSelectionLocked || !stageState.campaignActive) {
      throw new Error(`Stage ${nextStage} lost campaign identity or remaining lives`);
    }
    if (stageState.enemies.some((enemy) => !enemy.gravity || enemy.type === "flyer")) {
      throw new Error(`Stage ${nextStage} spawned a non-grounded regular enemy`);
    }
    visitedStages.push(stageState.number);
  }
  if (new Set(visitedStages).size !== 50) throw new Error("The complete 50-stage campaign did not visit every unique stage");
  if (landmarkSignatures.size !== 50) {
    throw new Error(`Expected 50 unique world/stage landmark compositions, received ${landmarkSignatures.size}`);
  }

  if (runtimeErrors.length) {
    throw new Error(`Browser runtime errors:\n${runtimeErrors.join("\n")}`);
  }
  console.log("Browser smoke test passed: campaign, hero persistence, gameplay inputs, four boss visuals and attacks, three-heart/chance recovery, real platform physics, all four boss attacks, all three transition directions, all 50 real stage restarts, 50 unique stage landmark compositions, persistent campaign identity, grounded enemy checks, and no uncaught runtime errors.");
} finally {
  if (browser) await browser.close();
  if (server.exitCode === null) {
    server.kill("SIGTERM");
    await Promise.race([once(server, "exit").catch(() => {}), delay(1000)]);
  }
  if (server.exitCode === null) server.kill("SIGKILL");
  server.stdout.destroy();
  server.stderr.destroy();
}
