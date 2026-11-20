export const SPECIAL_MOVE_COOLDOWN_MS = 1450;

export function getSpecialCooldownStatus(readyAt, now) {
  const remainingMs = Math.max(0, Number(readyAt) - Number(now));
  return {
    ready: remainingMs === 0,
    remainingMs,
    remainingSeconds: remainingMs === 0 ? 0 : Math.max(1, Math.ceil(remainingMs / 1000)),
  };
}

export function getBossPhase(health, maxHealth) {
  if (!(maxHealth > 0)) return 1;
  const ratio = Math.max(0, Number(health) || 0) / maxHealth;
  return ratio <= 0.25 ? 3 : ratio <= 0.6 ? 2 : 1;
}
