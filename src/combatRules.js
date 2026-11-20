export function getBossPhase(health, maxHealth) {
  if (!(maxHealth > 0)) return 1;
  const ratio = Math.max(0, Number(health) || 0) / maxHealth;
  return ratio <= 0.25 ? 3 : ratio <= 0.6 ? 2 : 1;
}
