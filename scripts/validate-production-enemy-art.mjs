import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { PREMIUM_ENEMY_ARCHETYPES, PREMIUM_BOSSES } from "../src/premiumCampaignData.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../public/assets/premium-characters");
const manifestPath = resolve(root, "manifest.json");
const errors = [];
const fail = (message) => errors.push(message);
if (!existsSync(manifestPath)) {
  console.error("Generated premium character sheets are missing. Run npm run art:generate first.");
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const expectedEnemies = PREMIUM_ENEMY_ARCHETYPES.map(({ id }) => id).sort();
const expectedBosses = PREMIUM_BOSSES.map(({ id }) => id).sort();
const enemies = Array.isArray(manifest.enemies) ? manifest.enemies : [];
const bosses = Array.isArray(manifest.bosses) ? manifest.bosses : [];
const seenFiles = new Set();
const seenHashes = new Set();
const seenDesigns = new Set();
const enemyStates = ["idle", "move", "attack", "hit", "defeat"];
const bossStates = ["entrance", "idle", "move", "attack-primary", "attack-secondary", "special", "hit", "phase-change", "defeat"];

if (manifest.columns !== 8) fail("all sheets must use eight aligned frames per row");
if (enemies.length !== 32) fail("expected exactly 32 regular enemy sheets, got " + enemies.length);
if (bosses.length !== 5) fail("expected exactly five boss sheets, got " + bosses.length);
if (manifest.cellSize?.enemies !== 112 || manifest.cellSize?.bosses !== 144) fail("unexpected character cell dimensions");

function validate(entries, kind, states, cellSize) {
  const ids = [];
  for (const entry of entries) {
    if (!entry || typeof entry.id !== "string" || !entry.id.trim()) {
      fail(kind + " sheet has no valid id");
      continue;
    }
    ids.push(entry.id);
    if (typeof entry.file !== "string" || !entry.file.endsWith(".svg")) {
      fail(entry.id + ": file must be a relative SVG path");
      continue;
    }
    const path = resolve(root, entry.file);
    if (!path.startsWith(root + sep)) {
      fail(entry.id + ": file path escapes premium character folder");
      continue;
    }
    if (seenFiles.has(entry.file)) fail(entry.id + ": file is reused by another character");
    seenFiles.add(entry.file);
    if (!existsSync(path)) {
      fail(entry.id + ": generated sprite sheet is missing");
      continue;
    }
    const svg = readFileSync(path, "utf8");
    const expectedWidth = 8 * cellSize;
    const expectedHeight = states.length * cellSize;
    if (!svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')) fail(entry.id + ": invalid SVG root");
    if (!svg.includes('width="' + expectedWidth + '" height="' + expectedHeight + '" viewBox="0 0 ' + expectedWidth + " " + expectedHeight + '"')) {
      fail(entry.id + ": expected sheet dimensions " + expectedWidth + "x" + expectedHeight);
    }
    const totalFrames = (svg.match(/data-frame="/g) || []).length;
    if (totalFrames !== states.length * 8) fail(entry.id + ": expected " + (states.length * 8) + " authored frame cells, found " + totalFrames);
    for (let row = 0; row < states.length; row += 1) {
      const state = states[row];
      const count = (svg.match(new RegExp('data-state="' + state + '"', "g")) || []).length;
      if (count !== 8) fail(entry.id + ": state " + state + " must contain eight unique frames");
      const range = entry.states?.[state];
      if (!range || range.row !== row || range.start !== row * 8 || range.end !== row * 8 + 7) {
        fail(entry.id + ": incorrect frame mapping for state " + state);
      }
    }
    const design = JSON.stringify(entry.design || {});
    if (!design || design === "{}") fail(entry.id + ": missing character-specific design metadata");
    if (seenDesigns.has(design)) fail(entry.id + ": duplicate silhouette/ornament/palette profile");
    seenDesigns.add(design);
    const contentHash = svg.length + ":" + svg.slice(0, 180) + ":" + svg.slice(-180);
    if (seenHashes.has(contentHash)) fail(entry.id + ": duplicate sprite sheet content");
    seenHashes.add(contentHash);
  }
  if (new Set(ids).size !== ids.length) fail(kind + " sheet IDs must be unique");
  return ids.sort();
}
const actualEnemies = validate(enemies, "enemy", enemyStates, 112);
const actualBosses = validate(bosses, "boss", bossStates, 144);
if (JSON.stringify(actualEnemies) !== JSON.stringify(expectedEnemies)) fail("enemy sheets must match the approved 32 campaign identities exactly");
if (JSON.stringify(actualBosses) !== JSON.stringify(expectedBosses)) fail("boss sheets must match the five campaign bosses exactly");

if (errors.length) {
  console.error("Premium character sheet validation failed with " + errors.length + " issue(s):");
  errors.forEach((error) => console.error("- " + error));
  process.exit(1);
}
console.log("Premium art validated: 32 unique enemy sheets (40 frames each) and five distinct boss sheets (72 frames each).");
