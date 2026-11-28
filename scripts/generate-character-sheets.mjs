import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PREMIUM_ENEMY_ARCHETYPES } from "../src/premiumCampaignData.js";

const OUTPUT = resolve("src/assets/generated-character-sheets");
const CELL = 128;
const COLUMNS = 8;
const ROWS = 5;
const FRAME_COUNT = COLUMNS * ROWS;
const BOSS_DEFINITIONS = [
  { id: "gatekeeper", name: "Gatekeeper", tint: "#77b9d8", style: "guardian", role: "heavy" },
  { id: "iron-comet", name: "Iron Comet", tint: "#df8755", style: "iron", role: "charger" },
  { id: "gale-talon", name: "Gale Talon", tint: "#8bc9ad", style: "winged", role: "flying" },
  { id: "suncrest", name: "Suncrest", tint: "#f0b94d", style: "solar", role: "summoner" },
  { id: "void-sovereign", name: "Void Sovereign", tint: "#a78bd9", style: "void", role: "summoner" },
];

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const hexRgb = (hex) => {
  const value = hex.replace("#", "");
  return [0, 2, 4].map((offset) => parseInt(value.slice(offset, offset + 2), 16));
};
const toHex = (rgb) => "#" + rgb.map((v) => clamp(Math.round(v), 0, 255).toString(16).padStart(2, "0")).join("");
const shade = (hex, amount) => {
  const rgb = hexRgb(hex);
  return toHex(rgb.map((v) => amount >= 0 ? v + (255 - v) * amount : v * (1 + amount)));
};
const stableHash = (value) => [...value].reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7);
const esc = (value) => String(value).replace(/[&<>"']/g, (char) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
})[char]);

function getSilhouette(id, role, boss = false) {
  if (boss) return "boss";
  if (/jelly|spore|plasma|astral|eclipse/.test(id)) return "orb";
  if (/shellback|turtle|bark|iron-bark|temple|breaker/.test(id)) return "armored";
  if (/copter|bee|talon|wing|scout/.test(id)) return "winged";
  if (/burrow|mire|root|vine|thorn/.test(id)) return "crawler";
  if (/pouncer|spirit|demon|ember|flame/.test(id)) return "imp";
  if (/sniper|licorice|rat|owl/.test(id)) return "slim";
  if (/hopper|leaper|acorn|squirrel/.test(id)) return "hopper";
  if (/mauler|bruiser|comet|golem/.test(id)) return "brute";
  return role === "flying" ? "winged" : role === "heavy" ? "brute" : role === "shield" ? "armored" : "round";
}

