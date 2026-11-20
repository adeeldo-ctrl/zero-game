export function shouldHeroCollideWithPlatform({
  isGround = false,
  dropThroughActive = false,
  velocityY = 0,
  heroBottom = 0,
  platformTop = 0,
}) {
  if (isGround) return true;
  if (dropThroughActive) return false;
  return velocityY >= 0 && heroBottom <= platformTop + 16;
}

export function shouldDropThroughPlatform({
  jumpPressed = false,
  downHeld = false,
  grounded = false,
  isGround = false,
}) {
  return jumpPressed && downHeld && grounded && !isGround;
}
