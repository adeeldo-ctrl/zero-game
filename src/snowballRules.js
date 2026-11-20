export function canKickElementBall({
  active = false,
  frozen = false,
  rolling = false,
  dx = 0,
  dy = 0,
  facing = 1,
  maxDistance = 118,
  maxVerticalDistance = 78,
}) {
  return active && frozen && !rolling &&
    dx * facing >= -24 &&
    Math.abs(dx) < maxDistance &&
    Math.abs(dy) < maxVerticalDistance;
}

export function canRollingBallHitTarget(dx, dy) {
  return Math.abs(dx) <= 64 && Math.abs(dy) <= 72;
}

export function isRollingBallOutOfBounds(x) {
  return x < -90 || x > 1050;
}