function featureMarkup(config, hash) {
  const { id, color, light, dark, accent, silhouette, boss } = config;
  const eye = boss ? 5 : 4;
  const horns = hash % 4;
  const accessory = boss ? config.style : (id.split("-")[0] || "wild");
  let shape = "";
  if (silhouette === "orb") shape = '<path d="M-32 8 Q-39 -28 -8 -38 Q28 -45 36 -10 Q43 22 10 34 Q-23 38 -32 8Z"/>';
  else if (silhouette === "armored") shape = '<path d="M-36 16 Q-42 -15 -20 -32 L20 -32 Q42 -15 36 16 Q22 35 0 35 Q-22 35 -36 16Z"/>';
  else if (silhouette === "winged") shape = '<path d="M-30 22 Q-39 -8 -18 -30 Q0 -42 18 -30 Q39 -8 30 22 Q12 36 -12 36Z"/>';
  else if (silhouette === "crawler") shape = '<path d="M-37 18 Q-42 -8 -24 -27 Q-5 -41 22 -26 Q42 -12 33 16 Q16 34 -12 32Z"/>';
  else if (silhouette === "imp") shape = '<path d="M-30 28 L-35 -5 Q-28 -30 -9 -30 L0 -39 L9 -30 Q28 -30 35 -5 L30 28 Q0 42 -30 28Z"/>';
  else if (silhouette === "slim") shape = '<path d="M-25 30 Q-30 -4 -16 -31 Q0 -42 16 -31 Q30 -4 25 30 Q0 39 -25 30Z"/>';
  else if (silhouette === "hopper") shape = '<path d="M-34 25 Q-42 -6 -19 -31 Q0 -45 19 -31 Q42 -6 34 25 Q0 41 -34 25Z"/>';
  else if (silhouette === "brute") shape = '<path d="M-40 20 L-35 -18 Q-26 -36 -8 -34 L8 -34 Q26 -36 35 -18 L40 20 Q18 39 -18 39Z"/>';
  else if (silhouette === "boss") shape = '<path d="M-44 25 Q-50 -10 -29 -31 L-12 -40 L0 -31 L12 -40 L29 -31 Q50 -10 44 25 Q20 47 -20 43Z"/>';
  else shape = '<path d="M-34 24 Q-40 -10 -18 -30 Q0 -40 18 -30 Q40 -10 34 24 Q0 40 -34 24Z"/>';

  const hornMarkup = horns === 0
    ? '<path d="M-24 -25 L-38 -48 L-12 -33 M24 -25 L38 -48 L12 -33" fill="' + light + '"/>'
    : horns === 1
      ? '<path d="M-25 -28 Q-45 -51 -35 -56 Q-20 -45 -12 -31 M25 -28 Q45 -51 35 -56 Q20 -45 12 -31" fill="' + accent + '"/>'
      : horns === 2
        ? '<path d="M-30 -20 L-44 -34 L-29 -33 M30 -20 L44 -34 L29 -33" fill="' + light + '"/>'
        : '<path d="M-22 -32 L-28 -51 L-8 -36 M22 -32 L28 -51 L8 -36" fill="' + accent + '"/>';

  let motif = "";
  if (accessory === "guardian" || accessory === "iron" || silhouette === "armored") {
    motif = '<path d="M-30 -3 L-18 -22 L0 -15 L18 -22 L30 -3 L22 20 L0 27 L-22 20Z" fill="' + dark + '" stroke="' + light + '" stroke-width="3"/><path d="M0 -12 L8 0 L0 12 L-8 0Z" fill="' + accent + '"/>';
  } else if (accessory === "winged" || silhouette === "winged") {
    motif = '<path d="M-27 -10 Q-63 -44 -58 -1 Q-54 22 -25 12Z" fill="' + light + '" stroke="' + dark + '" stroke-width="3"/><path d="M27 -10 Q63 -44 58 -1 Q54 22 25 12Z" fill="' + light + '" stroke="' + dark + '" stroke-width="3"/>';
  } else if (accessory === "solar") {
    motif = '<path d="M0 -52 L8 -39 L22 -45 L21 -29 L38 -26 L27 -12 L41 0 L24 8 L28 25 L9 23 L0 41 L-9 23 L-28 25 L-24 8 L-41 0 L-27 -12 L-38 -26 L-21 -29 L-22 -45 L-8 -39Z" fill="' + accent + '" stroke="' + light + '" stroke-width="2"/>';
  } else if (accessory === "void") {
    motif = '<ellipse cx="0" cy="-5" rx="43" ry="47" fill="none" stroke="' + accent + '" stroke-width="4" stroke-dasharray="5 7"/><path d="M-16 -5 Q0 -25 16 -5 Q0 17 -16 -5Z" fill="' + light + '"/>';
  } else if (accessory === "crystal" || accessory === "prism" || accessory === "glacier") {
    motif = '<path d="M-30 -6 L-20 -33 L-8 -12 L0 -45 L10 -12 L23 -34 L32 -5 L20 25 L-20 25Z" fill="' + accent + '" stroke="' + light + '" stroke-width="3"/>';
  } else if (accessory === "thorn" || accessory === "toxic" || accessory === "vine") {
    motif = '<path d="M-31 15 Q-50 -12 -31 -34 Q-28 -10 -10 -10 Q-20 -39 0 -49 Q2 -20 20 -17 Q19 -42 37 -34 Q24 -2 31 15" fill="none" stroke="' + accent + '" stroke-width="7" stroke-linecap="round"/>';
  } else if (accessory === "flame" || accessory === "ember" || accessory === "frostfire") {
    motif = '<path d="M-25 -25 Q-44 -54 -21 -58 Q-18 -39 -2 -42 Q-8 -63 10 -65 Q8 -42 29 -52 Q41 -28 22 -15" fill="' + accent + '" stroke="' + light + '" stroke-width="2"/>';
  } else if (accessory === "shadow" || accessory === "storm" || accessory === "metal" || accessory === "plasma" || accessory === "astral") {
    motif = '<path d="M-36 -4 L-19 -20 L-6 -8 L7 -31 L18 -10 L36 -21 L26 6 L9 15 L-8 9 L-24 21Z" fill="' + accent + '" stroke="' + light + '" stroke-width="2"/>';
  } else if (accessory === "solar" || accessory === "golden") {
    motif = '<circle cx="0" cy="-20" r="15" fill="' + accent + '" stroke="' + light + '" stroke-width="3"/>';
  }

  const eyes = hash % 5 === 0
    ? '<ellipse cx="0" cy="-4" rx="7" ry="9" fill="#fff"/><circle cx="1" cy="-3" r="3.5" fill="#24233a"/>'
    : '<ellipse cx="-10" cy="-5" rx="' + eye + '" ry="6" fill="#fff"/><ellipse cx="10" cy="-5" rx="' + eye + '" ry="6" fill="#fff"/><circle cx="-9" cy="-4" r="2.8" fill="#24233a"/><circle cx="11" cy="-4" r="2.8" fill="#24233a"/>';
  return { shape, hornMarkup, motif, eyes };
}

