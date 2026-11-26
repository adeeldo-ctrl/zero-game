// Procedural enemy generator for ZERO GAME
// Generates a simple sprite sheet with 6 frames (idle/walk/jump/turn/land/victory)
// Each frame is a 32x32 pixel canvas drawn with Phaser Graphics.

export function createProceduralEnemyTextures(scene, family, tint) {
  const frameCount = 6;
  const frameW = 32;
  const frameH = 32;
  const textureKey = `enemy_${family}`;

  // Create a temporary graphics object
  const gfx = scene.add.graphics({ x: 0, y: 0 });
  gfx.fillStyle(tint, 1);

  // Render each frame sequentially into a RenderTexture
  const rt = scene.make.renderTexture({ width: frameW * frameCount, height: frameH }, false);

  for (let i = 0; i < frameCount; i++) {
    // Clear previous drawing
    gfx.clear();
    gfx.fillStyle(tint, 1);
    // Simple shape varying per frame to give a visual cue
    const size = 16 + i * 2;
    const offset = (frameW - size) / 2;
    gfx.fillRoundedRect(offset, offset, size, size, 4);
    // Draw onto render texture at the proper offset
    rt.draw(gfx, i * frameW, 0);
  }

  // Save as a texture atlas
  rt.saveTexture(textureKey);
  rt.destroy();
  gfx.destroy();

  // Create Phaser animation definitions for this enemy
  const anims = scene.anims;
  const baseConfig = {
    key: `${family}_anim`,
    frames: anims.generateFrames(textureKey, { start: 0, end: frameCount - 1, prefix: '', zeroPad: 0, suffix: '' }),
    frameRate: 8,
    repeat: -1,
  };
  // Idle (frames 0-1)
  anims.create({ ...baseConfig, key: `${family}_idle`, frames: anims.generateFrames(textureKey, { start: 0, end: 1 }) });
  // Walk (frames 2-3)
  anims.create({ ...baseConfig, key: `${family}_walk`, frames: anims.generateFrames(textureKey, { start: 2, end: 3 }) });
  // Jump (frame 4)
  anims.create({ ...baseConfig, key: `${family}_jump`, frames: anims.generateFrames(textureKey, { start: 4, end: 4 }) });
  // Turn (frame 5)
  anims.create({ ...baseConfig, key: `${family}_turn`, frames: anims.generateFrames(textureKey, { start: 5, end: 5 }) });
}
