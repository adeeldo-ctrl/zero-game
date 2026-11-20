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
  const canvas = page.locator("#game-container canvas");
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

  if (runtimeErrors.length) {
    throw new Error(`Browser runtime errors:\n${runtimeErrors.join("\n")}`);
  }
  console.log("Browser smoke test passed: canvas, campaign entry, hero selection, gameplay inputs, and no uncaught runtime errors.");
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
