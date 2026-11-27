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
