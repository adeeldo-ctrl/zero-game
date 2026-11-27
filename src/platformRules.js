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

export const PLATFORM_TEXTURE_WIDTH = 180;

export function getPlatformTextureScale(platformWidth, textureWidth = PLATFORM_TEXTURE_WIDTH) {
  const width = Number(platformWidth);
  const sourceWidth = Number(textureWidth);
  if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(sourceWidth) || sourceWidth <= 0) {
    return 1;
  }
  return width / sourceWidth;
}
