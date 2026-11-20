// Dastaan Heroes: data-driven campaign definitions.
// Stage visuals, enemy families, bosses and elemental powers are kept separate
// from the Phaser scene so the campaign can grow without hard-coded level logic.

export const ELEMENTS = [
  { id: "fire", name: "Fire", color: 0xff792d, edge: 0xffdf68, glow: 0xffa33c, trail: 0xffe28a, ball: 0xff6b22, effect: "flame" },
  { id: "ice", name: "Ice", color: 0x8deaff, edge: 0xe6fbff, glow: 0x64dfff, trail: 0xffffff, ball: 0xc8f4ff, effect: "frost" },
  { id: "lightning", name: "Lightning", color: 0xb18aff, edge: 0xf1e6ff, glow: 0xd1a7ff, trail: 0xffffff, ball: 0x9972ff, effect: "spark" },
  { id: "water", name: "Water", color: 0x319cff, edge: 0x9be6ff, glow: 0x48caff, trail: 0xc8f5ff, ball: 0x278eea, effect: "splash" },
  { id: "nature", name: "Nature", color: 0x55c96b, edge: 0xc4ff8a, glow: 0x8bea72, trail: 0xe0ffc2, ball: 0x42a94f, effect: "leaf" },
  { id: "wind", name: "Wind", color: 0x9cebdc, edge: 0xe5fff8, glow: 0x9ffff0, trail: 0xffffff, ball: 0x6bd8c6, effect: "gust" },
  { id: "earth", name: "Earth", color: 0xb77b48, edge: 0xf4ce91, glow: 0xd89b5c, trail: 0xffe1ac, ball: 0x986039, effect: "stone" },
  { id: "light", name: "Light", color: 0xffe36a, edge: 0xffffff, glow: 0xfff29b, trail: 0xffffff, ball: 0xffd34e, effect: "starburst" },
  { id: "shadow", name: "Shadow", color: 0x7356b9, edge: 0xc7aaff, glow: 0x9c78e8, trail: 0xe2d5ff, ball: 0x51388f, effect: "void" },
  { id: "plasma", name: "Plasma", color: 0xff5ca8, edge: 0xffd0e6, glow: 0xff80c0, trail: 0xffe2f0, ball: 0xe83f91, effect: "pulse" }
];

export const HEROES = [
  {
    id: "ryo", name: "Ryo", title: "Balanced Wave Fighter", style: "Balanced martial arts",
    element: "fire", superPower: "Dragon Burst", color: 0x2b8f83, accent: 0xffc15a,
    description: "A balanced fighter with powerful energy waves.",
    specialMoves: [
      { id: "sky-throw", name: "Sky Throw", type: "throw" },
      { id: "rising-wave", name: "Rising Wave", type: "launch" },
      { id: "spinning-burst", name: "Spinning Burst", type: "shockwave" }
    ]
  },
  {
    id: "kairo", name: "Kairo", title: "Flame Rush Fighter", style: "Fast and aggressive",
    element: "fire", superPower: "Blazing Cyclone", color: 0xb74435, accent: 0xffd16b,
    description: "A fast fighter whose special moves create fiery impact bursts.",
    specialMoves: [
      { id: "flame-dash", name: "Flame Dash", type: "dash" },
      { id: "flare-launch", name: "Flare Launch", type: "launch" },
      { id: "fire-spin", name: "Fire Spin", type: "shockwave" }
    ]
  },
  {
    id: "mei", name: "Mei", title: "Lightning Kick Fighter", style: "Agile and acrobatic",
    element: "lightning", superPower: "Thunder Fan", color: 0x2879c3, accent: 0x9cecff,
    description: "An agile fighter with rapid kicks and wide-area energy effects.",
    specialMoves: [
      { id: "rapid-kick", name: "Rapid Kick", type: "rapid" },
      { id: "sky-wheel", name: "Sky Wheel", type: "launch" },
      { id: "lightning-ring", name: "Lightning Ring", type: "shockwave" }
    ]
  },
  {
    id: "volt", name: "Volt", title: "Electric Wild Fighter", style: "Powerful and unpredictable",
    element: "lightning", superPower: "Electric Storm", color: 0x399b56, accent: 0xffe16a,
    description: "A powerful fighter whose electric attacks push back groups of enemies.",
    specialMoves: [
      { id: "electric-grab", name: "Electric Grab", type: "throw" },
      { id: "rolling-rush", name: "Rolling Rush", type: "dash" },
      { id: "thunder-shockwave", name: "Thunder Shockwave", type: "shockwave" }
    ]
  }
];

export const ENEMY_FAMILIES = [
  { id: "striker", names: ["Street Striker", "Arena Boxer", "Red Sash Fighter", "Rising Kick Adept", "Guard Captain", "Training Champion", "Power Puncher", "Iron Step Fighter"] },
  { id: "agile", names: ["Swift Claw Runner", "Sky Kicker", "Shadow Acrobat", "Quickstep Fighter", "Whirlwind Adept", "Flash Jumper", "Twin Kick Scout", "Darting Champion"] },
  { id: "power", names: ["Heavyweight Guard", "Iron Fist Brawler", "Stone Step Fighter", "Thunder Guard", "Arena Bruiser", "Mighty Grappler", "Heavy Kick Expert", "Steel Wall Fighter"] }
];

