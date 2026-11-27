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
