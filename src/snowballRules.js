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

// Snow Bros-inspired arcade rolling: the ball accelerates while grounded,
// keeps momentum in the air, and spins in proportion to distance travelled.
export const ROLLING_BALL_START_SPEED = 390;
export const ROLLING_BALL_ACCELERATION = 520;
export const ROLLING_BALL_MAX_SPEED = 700;
export const ROLLING_BALL_RADIUS = 27;

export function calculateRollingBallMotion({
  velocityX = 0,
  direction = 1,
  deltaMs = 16,
  grounded = false,
  blockedLeft = false,
  blockedRight = false,
}) {
  const dt = Math.max(0, Math.min(deltaMs, 50)) / 1000;
  let nextDirection = Math.sign(velocityX) || Math.sign(direction) || 1;
  let speed = Math.abs(velocityX);

  // Snow Bros-style finish: first wall contact ends the carried enemy rather
  // than bouncing the ball back across the level.
  if (blockedLeft || blockedRight) {
    return { velocityX: 0, direction: nextDirection, rotationDelta: 0, hitWall: true };
  }

  if (grounded) {
    speed = Math.min(ROLLING_BALL_MAX_SPEED, Math.max(speed, ROLLING_BALL_START_SPEED) + ROLLING_BALL_ACCELERATION * dt);
  } else {
    // Keep most horizontal momentum while the ball drops between platforms.
    speed *= Math.max(0.985, 1 - dt * 0.18);
  }

  const nextVelocityX = nextDirection * speed;
  const rotationDelta = (nextVelocityX * dt / ROLLING_BALL_RADIUS) * (180 / Math.PI);
  return { velocityX: nextVelocityX, direction: nextDirection, rotationDelta };
}

export function isRollingBallOutOfBounds(x) {
  return x < -90 || x > 1050;
}
