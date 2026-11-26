// Procedural boss generator for ZERO GAME
// Generates a large sprite with distinct colour and simple animation frames.

export function createProceduralBossTexture(scene, bossId, tint) {
  const frameW = 96;
  const frameH = 96;
  const frames = 4; // idle, attack, phase, defeat
  const textureKey = `boss_${bossId}`;

  const gfx = scene.add.graphics({ x: 0, y: 0 });
  const rt = scene.make.renderTexture({ width: frameW * frames, height: frameH }, false);

  for (let i = 0; i < frames; i++) {
    gfx.clear();
    gfx.fillStyle(tint, 1);
    const radius = 30 + i * 5;
    gfx.fillCircle(frameW / 2, frameH / 2, radius);
    // Add simple eye
    gfx.fillStyle(0xffffff, 1);
    gfx.fillCircle(frameW / 2 - 10, frameH / 2 - 10, 5);
    gfx.fillCircle(frameW / 2 + 10, frameH / 2 - 10, 5);
    rt.draw(gfx, i * frameW, 0);
  }

  rt.saveTexture(textureKey);
  rt.destroy();
  gfx.destroy();

  // Create animations
  const anims = scene.anims;
  anims.create({
    key: `${bossId}_idle`,
    frames: anims.generateFrames(textureKey, { start: 0, end: 0 }),
    frameRate: 1,
    repeat: -1,
  });
  anims.create({
    key: `${bossId}_attack`,
    frames: anims.generateFrames(textureKey, { start: 1, end: 1 }),
    frameRate: 2,
    repeat: -1,
  });
  anims.create({
    key: `${bossId}_phase`,
    frames: anims.generateFrames(textureKey, { start: 2, end: 2 }),
    frameRate: 2,
    repeat: -1,
  });
  anims.create({
    key: `${bossId}_defeat`,
    frames: anims.generateFrames(textureKey, { start: 3, end: 3 }),
    frameRate: 1,
    repeat: 0,
  });
}
