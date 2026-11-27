import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PREMIUM_ENEMY_ARCHETYPES,
  PREMIUM_BOSSES,
} from "../src/premiumCampaignData.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../src/assets/enemies/production");
const manifestPath = resolve(root, "manifest.json");
const errors = [];

function fail(message) {
  errors.push(message);
}

function readPng(filePath, label) {
  if (!existsSync(filePath)) {
    fail(`${label}: missing PNG ${filePath}`);
    return null;
  }

  const bytes = readFileSync(filePath);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length < 33 || !bytes.subarray(0, 8).equals(signature)) {
    fail(`${label}: file is not a valid PNG`);
    return null;
  }
  if (bytes.toString("ascii", 12, 16) !== "IHDR") {
    fail(`${label}: PNG is missing its IHDR header`);
    return null;
  }

  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  const bitDepth = bytes[24];
  const colorType = bytes[25];
  if (!width || !height) fail(`${label}: PNG dimensions must be positive`);
  if (bitDepth !== 8) fail(`${label}: expected 8-bit PNG, got bit depth ${bitDepth}`);
  if (colorType !== 6) fail(`${label}: expected transparent RGBA PNG (color type 6), got ${colorType}`);
  return { width, height };
}

function validateSheet(entry, label, expectedFrameSize, requiredStates, seenIds, seenFiles) {
  if (!entry || typeof entry !== "object") {
    fail(`${label}: entry must be an object`);
    return;
  }
  if (typeof entry.id !== "string" || !entry.id.trim()) fail(`${label}: missing id`);
  else if (seenIds.has(entry.id)) fail(`${label}: duplicate id ${entry.id}`);
  else seenIds.add(entry.id);

  if (typeof entry.file !== "string" || !entry.file.endsWith(".png")) {
    fail(`${label}: file must be a relative .png path`);
    return;
  }
  const filePath = resolve(root, entry.file);
  if (!filePath.startsWith(root + sep)) {
    fail(`${label}: file path escapes the production art folder`);
    return;
  }
  if (seenFiles.has(entry.file)) fail(`${label}: PNG is reused by multiple characters (${entry.file})`);
  else seenFiles.add(entry.file);

  const frameWidth = entry.frameWidth;
  const frameHeight = entry.frameHeight;
  const columns = entry.columns;
  const rows = entry.rows;
  if (![frameWidth, frameHeight, columns, rows].every((value) => Number.isInteger(value) && value > 0)) {
    fail(`${label}: frameWidth, frameHeight, columns and rows must be positive integers`);
    return;
  }
  if (frameWidth !== expectedFrameSize || frameHeight !== expectedFrameSize) {
    fail(`${label}: expected ${expectedFrameSize}x${expectedFrameSize} frames`);
  }

  const png = readPng(filePath, label);
  if (png && (png.width !== frameWidth * columns || png.height !== frameHeight * rows)) {
    fail(`${label}: PNG is ${png.width}x${png.height}; expected ${frameWidth * columns}x${frameHeight * rows}`);
  }

  const frameCount = columns * rows;
  if (!entry.animations || typeof entry.animations !== "object") {
    fail(`${label}: animations object is required`);
    return;
  }
  for (const state of requiredStates) {
    const frames = entry.animations[state];
    if (!Array.isArray(frames) || frames.length === 0) {
      fail(`${label}: missing animation frames for "${state}"`);
      continue;
    }
    if (frames.some((frame) => !Number.isInteger(frame) || frame < 0 || frame >= frameCount)) {
      fail(`${label}: "${state}" contains a frame outside 0..${frameCount - 1}`);
    }
  }
}

if (!existsSync(manifestPath)) {
  console.error("Production enemy art is not installed: src/assets/enemies/production/manifest.json is missing.");
  console.error("Add the transparent animated PNG sheets and manifest, then run: npm run art:validate");
  process.exit(1);
}

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (error) {
  console.error(`Cannot parse production art manifest: ${error.message}`);
  process.exit(1);
}

if (manifest.version !== 1) fail("manifest.version must be 1");
if (!Array.isArray(manifest.enemies)) fail("manifest.enemies must be an array");
if (!Array.isArray(manifest.bosses)) fail("manifest.bosses must be an array");

const expectedEnemyIds = PREMIUM_ENEMY_ARCHETYPES.map(({ id }) => id).sort();
const expectedBossIds = PREMIUM_BOSSES.map(({ id }) => id).sort();
const enemyIds = new Set();
const bossIds = new Set();
const files = new Set();
const enemyStates = ["idle", "move", "attack", "hit", "defeat"];
const bossStates = PREMIUM_BOSSES[0].animations;

for (const entry of manifest.enemies || []) {
  validateSheet(entry, `enemy ${entry?.id || "(unknown)"}`, 128, enemyStates, enemyIds, files);
}
for (const entry of manifest.bosses || []) {
  validateSheet(entry, `boss ${entry?.id || "(unknown)"}`, 160, bossStates, bossIds, files);
}

const actualEnemyIds = [...enemyIds].sort();
const actualBossIds = [...bossIds].sort();
if (JSON.stringify(actualEnemyIds) !== JSON.stringify(expectedEnemyIds)) {
  fail("enemy roster must match all 45 campaign archetypes exactly");
}
if (JSON.stringify(actualBossIds) !== JSON.stringify(expectedBossIds)) {
  fail("boss roster must match all five campaign bosses exactly");
}
if ((manifest.enemies || []).length !== 45) fail("manifest must contain exactly 45 enemy sheets");
if ((manifest.bosses || []).length !== 5) fail("manifest must contain exactly five boss sheets");

if (errors.length) {
  console.error(`Production enemy art validation failed with ${errors.length} issue(s):`);
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Production enemy art pack is valid: 45 unique enemies, five unique bosses, transparent PNG sheets, and all required animation states.");
