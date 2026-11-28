export const GROUND_ENEMY_TYPES = Object.freeze([
  "chaser", "runner", "jumper", "guard", "charger", "flyer", "ambusher", "ranged", "bomber", "summoner",
]);

// Keep ordinary enemies clearly smaller than the dedicated boss artwork.
export const REGULAR_ENEMY_VISUAL_SCALE = 0.50;

export function getEnemyMovementSpeed(aiType, requestedSpeed) {
  return GROUND_ENEMY_TYPES.includes(aiType) ? requestedSpeed : 55;
}

export function getEnemyFacingDirection(targetX, enemyX, fallback = 1) {
  return targetX === enemyX ? (Math.sign(fallback) || 1) : targetX > enemyX ? 1 : -1;
}


const ENEMY_CLASS_POWER = Object.freeze({ fast: 1, special: 2, heavy: 3 });
const ELEMENT_POWER = Object.freeze({
  fire: 3, ice: 1, lightning: 3, water: 1, nature: 1,
  wind: 2, earth: 3, light: 3, shadow: 2, plasma: 3,
});

export function getSnowballPowerTier(enemyClass, elementId, stageNumber = 1) {
  const classPower = ENEMY_CLASS_POWER[enemyClass] || 1;
  const elementPower = ELEMENT_POWER[elementId] || 1;
  const stagePower = Math.floor((Math.max(1, Number(stageNumber) || 1) - 1) / 20);
  return Math.min(5, Math.max(classPower, elementPower) + stagePower);
}
