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
  const canvas = page.locator("#game-container canvas").first();
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
      scene.spawnBoss();
      if (!scene.bossVisual?.active) throw new Error(`Boss visual failed: ${bossData.style}`);
      scene.boss?.destroy();
      scene.bossVisual?.destroy();
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

  if (runtimeErrors.length) {
    throw new Error(`Browser runtime errors:\n${runtimeErrors.join("\n")}`);
  }
  console.log("Browser smoke test passed: campaign, hero persistence, gameplay inputs, four boss visuals, all three transition directions, real stage advance, and no uncaught runtime errors.");
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