function renderFrame(config, state, frame) {
  const { id, color, light, dark, accent, silhouette, boss } = config;
  const hash = stableHash(id);
  const p = frame / 7;
  const wave = Math.sin(p * Math.PI * 2);
  let bob = 0, lean = 0, squashX = 1, squashY = 1, armL = 0, armR = 0, legL = 0, legR = 0, alpha = 1, tilt = 0;
  if (state === "idle") {
    bob = Math.sin(p * Math.PI * 2) * 2.2;
    armL = Math.sin(p * Math.PI * 2) * 5;
    armR = -armL;
    squashY = 1 + Math.sin(p * Math.PI * 2) * 0.018;
  } else if (state === "move") {
    bob = Math.abs(wave) * -4;
    legL = wave * 28;
    legR = -wave * 28;
    armL = -wave * 24;
    armR = wave * 24;
    lean = config.role === "charger" ? 8 : 3;
  } else if (state === "attack") {
    const wind = frame < 2 ? -1 : frame < 5 ? 1 : 0.2;
    lean = frame < 2 ? -5 : frame < 5 ? 14 : 2;
    armL = -42 * wind;
    armR = -52 * wind;
    bob = frame < 2 ? 1 : -2;
    squashX = frame < 2 ? 0.94 : 1.12;
    squashY = frame < 2 ? 1.06 : 0.9;
  } else if (state === "hit") {
    lean = -12 + p * 12;
    armL = -65 + p * 55;
    armR = 65 - p * 55;
    squashX = 0.9 + p * 0.1;
    squashY = 1.1 - p * 0.1;
    bob = 2;
  } else if (state === "defeat") {
    tilt = Math.min(88, frame * 13);
    bob = frame * 1.4;
    squashY = Math.max(0.28, 1 - frame * 0.1);
    alpha = Math.max(0.3, 1 - frame * 0.09);
    armL = -frame * 8;
    armR = frame * 8;
  }

  const { shape, hornMarkup, motif, eyes } = featureMarkup(config, hash);
  const legColor = shade(color, -0.35);
  const armLength = boss ? 27 : 21;
  const limbWidth = boss ? 12 : 9;
  const bodyY = boss ? -1 : 0;
  const mouth = boss ? '<path d="M-10 10 Q0 20 10 10" fill="none" stroke="' + dark + '" stroke-width="3" stroke-linecap="round"/>' :
    '<path d="M-6 11 Q0 15 6 11" fill="none" stroke="' + dark + '" stroke-width="2.5" stroke-linecap="round"/>';
  const shell = silhouette === "armored" ? '<path d="M-26 -3 Q0 -38 26 -3 Q22 20 0 24 Q-22 20 -26 -3Z" fill="' + dark + '" stroke="' + light + '" stroke-width="3"/><path d="M0 -23 L0 21 M-19 -5 L19 8 M19 -5 L-19 8" stroke="' + accent + '" stroke-width="2"/>' : "";
  const bossCrown = boss ? '<path d="M-25 -31 L-34 -55 L-12 -41 L0 -63 L12 -41 L34 -55 L25 -31Z" fill="' + accent + '" stroke="' + light + '" stroke-width="3"/>' : "";
  const bossCape = boss ? '<path d="M-27 -9 Q-54 9 -43 51 L-10 35 L0 12 L10 35 L43 51 Q54 9 27 -9Z" fill="' + dark + '" stroke="' + accent + '" stroke-width="3"/>' : "";
  const cellX = (frame % COLUMNS) * CELL;
  const cellY = Math.floor(frame / COLUMNS) * CELL;
  const bodyScale = boss ? 1.03 : 0.93;
  const armPivot = boss ? 34 : 29;
  const legs = '<g transform="translate(-13 29) rotate(' + legL + ')"><path d="M0 0 L-3 18" stroke="' + dark + '" stroke-width="' + limbWidth + '" stroke-linecap="round"/><ellipse cx="-4" cy="18" rx="9" ry="5" fill="' + legColor + '" stroke="' + dark + '" stroke-width="2"/></g><g transform="translate(13 29) rotate(' + legR + ')"><path d="M0 0 L3 18" stroke="' + dark + '" stroke-width="' + limbWidth + '" stroke-linecap="round"/><ellipse cx="4" cy="18" rx="9" ry="5" fill="' + legColor + '" stroke="' + dark + '" stroke-width="2"/></g>';
  const arms = '<g transform="translate(-armPivot -5)" style="--unused:0" transform="translate(-' + armPivot + ' -5) rotate(' + armL + ')"><path d="M0 0 L-8 18" stroke="' + dark + '" stroke-width="' + (limbWidth + 2) + '" stroke-linecap="round"/><ellipse cx="-9" cy="20" rx="8" ry="9" fill="' + color + '" stroke="' + dark + '" stroke-width="2"/></g><g transform="translate(' + armPivot + ' -5) rotate(' + armR + ')"><path d="M0 0 L8 18" stroke="' + dark + '" stroke-width="' + (limbWidth + 2) + '" stroke-linecap="round"/><ellipse cx="9" cy="20" rx="8" ry="9" fill="' + color + '" stroke="' + dark + '" stroke-width="2"/></g>';
  return '<g transform="translate(' + cellX + ' ' + cellY + ')"><ellipse cx="64" cy="112" rx="' + (boss ? 40 : 31) + '" ry="7" fill="#1c2035" opacity=".25"/><g transform="translate(64 ' + (64 + bob) + ') rotate(' + tilt + ') skewX(' + lean + ') scale(' + squashX + ' ' + squashY + ')"><g transform="scale(' + bodyScale + ')">' +
    bossCape + legs + arms +
    '<g transform="translate(0 ' + bodyY + ') scale(1 ' + (boss ? 1 : 0.98) + ')"><path d="' + shape.match(/d="([^"]+)"/)[1] + '" fill="' + color + '" stroke="' + dark + '" stroke-width="' + (boss ? 5 : 3.5) + '" stroke-linejoin="round"/><path d="M-19 9 Q0 24 19 9 Q12 28 0 29 Q-12 28 -19 9Z" fill="' + light + '" opacity=".8"/>' + shell + motif + '</g>' +
    hornMarkup + bossCrown +
    '<g transform="translate(0 -7)">' + eyes + mouth + '</g>' +
    '<path d="M-22 -24 Q0 -37 22 -24" fill="none" stroke="' + light + '" stroke-width="3" stroke-linecap="round" opacity=".8"/>' +
    (boss ? '<path d="M-29 4 L-20 -7 L-11 4 L0 -8 L11 4 L20 -7 L29 4" fill="none" stroke="' + accent + '" stroke-width="4"/><circle cx="0" cy="3" r="7" fill="' + light + '" stroke="' + accent + '" stroke-width="2"/>' : '') +
    '</g></g></g>';
}

