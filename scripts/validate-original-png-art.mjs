import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve("src/assets");
const errors = [];
const enemyFiles = [
  "enemies/prepared-reference/03_red-horn-demon.png",
  "enemies/prepared-reference/05_winter-chick.png",
  "enemies/prepared-reference/07_pink-octopus.png",
  "enemies/prepared-reference/10_goggle-brown-creature.png",
  "enemies/prepared-reference/14_mushroom-crab.png",
  "enemies/prepared-reference/15_brown-goggle-creature.png",
  "enemies/prepared-reference/20_spiky-hedgehog.png",
  "enemies/prepared-reference/23_green-frog.png",
  "enemies/prepared-reference/25_squirrel.png",
  "enemies/prepared-reference/27_bee.png",
  "enemies/prepared-reference/33_mummy.png",
  "enemies/prepared-reference/35_blue-ogre-b.png",
  "enemies/prepared-reference/37_green-turtle-a.png",
  "enemies/prepared-reference/38_green-turtle-b.png",
  "enemies/prepared-reference/39_green-lizard.png",
  "enemies/prepared-reference/42_rat-guard.png",
  "enemies/prepared-reference/04_purple-bat.png",
  "enemies/prepared-reference/06_yeti.png",
  "enemies/prepared-reference/11_ice-golem.png",
  "enemies/prepared-reference/12_armored-penguin.png",
  "enemies/prepared-reference/19_ice-robot.png",
  "enemies/prepared-reference/21_skeleton.png",
  "enemies/prepared-reference/22_wolf-guard.png",
  "enemies/prepared-reference/24_spider.png",
  "enemies/prepared-reference/28_ice-fish.png",
  "enemies/prepared-reference/29_jellyfish.png",
  "enemies/prepared-reference/36_ice-cube-monster.png",
  "enemies/prepared-reference/01_snowman.png",
  "enemies/prepared-reference/13_chained-ghost.png",
  "enemies/prepared-reference/41_pumpkin-variant.png",
  "enemies/prepared-reference/45_owl-b.png",
  "enemies/prepared-reference/48_skull-cloud.png",
];
const approvalPath = resolve(root, "enemies/prepared-reference/approved-artwork.json");
if (!existsSync(approvalPath)) {
  errors.push("Missing approved original PNG mapping manifest.");
} else {
  const approval = JSON.parse(readFileSync(approvalPath, "utf8"));
  const mapping = approval.runtimeEnemyMapping || {};
  const mappedFiles = Object.values(mapping);
  if (Object.keys(mapping).length !== 32) errors.push("Expected mappings for all 32 enemy identities.");
  if (new Set(mappedFiles).size !== 32) errors.push("Each of the 32 enemy identities must use a different original PNG.");
  for (const file of mappedFiles) {
    if (!approval.approved?.includes(file)) errors.push("Enemy PNG is not in the approved list: " + file);
    if (!enemyFiles.includes("enemies/prepared-reference/" + file)) errors.push("Enemy mapping references an unvalidated PNG: " + file);
  }
}
const bossFiles = [
  "bosses/prepared-reference/gatekeeper.png",
  "bosses/prepared-reference/iron-comet.png",
  "bosses/prepared-reference/gale-talon.png",
  "bosses/prepared-reference/suncrest.png",
  "bosses/prepared-reference/void-sovereign.png",
];
for (const relative of [...enemyFiles, ...bossFiles]) {
  const file = resolve(root, relative);
  if (!existsSync(file)) {
    errors.push("Missing original PNG: " + relative);
    continue;
  }
  const bytes = readFileSync(file);
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (bytes.length < 24 || !bytes.subarray(0, 8).equals(signature)) {
    errors.push("Invalid PNG file: " + relative);
    continue;
  }
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width < 32 || height < 32) errors.push("PNG dimensions are too small: " + relative);
}
if (enemyFiles.length !== 32 || bossFiles.length !== 5) errors.push("Expected 32 distinct approved enemy source PNGs and five boss PNGs.");
if (errors.length) {
  console.error("Original PNG artwork validation failed:");
  errors.forEach((error) => console.error("- " + error));
  process.exit(1);
}
console.log("Original PNG artwork validated: 32 approved distinct enemy source images and five boss PNGs. No vector sprite-sheet generation is required.");
