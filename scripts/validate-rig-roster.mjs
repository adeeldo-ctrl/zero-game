import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const rosterPath = path.join(root, "src/assets/animations/rig-roster.json");
const roster = JSON.parse(fs.readFileSync(rosterPath, "utf8"));
const requiredEnemyClips = roster.requiredClips;
const requiredBossClips = roster.bossRequiredClips;
const failures = [];

function exists(relativePath, label) {
  const absolute = path.join(root, relativePath);
  if (!fs.existsSync(absolute)) failures.push("Missing " + label + ": " + relativePath);
  return absolute;
}

function validateCharacter(character, isBoss) {
  exists(character.source, "original source PNG");
  const rigPath = exists(character.rigFile, "Rigby2D skeleton JSON");
  const atlasPath = exists(character.atlas, "Rigby2D atlas");
  if (!fs.existsSync(rigPath) || !fs.existsSync(atlasPath)) return;

  let skeleton;
  try {
    skeleton = JSON.parse(fs.readFileSync(rigPath, "utf8"));
  } catch (error) {
    failures.push("Invalid skeleton JSON for " + character.id + ": " + error.message);
    return;
  }

  if (!Array.isArray(skeleton.bones) || skeleton.bones.length < 2) {
    failures.push(character.id + ": skeleton needs a root and at least one articulated bone");
  }
  if (!Array.isArray(skeleton.slots) || skeleton.slots.length === 0) {
    failures.push(character.id + ": skeleton has no artwork slots");
  }

  const attachments = (skeleton.skins || []).flatMap((skin) =>
    Object.values(skin.attachments || {}).flatMap((slot) => Object.values(slot || {}))
  );
  const mesh = attachments.find((attachment) => attachment.type === "mesh");
  if (!mesh || !Array.isArray(mesh.vertices) || !Array.isArray(mesh.uvs) || !Array.isArray(mesh.triangles)) {
    failures.push(character.id + ": original artwork is not exported as a weighted mesh");
  } else if (mesh.vertices.length <= mesh.uvs.length) {
    failures.push(character.id + ": mesh vertices are not bone-weighted");
  }

  if (skeleton.skeleton?.spine !== "4.2.0") {
    failures.push(character.id + ": expected Rigby2D skeleton JSON 4.2.0");
  }

  const animations = skeleton.animations && typeof skeleton.animations === "object"
    ? Object.keys(skeleton.animations)
    : [];
  const required = isBoss ? requiredBossClips : requiredEnemyClips;
  for (const clip of required) {
    if (!animations.includes(clip)) failures.push(character.id + ": missing animation clip " + clip);
  }

  const atlasText = fs.readFileSync(atlasPath, "utf8");
  const firstPage = atlasText.split(/\r?\n/).map((line) => line.trim()).find(Boolean);
  if (!firstPage) failures.push(character.id + ": atlas has no texture page entry");
  else exists(path.posix.join(path.posix.dirname(character.atlas), firstPage), "atlas texture page");
}

if (roster.status !== "rig-assets-generated-pending-visual-gameplay-verification") {
  failures.push("Rig roster status is not generated-pending-visual-gameplay-verification");
}
if (roster.enemies.length !== 32) failures.push("Expected 32 enemies, found " + roster.enemies.length);
if (roster.bosses.length !== 5) failures.push("Expected 5 bosses, found " + roster.bosses.length);

const all = [...roster.enemies, ...roster.bosses];
const ids = all.map((entry) => entry.id);
if (new Set(ids).size !== 37) failures.push("Enemy and boss IDs must be unique across all 37 characters");

for (const enemy of roster.enemies) validateCharacter(enemy, false);
for (const boss of roster.bosses) validateCharacter(boss, true);

if (failures.length) {
  console.error("Enemy/boss animation release gate is not satisfied:");
  for (const failure of failures) console.error("- " + failure);
  process.exitCode = 1;
} else {
  console.log("Rig structure gate passed: 32 weighted enemy meshes + 5 weighted boss meshes and required clips.");
}
