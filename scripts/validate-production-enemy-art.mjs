import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { PREMIUM_ENEMY_ARCHETYPES, PREMIUM_BOSSES } from "../src/premiumCampaignData.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../src/assets/generated-character-sheets");
const manifestPath = resolve(root, "manifest.json");
const errors = [];
const fail = (message) => errors.push(message);
if (!existsSync(manifestPath)) {
  console.error("Generated character sheets are missing. Run npm run art:generate first.");
  process.exit(1);
}
const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
const expectedEnemies = PREMIUM_ENEMY_ARCHETYPES.map(({ id }) => id).sort();
const expectedBosses = PREMIUM_BOSSES.map(({ id }) => id).sort();
const characters = Array.isArray(manifest.characters) ? manifest.characters : [];
const enemies = characters.filter((entry) => entry.kind === "enemy");
const bosses = characters.filter((entry) => entry.kind === "boss");
const enemyStates = ["idle", "move", "attack", "hit", "defeat"];
const bossStates = ["entrance", "idle", "move", "attack-primary", "attack-secondary", "special", "hit", "phase-change", "defeat"];
const seenIds = new Set();
const seenFiles = new Set();
const seenDesigns = new Set();
const seenHashes = new Set();

if (manifest.sheet?.width !== 1024 || manifest.sheet?.height !== 640) fail("enemy sheets must be 1024x640");
if (manifest.sheet?.frameWidth !== 128 || manifest.sheet?.frameHeight !== 128) fail("enemy frame cells must be 128x128");
if (manifest.sheet?.columns !== 8 || manifest.sheet?.rows !== 5 || manifest.sheet?.framesPerState !== 8) fail("enemy sheets must have eight frames across five animation rows");
if (manifest.bossSheet?.width !== 1024 || manifest.bossSheet?.height !== 1152) fail("boss sheets must be 1024x1152");
if (manifest.bossSheet?.frameWidth !== 128 || manifest.bossSheet?.frameHeight !== 128) fail("boss frame cells must be 128x128");
if (manifest.bossSheet?.columns !== 8 || manifest.bossSheet?.rows !== 9 || manifest.bossSheet?.framesPerState !== 8) fail("boss sheets must have eight frames across nine animation rows");
if (enemies.length !== 32) fail("expected exactly 32 regular enemy sheets, found " + enemies.length);
if (bosses.length !== 5) fail("expected exactly five boss sheets, found " + bosses.length);
if (PREMIUM_ENEMY_ARCHETYPES.length !== 32) fail("campaign data must contain exactly 32 active regular enemies");
if (PREMIUM_BOSSES.length !== 5) fail("campaign data must contain exactly five bosses");

function validate(entries, kind, states, width, height) {
  const ids = [];
  for (const entry of entries) {
    if (!entry || typeof entry.id !== "string" || !entry.id.trim()) {
      fail(kind + " entry has a missing id");
      continue;
    }
    ids.push(entry.id);
    if (seenIds.has(entry.id)) fail("duplicate character id: " + entry.id);
    seenIds.add(entry.id);
    if (typeof entry.file !== "string" || !entry.file.endsWith(".svg")) {
      fail(entry.id + ": file must be a relative SVG path");
      continue;
    }
    const filePath = resolve(root, entry.file);
    if (!filePath.startsWith(root + sep)) {
      fail(entry.id + ": file path escapes the generated art folder");
      continue;
    }
    if (seenFiles.has(entry.file)) fail(entry.id + ": sprite sheet file is reused");
    seenFiles.add(entry.file);
    if (!existsSync(filePath)) {
      fail(entry.id + ": generated SVG is missing");
      continue;
    }
    const svg = readFileSync(filePath, "utf8");
    if (!svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')) fail(entry.id + ": invalid SVG root");
    if (!svg.includes('width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + " " + height + '"')) {
      fail(entry.id + ": incorrect sprite-sheet dimensions");
    }
    const frameCount = (svg.match(/data-frame="/g) || []).length;
    if (frameCount !== states.length * 8) fail(entry.id + ": expected " + (states.length * 8) + " distinct frame cells, found " + frameCount);
    for (let row = 0; row < states.length; row += 1) {
      const state = states[row];
      const stateCount = (svg.match(new RegExp('data-state="' + state + '"', "g")) || []).length;
      if (stateCount !== 8) fail(entry.id + ": state " + state + " must contain eight authored frames");
      const range = entry.stateRanges?.[state];
      if (!Array.isArray(range) || range[0] !== row * 8 || range[1] !== row * 8 + 7) {
        fail(entry.id + ": state " + state + " has an invalid frame range");
      }
    }
    const design = JSON.stringify([entry.silhouette, entry.ornament, entry.palette]);
    if (!entry.silhouette || !entry.ornament || !Array.isArray(entry.palette) || entry.palette.length !== 4) {
      fail(entry.id + ": incomplete unique design metadata");
    }
    if (seenDesigns.has(design)) fail(entry.id + ": duplicates another character's silhouette, ornament and palette");
    seenDesigns.add(design);
    const hash = svg.length + ":" + svg.slice(0, 200) + ":" + svg.slice(-200);
    if (seenHashes.has(hash)) fail(entry.id + ": duplicate sprite-sheet content");
    seenHashes.add(hash);
  }
  if (new Set(ids).size !== ids.length) fail(kind + " IDs are not unique");
  return ids.sort();
}
const actualEnemies = validate(enemies, "enemy", enemyStates, 1024, 640);
const actualBosses = validate(bosses, "boss", bossStates, 1024, 1152);
if (JSON.stringify(actualEnemies) !== JSON.stringify(expectedEnemies)) fail("enemy sheet IDs do not match the approved 32 campaign identities");
if (JSON.stringify(actualBosses) !== JSON.stringify(expectedBosses)) fail("boss sheet IDs do not match all five campaign bosses");
if (characters.length !== 37) fail("the production pack must contain exactly 37 character sheets");

if (errors.length) {
  console.error("Production character-sheet validation failed with " + errors.length + " issue(s):");
  errors.forEach((error) => console.error("- " + error));
  process.exit(1);
}
console.log("Production art pack valid: 32 unique enemy sheets with five animation states and five unique boss sheets with nine animation states; eight frames per state.");
