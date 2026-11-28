// Premium campaign content manifest.
// This is the authored data contract for the 50-stage rebuild.
// Artwork, animation clips, audio files and runtime encounter integration are separate required deliverables.
export const PREMIUM_ENEMY_REGIONS = [
  {
    id: "emerald-forest",
    stages: [1, 10],
    enemies: [
      ["moss-scout", "Moss Scout", "runner", "common"],
      ["thorn-guard", "Thorn Guard", "shield", "common"],
      ["acorn-leaper", "Acorn Leaper", "leaper", "common"],
      ["spore-caster", "Spore Caster", "ranged", "special"],
      ["root-burrower", "Root Burrower", "ambusher", "special"],
      ["fern-glider", "Fern Glider", "flying", "common"],
      ["bark-bruiser", "Bark Bruiser", "heavy", "common"],
      ["venom-stalker", "Venom Stalker", "charger", "elite"],
      ["ancient-wisp", "Ancient Wisp", "summoner", "elite"],
      // Distinct approved-art variant identities; each keeps its own role and palette.
      ["shadow-moss-scout", "Shadow Moss Scout", "runner", "common", { variantOf: "moss-scout", artBaseId: "moss-scout", tint: 0x70c7ff, style: "shadow" }],
      ["iron-bark-bruiser", "Ironbark Bruiser", "heavy", "special", { variantOf: "bark-bruiser", artBaseId: "bark-bruiser", tint: 0xb6a7ff, style: "metal" }],
      ["golden-acorn-leaper", "Golden Acorn Leaper", "leaper", "common", { variantOf: "acorn-leaper", artBaseId: "acorn-leaper", tint: 0xffd65a, style: "solar" }],
    ],
  },
  {
    id: "candy-orchard",
    stages: [11, 20],
    enemies: [
      ["gumdrop-dasher", "Gumdrop Dasher", "runner", "common"],
      ["taffy-tank", "Taffy Tank", "heavy", "common"],
      ["jelly-vault", "Jelly Vault", "leaper", "common"],
      ["licorice-sniper", "Licorice Sniper", "ranged", "special"],
      ["sugar-shell", "Sugar Shell", "shield", "common"],
      ["fizz-bomber", "Fizz Bomber", "bomber", "special"],
      ["candy-copter", "Candy Copter", "flying", "common"],
      ["caramel-mauler", "Caramel Mauler", "charger", "elite"],
      ["prism-trickster", "Prism Trickster", "illusionist", "elite"],
      // Distinct approved-art variant identities; each keeps its own role and palette.
      ["prism-jelly-vault", "Prism Jelly Vault", "leaper", "special", { variantOf: "jelly-vault", artBaseId: "jelly-vault", tint: 0xa5f4ff, style: "prism" }],
      ["molten-caramel-mauler", "Molten Caramel Mauler", "charger", "elite", { variantOf: "caramel-mauler", artBaseId: "caramel-mauler", tint: 0xff7046, style: "flame" }],
      ["storm-candy-copter", "Storm Candy Copter", "flying", "special", { variantOf: "candy-copter", artBaseId: "candy-copter", tint: 0x76e8ff, style: "storm" }],
    ],
  },
  {
    id: "frost-citadel",
    stages: [21, 30],
    enemies: [
      ["flake-runner", "Flake Runner", "runner", "common"],
      ["glacier-sentinel", "Glacier Sentinel", "shield", "common"],
      ["icicle-hopper", "Icicle Hopper", "leaper", "common"],
      ["blizzard-mage", "Blizzard Mage", "ranged", "special"],
      ["snowdrift-stalker", "Snowdrift Stalker", "ambusher", "special"],
      ["frostwing", "Frostwing", "flying", "common"],
      ["permafrost-ogre", "Permafrost Ogre", "heavy", "common"],
      ["hailstorm-lancer", "Hailstorm Lancer", "charger", "elite"],
      ["glacial-oracle", "Glacial Oracle", "summoner", "elite"],
      // Distinct approved-art variant identities; each keeps its own role and palette.
      ["frostfire-icicle-hopper", "Frostfire Icicle Hopper", "leaper", "special", { variantOf: "icicle-hopper", artBaseId: "icicle-hopper", tint: 0xa9f5ff, style: "frostfire" }],
      ["crystal-spore-caster", "Crystal Spore Caster", "ranged", "special", { variantOf: "spore-caster", artBaseId: "spore-caster", tint: 0xd7a5ff, style: "crystal" }],
      ["thorn-root-burrower", "Thorn Root Burrower", "ambusher", "elite", { variantOf: "root-burrower", artBaseId: "root-burrower", tint: 0x9de477, style: "thorn" }],
    ],
  },
  {
    id: "moonlit-jungle",
    stages: [31, 40],
    enemies: [
      ["moon-prowler", "Moon Prowler", "runner", "common"],
      ["jade-shellback", "Jade Shellback", "shield", "common"],
      ["vine-vault", "Vine Vault", "leaper", "common"],
      ["willow-witch", "Willow Witch", "ranged", "special"],
      ["mire-burrower", "Mire Burrower", "ambusher", "special"],
      ["night-manta", "Night Manta", "flying", "common"],
      ["temple-breaker", "Temple Breaker", "heavy", "common"],
      ["spirit-pouncer", "Spirit Pouncer", "charger", "elite"],
      ["eclipse-summoner", "Eclipse Summoner", "summoner", "elite"],
      // Distinct approved-art variant identities; each keeps its own role and palette.
      ["ember-spirit-pouncer", "Ember Spirit Pouncer", "charger", "elite", { variantOf: "spirit-pouncer", artBaseId: "spirit-pouncer", tint: 0xff8152, style: "ember" }],
      ["toxic-vine-vault", "Toxic Vine Vault", "leaper", "special", { variantOf: "vine-vault", artBaseId: "vine-vault", tint: 0xb6ee58, style: "toxic" }],
      ["solar-jade-shellback", "Solar Jade Shellback", "shield", "special", { variantOf: "jade-shellback", artBaseId: "jade-shellback", tint: 0xffe16b, style: "solar" }],
    ],
  },
  {
    id: "starfall-realm",
    stages: [41, 50],
    enemies: [
      ["comet-dart", "Comet Dart", "runner", "common"],
      ["nebula-warden", "Nebula Warden", "shield", "common"],
      ["orbit-jumper", "Orbit Jumper", "leaper", "common"],
      ["quasar-sage", "Quasar Sage", "ranged", "special"],
      ["rift-stalker", "Rift Stalker", "ambusher", "special"],
      ["stardust-ray", "Stardust Ray", "flying", "common"],
      ["meteor-colossus", "Meteor Colossus", "heavy", "common"],
      ["nova-lancer", "Nova Lancer", "charger", "elite"],
      ["void-architect", "Void Architect", "summoner", "elite"],
      // Distinct approved-art variant identities; each keeps its own role and palette.
      ["plasma-mire-burrower", "Plasma Mire Burrower", "ambusher", "elite", { variantOf: "mire-burrower", artBaseId: "mire-burrower", tint: 0xe58cff, style: "plasma" }],
      ["void-licorice-sniper", "Void Licorice Sniper", "ranged", "elite", { variantOf: "licorice-sniper", artBaseId: "licorice-sniper", tint: 0xa78bff, style: "void" }],
      ["astral-eclipse-summoner", "Astral Eclipse Summoner", "summoner", "elite", { variantOf: "eclipse-summoner", artBaseId: "eclipse-summoner", tint: 0xc19cff, style: "astral" }],
      ["frost-temple-breaker", "Frost Temple Breaker", "heavy", "elite", { variantOf: "temple-breaker", artBaseId: "temple-breaker", tint: 0x8fe8ff, style: "glacier" }],
    ],
  },
].map((region) => ({
  ...region,
  enemies: region.enemies.map(([id, name, role, tier, variant = null]) => ({
    id, name, role, tier, ...(variant || {}),
    spriteKey: `enemy-${id}`,
    animations: ["idle", "move", "attack", "hit", "defeat"],
  })),
}));