function makeSheet(config) {
  const hash = stableHash(config.id);
  const color = config.tint || ["#70c7ff", "#f28a5a", "#8ed18b", "#c39aff", "#f0c66b", "#69c9d7"][hash % 6];
  const normalized = {
    ...config,
    tint: color,
    color,
    light: shade(color, 0.36),
    dark: shade(color, -0.42),
    accent: shade(config.tint || color, config.boss ? 0.22 : (hash % 2 ? 0.48 : -0.12)),
    silhouette: getSilhouette(config.id, config.role, config.boss),
  };
  const states = ["idle", "move", "attack", "hit", "defeat"];
  const frames = states.flatMap((state) => Array.from({ length: 8 }, (_, frame) => renderFrame(normalized, state, frame))).join("");
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + (CELL * COLUMNS) + '" height="' + (CELL * ROWS) + '" viewBox="0 0 ' + (CELL * COLUMNS) + ' ' + (CELL * ROWS) + '">' + frames + '</svg>';
  return { svg, normalized, hash };
}

await mkdir(OUTPUT, { recursive: true });
const all = [
  ...PREMIUM_ENEMY_ARCHETYPES.map((entry) => ({ ...entry, boss: false })),
  ...BOSS_DEFINITIONS.map((entry) => ({ ...entry, boss: true })),
];
if (PREMIUM_ENEMY_ARCHETYPES.length !== 32) throw new Error("Expected exactly 32 approved regular enemy identities.");
if (new Set(all.map((entry) => entry.id)).size !== 37) throw new Error("Enemy and boss sheet IDs must be unique.");
const manifest = {
  source: "Original procedural SVG artwork generated in-repository; no paid assets or external image downloads.",
  sheet: { width: CELL * COLUMNS, height: CELL * ROWS, frameWidth: CELL, frameHeight: CELL, columns: COLUMNS, rows: ROWS, framesPerState: 8 },
  states: ["idle", "move", "attack", "hit", "defeat"],
  regularEnemyCount: 32,
  bossCount: 5,
  characters: [],
};
for (const entry of all) {
  const { svg, normalized, hash } = makeSheet(entry);
  const filename = entry.id + ".svg";
  await writeFile(resolve(OUTPUT, filename), svg, "utf8");
  manifest.characters.push({
    id: entry.id,
    name: entry.name,
    kind: entry.boss ? "boss" : "enemy",
    role: entry.role,
    style: entry.style || null,
    silhouette: normalized.silhouette,
    palette: [normalized.color, normalized.light, normalized.dark, normalized.accent],
    framesPerState: 8,
    stateRanges: { idle: [0, 7], move: [8, 15], attack: [16, 23], hit: [24, 31], defeat: [32, 39] },
    visualSignature: hash,
    file: filename,
  });
}
await writeFile(resolve(OUTPUT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log("Generated " + manifest.regularEnemyCount + " unique regular enemy sheets and " + manifest.bossCount + " unique boss sheets (" + (all.length * FRAME_COUNT) + " authored vector frames).");
