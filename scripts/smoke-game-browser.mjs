import { spawn } from "node:child_process";
import { once } from "node:events";
import { setTimeout as delay } from "node:timers/promises";
import { chromium } from "playwright";
import { PREMIUM_ENEMY_ARCHETYPES, PREMIUM_BOSSES } from "../src/premiumCampaignData.js";

const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], {
  cwd: process.cwd(),
  stdio: ["ignore", "pipe", "pipe"],
});
let serverOutput = "";
server.stdout.on("data", (chunk) => { serverOutput += chunk.toString(); });
server.stderr.on("data", (chunk) => { serverOutput += chunk.toString(); });

let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const response = await fetch("http://127.0.0.1:4173");
      if (response.ok) { ready = true; break; }
    } catch { /* Vite is still starting. */ }
    if (server.exitCode !== null) break;
    await delay(500);
  }
  if (!ready) throw new Error(`Vite did not start. Server output:\n${serverOutput}`);

  browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-dev-shm-usage"]
  });
  const page = await browser.newPage({ viewport: { width: 960, height: 540 } });
  page.setDefaultTimeout(15000);
  page.setDefaultNavigationTimeout(15000);
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });
  await page.goto("http://127.0.0.1:4173", { waitUntil: "domcontentloaded" });
  const canvas = page.locator("#game-container canvas").last();
  await canvas.waitFor({ state: "visible", timeout: 15000 });
  const dimensions = await canvas.evaluate((node) => ({ width: node.width, height: node.height }));
  if (dimensions.width !== 960 || dimensions.height !== 540) {
    throw new Error(`Unexpected game canvas dimensions: ${JSON.stringify(dimensions)}`);
  }

  const characterIds = [
    ...PREMIUM_ENEMY_ARCHETYPES.map(({ id }) => id),
    ...PREMIUM_BOSSES.map(({ id }) => id),
  ];
  await page.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.sys.isActive() &&
      scene.textures.exists("approved-enemy-spirit-pouncer") &&
      scene.textures.exists("approved-enemy-frost-temple-breaker") &&
      scene.textures.exists("boss-image-void-sovereign");
  }, undefined, { timeout: 15000 });
  const pngArtAudit = await page.evaluate((ids) => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene?.sys.isActive()) return { error: "Phaser scene is not active" };
    const missing = [];
    const invalidImages = [];
    for (const id of ids) {
      const isBoss = ids.indexOf(id) >= 32;
      const textureKey = isBoss ? `boss-image-${id}` : `approved-enemy-${id}`;
      const texture = scene.textures.get(textureKey);
      if (!texture || !scene.textures.exists(textureKey)) {
        missing.push(`png-texture:${id}`);
        continue;
      }
      const source = texture.getSourceImage();
      if (!source || source.width < 32 || source.height < 32) invalidImages.push(`image:${id}`);
    }
    return { missing, invalidImages };
  }, characterIds);
  if (pngArtAudit.error || pngArtAudit.missing.length || pngArtAudit.invalidImages.length) {
    throw new Error("Original PNG artwork integration failed: " + JSON.stringify(pngArtAudit));
  }

  const rigAudit = await page.evaluate((ids) => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    const cache = scene?.cache?.custom?.rigby2d;
    const missing = [];
    const missingClips = [];
    const invalidMeshes = [];
    for (const id of ids) {
      const isBoss = ids.indexOf(id) >= 32;
      const key = isBoss ? `boss-rig-${id}` : `enemy-rig-${id}`;
      const data = cache?.get(key);
      if (!data?.skeleton) {
        missing.push(key);
        continue;
      }
      const clips = data.skeleton.animations.map((animation) => animation.name);
      const required = isBoss
        ? ["entrance", "idle", "locomotion", "jump", "fall", "land", "hit", "phase-change", "defeat", "signature"]
        : ["idle", "locomotion", "jump", "fall", "land", "hit", "defeat",
          "idle-phone", "idle-scratch", "idle-comb", "idle-look-around", "idle-groom"];
      for (const clip of required) if (!clips.includes(clip)) missingClips.push(key + ":" + clip);
      if (!isBoss) {
        const boneNames = data.skeleton.bones.map((bone) => bone.name);
        const hasHands = boneNames.includes("upperarm_l") && boneNames.includes("forearm_l");
        const applicableAmbientClips = hasHands
          ? ["idle-phone", "idle-scratch", "idle-comb", "idle-look-around", "idle-groom"]
          : ["idle-look-around", "idle-groom"];
        for (const clip of applicableAmbientClips) {
          const animation = data.skeleton.animations.find((entry) => entry.name === clip);
          if (!animation || !Object.keys(animation.bones || {}).length) {
            missingClips.push(key + ":" + clip + "(empty)");
          }
        }
      }
      const meshes = data.skeleton.slots.flatMap((slot) => slot.attachments || [])
        .filter((attachment) => attachment.type === "mesh");
      if (!meshes.some((mesh) => Array.isArray(mesh.weights) && mesh.weights.length > 0)) {
        invalidMeshes.push(key);
      }
    }
    return { missing, missingClips, invalidMeshes };
  }, characterIds);
  if (rigAudit.missing.length || rigAudit.missingClips.length || rigAudit.invalidMeshes.length) {
    throw new Error("Rigby2D roster integration failed: " + JSON.stringify(rigAudit));
  }

  const movementRig = await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    const rig = scene.add.rigby(80, 80, "enemy-rig-spirit-pouncer", "idle");
    rig.setVisible(false);
    const bone = rig.skeleton.bones.find((entry) => entry.name === "pelvis")?.name || rig.skeleton.bones[1].name;
    const before = rig.boneWorld(bone);
    rig.play("locomotion", true, 0);
    window.__ZERO_GAME_RIG_MOTION__ = { rig, bone, before };
    return { bone, before };
  });
  await delay(180);
  const movementAfter = await page.evaluate(() => {
    const value = window.__ZERO_GAME_RIG_MOTION__;
    const after = value.rig.boneWorld(value.bone);
    value.rig.destroy();
    delete window.__ZERO_GAME_RIG_MOTION__;
    return after;
  });
  if (!movementAfter || Math.hypot(movementAfter.x - movementRig.before.x, movementAfter.y - movementRig.before.y) < 0.1) {
    throw new Error("Rigby2D locomotion clip did not move the enemy bone mesh");
  }

  const bossSignature = await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    const rig = scene.add.rigby(120, 80, "boss-rig-gatekeeper", "idle");
    rig.setVisible(false);
    const bone = "torso";
    const before = rig.boneWorld(bone);
    rig.play("signature", true, 0);
    window.__ZERO_GAME_BOSS_SIGNATURE__ = { rig, bone, before };
    return { bone, before };
  });
  await delay(180);
  const bossSignatureAfter = await page.evaluate(() => {
    const value = window.__ZERO_GAME_BOSS_SIGNATURE__;
    const after = value.rig.boneWorld(value.bone);
    value.rig.destroy();
    delete window.__ZERO_GAME_BOSS_SIGNATURE__;
    return after;
  });
  if (!bossSignatureAfter || Math.abs(bossSignatureAfter.rotation - bossSignature.before.rotation) < 0.005) {
    throw new Error("Gatekeeper signature motion did not animate its rigged torso");
  }
  const ambientAwareness = await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    const values = new Map();
    const fake = {
      data: values,
      body: { blocked: { down: true } },
      setData(key, value) { values.set(key, value); return this; },
      getData(key) { return values.get(key); },
      setVelocityX(value) { this.velocityX = value; },
    };
    fake.setData("enemyArchetypeId", "spirit-pouncer");
    fake.setData("enemyRole", "runner");
    scene.initializeEnemyAmbientIdle(fake, "runner", 7);
    const idleFarAway = scene.updateEnemyAmbientIdle(fake, "runner", 500, scene.time.now + 1200);
    const selectedClip = fake.getData("ambientIdleClip");
    const idleStopsNearHero = scene.updateEnemyAmbientIdle(fake, "runner", 100, scene.time.now + 1400);
    return {
      idleFarAway,
      selectedClip,
      stoppedNearHero: !idleStopsNearHero,
      resumedAi: fake.getData("aiState") === "tell",
      idleStoppedVelocity: fake.velocityX === 0,
    };
  });
  if (!ambientAwareness.idleFarAway ||
      !["idle-phone", "idle-scratch", "idle-comb", "idle-look-around"].includes(ambientAwareness.selectedClip) ||
      !ambientAwareness.stoppedNearHero || !ambientAwareness.resumedAi || !ambientAwareness.idleStoppedVelocity) {
    throw new Error("Enemy ambient personality/hero-awareness behaviour failed: " + JSON.stringify(ambientAwareness));
  }

  const allBossSignatures = await page.evaluate((bossIds) => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    const entries = bossIds.map((id) => {
      const rig = scene.add.rigby(140, 90, `boss-rig-${id}`, "idle");
      rig.setVisible(false);
      const bones = rig.skeleton.bones.filter((bone) => bone.name !== "root");
      const before = bones.map((bone) => ({ name: bone.name, ...rig.boneWorld(bone.name) }));
      rig.play("signature", true, 0);
      return { id, rig, before };
    });
    window.__ZERO_GAME_ALL_BOSS_SIGNATURES__ = entries;
    return entries.map(({ id, before }) => ({ id, boneCount: before.length }));
  }, characterIds.slice(32));
  await delay(220);
  const allBossSignaturesAfter = await page.evaluate(() => {
    const entries = window.__ZERO_GAME_ALL_BOSS_SIGNATURES__;
    const result = entries.map(({ id, rig, before }) => {
      const after = before.map((bone) => ({ name: bone.name, ...rig.boneWorld(bone.name) }));
      const moved = after.some((bone, index) =>
        Math.abs((bone.x || 0) - (before[index].x || 0)) > 0.1 ||
        Math.abs((bone.y || 0) - (before[index].y || 0)) > 0.1 ||
        Math.abs((bone.rotation || 0) - (before[index].rotation || 0)) > 0.005
      );
      rig.destroy();
      return { id, moved };
    });
    delete window.__ZERO_GAME_ALL_BOSS_SIGNATURES__;
    return result;
  });
  if (allBossSignaturesAfter.some((entry) => !entry.moved)) {
    throw new Error("A boss signature clip did not move its rigged mesh: " + JSON.stringify(allBossSignaturesAfter));
  }

  const accessibility = await page.evaluate(() => ({
    gameRole: document.querySelector("#game-container")?.getAttribute("role"),
    gameLabel: document.querySelector("#game-container")?.getAttribute("aria-label"),
    instructions: document.querySelector("#game-instructions")?.textContent?.trim(),
    controlsRole: document.querySelector("#mobile-controls-overlay")?.getAttribute("role"),
    controlsLabel: document.querySelector("#mobile-controls-overlay")?.getAttribute("aria-label"),
  }));
  if (accessibility.gameRole !== "application" ||
      !accessibility.gameLabel?.includes("ZERO GAME") ||
      !accessibility.instructions ||
      accessibility.controlsRole !== "group" ||
      !accessibility.controlsLabel?.includes("movement joystick")) {
    throw new Error("Game canvas and mobile touch surface are missing accessible descriptions");
  }

  const reducedMotionPage = await browser.newPage({
    viewport: { width: 960, height: 540 },
    reducedMotion: "reduce",
  });
  await reducedMotionPage.goto("http://127.0.0.1:4173", { waitUntil: "domcontentloaded" });
  await reducedMotionPage.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.reducedMotion === true;
  }, undefined, { timeout: 15000 });
  await reducedMotionPage.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (scene.addAmbientTween({ repeat: -1 }) !== null) {
      throw new Error("Reduced-motion mode did not suppress a looping ambient tween");
    }
  });
  await reducedMotionPage.close();

  // Verify the four home-screen hero previews are clean and their descriptions do not overlap.
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    const previews = scene?.children.list.filter((item) => item.getData?.("heroPreview")) || [];
    const descriptions = scene?.children.list.filter((item) => item.getData?.("heroDescription")) || [];
    if (previews.length !== 4 || descriptions.length !== 4) {
      throw new Error("Home screen must show four separately identified hero previews and descriptions");
    }
    if (previews.some((visual) => (visual.getData("heroLookItems") || []).some((item) => item.type === "Triangle"))) {
      throw new Error("Hero previews still contain unwanted triangular direction-marker artwork");
    }
    const bounds = descriptions.map((item) => item.getBounds());
    for (let i = 0; i < bounds.length; i++) {
      for (let j = i + 1; j < bounds.length; j++) {
        const overlapX = Math.min(bounds[i].right, bounds[j].right) - Math.max(bounds[i].left, bounds[j].left);
        const overlapY = Math.min(bounds[i].bottom, bounds[j].bottom) - Math.max(bounds[i].top, bounds[j].top);
        if (overlapX > 0 && overlapY > 0) throw new Error("Hero descriptions overlap on the home screen");
      }
    }
  });

  // Enter the campaign, choose one hero, and exercise live gameplay inputs.
  await page.mouse.click(480, 502);
  await delay(450);
  await page.mouse.click(132, 468);
  await delay(2600);
  await page.keyboard.press("Space");
  await delay(700);

  // Exercise the actual DOM pointer layer used by the Android touch overlay.
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.audio.setMusicVolume(0.5);
    scene.audio.setSfxVolume(0.5);
  });
  await page.mouse.click(610, 43);
  await page.mouse.click(690, 43);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (scene.audio.getMusicVolume() !== 0.75 || scene.audio.getSfxVolume() !== 0.75) {
      throw new Error("Touch overlay did not route the MUSIC/SFX volume controls");
    }
  });
  await page.mouse.move(132, 448);
  await page.mouse.down();
  await page.mouse.move(180, 448);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (scene.touch.axis < 0.7) throw new Error("Touch joystick did not preserve rightward movement mapping");
  });
  await page.mouse.move(132, 500);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene.touch.down) throw new Error("Touch joystick did not detect the DOWN direction");
  });
  await page.mouse.up();
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (scene.touch.axis !== 0 || scene.touch.down) throw new Error("Touch joystick did not reset on release");
  });
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.projectiles.clear(true, true);
    scene.lastAttack = -10000;
  });
  await page.mouse.move(765, 448);
  await page.mouse.down();
  await page.mouse.up();
  await page.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.projectiles.getChildren().some((projectile) =>
      projectile.active && projectile.getData("charge") === 0 && projectile.body.velocity.x > 700
    );
  }, undefined, { timeout: 2000 });
  for (const [index, x] of [[0, 580], [1, 680], [2, 780]]) {
    const expectedType = await page.evaluate((moveIndex) => {
      const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
      return scene.selectedHero.specialMoves[moveIndex].type;
    }, index);
    // All three EXTRA buttons trigger their own immediate special move.
    for (let repeat = 0; repeat < 2; repeat++) {
      const previousCount = await page.evaluate(() => {
        const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
        return scene.specialActivationCount || 0;
      });
      await page.mouse.click(x, 340);
      await page.waitForFunction(({ type, count }) => {
        const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
        return scene?.specialPoseType === type &&
          scene.specialActivationCount > count &&
          scene.specialPoseUntil > scene.time.now;
      }, { type: expectedType, count: previousCount }, { timeout: 1500 });
    }
  }
  // POWER remains separate from the three EXTRA special-move buttons.
  const initialPower = await page.evaluate(() => window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene")?.powerType);
  await page.mouse.click(880, 340);
  await page.waitForFunction((previous) => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.powerType !== previous;
  }, initialPower, { timeout: 1500 });
  const powerAfterOnePress = await page.evaluate(() => window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene")?.powerType);
  if (!powerAfterOnePress || powerAfterOnePress === initialPower) throw new Error("POWER button did not advance the selected element");
  await page.mouse.click(880, 340);
  await page.waitForFunction((previous) => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.powerType !== previous;
  }, powerAfterOnePress, { timeout: 1500 });

  // Verify every equipped special move damages a live enemy through the real Phaser scene.
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene?.sys.isActive()) throw new Error("Game scene unavailable for special-move runtime test");
    scene.enemies.getChildren().forEach((enemy) => {
      enemy.getData("visual")?.destroy();
      enemy.getData("elementBall")?.destroy();
      enemy.destroy();
    });
    scene.projectiles.clear(true, true);
    scene.hero.setPosition(300, 450).setVelocity(0, 0);
    scene.facing = 1;
    const makeTarget = (x) => {
      const enemy = scene.enemies.create(x, 450, "enemy0");
      enemy.setCollideWorldBounds(true).setBounce(0);
      enemy.body.setAllowGravity(true);
      enemy.setData("frozen", false);
      enemy.setData("isTimeHunter", false);
      enemy.setData("aiType", "chaser");
      enemy.setData("enemyArchetypeId", "spirit-pouncer");
      scene.createEnemyVisual(enemy, 0x8b4a3e, 0xffd36b);
      return enemy;
    };
    window.__ZERO_GAME_SPECIAL_TARGETS__ = [makeTarget(390), makeTarget(410), makeTarget(430)];
    scene.specialMove(0);
    if (scene.specialPoseType !== "wave" || scene.specialPoseUntil <= scene.time.now) {
      throw new Error("EXTRA 1 did not start its timed charge-and-thrust animation");
    }
    const wave = scene.projectiles.getChildren().find((projectile) =>
      projectile.active && projectile.getData("specialAttack")
    );
    if (!wave) throw new Error("EXTRA 1 did not create its elemental wave projectile");
    // Invoke the same overlap callback used by Arcade Physics to make the
    // projectile-to-target damage assertion deterministic in headless Chromium.
    scene.hitEnemy(wave, window.__ZERO_GAME_SPECIAL_TARGETS__[0]);
    const waveTarget = window.__ZERO_GAME_SPECIAL_TARGETS__[0];
    const waveDamage = waveTarget.getData("visual")?.getData("damageParts");
    if (waveTarget.getData("hitCount") < 2 || !waveDamage ||
        waveDamage.hornR?.active || waveDamage.armR?.active) {
      throw new Error("EXTRA 1 wave did not apply the expected multi-hit damage through the hit pipeline");
    }
  });
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    const targets = window.__ZERO_GAME_SPECIAL_TARGETS__;
    // Keep the test target stationary and deliberately nearest to the hero so
    // Phaser AI/physics timing cannot move it outside the uppercut's target set.
    scene.hero.setPosition(300, 450);
    scene.hero.body.reset(300, 450);
    scene.facing = 1;
    targets[1].setPosition(330, 450);
    targets[1].body.reset(330, 450);
    targets[1].setVelocity(0, 0);
    targets[1].body.setAllowGravity(false);
    targets[1].setData("frozen", false);
    scene.specialMove(1);
    if (scene.specialPoseType !== "uppercut" || scene.hero.body.velocity.y > -400) {
      throw new Error("EXTRA 2 did not launch its rising uppercut movement and animation");
    }
    const secondDamage = targets[1].getData("visual")?.getData("damageParts");
    if (targets[1].getData("hitCount") < 2 || !secondDamage ||
        secondDamage.hornR?.active || secondDamage.armR?.active) {
      throw new Error("EXTRA 2 damage check failed: hitCount=" + targets[1].getData("hitCount") + ", frozen=" + targets[1].getData("frozen") + ", moveType=" + scene.selectedHero?.specialMoves?.[1]?.type + ", visualActive=" + targets[1].getData("visual")?.active);
    }
    scene.hero.setPosition(300, 450);
    scene.hero.body.reset(300, 450);
    scene.facing = 1;
    targets[2].setPosition(340, 450);
    targets[2].body.reset(340, 450);
    targets[2].setVelocity(0, 0);
    targets[2].body.setAllowGravity(false);
    targets[2].setData("frozen", false);
    scene.specialMove(2);
    if (scene.specialPoseType !== "spin" || scene.specialDashUntil <= scene.time.now) {
      throw new Error("EXTRA 3 did not activate its spinning-kick dash choreography");
    }
    const thirdDamage = targets[2].getData("visual")?.getData("damageParts");
    if (targets[2].getData("hitCount") < 2 || !thirdDamage ||
        thirdDamage.hornR?.active || thirdDamage.armR?.active) {
      throw new Error("EXTRA 3 damage check failed: hitCount=" + targets[2].getData("hitCount") + ", frozen=" + targets[2].getData("frozen") + ", moveType=" + scene.selectedHero?.specialMoves?.[2]?.type + ", visualActive=" + targets[2].getData("visual")?.active);
    }
    // Reuse EXTRA 1 twice before its first animation ends. Both presses
    // must create a special projectile immediately.
    scene.projectiles.clear(true, true);
    scene.specialMove(0);
    scene.specialMove(0);
    const repeatedSpecials = scene.projectiles.getChildren().filter((projectile) =>
      projectile.active && projectile.getData("specialAttack")
    );
    if (repeatedSpecials.length < 2 || scene.statusLabel.text.includes("RECHARGING")) {
      throw new Error("EXTRA buttons must be immediately reusable without cooldown");
    }
    targets.forEach((enemy) => {
      enemy.getData("visual")?.destroy();
      enemy.getData("elementBall")?.destroy();
      enemy.destroy();
    });
    const rollingEnemy = scene.enemies.create(360, 450, "enemy0");
    rollingEnemy.setCollideWorldBounds(true);
    rollingEnemy.body.setAllowGravity(false);
    rollingEnemy.setData("frozen", true);
    rollingEnemy.setData("rolling", false);
    rollingEnemy.setData("ballPalette", scene.getPowerPalette());
    rollingEnemy.setData("elementBall", scene.add.container(360, 450));
    const rollTarget = scene.enemies.create(410, 450, "enemy1");
    rollTarget.setCollideWorldBounds(true);
    rollTarget.body.setAllowGravity(true);
    rollTarget.setData("frozen", false);
    scene.hero.setPosition(300, 450);
    scene.facing = 1;
    if (!scene.kickNearestElementBall()) throw new Error("FIRE did not kick a nearby frozen elemental ball");
    if (!rollingEnemy.getData("rolling")) throw new Error("Kicked elemental ball did not enter rolling state");
    scene.updateRollingBall(rollingEnemy, 16);
    if (rollTarget.active) throw new Error("Rolling elemental ball did not hit and clear a nearby enemy");
    rollingEnemy.getData("elementBall")?.destroy();
    rollingEnemy.destroy();
  });

  // Exercise the integrated three-heart / three-chance damage and respawn flow.
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene?.sys.isActive()) throw new Error("Game scene unavailable for campaign lives test");
    scene.stageCleared = true;
    scene.enemies.getChildren().forEach((enemy) => enemy.getData("visual")?.destroy());
    scene.enemies.clear(true, true);
  });
  await delay(4200);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.stageCleared = false;
    scene.health = 3;
    scene.chances = 3;
    scene.chanceLossInProgress = false;
    scene.gameOver = false;
    const harmlessEnemy = { active: true, x: 500, y: 450, body: { top: 420 }, getData: () => false };
    scene.hero.setPosition(300, 450);
    scene.hero.body.reset(300, 450);
    scene.hero.setVelocity(0, 0);
    scene.lastDamage = scene.time.now - 2000;
    scene.damageHero(scene.hero, harmlessEnemy);
    if (scene.health !== 2 || scene.chances !== 3) throw new Error("First hit did not remove exactly one heart");
    window.__ZERO_GAME_LIVES_TEST_ENEMY__ = harmlessEnemy;
  });
  await delay(700);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.hero.setPosition(300, 450);
    scene.hero.body.reset(300, 450);
    scene.hero.setVelocity(0, 0);
    scene.lastDamage = scene.time.now - 2000;
    scene.damageHero(scene.hero, window.__ZERO_GAME_LIVES_TEST_ENEMY__);
    if (scene.health !== 1 || scene.chances !== 3) throw new Error("Second hit did not remove exactly one heart");
  });
  await delay(700);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.hero.setPosition(300, 450);
    scene.hero.body.reset(300, 450);
    scene.hero.setVelocity(0, 0);
    scene.lastDamage = scene.time.now - 2000;
    scene.damageHero(scene.hero, window.__ZERO_GAME_LIVES_TEST_ENEMY__);
    if (scene.chances !== 2 || scene.health !== 3 || !scene.chanceLossInProgress) {
      throw new Error("Three lost hearts did not consume one chance and restore three hearts");
    }
    scene.lastDamage = scene.time.now - 2000;
    scene.damageHero(scene.hero, window.__ZERO_GAME_LIVES_TEST_ENEMY__);
    if (scene.chances !== 2 || scene.health !== 3) {
      throw new Error("Repeated damage during chance-loss lock consumed another chance");
    }
  });
  // Phaser's delayedCall advances on the scene clock; wait for its actual
  // completion instead of assuming a fixed wall-clock delay in headless CI.
  try {
    await page.waitForFunction(() => {
      const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
      return scene?.chances === 2 && scene.health === 3 && !scene.chanceLossInProgress &&
        scene.hero?.body?.enable && scene.stageNumber === 1 && !scene.gameOver;
    }, undefined, { timeout: 5000 });
  } catch (error) {
    const state = await page.evaluate(() => {
      const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
      return {
        active: scene?.sys.isActive(),
        scenePaused: scene?.sys.isPaused(),
        timePaused: scene?.time.paused,
        timeNow: scene?.time.now,
        respawnAt: scene?.chanceRespawnAt,
        updateTicks: scene?.chanceRespawnUpdateTicks,
        gameStarted: scene?.gameStarted,
        stageCleared: scene?.stageCleared,
        pendingTimers: scene?.time.getPendingEvents?.().map((event) => ({ delay: event.delay, elapsed: event.elapsed, paused: event.paused })),
        physicsPaused: scene?.physics.world.isPaused,
        chances: scene?.chances,
        health: scene?.health,
        chanceLossInProgress: scene?.chanceLossInProgress,
        gameOver: scene?.gameOver,
        stageNumber: scene?.stageNumber,
        heroActive: scene?.hero?.active,
        heroBodyEnabled: scene?.hero?.body?.enable,
        status: scene?.statusLabel?.text,
      };
    });
    throw new Error("Campaign respawn did not complete; runtime state: " + JSON.stringify(state) + "; " + error.message);
  }

  // Use the remaining two chances in the live scene and verify the true Game Over boundary.
  for (const expectedChances of [1, 0]) {
    await page.evaluate((expected) => {
      const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
      const harmlessEnemy = window.__ZERO_GAME_LIVES_TEST_ENEMY__;
      for (let hit = 0; hit < 3; hit++) {
        scene.lastDamage = -10000;
        scene.damageHero(scene.hero, harmlessEnemy);
      }
      if (scene.chances !== expected) {
        throw new Error("Expected " + expected + " remaining chance(s), received " + scene.chances);
      }
    }, expectedChances);
    if (expectedChances > 0) {
      await delay(1050);
      await page.evaluate(() => {
        const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
        if (scene.health !== 3 || scene.chanceLossInProgress || scene.gameOver) {
          throw new Error("A remaining chance did not restore three hearts and resume gameplay");
        }
      });
    }
  }
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene.gameOver || scene.chances !== 0 || scene.health !== 0) {
      throw new Error("The third lost chance did not end the campaign");
    }
    scene.startNewCampaign();
  });
  await page.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.sys.isActive() && scene.stageNumber === 1 && scene.stageConfig?.number === 1 &&
      !scene.gameStarted && !scene.gameOver && !scene.campaignActive && !scene.heroSelectionLocked &&
      scene.chances === 3 && scene.health === 3 && scene.hero?.body?.enable === true;
  }, undefined, { timeout: 10000 });
  await page.mouse.click(120, 486);
  await delay(1200);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene.campaignActive || !scene.heroSelectionLocked || scene.chances !== 3 ||
        scene.health !== 3 || scene.stageNumber !== 1 || !scene.hero.body.enable) {
      throw new Error("New campaign did not lock one hero selection and restore the full lives pool");
    }
  });

  // Exercise real Arcade Physics for pass-through, landing, drop-through and permanent floor.
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene?.sys.isActive()) throw new Error("Game scene unavailable for platform physics test");
    scene.stageCleared = true;
    scene.enemies.getChildren().forEach((enemy) => enemy.getData("visual")?.destroy());
    scene.enemies.clear(true, true);
  });
  // Let already-scheduled stage-one enemy entries expire while the stage is frozen.
  await delay(4200);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.stageCleared = false;
    scene.hero.setPosition(170, 462);
    scene.hero.setVelocity(0, -470);
    scene.jumpCount = 1;
    const platform = scene.platforms.getChildren().find((item) => item !== scene.groundPlatform && Math.abs(item.x - 170) < 2);
    if (!platform) throw new Error("Stage-one test platform not found");
    window.__ZERO_GAME_PLATFORM_TOP__ = platform.body.top;
  });
  await delay(450);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!(scene.hero.y < 420 && scene.hero.body.bottom <= window.__ZERO_GAME_PLATFORM_TOP__ + 16)) {
      throw new Error(`Hero did not pass upward through the elevated platform: y=${scene.hero.y}, bottom=${scene.hero.body.bottom}, platformTop=${window.__ZERO_GAME_PLATFORM_TOP__}, velocityY=${scene.hero.body.velocity.y}, worldPaused=${scene.physics.world.isPaused}`);
    }
  });
  await page.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.hero?.body?.blocked?.down === true;
  }, undefined, { timeout: 5000 });
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (Math.abs(scene.hero.body.bottom - window.__ZERO_GAME_PLATFORM_TOP__) > 8) {
      throw new Error("Hero did not land on the elevated platform from above");
    }
    scene.touch.down = true;
    scene.touch.jump = true;
  });
  await delay(80);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.touch.down = false;
    scene.touch.jump = false;
  });
  await page.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.hero?.body?.blocked?.down === true && scene.hero.y >= 455;
  }, undefined, { timeout: 5000 });
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (scene.hero.y < 455) throw new Error("DOWN + JUMP did not land on the permanent floor");
    scene.hero.body.reset(480, 462);
    scene.hero.setVelocity(0, 0);
    scene.jumpCount = 0;
  });
  await page.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.hero?.body?.blocked?.down === true;
  }, undefined, { timeout: 3000 });
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    const floorTop = scene.groundPlatform.body.top;
    if (Math.abs(scene.hero.body.bottom - floorTop) > 8) throw new Error("Hero body did not settle on the permanent floor");
    scene.touch.down = true;
    scene.touch.jump = true;
  });
  await delay(80);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.touch.down = false;
    scene.touch.jump = false;
  });
  await delay(120);
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!(scene.hero.y < 455)) {
      throw new Error("DOWN + JUMP incorrectly dropped the hero through the permanent ground instead of jumping upward");
    }
  });

  // Exercise all five campaign boss visual archetypes without changing production game flow.
  await page.evaluate(() => {
    const game = window.__ZERO_GAME_TEST__;
    const scene = game?.scene.getScene("ZeroGameScene");
    if (!scene?.sys.isActive()) throw new Error("Development game test hook is unavailable");
    const originalStage = scene.stageConfig;
    const bosses = [
      { name: "Gatekeeper Test", style: "intro grappler", color: 0x8a5943, element: "earth" },
      { name: "Boxing Test", style: "boxing champion", color: 0x6259a7, element: "earth" },
      { name: "Agile Test", style: "agile claw acrobat", color: 0x8d405e, element: "wind" },
      { name: "Master Test", style: "disciplined martial arts master", color: 0xa64b3d, element: "fire" },
      { name: "Warlord Test", style: "final warlord", color: 0x493b76, element: "shadow" },
    ];
    for (const bossData of bosses) {
      scene.stageConfig = { ...originalStage, boss: { ...bossData, hp: 30, attack: "Test attack" } };
      scene.bossHealth = 30;
      scene.bossMaxHealth = 30;
      scene.bossDefeated = false;
      scene.spawnBoss();
      if (!scene.bossVisual?.active) throw new Error(`Boss visual failed: ${bossData.style}`);
      const expectedFirstAttack = bossData.style.includes("boxing") ? 2
        : bossData.style.includes("agile") ? 2
        : bossData.style.includes("master") ? 1 : 0;
      const boss = scene.boss;
      boss.body.blocked.down = true;
      boss.setData("wasAirborne", false);
      boss.setData("bossAttackState", "rest");
      boss.setData("bossAttackAt", 0);
      scene.updateBoss(boss, 16);
      if (boss.getData("bossAttackState") !== "tell" ||
          boss.getData("bossAttackKind") !== expectedFirstAttack) {
        throw new Error(`Boss attack pattern failed: ${bossData.style}`);
      }
      boss.setData("bossTellUntil", 0);
      scene.updateBoss(boss, 16);
      const state = boss.getData("bossAttackState");
      if (expectedFirstAttack === 0 && state !== "slam") {
        throw new Error(`Ground slam failed: ${bossData.style}`);
      }
      if (expectedFirstAttack === 1 && scene.bossShots.countActive() < 1) {
        throw new Error(`Energy volley failed: ${bossData.style}`);
      }
      if (expectedFirstAttack === 2 && state !== "dash") {
        throw new Error(`Dash attack failed: ${bossData.style}`);
      }
      if (bossData.style.includes("final")) {
        scene.bossHealth = 100;
        scene.bossMaxHealth = 100;
        scene.bossPhase = 1;
        scene.hitBoss(boss, 40);
        if (scene.bossPhase !== 2) throw new Error("Boss did not enter phase two at 60% health");
        scene.hitBoss(boss, 35);
        if (scene.bossPhase !== 3) throw new Error("Boss did not enter final phase at 25% health");
        scene.bossShots.clear(true, true);
        scene.fireBossVolley(boss);
        if (scene.bossShots.countActive() !== 7) {
          throw new Error("Final boss phase did not launch its seven-projectile volley");
        }
      }
      boss.destroy();
      scene.bossVisual?.destroy();
      scene.bossShots.clear(true, true);
      scene.boss = null;
      scene.bossVisual = null;
    }
    scene.stageConfig = originalStage;
  });

  // Verify all three Snow Bros.-style stage entry directions complete and resume gameplay.
  for (const direction of ["down", "right", "left"]) {
    await page.evaluate((entryDirection) => {
      const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
      if (!scene?.sys.isActive()) throw new Error("Game scene unavailable during stage transition test");
      window.__ZERO_GAME_TRANSITION_DONE__ = false;
      scene.playStageEntryTransition(entryDirection, () => {
        scene.stageTransitionActive = false;
        scene.setMobileControlsVisible(true);
        window.__ZERO_GAME_TRANSITION_DONE__ = true;
      });
    }, direction);
    await page.waitForFunction(() => window.__ZERO_GAME_TRANSITION_DONE__ === true, { timeout: 7000 });
  }

  // Advance through the real scene-restart path and verify campaign identity/state persist.
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene) throw new Error("Game scene unavailable for campaign persistence test");
    window.__ZERO_GAME_PERSISTENCE__ = {
      heroId: scene.selectedHero?.id,
      chances: scene.chances,
      hearts: scene.health,
      landmarkSignature: scene.stageVariantLandmark?.getData("stageLandmarkSignature"),
    };
    scene.stageCleared = true;
    scene.stageAdvancePending = false;
    scene.advanceToNextStage();
  });
  await page.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.stageNumber === 2 && scene.stageConfig?.number === 2 &&
      scene.gameStarted && !scene.stageTransitionActive;
  }, undefined, { timeout: 10000 });
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    const before = window.__ZERO_GAME_PERSISTENCE__;
    if (scene.selectedHero?.id !== before.heroId) throw new Error("Selected hero changed during stage advance");
    if (scene.chances !== before.chances || scene.health !== before.hearts) {
      throw new Error("Campaign hearts/chances did not persist through stage advance");
    }
    if (!scene.heroSelectionLocked || !scene.campaignActive) {
      throw new Error("Hero selection/campaign lock did not persist");
    }
    const expectedStageOne = "world-0-stage-variant-0";
    const expectedStageTwo = "world-0-stage-variant-1";
    if (before.landmarkSignature !== expectedStageOne ||
        scene.stageVariantLandmark?.getData("stageLandmarkSignature") !== expectedStageTwo ||
        !scene.stageVariantLandmark.active) {
      throw new Error("Stage-specific landmark composition did not change with the stage");
    }
  });

  const campaignIdentity = await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return {
      heroId: scene.selectedHero?.id,
      chances: scene.chances,
      hearts: scene.health,
      landmarkSignatures: [
        window.__ZERO_GAME_PERSISTENCE__.landmarkSignature,
        scene.stageVariantLandmark?.getData("stageLandmarkSignature"),
      ],
    };
  });
  const landmarkSignatures = new Set(campaignIdentity.landmarkSignatures);
  if (landmarkSignatures.size !== 2) throw new Error("Stage 1 and stage 2 landmark compositions are not unique");

  // Complete the stage-2 restart before sweeping the rest of the campaign.
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene?.sys.isActive() || scene.stageNumber !== 2) {
      throw new Error("Game scene unavailable at the stage-3 campaign transition");
    }
    scene.stageCleared = true;
    scene.stageAdvancePending = false;
    scene.advanceToNextStage();
  });
  await page.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.stageNumber === 3 && scene.stageConfig?.number === 3 &&
      scene.gameStarted && !scene.stageTransitionActive;
  }, undefined, { timeout: 10000 });
  await page.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.stageConfig?.isBossStage
      ? !!scene.boss?.active
      : scene?.enemies?.getChildren().some((enemy) =>
        enemy.active && !enemy.getData("isBoss") && !enemy.getData("isTimeHunter")
      );
  }, undefined, { timeout: 3000 });

  const stageThreeLandmark = await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.stageVariantLandmark?.getData("stageLandmarkSignature");
  });
  if (stageThreeLandmark !== "world-0-stage-variant-2") {
    throw new Error("Stage 3 did not register its unique world landmark composition");
  }
  landmarkSignatures.add(stageThreeLandmark);

  // Walk the actual Phaser scene-restart path through every remaining stage.
  const visitedStages = [1, 2, 3];
  for (let nextStage = 4; nextStage <= 50; nextStage++) {
    await page.evaluate(() => {
      const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
      if (!scene?.sys.isActive()) throw new Error("Game scene unavailable during 50-stage campaign sweep");
      scene.stageCleared = true;
      scene.stageAdvancePending = false;
      scene.advanceToNextStage();
    });
    await page.waitForFunction((number) => {
      const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
      return scene?.stageNumber === number && scene.stageConfig?.number === number &&
        scene.gameStarted && !scene.stageTransitionActive;
    }, nextStage, { timeout: 10000 });
    await page.waitForFunction(() => {
      const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
      if (scene?.stageConfig?.isBossStage) return !!scene.boss?.active;
      return scene?.enemies?.getChildren().some((enemy) =>
        enemy.active && !enemy.getData("isBoss") && !enemy.getData("isTimeHunter")
      );
    }, undefined, { timeout: 3000 });
    const stageState = await page.evaluate(() => {
      const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
      return {
        number: scene.stageNumber,
        name: scene.stageConfig.name,
        world: scene.stageConfig.world,
        worldIndex: scene.stageConfig.worldIndex,
        variant: scene.stageConfig.background.stageVariant,
        backdropKey: scene.worldBackdrop?.texture?.key,
        landmarkSignature: scene.stageVariantLandmark?.getData("stageLandmarkSignature"),
        landmarkActive: !!scene.stageVariantLandmark?.active,
        platforms: scene.platforms.getChildren().length,
        boss: !!scene.stageConfig.boss,
        bossId: scene.stageConfig.boss?.id || null,
        bossStage: !!scene.stageConfig.isBossStage,
        bossActive: !!scene.boss?.active,
        configuredEnemyCount: scene.stageConfig.enemyCount,
        enemies: scene.enemies.getChildren().filter((enemy) =>
          enemy.active && !enemy.getData("isBoss") && !enemy.getData("isTimeHunter")
        ).map((enemy) => ({
          type: enemy.getData("aiType"),
          gravity: enemy.body.allowGravity,
          y: enemy.y,
          element: enemy.getData("enemyPowerType"),
          visualElement: enemy.getData("visual")?.getData("elementId"),
        })),
        heroId: scene.selectedHero?.id,
        chances: scene.chances,
        hearts: scene.health,
        heroSelectionLocked: scene.heroSelectionLocked,
        campaignActive: scene.campaignActive,
      };
    });
    if (stageState.number !== nextStage || stageState.platforms !== 7) {
      throw new Error(`Stage ${nextStage} did not create its fixed arena, continuous floor, and six separated elevated platforms`);
    }
    if (stageState.variant !== (nextStage - 1) % 5 ||
        stageState.worldIndex !== Math.floor((nextStage - 1) / 5) ||
        stageState.backdropKey !== `world-backdrop-${stageState.worldIndex}`) {
      throw new Error(`Stage ${nextStage} theme, atmosphere, or original world backdrop identity is incorrect`);
    }
    const expectedLandmark = `world-${stageState.worldIndex}-stage-variant-${stageState.variant}`;
    if (!stageState.landmarkActive || stageState.landmarkSignature !== expectedLandmark) {
      throw new Error(`Stage ${nextStage} did not create its stage-specific landmark composition`);
    }
    landmarkSignatures.add(stageState.landmarkSignature);
    if (stageState.boss !== (nextStage % 10 === 0) ||
        stageState.bossStage !== (nextStage % 10 === 0) ||
        stageState.bossActive !== (nextStage % 10 === 0) ||
        (stageState.bossStage ? stageState.configuredEnemyCount !== 0 : stageState.configuredEnemyCount <= 0)) {
      throw new Error(`Stage ${nextStage} boss milestone is not a dedicated boss-only encounter`);
    }
    if (stageState.bossStage && stageState.enemies.length !== 0) {
      throw new Error(`Boss stage ${nextStage} must not spawn regular enemies`);
    }
    if (stageState.enemies.some((enemy) => !enemy.element || enemy.visualElement !== enemy.element)) {
      throw new Error(`Stage ${nextStage} enemy elemental visuals do not match their assigned power`);
    }
    if (stageState.heroId !== campaignIdentity.heroId ||
        stageState.chances !== campaignIdentity.chances ||
        stageState.hearts !== campaignIdentity.hearts ||
        !stageState.heroSelectionLocked || !stageState.campaignActive) {
      throw new Error(`Stage ${nextStage} lost campaign identity or remaining lives`);
    }
    const invalidGroundEnemy = stageState.enemies.some((enemy) =>
      enemy.type !== "flyer" && !enemy.gravity
    );
    const invalidFlyingEnemy = stageState.enemies.some((enemy) =>
      enemy.type === "flyer" && (enemy.gravity || enemy.y < 160 || enemy.y > 360)
    );
    if (invalidGroundEnemy || invalidFlyingEnemy) {
      throw new Error(`Stage ${nextStage} has an invalid grounded or flying enemy spawn`);
    }
    visitedStages.push(stageState.number);
  }
  if (new Set(visitedStages).size !== 50) throw new Error("The complete 50-stage campaign did not visit every unique stage");
  if (landmarkSignatures.size !== 50) {
    throw new Error(`Expected 50 unique world/stage landmark compositions, received ${landmarkSignatures.size}`);
  }
  await page.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.stageNumber = 50;
    scene.stageCleared = true;
    scene.showVictory();
    const actions = scene.children.list.filter((item) =>
      item.type === "Text" && ["PLAY AGAIN", "CHANGE HERO"].includes(item.text)
    );
    if (actions.length !== 2 || actions.some((item) => !item.input?.enabled)) {
      throw new Error("Final campaign victory screen must offer working replay and hero-change actions");
    }
  });

  const nativePage = await browser.newPage({ viewport: { width: 960, height: 540 } });
  const nativeErrors = [];
  nativePage.on("pageerror", (error) => nativeErrors.push(error.message));
  nativePage.on("console", (message) => {
    if (message.type() === "error") nativeErrors.push(message.text());
  });
  await nativePage.addInitScript(() => { window.__ZERO_GAME_TEST_NATIVE_TOUCH__ = true; });
  await nativePage.goto("http://127.0.0.1:4173", { waitUntil: "domcontentloaded" });
  await nativePage.locator("#game-container canvas").last().waitFor({ state: "visible" });
  await nativePage.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.hero?.active && scene?.heroVisual?.active && scene?.selectedHero;
  }, undefined, { timeout: 15000 });
  // Enter gameplay directly for this page so the special native-touch test
  // does not depend on mouse events in the hero-select screen.
  await nativePage.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.heroSelectionLocked = true;
    scene.beginCampaign();
  });
  await nativePage.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.campaignActive && scene?.heroSelectionLocked;
  }, undefined, { timeout: 10000 });
  await nativePage.bringToFront();
  // Wait for the actual stage spawn instead of assuming a fixed wall-clock delay.
  // Chromium can throttle a background page, so a sleep may finish before Phaser's
  // scene clock has executed the delayed enemy-spawn callbacks.
  await nativePage.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.enemies?.getChildren().filter((enemy) =>
      enemy.active && !enemy.getData("isBoss")
    ).length >= 2;
  }, undefined, { timeout: 15000 });

  const point = (id, x, y) => ({ id, x, y, radiusX: 12, radiusY: 12, force: 1 });
  const dispatchTouch = (type, changedPoints, activePoints = changedPoints) => nativePage.evaluate(
    ({ type, changedPoints, activePoints }) => {
      const toTouch = ({ id, x, y }) => ({ identifier: id, clientX: x, clientY: y });
      const event = new Event(type, { bubbles: true, cancelable: true });
      Object.defineProperty(event, "changedTouches", { value: changedPoints.map(toTouch) });
      Object.defineProperty(event, "touches", { value: activePoints.map(toTouch) });
      const destination = type === "touchstart"
        ? document.getElementById("mobile-controls-overlay")
        : window;
      destination.dispatchEvent(event);
    }, { type, changedPoints, activePoints }
  );
  await nativePage.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.hero.setPosition(480, 450);
    scene.facing = 1;
    scene.lastAttack = -10000;
    scene.projectiles.clear(true, true);
  });
  const beforeTripleTouch = await nativePage.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene?.textures.exists("shot") || !scene?.textures.exists("platform")) {
      throw new Error("Restored gameplay shot or platform texture is missing");
    }
    scene.lastDamage = scene.time.now + 100000;
    const enemies = scene.enemies.getChildren().filter((enemy) => enemy.active && !enemy.getData("isBoss"));
    const archetypes = new Set(enemies.map((enemy) => enemy.getData("enemyArchetypeId")));
    const roles = new Set(enemies.map((enemy) => enemy.getData("enemyRole")));
    if (archetypes.size < 2 || roles.size < 2) {
      throw new Error(`Live stage did not spawn its distinct premium enemy archetypes: ${[...archetypes].join(",")}`);
    }
    if (enemies.some((enemy) => {
      const visual = enemy.getData("visual");
      const sprite = visual?.getData("authoredSprite");
      return !visual?.visible || !sprite?.active ||
        sprite.texture?.key !== `approved-enemy-${enemy.getData("enemyArchetypeId")}` ||
        visual.getData("approvedArtSprite") !== sprite || !sprite.visible;
    })) {
      throw new Error("A live stage enemy is missing its visible unique original PNG artwork");
    }
    enemies.forEach((enemy, index) => enemy.setData("smokeCheckId", index));
    return {
      activations: scene.specialActivationCount || 0,
      powerType: scene.powerType,
      animTime: scene.heroAnimTime || 0,
      enemyAnimTimes: enemies.map((enemy) => [enemy.getData("smokeCheckId"), enemy.getData("animTime") || 0])
    };
  });

  await dispatchTouch("touchstart", [point(1, 132, 448), point(2, 665, 340), point(3, 885, 340)]);
  await nativePage.waitForFunction((before) => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return (scene?.specialActivationCount || 0) > before.activations &&
      scene?.powerType !== before.powerType;
  }, beforeTripleTouch, { timeout: 3000 });
  await dispatchTouch("touchmove", [point(1, 245, 448), point(2, 665, 340), point(3, 885, 340)]);
  await nativePage.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.touch.axis > 0.95;
  }, undefined, { timeout: 2000 });
  await dispatchTouch("touchend", [point(2, 665, 340)], [point(1, 245, 448), point(3, 885, 340)]);
  await nativePage.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.touch.axis > 0.95;
  }, undefined, { timeout: 1000 });

  const beforeRepeat = await nativePage.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene.specialActivationCount || 0;
  });
  await dispatchTouch("touchstart", [point(4, 665, 340)], [point(1, 245, 448), point(3, 885, 340), point(4, 665, 340)]);
  await nativePage.waitForFunction((count) => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return (scene?.specialActivationCount || 0) > count;
  }, beforeRepeat, { timeout: 2000 });
  await dispatchTouch("touchmove", [point(1, 245, 448), point(3, 885, 340), point(4, 665, 340)]);
  await dispatchTouch("touchend", [point(1, 245, 448), point(3, 885, 340), point(4, 665, 340)], []);
  await nativePage.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.touch.axis === 0 && scene?.touch.down === false;
  }, undefined, { timeout: 2000 });

  // A background transition must release every captured native touch, even
  // when the WebView never delivers touchend for fingers that were held.
  await dispatchTouch("touchstart", [point(5, 132, 448), point(6, 665, 340)]);
  await nativePage.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.keys.left.isDown = true;
    scene.keys.left.isUp = false;
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
    if (scene?.touch.axis !== 0 || scene?.mobileActionQueue?.length ||
        scene?.mobileJumpHeld || scene?.attackHeld || scene?.keys.left.isDown) {
      throw new Error("Backgrounding did not clear active joystick, action, and keyboard inputs");
    }
  });
  await nativePage.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await nativePage.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.sys.isActive();
  }, undefined, { timeout: 2000 });
  await dispatchTouch("touchstart", [point(7, 132, 448)]);
  await dispatchTouch("touchmove", [point(7, 245, 448)]);
  await nativePage.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.touch.axis > 0.95;
  }, undefined, { timeout: 2000 });
  await dispatchTouch("touchend", [point(7, 245, 448)], []);

  // Hiding the control overlay during a stage/menu transition must release
  // pointer ids even if the browser never sends touchend for the held fingers.
  await dispatchTouch("touchstart", [point(8, 132, 448), point(9, 665, 340)]);
  await nativePage.evaluate(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    scene.setMobileControlsVisible(false);
    if (scene.touch.axis !== 0 || scene.mobileActionQueue.length) {
      throw new Error("Hiding the control overlay did not reset active input state");
    }
    scene.setMobileControlsVisible(true);
  });
  await dispatchTouch("touchstart", [point(10, 132, 448)]);
  await dispatchTouch("touchmove", [point(10, 245, 448)]);
  await nativePage.waitForFunction(() => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    return scene?.touch.axis > 0.95;
  }, undefined, { timeout: 2000 });
  await dispatchTouch("touchend", [point(10, 245, 448)], []);
  await delay(150);
  await nativePage.evaluate((animTime) => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    if (!scene || scene.heroAnimTime <= animTime || !scene.sys.isActive()) {
      throw new Error("Scene update loop stalled after simultaneous joystick + Extra 1 + POWER input");
    }
  }, beforeTripleTouch.animTime);
  await nativePage.waitForFunction((before) => {
    const scene = window.__ZERO_GAME_TEST__?.scene.getScene("ZeroGameScene");
    const enemies = scene?.enemies.getChildren().filter((enemy) => enemy.active && !enemy.getData("isBoss")) || [];
    const byId = new Map(enemies.map((enemy) => [enemy.getData("smokeCheckId"), enemy.getData("animTime") || 0]));
    return before.some(([id, animTime]) => byId.has(id) && byId.get(id) > animTime);
  }, beforeTripleTouch.enemyAnimTimes, { timeout: 2000 });
  await nativePage.close();

  if (nativeErrors.length) {
    throw new Error(`Android TouchEvent path runtime errors:\n${nativeErrors.join("\n")}`);
  }
  if (runtimeErrors.length) {
    throw new Error(`Browser runtime errors:\n${runtimeErrors.join("\n")}`);
  }
  console.log("Browser smoke test passed: campaign/stage regression, 32 enemy ambient clips and hero-awareness state changes, all five boss signature rigs, original enemy visuals, mobile multitouch controls, boss/stage progression, and no uncaught runtime errors.");
} finally {
  if (browser) await browser.close();
  if (server.exitCode === null) {
    server.kill("SIGTERM");
    await Promise.race([once(server, "exit").catch(() => {}), delay(1000)]);
  }
  if (server.exitCode === null) server.kill("SIGKILL");
  server.stdout.destroy();
  server.stderr.destroy();
}