export const PREMIUM_BOSSES = [
  { stage: 10, id: "gatekeeper", name: "Arena Gatekeeper", style: "armored-guardian", signature: "stonequake", music: "boss-gatekeeper-theme" },
  { stage: 20, id: "iron-comet", name: "Iron Comet", style: "meteor-bruiser", signature: "comet-rush", music: "boss-iron-comet-theme" },
  { stage: 30, id: "gale-talon", name: "Gale Talon", style: "aerial-duelist", signature: "cyclone-dive", music: "boss-gale-talon-theme" },
  { stage: 40, id: "suncrest", name: "Suncrest Master", style: "radiant-martial-artist", signature: "solar-combo", music: "boss-suncrest-theme" },
  { stage: 50, id: "void-sovereign", name: "Void Sovereign", style: "cosmic-final-form", signature: "rift-collapse", music: "boss-void-sovereign-theme" },
].map((boss) => ({
  ...boss,
  spriteKey: `boss-${boss.id}`,
  animations: ["entrance", "idle", "move", "attack-primary", "attack-secondary", "special", "hit", "phase-change", "defeat"],
  attendantsPerWave: 2,
  maxActiveAttendants: 8,
}));

export const PREMIUM_STAGE_MUSIC = Array.from({ length: 50 }, (_, index) => ({
  stage: index + 1,
  trackId: `stage-${String(index + 1).padStart(2, "0")}-theme`,
  regionId: PREMIUM_ENEMY_REGIONS[Math.floor(index / 10)].id,
}));

