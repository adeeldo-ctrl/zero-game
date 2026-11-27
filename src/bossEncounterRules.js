export const BOSS_ATTENDANT_WAVE_SIZE = 2;
export const BOSS_ATTENDANT_MAX_ACTIVE = 8;

export function getBossAttendantWaveSize(
  activeCount,
  maxActive = BOSS_ATTENDANT_MAX_ACTIVE,
  waveSize = BOSS_ATTENDANT_WAVE_SIZE,
) {
  const active = Math.max(0, Math.floor(Number(activeCount) || 0));
  const cap = Math.max(0, Math.floor(Number(maxActive) || 0));
  const wave = Math.max(1, Math.floor(Number(waveSize) || 1));
  if (active > cap - wave) return 0;
  return Math.min(wave, cap - active);
}

export const BOSS_SIGNATURE_PROFILES = {
  gatekeeper: { signature: "stonequake", counts: [3, 5, 7], spread: 0.2, speed: 225, shape: "stone", radial: false },
  "iron-comet": { signature: "comet-rush", counts: [3, 4, 5], spread: 0.11, speed: 390, shape: "punch", radial: false },
  "gale-talon": { signature: "cyclone-dive", counts: [5, 7, 9], spread: 0.46, speed: 320, shape: "talon", radial: false },
  suncrest: { signature: "solar-combo", counts: [6, 8, 10], spread: Math.PI * 2, speed: 245, shape: "sun", radial: true },
  "void-sovereign": { signature: "rift-collapse", counts: [6, 9, 12], spread: Math.PI * 1.6, speed: 275, shape: "void", radial: true },
};

export function getBossSignatureProfile(bossId) {
  return BOSS_SIGNATURE_PROFILES[bossId] || BOSS_SIGNATURE_PROFILES.gatekeeper;
}

export const BOSS_ANIMATION_PROFILES = {
  gatekeeper: { idleFrames: [0, 1, 0, 1], idleRate: 4, strikeFrames: [2, 3, 2, 3], strikeRate: 8, hitFrames: [3, 0, 3], phaseFrames: [0, 2, 3, 1], defeatFrames: [3, 2, 1, 0] },
  "iron-comet": { idleFrames: [0, 1, 2, 1], idleRate: 8, strikeFrames: [1, 2, 3, 2], strikeRate: 16, hitFrames: [2, 0, 2], phaseFrames: [1, 3, 2, 0], defeatFrames: [2, 3, 1, 0] },
  "gale-talon": { idleFrames: [0, 2, 0, 2], idleRate: 9, strikeFrames: [1, 2, 3, 1], strikeRate: 18, hitFrames: [1, 3, 1], phaseFrames: [2, 0, 3, 1], defeatFrames: [1, 2, 3, 0] },
  suncrest: { idleFrames: [0, 1, 2, 3], idleRate: 5, strikeFrames: [3, 2, 1, 2], strikeRate: 11, hitFrames: [3, 1, 3], phaseFrames: [0, 3, 2, 1], defeatFrames: [3, 1, 2, 0] },
  "void-sovereign": { idleFrames: [0, 3, 0, 3], idleRate: 4, strikeFrames: [2, 1, 3, 2], strikeRate: 14, hitFrames: [0, 2, 0], phaseFrames: [3, 1, 0, 2], defeatFrames: [2, 1, 3, 0] },
};
