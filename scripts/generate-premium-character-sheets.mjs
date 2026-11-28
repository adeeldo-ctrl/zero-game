import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PREMIUM_ENEMY_ARCHETYPES, PREMIUM_BOSSES } from "../src/premiumCampaignData.js";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../src/assets/generated-character-sheets");
const ENEMY_SIZE = 128;
const BOSS_SIZE = 128;
const COLUMNS = 8;
const ENEMY_STATES = ["idle", "move", "attack", "hit", "defeat"];
const BOSS_STATES = ["entrance", "idle", "move", "attack-primary", "attack-secondary", "special", "hit", "phase-change", "defeat"];

const profiles = {
  "spirit-pouncer": { shape: "imp", body: "#d94c42", light: "#ffb36a", trim: "#ffe08a", accent: "#8d3047", eyes: "#fff7d8", ornament: "ember-horns" },
  "icicle-hopper": { shape: "chick", body: "#7ec9ed", light: "#e9fbff", trim: "#b7f4ff", accent: "#397cae", eyes: "#fffdf4", ornament: "ice-crest" },
  "jelly-vault": { shape: "jelly", body: "#c56ed7", light: "#f7c6ff", trim: "#ffe7ff", accent: "#7c3f9c", eyes: "#fff8ff", ornament: "tentacles" },
  "bark-bruiser": { shape: "tree", body: "#8a6948", light: "#c9a66c", trim: "#9de18b", accent: "#4b784d", eyes: "#fff3d7", ornament: "leaf-crown" },
  "spore-caster": { shape: "mushroom", body: "#bd6e9b", light: "#f3c4a4", trim: "#f4e0a5", accent: "#75436c", eyes: "#fff9ef", ornament: "spore-cap" },
  "caramel-mauler": { shape: "blob", body: "#c47a3c", light: "#ffd08a", trim: "#fff0ae", accent: "#78452f", eyes: "#fff9e8", ornament: "candy-swirl" },
  "moss-scout": { shape: "hedgehog", body: "#6e9d59", light: "#b9d78a", trim: "#e4f0a9", accent: "#3e684c", eyes: "#fffbe8", ornament: "moss-spines" },
  "vine-vault": { shape: "frog", body: "#58a96d", light: "#b8ed9d", trim: "#e5f7b4", accent: "#2f6e57", eyes: "#fffdf1", ornament: "vine-frill" },
  "acorn-leaper": { shape: "squirrel", body: "#a96b43", light: "#edbd7b", trim: "#f6dc9c", accent: "#69402f", eyes: "#fff9e8", ornament: "acorn-cap" },
  "candy-copter": { shape: "bee", body: "#e6b83e", light: "#fff0a1", trim: "#fff7d0", accent: "#80532e", eyes: "#fffdf0", ornament: "sugar-wings" },
  "eclipse-summoner": { shape: "wisp", body: "#6653a7", light: "#b8a5ef", trim: "#eee3ff", accent: "#33295e", eyes: "#fffaff", ornament: "eclipse-ring" },
  "temple-breaker": { shape: "golem", body: "#72899c", light: "#c4d4dc", trim: "#f0d28b", accent: "#3c526c", eyes: "#fff4c8", ornament: "rune-stone" },
  "jade-shellback": { shape: "turtle", body: "#4f9d78", light: "#a8df9c", trim: "#f0d88a", accent: "#2c665d", eyes: "#fffbed", ornament: "jade-shell" },
  "root-burrower": { shape: "root", body: "#9b7949", light: "#d7b47a", trim: "#a7e17e", accent: "#5e5338", eyes: "#fff5d9", ornament: "root-crown" },
  "mire-burrower": { shape: "lizard", body: "#7d9a4b", light: "#c6dc7b", trim: "#f3e79b", accent: "#405c3a", eyes: "#fffce8", ornament: "mire-fins" },
  "licorice-sniper": { shape: "eel", body: "#5b456f", light: "#b39acb", trim: "#e6d4f6", accent: "#30243e", eyes: "#fff8ff", ornament: "licorice-coils" },
  "shadow-moss-scout": { shape: "hedgehog", body: "#334d6d", light: "#8ab9df", trim: "#d8f1ff", accent: "#1f2b4b", eyes: "#e9fbff", ornament: "crescent-spines" },
  "iron-bark-bruiser": { shape: "tree", body: "#596d7d", light: "#b3c3ce", trim: "#d6c8ff", accent: "#344657", eyes: "#fff9e8", ornament: "iron-bark-plates" },
  "golden-acorn-leaper": { shape: "squirrel", body: "#d59a34", light: "#ffe39a", trim: "#fff6c7", accent: "#8d572a", eyes: "#fffdf0", ornament: "golden-acorn" },
  "prism-jelly-vault": { shape: "jelly", body: "#69b8ca", light: "#e5fbff", trim: "#ffd8ff", accent: "#4674a8", eyes: "#ffffff", ornament: "prism-facets" },
  "molten-caramel-mauler": { shape: "blob", body: "#bd543a", light: "#ffb05c", trim: "#ffe08a", accent: "#713044", eyes: "#fff3cf", ornament: "molten-ridges" },
  "storm-candy-copter": { shape: "bee", body: "#5a91c6", light: "#c2efff", trim: "#f5e89a", accent: "#314b7a", eyes: "#ffffff", ornament: "storm-wings" },
  "frostfire-icicle-hopper": { shape: "chick", body: "#8dcde8", light: "#fff0c8", trim: "#a8efff", accent: "#bd6547", eyes: "#fffdf4", ornament: "frostfire-crest" },
  "crystal-spore-caster": { shape: "mushroom", body: "#9272bd", light: "#ead8ff", trim: "#a9f4ff", accent: "#56447e", eyes: "#fffaff", ornament: "crystal-cap" },
  "thorn-root-burrower": { shape: "root", body: "#718b4c", light: "#c8df8c", trim: "#f3efb0", accent: "#405b3c", eyes: "#fffbe8", ornament: "thorn-crown" },
  "ember-spirit-pouncer": { shape: "imp", body: "#d55b36", light: "#ffc46b", trim: "#fff0a5", accent: "#7f3040", eyes: "#fff8dc", ornament: "ember-flare" },
  "toxic-vine-vault": { shape: "frog", body: "#84aa3f", light: "#d4f078", trim: "#f5ffad", accent: "#4d6433", eyes: "#fffde9", ornament: "toxic-vines" },
  "solar-jade-shellback": { shape: "turtle", body: "#b78d36", light: "#f8db7b", trim: "#fff5b5", accent: "#54734b", eyes: "#fffdf1", ornament: "solar-shell" },
  "plasma-mire-burrower": { shape: "lizard", body: "#8a56b8", light: "#e1a9ff", trim: "#fff0ff", accent: "#4b337d", eyes: "#fffaff", ornament: "plasma-fins" },
  "void-licorice-sniper": { shape: "eel", body: "#392c62", light: "#9e8be0", trim: "#e6ddff", accent: "#211a40", eyes: "#fffaff", ornament: "void-coils" },
  "astral-eclipse-summoner": { shape: "wisp", body: "#51417f", light: "#b9a7f5", trim: "#fff0c9", accent: "#292044", eyes: "#ffffff", ornament: "astral-crown" },
  "frost-temple-breaker": { shape: "golem", body: "#5e8eb2", light: "#d8f5ff", trim: "#b6f4ff", accent: "#344f78", eyes: "#fffdf0", ornament: "glacier-runes" },
};