export const PREMIUM_PLATFORM_FAMILIES = [
  "polished-stone", "candy-glass", "carved-wood", "ice-crystal", "cloud-sky",
  "clockwork-metal", "lava-obsidian", "rune-energy", "floating-moss", "starfield",
];

export const PREMIUM_PLATFORM_SHAPES = [
  "cloud-island", "crystal-bridge", "gear-rail", "vine-branch",
  "rune-arch", "candy-bubble", "lava-crack", "star-bridge",
];

export const PREMIUM_SPECIAL_PLATFORM_TYPES = [
  "accelerator", "spring-bounce", "temporary-fade", "moving", "slippery-ice",
  "one-way-drop-through", "elemental-energy",
];

export function getPremiumEnemyRegion(stageNumber) {
  const stage = Math.max(1, Math.min(50, Math.floor(Number(stageNumber) || 1)));
  return PREMIUM_ENEMY_REGIONS[Math.floor((stage - 1) / 10)];
}

export function getPremiumStageEnemyRoster(stageNumber) {
  const stage = Math.max(1, Math.min(50, Math.floor(Number(stageNumber) || 1)));
  const region = getPremiumEnemyRegion(stage);
  const localStage = ((stage - 1) % 10) + 1;
  // Each stage introduces/combines different members of its region's nine-type roster.
  const rosterSize = region.enemies.length;
  const availableCount = Math.min(rosterSize, 2 + Math.floor((Math.min(localStage, 9) - 1) * (rosterSize - 2) / 8));
  const rotation = (localStage - 1) % rosterSize;
  return Array.from({ length: availableCount }, (_, index) =>
    region.enemies[(rotation + index) % region.enemies.length]
  );
}

export function getPremiumBoss(stageNumber) {
  return PREMIUM_BOSSES.find((boss) => boss.stage === Number(stageNumber)) || null;
}

export function getPremiumStageMusic(stageNumber) {
  return PREMIUM_STAGE_MUSIC[Math.max(0, Math.min(49, Number(stageNumber) - 1))];
}

export const PREMIUM_ENEMY_ARCHETYPES = PREMIUM_ENEMY_REGIONS.flatMap((region) => region.enemies);

export function getPremiumEnemyFrameIndex(archetypeId) {
  return PREMIUM_ENEMY_ARCHETYPES.findIndex((enemy) => enemy.id === archetypeId);
}
