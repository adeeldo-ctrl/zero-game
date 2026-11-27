export function canKickElementBall({
  active = false, frozen = false, rolling = false, dx = 0, dy = 0,
  facing = 1, maxDistance = 118, maxVerticalDistance = 78,
}) {
  return active && frozen && !rolling && dx * facing >= -24 &&
    Math.abs(dx) < maxDistance && Math.abs(dy) < maxVerticalDistance;
}

export function canRollingBallHitTarget(dx, dy) {
  return Math.abs(dx) <= 64 && Math.abs(dy) <= 72;
}

export const ROLLING_BALL_START_SPEED = 390;
export const ROLLING_BALL_ACCELERATION = 520;
export const ROLLING_BALL_MAX_SPEED = 700;
export const ROLLING_BALL_RADIUS = 27;
export const ROLLING_BALL_WALL_BOUNCES = 1;
export const ROLLING_BALL_BOUNCE_DAMPING = 0.72;

export function calculateRollingBallMotion({
  velocityX = 0, direction = 1, deltaMs = 16, grounded = false,
  blockedLeft = false, blockedRight = false, wallBounces = 0,
  maxWallBounces = ROLLING_BALL_WALL_BOUNCES,
}) {
  const dt = Math.max(0, Math.min(deltaMs, 50)) / 1000;
  let nextDirection = Math.sign(velocityX) || Math.sign(direction) || 1;
  let speed = Math.abs(velocityX);
  if (blockedLeft || blockedRight) {
    const nextWallBounces = wallBounces + 1;
    if (nextWallBounces >= maxWallBounces) {
      return { velocityX: 0, direction: nextDirection, rotationDelta: 0,
        hitWall: true, wallBounces: nextWallBounces, finished: true };
    }
    nextDirection = blockedLeft ? 1 : -1;
    speed = Math.max(210, speed * ROLLING_BALL_BOUNCE_DAMPING);
    return { velocityX: nextDirection * speed, direction: nextDirection,
      rotationDelta: 0, hitWall: true, wallBounces: nextWallBounces, finished: false };
  }
  if (grounded) speed = Math.min(ROLLING_BALL_MAX_SPEED,
    Math.max(speed, ROLLING_BALL_START_SPEED) + ROLLING_BALL_ACCELERATION * dt);
  else speed *= Math.max(0.985, 1 - dt * 0.18);
  const nextVelocityX = nextDirection * speed;
  return { velocityX: nextVelocityX, direction: nextDirection,
    rotationDelta: (nextVelocityX * dt / ROLLING_BALL_RADIUS) * (180 / Math.PI),
    hitWall: false, wallBounces };
}

export function isRollingBallOutOfBounds(x) {
  return x < -90 || x > 1050;
}