const WORLDS = [
  { name: "Emerald Kingdom", sky: 0x79ccef, far: 0x6b9eaa, ground: 0x397c4c, accent: 0x8ad35b, platform: 0x8a6a50 },
  { name: "Candy Orchard", sky: 0xffc6d9, far: 0xc77ca4, ground: 0x8d5478, accent: 0xffe28a, platform: 0xb77b83 },
  { name: "Frozen Peaks", sky: 0x9adcf4, far: 0x759fb9, ground: 0x477c9c, accent: 0xe4fbff, platform: 0x7395aa },
  { name: "Golden Desert", sky: 0xf4c77e, far: 0xc58b59, ground: 0x9a633c, accent: 0xffe09b, platform: 0x9d7654 },
  { name: "Moonlit Forest", sky: 0x26345f, far: 0x394b70, ground: 0x254d48, accent: 0x91e6a6, platform: 0x526b60 },
  { name: "Crystal Caves", sky: 0x443b78, far: 0x7466a8, ground: 0x3b477a, accent: 0xb9a7ff, platform: 0x6c6996 },
  { name: "Coral Coast", sky: 0x6bd4d0, far: 0x4b9ca7, ground: 0x287f79, accent: 0xffd49b, platform: 0x9a8062 },
  { name: "Sky Islands", sky: 0x9acbff, far: 0x7898c8, ground: 0x527c9b, accent: 0xf5e6a3, platform: 0x8c9dba },
  { name: "Volcano Valley", sky: 0x513c51, far: 0x80505b, ground: 0x493b43, accent: 0xff9b55, platform: 0x72555a },
  { name: "Starfall Citadel", sky: 0x171e48, far: 0x343e78, ground: 0x34305d, accent: 0xffdf88, platform: 0x69618f }
];

const BOSS_DATA = [
  { name: "Ironback Brawler", family: "power", element: "earth", hp: 34, attack: "Ground Pulse", color: 0x8a5943, style: "intro bruiser" },
  { name: "The Pit Champion", family: "striker", element: "fire", hp: 46, attack: "Heavy Impact", color: 0xa64b3d, style: "boxing champion" },
  { name: "Crimson Talon", family: "agile", element: "wind", hp: 54, attack: "Aerial Rush", color: 0x8d405e, style: "agile aerial fighter" },
  { name: "Summit Master", family: "striker", element: "lightning", hp: 64, attack: "Thunder Form", color: 0x6259a7, style: "martial arts master" },
  { name: "Obsidian Warlord", family: "power", element: "shadow", hp: 82, attack: "Warlord Storm", color: 0x493b76, style: "final warlord" }
];

const stageColor = (color, step, channelShift = 1) => {
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  const shift = step * channelShift;
  const nr = Math.max(0, Math.min(255, r + Math.sin(shift * 0.17) * 28));
  const ng = Math.max(0, Math.min(255, g + Math.cos(shift * 0.13) * 24));
  const nb = Math.max(0, Math.min(255, b + Math.sin(shift * 0.11 + 1) * 26));
  return (Math.round(nr) << 16) | (Math.round(ng) << 8) | Math.round(nb);
};

export const STAGES = Array.from({ length: 50 }, (_, index) => {
  const number = index + 1;
  const worldIndex = Math.floor(index / 5) % WORLDS.length;
  const world = WORLDS[worldIndex];
  const family = ENEMY_FAMILIES[(index + Math.floor(index / 3)) % ENEMY_FAMILIES.length];
  const boss = number % 10 === 0 ? BOSS_DATA[number / 10 - 1] : null;
  return {
    number,
    name: `${world.name} - Stage ${String(number).padStart(2, "0")}`,
    world: world.name,
    worldIndex,
    background: {
      ...world,
      sky: stageColor(world.sky, number, 1.4),
      far: stageColor(world.far, number, 1.1),
      ground: stageColor(world.ground, number, 0.9),
      accent: stageColor(world.accent, number, 1.7),
      stageVariant: index % 5,
      atmosphere: ["Dawn", "Daylight", "Sunset", "Twilight", "Midnight"][index % 5]
    },
    enemyFamily: family.id,
    enemyTypes: Array.from({ length: 6 + Math.floor(index / 10) }, (_, enemyIndex) =>
      family.names[(index + enemyIndex * 2) % family.names.length]
    ),
    enemyCount: 6 + Math.floor(index / 10),
    timeLimit: 120,
    boss
  };
});

export const getStage = (number) => STAGES[Math.max(0, Math.min(49, number - 1))];
export const getElement = (id) => ELEMENTS.find((element) => element.id === id) || ELEMENTS[0];
export const getHero = (id) => HEROES.find((hero) => hero.id === id) || HEROES[0];
