export const GROUND_ENEMY_TYPES = Object.freeze([
  "chaser", "runner", "jumper", "guard", "charger",
]);

export const REGULAR_ENEMY_VISUAL_SCALE = 1.2;

export function getEnemyMovementSpeed(aiType, requestedSpeed) {
  return GROUND_ENEMY_TYPES.includes(aiType) ? requestedSpeed : 55;
}

export function getEnemyFacingDirection(targetX, enemyX, fallback = 1) {
  return targetX === enemyX ? (Math.sign(fallback) || 1) : targetX > enemyX ? 1 : -1;
}
