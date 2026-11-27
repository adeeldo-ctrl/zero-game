export function getBossPhase(health, maxHealth) {
  if (!(maxHealth > 0)) return 1;
  const ratio = Math.max(0, Number(health) || 0) / maxHealth;
  return ratio <= 0.25 ? 3 : ratio <= 0.6 ? 2 : 1;
}

export function isValidJumpStomp({ heroBottom, enemyTop, heroY, enemyY, velocityY, isBoss = false }) {
  return !isBoss && velocityY > 85 && heroBottom <= enemyTop + 26 && heroY < enemyY - 12;
}