const bossProfiles = {
  gatekeeper: { shape: "fortress", body: "#6c879a", light: "#d1e2e9", trim: "#ffe09a", accent: "#334f69", eyes: "#fff8d8", ornament: "crystal-crown", name: "Arena Gatekeeper" },
  "iron-comet": { shape: "comet", body: "#697b92", light: "#d7e2ed", trim: "#ffca83", accent: "#34445e", eyes: "#fff6db", ornament: "orbiting-rings", name: "Iron Comet" },
  "gale-talon": { shape: "sky-guardian", body: "#5c9fb4", light: "#d9fbff", trim: "#fff0b1", accent: "#315a7c", eyes: "#ffffff", ornament: "wind-fan", name: "Gale Talon" },
  suncrest: { shape: "sun-phoenix", body: "#d68b3e", light: "#ffe39a", trim: "#fff6bf", accent: "#914d39", eyes: "#fffdf0", ornament: "sun-halo", name: "Suncrest Master" },
  "void-sovereign": { shape: "void-monarch", body: "#55417d", light: "#b9a5ef", trim: "#f7e7ff", accent: "#281e4c", eyes: "#ffffff", ornament: "star-crown", name: "Void Sovereign" },
};

function esc(value) { return String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;"); }

function bodyMarkup(shape, c) {
  const b = c.body, l = c.light, a = c.accent, t = c.trim;
  const map = {
    imp: '<path d="M-27 25 Q-42 1 -24 -22 Q-10 -42 0 -28 Q15 -45 28 -19 Q43 8 26 27 Q12 43 -12 38Z" fill="url(#body)" stroke="' + a + '" stroke-width="4"/><path d="M-19 -24 Q-36 -49 -12 -42 L-5 -25Z M18 -25 Q35 -51 39 -34 L25 -16Z" fill="' + t + '" stroke="' + a + '" stroke-width="3"/>',
    chick: '<ellipse cx="0" cy="3" rx="30" ry="35" fill="url(#body)" stroke="' + a + '" stroke-width="4"/><path d="M22 0 L42 8 L22 15Z" fill="' + t + '" stroke="' + a + '" stroke-width="2"/><path d="M-15 -28 Q-22 -47 -8 -42 Q0 -57 8 -42 Q23 -47 15 -27Z" fill="' + l + '" stroke="' + a + '" stroke-width="3"/>',
    jelly: '<path d="M-36 9 Q-38 -34 0 -39 Q38 -34 36 9 Q21 24 0 20 Q-22 25 -36 9Z" fill="url(#body)" stroke="' + a + '" stroke-width="4"/><path d="M-25 14 Q-32 35 -20 46 Q-11 35 -13 20 M-7 18 Q-10 39 0 48 Q10 37 7 18 M13 18 Q10 38 21 46 Q31 34 24 13" fill="none" stroke="' + l + '" stroke-width="7" stroke-linecap="round"/>',
    tree: '<path d="M-27 34 Q-36 12 -23 -7 L-14 -26 L-3 -12 L7 -34 L18 -12 L29 -2 Q39 18 25 35Z" fill="url(#body)" stroke="' + a + '" stroke-width="4"/><path d="M-18 20 Q-5 6 4 18 Q14 5 22 18" fill="none" stroke="' + l + '" stroke-width="7" stroke-linecap="round"/>',
    mushroom: '<path d="M-15 34 Q-19 7 -12 -7 L12 -7 Q20 12 15 34Z" fill="url(#body)" stroke="' + a + '" stroke-width="4"/><path d="M-38 -5 Q-33 -37 0 -39 Q34 -38 39 -5 Q18 8 0 3 Q-18 9 -38 -5Z" fill="' + b + '" stroke="' + a + '" stroke-width="4"/><circle cx="-18" cy="-18" r="6" fill="' + t + '"/><circle cx="13" cy="-22" r="7" fill="' + l + '"/>',
    blob: '<path d="M-36 29 Q-44 8 -31 -10 Q-24 -30 -8 -25 Q6 -43 20 -25 Q41 -20 37 5 Q44 26 22 34 Q0 42 -18 34Z" fill="url(#body)" stroke="' + a + '" stroke-width="4"/>',
    hedgehog: '<path d="M-34 22 Q-40 3 -25 -16 Q-15 -33 -7 -19 Q1 -40 10 -19 Q22 -37 25 -12 Q42 1 31 24 Q12 42 -17 34Z" fill="url(#body)" stroke="' + a + '" stroke-width="4"/><path d="M-29 -7 L-37 -27 L-19 -17 L-13 -39 L-3 -19 L9 -42 L14 -17 L31 -31 L26 -7" fill="' + t + '" stroke="' + a + '" stroke-width="3" stroke-linejoin="round"/>',
    frog: '<path d="M-34 27 Q-43 3 -24 -13 Q-10 -29 0 -17 Q13 -31 27 -11 Q43 7 32 28 Q8 43 -18 35Z" fill="url(#body)" stroke="' + a + '" stroke-width="4"/><circle cx="-20" cy="-19" r="13" fill="' + l + '" stroke="' + a + '" stroke-width="3"/><circle cx="20" cy="-19" r="13" fill="' + l + '" stroke="' + a + '" stroke-width="3"/>',
    squirrel: '<path d="M-20 31 Q-35 5 -18 -18 Q-4 -33 15 -16 Q30 0 20 30Z" fill="url(#body)" stroke="' + a + '" stroke-width="4"/><path d="M18 24 Q43 30 38 1 Q34 -25 14 -27 Q31 -47 48 -29 Q66 -8 46 20 Q38 39 18 39Z" fill="' + b + '" stroke="' + a + '" stroke-width="4"/><path d="M27 16 Q45 17 42 -5" fill="none" stroke="' + l + '" stroke-width="7" stroke-linecap="round"/>',
    bee: '<ellipse cx="0" cy="7" rx="27" ry="34" fill="url(#body)" stroke="' + a + '" stroke-width="4"/><path d="M-18 -14 Q-7 -19 4 -14 M-24 2 Q-8 -4 9 2 M-21 18 Q-6 11 17 18" stroke="' + a + '" stroke-width="8" fill="none"/><ellipse cx="-25" cy="-23" rx="16" ry="9" fill="' + l + '" opacity=".8" stroke="' + a + '" stroke-width="2"/><ellipse cx="25" cy="-23" rx="16" ry="9" fill="' + l + '" opacity=".8" stroke="' + a + '" stroke-width="2"/>',
    wisp: '<path d="M-29 31 Q-42 1 -19 -20 Q-5 -36 0 -49 Q9 -31 24 -20 Q43 2 27 29 Q14 44 0 31 Q-14 45 -29 31Z" fill="url(#body)" stroke="' + a + '" stroke-width="4"/>',
    golem: '<path d="M-32 -27 L-15 -39 L17 -37 L33 -19 L29 27 L14 39 L-20 36 L-34 17Z" fill="url(#body)" stroke="' + a + '" stroke-width="5"/><path d="M-22 -9 L-8 -18 L4 -7 L-8 3Z M12 11 L25 1" stroke="' + l + '" stroke-width="4" fill="none" stroke-linecap="round"/>',
    turtle: '<ellipse cx="0" cy="1" rx="35" ry="30" fill="' + b + '" stroke="' + a + '" stroke-width="4"/><path d="M-34 4 Q-30 -34 0 -35 Q31 -33 35 4 Q18 28 0 27 Q-20 28 -34 4Z" fill="url(#body)" stroke="' + t + '" stroke-width="4"/><path d="M-18 -10 L0 -25 L18 -10 L18 10 L0 23 L-18 10Z" fill="none" stroke="' + a + '" stroke-width="3"/>',
    root: '<path d="M-20 33 Q-39 17 -27 -8 Q-15 -32 0 -18 Q15 -34 28 -8 Q39 14 19 34 L12 48 L0 35 L-12 48Z" fill="url(#body)" stroke="' + a + '" stroke-width="4"/><path d="M-25 12 Q-43 30 -44 43 M25 12 Q43 30 44 43" stroke="' + l + '" stroke-width="7" fill="none" stroke-linecap="round"/>',
    lizard: '<path d="M-34 20 Q-42 -2 -20 -19 Q2 -35 26 -16 Q41 0 24 22 Q5 37 -18 30Z" fill="url(#body)" stroke="' + a + '" stroke-width="4"/><path d="M19 18 Q40 17 48 34 Q28 42 16 29" fill="' + b + '" stroke="' + a + '" stroke-width="4"/><path d="M-23 22 L-38 38 M17 22 L30 39" stroke="' + l + '" stroke-width="7" stroke-linecap="round"/>',
    eel: '<path d="M-38 21 Q-22 -25 8 -24 Q34 -24 36 0 Q38 24 11 27 Q-7 29 -16 12 Q-23 -1 -37 6" fill="none" stroke="' + a + '" stroke-width="24" stroke-linecap="round"/><path d="M-38 21 Q-22 -25 8 -24 Q34 -24 36 0 Q38 24 11 27" fill="none" stroke="url(#body)" stroke-width="17" stroke-linecap="round"/>',
    fortress: '<path d="M-37 35 L-37 -22 L-23 -22 L-23 -39 L-8 -39 L-8 -24 L8 -24 L8 -42 L24 -42 L24 -22 L38 -22 L38 35Z" fill="url(#body)" stroke="' + a + '" stroke-width="5"/><path d="M-25 3 L-10 -9 L0 2 L10 -9 L25 3" fill="none" stroke="' + l + '" stroke-width="6"/>',
    comet: '<path d="M-31 24 Q-48 -2 -24 -28 Q1 -47 27 -23 Q48 2 24 27 Q0 44 -31 24Z" fill="url(#body)" stroke="' + a + '" stroke-width="5"/><path d="M-38 -18 Q-56 -37 -44 -47 M-42 0 Q-65 -2 -67 -20 M-35 22 Q-58 40 -65 29" fill="none" stroke="' + t + '" stroke-width="8" stroke-linecap="round"/>',
    "sky-guardian": '<path d="M-26 32 Q-40 0 -21 -27 Q0 -45 21 -27 Q40 0 26 32 Q0 45 -26 32Z" fill="url(#body)" stroke="' + a + '" stroke-width="5"/><path d="M-18 -8 Q-62 -48 -57 -3 Q-42 23 -14 16 M18 -8 Q62 -48 57 -3 Q42 23 14 16" fill="' + l + '" stroke="' + a + '" stroke-width="4"/>',
    "sun-phoenix": '<path d="M-26 32 Q-38 2 -18 -25 L0 -44 L18 -25 Q38 2 26 32 Q0 48 -26 32Z" fill="url(#body)" stroke="' + a + '" stroke-width="5"/><path d="M-20 18 Q-58 38 -51 -5 Q-43 -31 -17 -19 M20 18 Q58 38 51 -5 Q43 -31 17 -19" fill="' + t + '" stroke="' + a + '" stroke-width="4"/><path d="M-9 -39 L0 -57 L9 -39" fill="' + l + '" stroke="' + a + '" stroke-width="3"/>',
    "void-monarch": '<path d="M-28 34 Q-42 4 -22 -22 L-12 -43 L0 -29 L13 -48 L24 -21 Q43 5 27 34 Q0 48 -28 34Z" fill="url(#body)" stroke="' + a + '" stroke-width="5"/><path d="M-35 -20 L-49 -45 L-18 -33 M35 -20 L49 -45 L18 -33" fill="' + t + '" stroke="' + a + '" stroke-width="4"/>',
  };
  return map[shape] || map.blob;
}

function ornamentMarkup(ornament, c, frame, state) {
  const t = c.trim, l = c.light, a = c.accent;
  const pulse = 1 + Math.sin((frame / 5) * Math.PI * 2) * 0.05;
  const common = {
    "ember-horns": '<path d="M-16 -36 Q-29 -58 -9 -57 L-2 -34 M16 -36 Q29 -58 9 -57 L2 -34" stroke="' + t + '" stroke-width="6" fill="none" stroke-linecap="round"/>',
    "ice-crest": '<path d="M-18 -33 L-13 -56 L-2 -38 L7 -60 L13 -36 L23 -52 L21 -27Z" fill="' + t + '" stroke="' + a + '" stroke-width="3"/>',
    tentacles: '<path d="M-28 17 Q-45 38 -34 49 M-9 20 Q-20 43 -8 52 M13 20 Q8 43 22 51 M29 14 Q47 35 39 48" fill="none" stroke="' + t + '" stroke-width="5" stroke-linecap="round"/>',
    "leaf-crown": '<path d="M-20 -27 Q-38 -54 -17 -51 Q-5 -48 0 -29 Q8 -55 25 -48 Q34 -34 12 -25Z" fill="' + t + '" stroke="' + a + '" stroke-width="3"/>',
    "spore-cap": '<circle cx="-24" cy="-18" r="5" fill="' + t + '"/><circle cx="18" cy="-25" r="6" fill="' + t + '"/><circle cx="28" cy="-4" r="4" fill="' + l + '"/>',
    "candy-swirl": '<path d="M-20 4 Q-12 -16 4 -8 Q20 1 7 14 Q-3 22 -11 12" fill="none" stroke="' + t + '" stroke-width="6" stroke-linecap="round"/>',
    "moss-spines": '<path d="M-29 -8 L-39 -31 L-20 -23 L-10 -44 L0 -24 L13 -45 L19 -20 L37 -31 L27 -5" fill="' + t + '" stroke="' + a + '" stroke-width="3"/>',
    "vine-frill": '<path d="M-33 2 Q-50 -16 -41 -27 Q-23 -22 -21 -8 M33 2 Q50 -16 41 -27 Q23 -22 21 -8" fill="' + t + '" stroke="' + a + '" stroke-width="3"/>',
    "acorn-cap": '<path d="M-29 -19 Q0 -48 29 -19 L23 -11 L-23 -11Z" fill="' + t + '" stroke="' + a + '" stroke-width="3"/><path d="M0 -42 L0 -51" stroke="' + a + '" stroke-width="5" stroke-linecap="round"/>',
    "sugar-wings": '<ellipse cx="-33" cy="-24" rx="19" ry="10" transform="rotate(-28 -33 -24)" fill="' + l + '" stroke="' + t + '" stroke-width="3"/><ellipse cx="33" cy="-24" rx="19" ry="10" transform="rotate(28 33 -24)" fill="' + l + '" stroke="' + t + '" stroke-width="3"/>',
    "eclipse-ring": '<circle cx="0" cy="-4" r="49" fill="none" stroke="' + t + '" stroke-width="4" opacity=".8"/><circle cx="0" cy="-4" r="39" fill="none" stroke="' + l + '" stroke-width="2" stroke-dasharray="5 7"/>',
    "rune-stone": '<path d="M0 -25 L10 -7 L0 7 L-10 -7Z" fill="' + t + '" stroke="' + l + '" stroke-width="3"/><path d="M-22 17 L-10 5 M22 17 L10 5" stroke="' + t + '" stroke-width="4"/>',
    "jade-shell": '<path d="M-23 -5 Q0 -38 23 -5 M-18 9 Q0 -15 18 9" fill="none" stroke="' + t + '" stroke-width="4"/>',
    "root-crown": '<path d="M-20 -26 Q-36 -51 -12 -44 L0 -25 Q10 -53 28 -43 Q33 -26 12 -21Z" fill="' + t + '" stroke="' + a + '" stroke-width="3"/>',
    "mire-fins": '<path d="M-25 -3 L-47 -22 L-36 8 M25 -3 L47 -22 L36 8" fill="' + t + '" stroke="' + a + '" stroke-width="3"/>',
    "licorice-coils": '<path d="M-33 -22 Q-49 -41 -52 -20 Q-55 0 -34 3 M33 -22 Q49 -41 52 -20 Q55 0 34 3" fill="none" stroke="' + t + '" stroke-width="7" stroke-linecap="round"/>',
    "crescent-spines": '<path d="M-28 -7 L-38 -34 L-17 -23 L-4 -44 L7 -21 L26 -39 L25 -7" fill="' + t + '" stroke="' + a + '" stroke-width="3"/><path d="M-12 -49 Q0 -60 12 -49" stroke="' + l + '" stroke-width="4" fill="none"/>',
    "iron-bark-plates": '<path d="M-31 -9 L-20 -30 L-5 -21 L0 -35 L14 -20 L29 -29 L34 -5" fill="' + t + '" stroke="' + a + '" stroke-width="4"/><path d="M-22 6 L22 6" stroke="' + l + '" stroke-width="4"/>',
    "golden-acorn": '<path d="M-28 -18 Q0 -49 28 -18 L20 -9 L-20 -9Z" fill="' + t + '" stroke="' + a + '" stroke-width="3"/><circle cx="0" cy="-30" r="6" fill="' + l + '"/>',
    "prism-facets": '<path d="M-28 -16 L-12 -36 L4 -18 L21 -35 L32 -8 L16 5 L0 -5 L-17 7Z" fill="' + t + '" opacity=".88" stroke="' + l + '" stroke-width="3"/>',
    "molten-ridges": '<path d="M-28 0 Q-39 -17 -25 -30 Q-10 -18 -12 -3 M0 -7 Q-12 -28 2 -44 Q16 -27 12 -7 M26 0 Q14 -18 29 -30 Q43 -13 36 3" fill="' + t + '" stroke="' + a + '" stroke-width="3"/>',
    "storm-wings": '<path d="M-32 -23 Q-57 -48 -55 -8 Q-39 4 -27 -7 M32 -23 Q57 -48 55 -8 Q39 4 27 -7" fill="' + t + '" stroke="' + a + '" stroke-width="3"/><path d="M-8 -42 L-1 -29 L-9 -17 L7 -19 L1 -4" stroke="' + l + '" stroke-width="4" fill="none"/>',
    "frostfire-crest": '<path d="M-21 -32 L-14 -55 L-3 -35 L7 -56 L15 -30 L24 -48 L22 -22Z" fill="' + t + '" stroke="' + a + '" stroke-width="3"/><path d="M-9 -40 L-5 -53 M8 -37 L13 -50" stroke="' + l + '" stroke-width="3"/>',
    "crystal-cap": '<path d="M-31 -10 L-18 -37 L-5 -21 L8 -49 L18 -20 L32 -35 L30 -5Z" fill="' + t + '" stroke="' + a + '" stroke-width="3"/>',
    "thorn-crown": '<path d="M-26 -17 L-39 -42 L-14 -30 L0 -52 L12 -29 L38 -43 L25 -13Z" fill="' + t + '" stroke="' + a + '" stroke-width="3"/>',
    "ember-flare": '<path d="M-20 -30 Q-35 -58 -8 -52 L0 -31 Q14 -63 27 -42 L15 -21Z" fill="' + t + '" stroke="' + a + '" stroke-width="3"/>',
    "toxic-vines": '<path d="M-32 -5 Q-54 -32 -40 -40 Q-20 -30 -22 -9 M32 -5 Q54 -32 40 -40 Q20 -30 22 -9" fill="none" stroke="' + t + '" stroke-width="6"/><circle cx="-42" cy="-37" r="5" fill="' + l + '"/><circle cx="42" cy="-37" r="5" fill="' + l + '"/>',
    "solar-shell": '<path d="M-30 -9 L-18 -34 L0 -43 L18 -34 L30 -9 M0 -42 L0 -20 M-30 -9 L-16 8 L0 15 L16 8 L30 -9" fill="none" stroke="' + t + '" stroke-width="4"/>',
    "plasma-fins": '<path d="M-29 -6 L-51 -27 L-41 5 M29 -6 L51 -27 L41 5" fill="' + t + '" stroke="' + a + '" stroke-width="3"/><path d="M-13 -32 L-2 -45 L7 -28 L18 -42" fill="none" stroke="' + l + '" stroke-width="4"/>',
    "void-coils": '<path d="M-34 -25 Q-54 -48 -57 -21 Q-58 1 -35 7 M34 -25 Q54 -48 57 -21 Q58 1 35 7" fill="none" stroke="' + t + '" stroke-width="8"/><circle cx="0" cy="-42" r="5" fill="' + l + '"/>',
    "astral-crown": '<path d="M-28 -26 L-20 -50 L-5 -30 L0 -58 L9 -30 L26 -50 L29 -24Z" fill="' + t + '" stroke="' + a + '" stroke-width="3"/><circle cx="-35" cy="-42" r="4" fill="' + l + '"/><circle cx="35" cy="-42" r="4" fill="' + l + '"/>',
    "glacier-runes": '<path d="M-30 -18 L-17 -42 L-5 -22 L8 -49 L18 -22 L32 -40 L28 -9Z" fill="' + t + '" stroke="' + a + '" stroke-width="3"/><path d="M-18 5 L-8 -5 L0 5 L8 -5 L18 5" fill="none" stroke="' + l + '" stroke-width="4"/>',
    "crystal-crown": '<path d="M-31 -28 L-18 -58 L-4 -35 L8 -62 L18 -34 L33 -55 L29 -22Z" fill="' + t + '" stroke="' + a + '" stroke-width="4"/>',
    "orbiting-rings": '<ellipse cx="0" cy="-3" rx="52" ry="17" transform="rotate(-22)" fill="none" stroke="' + t + '" stroke-width="5"/><ellipse cx="0" cy="-3" rx="44" ry="14" transform="rotate(28)" fill="none" stroke="' + l + '" stroke-width="3"/>',
    "wind-fan": '<path d="M-25 -12 Q-62 -48 -57 -4 Q-45 17 -18 9 M25 -12 Q62 -48 57 -4 Q45 17 18 9 M0 -30 L0 -57" fill="' + t + '" stroke="' + a + '" stroke-width="4"/>',
    "sun-halo": '<circle cx="0" cy="-5" r="49" fill="none" stroke="' + t + '" stroke-width="6"/><path d="M0 -63 L0 -52 M0 43 L0 54 M-58 -5 L-47 -5 M47 -5 L58 -5 M-41 -46 L-33 -38 M41 -46 L33 -38" stroke="' + l + '" stroke-width="5" stroke-linecap="round"/>',
    "star-crown": '<path d="M-32 -26 L-20 -53 L-5 -32 L0 -62 L10 -32 L25 -54 L32 -24Z" fill="' + t + '" stroke="' + a + '" stroke-width="4"/><circle cx="-42" cy="-46" r="5" fill="' + l + '"/><circle cx="42" cy="-46" r="5" fill="' + l + '"/>',
  };
  const result = common[ornament] || "";
  if (state === "phase-change" || state === "special") {
    return result + '<circle cx="0" cy="-2" r="' + (42 * pulse).toFixed(1) + '" fill="none" stroke="' + t + '" stroke-width="3" opacity=".72" stroke-dasharray="6 6"/>';
  }
  return result;
}

function renderFrame(profile, state, frame, cellSize, isBoss) {
  const phase = frame / 7 * Math.PI * 2;
  let bob = Math.sin(phase) * (state === "idle" ? 2.2 : state === "move" ? 4.5 : 1.2);
  let lean = state === "move" ? Math.sin(phase) * 7 : state === "attack" || state === "attack-primary" ? 12 + frame * 1.2 : state === "attack-secondary" ? -5 : state === "hit" ? -10 : state === "defeat" ? 14 : 0;
  let squashX = state === "defeat" ? 1 + frame * 0.055 : state === "hit" ? 0.92 : 1;
  let squashY = state === "defeat" ? 1 - frame * 0.095 : state === "hit" ? 1.08 : state === "attack" || state === "attack-primary" ? 1.03 + frame * 0.012 : 1;
  let armSwing = state === "move" ? Math.sin(phase) * 22 : state === "attack" || state === "attack-primary" ? -30 - frame * 7 : state === "attack-secondary" || state === "special" ? Math.sin(phase) * 30 : state === "hit" ? 28 : 0;
  if (state === "entrance") { bob = 12 - frame * 2.4; squashX = 0.68 + frame * 0.065; squashY = 0.7 + frame * 0.06; }
  if (state === "phase-change") { bob = Math.sin(phase) * 4; squashX = 1.05 + frame * 0.025; squashY = 1.05 + frame * 0.025; }
  if (state === "defeat") lean = 12 + frame * 6;
  const scale = cellSize / 128 * (isBoss ? 1.23 : 1);
  const origin = cellSize / 2;
  const shadowY = isBoss ? 48 : 45;
  const eye = profile.eyes || "#fff8e8";
  const body = bodyMarkup(profile.shape, profile);
  const ornament = ornamentMarkup(profile.ornament, profile, frame, state);
  const limbs = '<g stroke="' + profile.accent + '" stroke-width="' + (isBoss ? 9 : 7) + '" stroke-linecap="round" fill="none"><path d="M-22 4 Q-37 13 -35 29" transform="rotate(' + armSwing + ' -22 4)"/><path d="M22 4 Q37 13 35 29" transform="rotate(' + (-armSwing) + ' 22 4)"/></g><g fill="' + profile.accent + '"><ellipse cx="-18" cy="36" rx="10" ry="7" transform="rotate(' + (state === "move" ? Math.sin(phase) * 25 : 0) + ' -18 36)"/><ellipse cx="18" cy="36" rx="10" ry="7" transform="rotate(' + (state === "move" ? -Math.sin(phase) * 25 : 0) + ' 18 36)"/></g>';
  const eyes = '<g><ellipse cx="-12" cy="-2" rx="8" ry="10" fill="' + eye + '"/><ellipse cx="12" cy="-2" rx="8" ry="10" fill="' + eye + '"/><circle cx="-10" cy="0" r="3.7" fill="#24233b"/><circle cx="14" cy="0" r="3.7" fill="#24233b"/><circle cx="-11" cy="-4" r="2" fill="#ffffff"/><circle cx="13" cy="-4" r="2" fill="#ffffff"/></g>';
  const mouth = state === "attack" || state === "attack-primary" || state === "special" ? '<ellipse cx="0" cy="17" rx="8" ry="7" fill="' + profile.accent + '"/>' : '<path d="M-8 15 Q0 21 8 15" stroke="' + profile.accent + '" stroke-width="3" fill="none" stroke-linecap="round"/>';
  const effect = state === "attack" || state === "attack-primary" ? '<circle cx="40" cy="4" r="' + (6 + frame * 1.8) + '" fill="' + profile.trim + '" opacity=".85"/><path d="M29 -12 Q48 -20 56 -2 Q49 18 31 14" fill="none" stroke="' + profile.light + '" stroke-width="4" stroke-linecap="round"/>' : state === "attack-secondary" || state === "special" ? '<circle cx="0" cy="-5" r="' + (34 + frame * 2) + '" fill="none" stroke="' + profile.trim + '" stroke-width="3" opacity=".7"/><circle cx="-42" cy="-22" r="4" fill="' + profile.light + '"/><circle cx="42" cy="-22" r="4" fill="' + profile.light + '"/>' : state === "phase-change" ? '<circle cx="0" cy="0" r="' + (28 + frame * 7) + '" fill="none" stroke="' + profile.trim + '" stroke-width="5" opacity=".72"/>' : "";
  const blink = frame === 6 && state === "idle" ? '<path d="M-19 -1 L-5 -1 M5 -1 L19 -1" stroke="' + profile.accent + '" stroke-width="4" stroke-linecap="round"/>' : "";
  const frameOpacity = state === "defeat" ? Math.max(0.38, 1 - frame * 0.1) : 1;
  return '<g data-state="' + state + '" data-frame="' + frame + '" transform="translate(' + origin + ' ' + origin + ') scale(' + scale.toFixed(4) + ')"><ellipse cx="0" cy="' + shadowY + '" rx="' + (isBoss ? 45 : 34) + '" ry="7" fill="#182239" opacity=".28"/><g opacity="' + frameOpacity + '" transform="translate(' + (state === "move" ? Math.sin(phase) * 2 : 0) + ' ' + bob.toFixed(2) + ') rotate(' + lean + ') scale(' + squashX.toFixed(3) + ' ' + squashY.toFixed(3) + ')">' + limbs + body + ornament + eyes + mouth + blink + effect + '</g></g>';
}

function makeSheet(profile, states, cellSize, isBoss) {
  const rows = states.length;
  const width = COLUMNS * cellSize;
  const height = rows * cellSize;
  const cells = [];
  states.forEach((state, row) => {
    for (let frame = 0; frame < COLUMNS; frame += 1) {
      cells.push('<g transform="translate(' + (frame * cellSize) + ' ' + (row * cellSize) + ')">' + renderFrame(profile, state, frame, cellSize, isBoss) + '</g>');
    }
  });
  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + width + '" height="' + height + '" viewBox="0 0 ' + width + ' ' + height + '"><defs><linearGradient id="body" x1="0" y1="0" x2="0.85" y2="1"><stop offset="0" stop-color="' + profile.light + '"/><stop offset=".46" stop-color="' + profile.body + '"/><stop offset="1" stop-color="' + profile.accent + '"/></linearGradient><radialGradient id="aura"><stop offset="0" stop-color="' + profile.trim + '" stop-opacity=".28"/><stop offset="1" stop-color="' + profile.trim + '" stop-opacity="0"/></radialGradient></defs>' + cells.join("") + '</svg>';
}

function animationMap(states) {
  const map = {};
  states.forEach((state, row) => {
    map[state] = { row, start: row * COLUMNS, end: row * COLUMNS + COLUMNS - 1, frameRate: state === "idle" ? 7 : state === "move" ? 10 : state === "defeat" ? 8 : 12, repeat: ["idle", "move"].includes(state) ? -1 : 0 };
  });
  return map;
}

mkdirSync(ROOT, { recursive: true });
const manifest = {
  source: "Original procedural SVG artwork generated in-repository; no third-party sprite files or paid assets included.",
  sheet: { width: COLUMNS * ENEMY_SIZE, height: ENEMY_STATES.length * ENEMY_SIZE, frameWidth: ENEMY_SIZE, frameHeight: ENEMY_SIZE, columns: COLUMNS, rows: ENEMY_STATES.length, framesPerState: COLUMNS },
  bossSheet: { width: COLUMNS * BOSS_SIZE, height: BOSS_STATES.length * BOSS_SIZE, frameWidth: BOSS_SIZE, frameHeight: BOSS_SIZE, columns: COLUMNS, rows: BOSS_STATES.length, framesPerState: COLUMNS },
  states: ENEMY_STATES,
  bossStates: BOSS_STATES,
  regularEnemyCount: 32,
  bossCount: 5,
  characters: [],
};

function stateRanges(states) {
  return Object.fromEntries(states.map((state, row) => [state, [row * COLUMNS, row * COLUMNS + COLUMNS - 1]]));
}

for (const archetype of PREMIUM_ENEMY_ARCHETYPES) {
  const profile = profiles[archetype.id];
  if (!profile) throw new Error("Missing unique art profile for enemy " + archetype.id);
  const file = archetype.id + ".svg";
  writeFileSync(resolve(ROOT, file), makeSheet(profile, ENEMY_STATES, ENEMY_SIZE, false), "utf8");
  manifest.characters.push({
    id: archetype.id, name: archetype.name, kind: "enemy", role: archetype.role, style: archetype.style || null,
    silhouette: profile.shape, ornament: profile.ornament, palette: [profile.body, profile.light, profile.trim, profile.accent],
    framesPerState: COLUMNS, stateRanges: stateRanges(ENEMY_STATES), visualSignature: archetype.id.split("").reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7),
    file,
  });
}

for (const boss of PREMIUM_BOSSES) {
  const profile = bossProfiles[boss.id];
  if (!profile) throw new Error("Missing unique art profile for boss " + boss.id);
  const file = boss.id + ".svg";
  writeFileSync(resolve(ROOT, file), makeSheet(profile, BOSS_STATES, BOSS_SIZE, true), "utf8");
  manifest.characters.push({
    id: boss.id, name: profile.name, kind: "boss", role: boss.style, style: boss.style,
    silhouette: profile.shape, ornament: profile.ornament, palette: [profile.body, profile.light, profile.trim, profile.accent],
    framesPerState: COLUMNS, stateRanges: stateRanges(BOSS_STATES), visualSignature: boss.id.split("").reduce((sum, char) => (sum * 31 + char.charCodeAt(0)) >>> 0, 7),
    file,
  });
}

writeFileSync(resolve(ROOT, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log("Generated " + manifest.regularEnemyCount + " unique enemy sheets and " + manifest.bossCount + " distinct boss sheets (" + (manifest.characters.length * COLUMNS) + " frames per animation state across the roster).");
