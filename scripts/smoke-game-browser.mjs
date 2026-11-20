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
  }, { timeout: 5000 });
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
  }, { timeout: 5000 });
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
  }, { timeout: 3000 });
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
    };
    scene.stageCleared = true;
    scene.stageAdvancePending = false;
    scene.advanceToNextStage();
  });
  await page.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.stageNumber === 2 && scene.stageConfig?.number === 2 &&
      scene.gameStarted && !scene.stageTransitionActive;
  }, { timeout: 10000 });
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
  });

  const campaignIdentity = await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return {
      heroId: scene.selectedHero?.id,
      chances: scene.chances,
      hearts: scene.health,
    };
  });

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
    }, { timeout: 3000 });
    const stageState = await page.evaluate(() => {
      const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
      return {
        number: scene.stageNumber,
        name: scene.stageConfig.name,
        world: scene.stageConfig.world,
        worldIndex: scene.stageConfig.worldIndex,
        variant: scene.stageConfig.background.stageVariant,
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

  if (runtimeErrors.length) {
    throw new Error(`Browser runtime errors:\n${runtimeErrors.join("\n")}`);
  }
  console.log("Browser smoke test passed: campaign, hero persistence, gameplay inputs, four boss visuals and attacks, three-heart/chance recovery, real platform physics, all four boss attacks, all three transition directions, all 50 real stage restarts, persistent campaign identity, grounded enemy checks, and no uncaught runtime errors.");
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
