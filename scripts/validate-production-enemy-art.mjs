import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
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

let manifest;
try {
  manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
} catch (error) {
  console.error(`Cannot parse generated character sheet manifest: ${error.message}`);
  process.exit(1);
}

const expectedEnemyIds = PREMIUM_ENEMY_ARCHETYPES.map(({ id }) => id).sort();
const expectedBossIds = PREMIUM_BOSSES.map(({ id }) => id).sort();
const characters = Array.isArray(manifest.characters) ? manifest.characters : [];
const enemies = characters.filter((entry) => entry.kind === "enemy");
const bosses = characters.filter((entry) => entry.kind === "boss");
const requiredStates = ["idle", "move", "attack", "hit", "defeat"];
const seenIds = new Set();
const seenSignatures = new Set();
const seenContent = new Set();

if (manifest.sheet?.width !== 1024 || manifest.sheet?.height !== 640) fail("sheet canvas must be exactly 1024x640");
if (manifest.sheet?.frameWidth !== 128 || manifest.sheet?.frameHeight !== 128) fail("each animation frame must be 128x128");
if (manifest.sheet?.columns !== 8 || manifest.sheet?.rows !== 5) fail("sheet must contain an 8-column by 5-row layout");
if (manifest.sheet?.framesPerState !== 8) fail("each animation state must have eight frames");
if (JSON.stringify([...manifest.states].sort()) !== JSON.stringify([...requiredStates].sort())) fail("manifest must include idle, move, attack, hit and defeat states");
if (enemies.length !== 32) fail(`expected exactly 32 regular enemy sheets, found ${enemies.length}`);
if (bosses.length !== 5) fail(`expected exactly five boss sheets, found ${bosses.length}`);
if (PREMIUM_ENEMY_ARCHETYPES.length !== 32) fail("campaign data must contain exactly 32 active regular enemy identities");

for (const entry of characters) {
  if (!entry || typeof entry.id !== "string" || !entry.id.trim()) {
    fail("every character sheet must have a non-empty id");
    continue;
  }
  if (seenIds.has(entry.id)) fail(`duplicate character id: ${entry.id}`);
  seenIds.add(entry.id);
  if (typeof entry.file !== "string" || !entry.file.endsWith(".svg")) {
    fail(`${entry.id}: file must be a relative SVG path`);
    continue;
  }
  const filePath = resolve(root, entry.file);
  if (!filePath.startsWith(root + sep)) {
    fail(`${entry.id}: file path escapes generated character sheet folder`);
    continue;
  }
  if (!existsSync(filePath)) {
    fail(`${entry.id}: missing generated SVG ${entry.file}`);
    continue;
  }
  const svg = readFileSync(filePath, "utf8");
  if (!svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg"')) fail(`${entry.id}: invalid SVG root`);
  if (!svg.includes('width="1024" height="640" viewBox="0 0 1024 640"')) fail(`${entry.id}: wrong SVG dimensions`);
      const frameCount = (svg.match(/<g transform="translate\(\d+ \d+\)">/g) || []).length;
  if (frameCount !== 40) fail(`${entry.id}: expected 40 separate frames, found ${frameCount}`);
  const contentHash = createHash("sha256").update(svg).digest("hex");
  if (seenContent.has(contentHash)) fail(`${entry.id}: sprite sheet duplicates another character sheet`);
  seenContent.add(contentHash);
  if (!Number.isInteger(entry.visualSignature) || seenSignatures.has(entry.visualSignature)) {
    fail(`${entry.id}: visual signature is missing or duplicated`);
  }
  seenSignatures.add(entry.visualSignature);
  if (!entry.stateRanges || requiredStates.some((state) => {
    const range = entry.stateRanges[state];
    return !Array.isArray(range) || range.length !== 2 || range[1] - range[0] !== 7;
  })) fail(`${entry.id}: every animation state must map to eight frames`);
}

const actualEnemyIds = enemies.map(({ id }) => id).sort();
const actualBossIds = bosses.map(({ id }) => id).sort();
if (JSON.stringify(actualEnemyIds) !== JSON.stringify(expectedEnemyIds)) fail("regular enemy sheets must match the approved 32 campaign identities exactly");
if (JSON.stringify(actualBossIds) !== JSON.stringify(expectedBossIds)) fail("boss sheets must match all five campaign bosses exactly");

if (errors.length) {
  console.error(`Generated character sheet validation failed with ${errors.length} issue(s):`);
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}
console.log("Character art pack validated: 32 unique enemy sheets + 5 unique boss sheets; 40 frames each; five animation states per character.");
