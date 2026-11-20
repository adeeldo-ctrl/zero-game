export const GROUND_ENEMY_TYPES = Object.freeze([
  "chaser",
  "runner",
  "jumper",
  "guard",
  "charger",
]);

export function getEnemyMovementSpeed(aiType, requestedSpeed) {
  return GROUND_ENEMY_TYPES.includes(aiType) ? requestedSpeed : 55;
}
