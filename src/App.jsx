
import { useCallback, useEffect, useRef } from "react";
import Phaser from "phaser";
import heroRyoSheet from "./assets/heroes/hero_ryo.png";
import heroKairoSheet from "./assets/heroes/hero_kairo.png";
import heroMeiSheet from "./assets/heroes/hero_mei.png";
import heroVoltSheet from "./assets/heroes/hero_volt.png";
import enemyFastSheet from "./assets/enemies/enemy-fast-sheet.svg";
import enemyHeavySheet from "./assets/enemies/enemy-heavy-sheet.svg";
import enemySpecialSheet from "./assets/enemies/enemy-special-sheet.svg";
import premiumEnemyAtlas from "./assets/enemies/premium-enemy-atlas.svg";
import enemy03RedHorn from "./assets/enemies/prepared-reference/03_red-horn-demon.png";
import enemy05WinterChick from "./assets/enemies/prepared-reference/05_winter-chick.png";
import enemy07PinkOctopus from "./assets/enemies/prepared-reference/07_pink-octopus.png";
import enemy10GoggleBrown from "./assets/enemies/prepared-reference/10_goggle-brown-creature.png";
import enemy14MushroomCrab from "./assets/enemies/prepared-reference/14_mushroom-crab.png";
import enemy15BrownGoggle from "./assets/enemies/prepared-reference/15_brown-goggle-creature.png";
import enemy20Hedgehog from "./assets/enemies/prepared-reference/20_spiky-hedgehog.png";
import enemy23GreenFrog from "./assets/enemies/prepared-reference/23_green-frog.png";
import enemy25Squirrel from "./assets/enemies/prepared-reference/25_squirrel.png";
import enemy27Bee from "./assets/enemies/prepared-reference/27_bee.png";
import enemy33Mummy from "./assets/enemies/prepared-reference/33_mummy.png";
import enemy35BlueOgre from "./assets/enemies/prepared-reference/35_blue-ogre-b.png";
import enemy37Turtle from "./assets/enemies/prepared-reference/37_green-turtle-a.png";
import enemy38Turtle from "./assets/enemies/prepared-reference/38_green-turtle-b.png";
import enemy39Lizard from "./assets/enemies/prepared-reference/39_green-lizard.png";
import enemy42RatGuard from "./assets/enemies/prepared-reference/42_rat-guard.png";
import bossGatekeeperSheet from "./assets/bosses/prepared-reference/gatekeeper.png";
import bossIronCometSheet from "./assets/bosses/prepared-reference/iron-comet.png";
import bossGaleTalonSheet from "./assets/bosses/prepared-reference/gale-talon.png";
import bossSuncrestSheet from "./assets/bosses/prepared-reference/suncrest.png";
import bossVoidSovereignSheet from "./assets/bosses/prepared-reference/void-sovereign.png";
import worldBackdropEmerald from "./assets/backgrounds/world-emerald.svg";
import worldBackdropCandy from "./assets/backgrounds/world-candy.svg";
import worldBackdropFrozen from "./assets/backgrounds/world-frozen.svg";
import worldBackdropDesert from "./assets/backgrounds/world-desert.svg";
import worldBackdropMoonlit from "./assets/backgrounds/world-moonlit.svg";
import worldBackdropCrystal from "./assets/backgrounds/world-crystal.svg";
import worldBackdropCoral from "./assets/backgrounds/world-coral.svg";
import worldBackdropSky from "./assets/backgrounds/world-sky.svg";
import worldBackdropVolcano from "./assets/backgrounds/world-volcano.svg";
import worldBackdropCosmic from "./assets/backgrounds/world-cosmic.svg";
import { Capacitor } from "@capacitor/core";
import { ELEMENTS, HEROES, getElement, getStage, getHero } from "./gameData";
import { getPremiumStageEnemyRoster, getPremiumEnemyRegion, PREMIUM_ENEMY_ARCHETYPES, getPremiumEnemyFrameIndex } from "./premiumCampaignData";
import { createGameAudio } from "./gameAudio";

const APPROVED_ENEMY_ART = {
  "spirit-pouncer": enemy03RedHorn,
  "icicle-hopper": enemy05WinterChick,
  "jelly-vault": enemy07PinkOctopus,
  "bark-bruiser": enemy10GoggleBrown,
  "spore-caster": enemy14MushroomCrab,
  "caramel-mauler": enemy15BrownGoggle,
  "moss-scout": enemy20Hedgehog,
  "vine-vault": enemy23GreenFrog,
  "acorn-leaper": enemy25Squirrel,
  "candy-copter": enemy27Bee,
  "eclipse-summoner": enemy33Mummy,
  "temple-breaker": enemy35BlueOgre,
  "jade-shellback": enemy37Turtle,
  "root-burrower": enemy38Turtle,
  "mire-burrower": enemy39Lizard,
  "licorice-sniper": enemy42RatGuard,
  "shadow-moss-scout": enemy20Hedgehog,
  "iron-bark-bruiser": enemy10GoggleBrown,
  "golden-acorn-leaper": enemy25Squirrel,
  "prism-jelly-vault": enemy07PinkOctopus,
  "molten-caramel-mauler": enemy15BrownGoggle,
  "storm-candy-copter": enemy27Bee,
  "frostfire-icicle-hopper": enemy05WinterChick,
  "crystal-spore-caster": enemy14MushroomCrab,
  "thorn-root-burrower": enemy38Turtle,
  "ember-spirit-pouncer": enemy03RedHorn,
  "toxic-vine-vault": enemy23GreenFrog,
  "solar-jade-shellback": enemy37Turtle,
  "plasma-mire-burrower": enemy39Lizard,
  "void-licorice-sniper": enemy42RatGuard,
  "astral-eclipse-summoner": enemy33Mummy,
  "frost-temple-breaker": enemy35BlueOgre,
};
import { createCampaignLives, loseCampaignHeart, getStageTransitionDirection } from "./campaignRules";
import { shouldHeroCollideWithPlatform, shouldDropThroughPlatform, getPlatformTextureScale } from "./platformRules";
import { getBossPhase, isValidJumpStomp } from "./combatRules";
import { getBossAttendantWaveSize, BOSS_ATTENDANT_MAX_ACTIVE, getBossSignatureProfile } from "./bossEncounterRules";
import { canKickElementBall, canRollingBallHitTarget, isRollingBallOutOfBounds, calculateRollingBallMotion } from "./snowballRules";
import { getEnemyMovementSpeed, getSnowballPowerTier, REGULAR_ENEMY_VISUAL_SCALE } from "./enemyRules";
import { MOBILE_ACTION_BUTTONS, enqueueMobileAction, consumeMobileAction } from "./mobileActionQueue";
import "./App.css";

class ZeroGameScene extends Phaser.Scene {
  preload() {
    const heroSheets = {
      ryo: heroRyoSheet,
      kairo: heroKairoSheet,
      mei: heroMeiSheet,
      volt: heroVoltSheet,
    };
    Object.entries(heroSheets).forEach(([heroId, source]) => {
      this.load.spritesheet(`hero-sheet-${heroId}`, source, {
        frameWidth: 210,
        frameHeight: 212,
      });
    });
    const worldBackdrops = [
      worldBackdropEmerald, worldBackdropCandy, worldBackdropFrozen,
      worldBackdropDesert, worldBackdropMoonlit, worldBackdropCrystal,
      worldBackdropCoral, worldBackdropSky, worldBackdropVolcano, worldBackdropCosmic,
    ];
    const enemySheets = [
      ["enemy-sheet-fast", enemyFastSheet],
      ["enemy-sheet-heavy", enemyHeavySheet],
      ["enemy-sheet-special", enemySpecialSheet],
    ];
    enemySheets.forEach(([key, source]) => this.load.spritesheet(key, source, {
      frameWidth: 128, frameHeight: 128,
    }));
    this.load.spritesheet("premium-enemy-atlas", premiumEnemyAtlas, {
      frameWidth: 128, frameHeight: 128,
    });
    Object.entries(APPROVED_ENEMY_ART).forEach(([archetypeId, source]) => {
      this.load.image(`approved-enemy-${archetypeId}`, source);
    });
    const bossImages = [
      ["boss-image-gatekeeper", bossGatekeeperSheet],
      ["boss-image-iron-comet", bossIronCometSheet],
      ["boss-image-gale-talon", bossGaleTalonSheet],
      ["boss-image-suncrest", bossSuncrestSheet],
      ["boss-image-void-sovereign", bossVoidSovereignSheet],
    ];
    bossImages.forEach(([key, source]) => this.load.image(key, source));
    worldBackdrops.forEach((source, index) => {
      this.load.image(`world-backdrop-${index}`, source);
    });
  }

  createHeroAnimations() {
    const animationRanges = {
      idle: { start: 0, end: 3, frameRate: 6, repeat: -1 },
      land: { start: 4, end: 5, frameRate: 8, repeat: 0 },
      walk: { start: 6, end: 11, frameRate: 11, repeat: -1 },
      jump: { start: 12, end: 14, frameRate: 8, repeat: -1 },
      turn: { start: 15, end: 16, frameRate: 7, repeat: 0 },
      victory: { start: 18, end: 21, frameRate: 9, repeat: 0 },
    };
    ["ryo", "kairo", "mei", "volt"].forEach((heroId) => {
      const textureKey = `hero-sheet-${heroId}`;
      Object.entries(animationRanges).forEach(([state, range]) => {
        const key = `hero-${heroId}-${state}`;
        if (this.anims.exists(key)) return;
        this.anims.create({
          key,
          frames: this.anims.generateFrameNumbers(textureKey, {
            start: range.start,
            end: range.end,
          }),
          frameRate: range.frameRate,
          repeat: range.repeat,
        });
      });
    });
  }

  createCombatantAnimations() {
    ["fast", "heavy", "special"].forEach((kind) => {
      const key = `enemy-${kind}-move`;
      if (this.anims.exists(key)) return;
      this.anims.create({
        key,
        frames: this.anims.generateFrameNumbers(`enemy-sheet-${kind}`, { start: 0, end: 3 }),
        frameRate: kind === "fast" ? 9 : 6,
        repeat: -1,
      });
      const strikeKey = `enemy-${kind}-strike`;
      if (!this.anims.exists(strikeKey)) {
        this.anims.create({
          key: strikeKey,
          frames: this.anims.generateFrameNumbers(`enemy-sheet-${kind}`, { frames: [1, 2, 3] }),
          frameRate: kind === "fast" ? 13 : 9,
          repeat: 0,
        });
      }
    });
    const enemyAnimationProfiles = {
      runner: { move: [0, 1, 2, 3], strike: [1, 2, 3], rate: 12 },
      shield: { move: [0, 2, 1, 3], strike: [2, 1, 3], rate: 6 },
      leaper: { move: [0, 2, 3, 1], strike: [2, 3, 1], rate: 10 },
      ranged: { move: [0, 1, 0, 2], strike: [1, 3, 2], rate: 7 },
      ambusher: { move: [0, 3, 2, 1], strike: [3, 2, 1], rate: 9 },
      flying: { move: [0, 2, 0, 3], strike: [2, 3, 1], rate: 11 },
      heavy: { move: [0, 1, 0, 1], strike: [1, 2, 3], rate: 5 },
      charger: { move: [0, 3, 1, 2], strike: [3, 1, 2], rate: 8 },
      summoner: { move: [0, 1, 3, 2], strike: [1, 3, 2], rate: 6 },
      bomber: { move: [0, 2, 1, 3], strike: [2, 1, 3], rate: 7 },
      illusionist: { move: [0, 3, 1, 2], strike: [3, 1, 2], rate: 10 },
    };
    PREMIUM_ENEMY_ARCHETYPES.filter((archetype) => !archetype.variantOf).forEach((archetype) => {
      const frameStart = getPremiumEnemyFrameIndex(archetype.id) * 4;
      const profile = enemyAnimationProfiles[archetype.role] || enemyAnimationProfiles.runner;
      const idleKey = `enemy-${archetype.id}-idle`;
      const moveKey = `enemy-${archetype.id}-move`;
      const attackKey = `enemy-${archetype.id}-attack`;
      const hitKey = `enemy-${archetype.id}-hit`;
      const defeatKey = `enemy-${archetype.id}-defeat`;
      if (!this.anims.exists(idleKey)) {
        this.anims.create({
          key: idleKey,
          frames: [{ key: "premium-enemy-atlas", frame: frameStart }],
          frameRate: 1,
          repeat: -1,
        });
      }
      if (!this.anims.exists(moveKey)) {
        this.anims.create({
          key: moveKey,
          frames: this.anims.generateFrameNumbers("premium-enemy-atlas", {
            frames: profile.move.map((frame) => frameStart + frame),
          }),
          frameRate: profile.rate + (archetype.tier === "elite" ? 2 : 0),
          repeat: -1,
        });
      }
      if (!this.anims.exists(attackKey)) {
        this.anims.create({
          key: attackKey,
          frames: this.anims.generateFrameNumbers("premium-enemy-atlas", {
            frames: profile.strike.map((frame) => frameStart + frame),
          }),
          frameRate: profile.rate + (archetype.tier === "elite" ? 6 : 4),
          repeat: 0,
        });
      }
      if (!this.anims.exists(hitKey)) {
        this.anims.create({
          key: hitKey,
          frames: this.anims.generateFrameNumbers("premium-enemy-atlas", {
            frames: [frameStart + 3, frameStart + 1, frameStart + 3],
          }),
          frameRate: 16,
          repeat: 0,
        });
      }
      if (!this.anims.exists(defeatKey)) {
        this.anims.create({
          key: defeatKey,
          frames: this.anims.generateFrameNumbers("premium-enemy-atlas", {
            frames: [frameStart + 3, frameStart + 2, frameStart + 1, frameStart],
          }),
          frameRate: archetype.tier === "elite" ? 11 : 9,
          repeat: 0,
        });
      }
    });

  }

  addAmbientTween(config) {
    // Keep gameplay cues and one-shot transitions intact, but suppress looping
    // decorative motion when the operating system requests reduced motion.
    if (this.reducedMotion && config?.repeat === -1) return null;
    return this.tweens.add(config);
  }

  setHeroSpriteAnimation(visual, state) {
    const sprite = visual?.getData("heroSprite");
    const heroId = visual?.getData("heroSpriteId") || "ryo";
    if (!sprite?.active) return;
    const key = `hero-${heroId}-${state}`;
    if (this.anims.exists(key) && sprite.anims.currentAnim?.key !== key) {
      sprite.play(key, true);
    }
  }

  constructor() {
    super("ZeroGameScene");

    this.touch = {
      left: false,
      right: false,
      down: false,
      jump: false,
      attack: false,
      super: false,
      special1: false,
      special2: false,
      special3: false,
    };

    this.stageNumber = 1;
    this.stageConfig = getStage(1);
    this.selectedHero = getHero(localStorage.getItem("zero_game_hero") || "ryo");
    this.stageStartedAt = 0;
    this.stageTimeLeft = 120;
    this.timeHunterSpawned = false;
    this.treasureChest = null;
    this.bonusUntil = 0;
    this.bonusMode = false;
    this.score = 0;
    this.extraLivesAwarded = 0;
    this.gameStarted = true;
    this.campaignActive = false;
    this.heroSelectionLocked = false;
    this.openHeroSelectAfterRestart = false;
    this.chances = 3;
    this.chanceLossInProgress = false;
    this.stageTransitionActive = false;
    this.pendingStageTransitionDirection = null;
    this.snowballTutorialShown = false;
    this.stageEnemyCount = this.stageConfig.enemyCount;
    this.score = 0;
    this.facing = 1;
    this.defeated = 0;
    this.health = 3;
    this.lastAttack = 0;
    this.lastDamage = 0;
    this.stageCleared = false;
    this.gameOver = false;
    this.heroAnimTime = 0;
    this.heroWasAirborne = false;
    this.boss = null;
    this.bossHealth = this.stageConfig.boss?.hp || 24;
    this.bossMaxHealth = this.bossHealth;
    this.bossAttackAt = 0;
    this.bossDefeated = false;
    this.bossPhase = 1;
    this.powerType = "fire";
    this.particlePowerLevel = 1;
    this.particlePowerMaxLevel = 20;
    this.attackHeld = false;
    this.attackChargeStart = 0;
    this.attackCharge = 0;
    this.superReadyAt = 0;
    this.jumpFlipDirection = 1;
    this.jumpStartedAt = 0;
    this.jumpWasMoving = false;
    this.jumpCount = 0;
    this.dropThroughUntil = 0;
    this.touch.axis = 0;
    this.touch.down = false;
    this.mobileActionQueue = [];
    this.mobileJumpHeld = false;
    this.mobileJumpPressedAt = 0;
    this.audio = createGameAudio();
    this.reducedMotion = typeof window !== "undefined" &&
      Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches);
  }

  create() {
    const W = 960;
    const H = 540;

    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setScroll(0, 0);

    this.stageConfig = getStage(this.stageNumber);
    this.stageEnemyCount = this.stageConfig.enemyCount;
    // A Phaser scene restart reuses this scene instance; reset every stage-scoped
    // boss reference/guard so a later boss cannot be skipped by stale state.
    this.boss = null;
    this.bossVisual = null;
    this.bossSpawnQueued = false;
    this.bossAttendantSpawnQueued = false;
    this.bossDefeated = false;
    this.bossHealth = this.stageConfig.boss?.hp || 24;
    this.bossMaxHealth = this.bossHealth;
    this.stageTimeLeft = this.stageConfig.timeLimit || 120;
    this.stageStartedAt = this.time.now;
    this.timeHunterSpawned = false;
    this.bonusMode = false;
    this.createBackground();
    this.createTextures();
    this.createHeroAnimations();
    this.createCombatantAnimations();
    this.createPlatforms();

    // Invisible physics body for the currently selected hero
    this.hero = this.physics.add.sprite(480, 450, "ryo");
    this.hero.setCollideWorldBounds(true);
    this.hero.setDepth(10);
    this.hero.setSize(34, 64);
    this.hero.setOffset(15, 18);
    this.hero.setVisible(false);

    // Animated visual character
    this.heroVisual = this.createHeroVisual(480, 450, this.selectedHero.id);
    this.applyHeroLook(this.heroVisual, this.selectedHero);

    this.physics.add.overlap(this.hero, this.platforms, this.handleSpecialPlatform, null, this);
    this.heroPlatformCollider = this.physics.add.collider(this.hero, this.platforms, null,
      (hero, platform) => shouldHeroCollideWithPlatform({
        isGround: platform === this.groundPlatform,
        dropThroughActive: this.time.now < (this.dropThroughUntil || 0),
        velocityY: hero.body.velocity.y,
        heroBottom: hero.body.bottom,
        platformTop: platform.body.top,
      }), this);

    this.enemies = this.physics.add.group();
    this.projectiles = this.physics.add.group();
    this.bossShots = this.physics.add.group();
    this.bonusItems = this.physics.add.group();

    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.overlap(this.hero, this.bonusItems, this.collectBonusItem, null, this);

    this.physics.add.overlap(
      this.projectiles,
      this.enemies,
      this.hitEnemy,
      null,
      this
    );

    this.physics.add.overlap(
      this.hero,
      this.enemies,
      this.damageHero,
      null,
      this
    );
    this.physics.add.overlap(
      this.hero,
      this.bossShots,
      this.hitBossShot,
      null,
      this
    );

    this.keys = this.input.keyboard.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      d: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE,
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      attack: Phaser.Input.Keyboard.KeyCodes.X,
      super: Phaser.Input.Keyboard.KeyCodes.Z,
      cyclePower: Phaser.Input.Keyboard.KeyCodes.C,
      special1: Phaser.Input.Keyboard.KeyCodes.ONE,
      special2: Phaser.Input.Keyboard.KeyCodes.TWO,
      special3: Phaser.Input.Keyboard.KeyCodes.THREE,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      restart: Phaser.Input.Keyboard.KeyCodes.R,
      musicToggle: Phaser.Input.Keyboard.KeyCodes.M,
      sfxToggle: Phaser.Input.Keyboard.KeyCodes.N
    });

    this.createHUD();
    this.createMobileControls();
    this.input.keyboard.once("keydown", () => { this.audio.unlock(); this.audio.play("stage"); });
    this.events.once("shutdown", () => { this.audio.stop(); });
    this.defeated = 0;
    this.stageCleared = false;
    this.stageCollectionActive = false;
    this.gameOver = false;
    if (this.openHeroSelectAfterRestart) {
      this.openHeroSelectAfterRestart = false;
      this.showHeroSelect();
    } else if (this.campaignActive && this.selectedHero) {
      const direction = this.pendingStageTransitionDirection;
      this.pendingStageTransitionDirection = null;
      this.beginCampaign({ transitionDirection: direction });
    } else {
      this.showStoryScreen();
    }
  }

  createBackground() {
    const W = 960;
    const H = 540;

    this.add.rectangle(480, 270, W, H, this.stageConfig.background.sky)
      .setDepth(-30);

    // Celestial bodies and clouds belong to the weather layer. The distant
    // silhouette below is authored by world so desert/ocean/cosmic stages do
    // not inherit the same snow-capped mountain skyline.
    const farScene = this.add.graphics().setDepth(-22);
    const farColor = this.stageConfig.background.far;
    const groundColor = this.stageConfig.background.ground;
    const world = this.stageConfig.worldIndex || 0;
    this.worldBackdrop = this.add.image(480, 270, `world-backdrop-${world}`)
      .setDisplaySize(W, H)
      .setAlpha(0.58)
      .setDepth(-29);
    farScene.fillStyle(farColor, 0.96);
    if (world === 0 || world === 4) {
      farScene.fillEllipse(150, 365, 420, 150);
      farScene.fillEllipse(510, 360, 520, 170);
      farScene.fillEllipse(880, 370, 420, 150);
      for (let x = 70; x < 960; x += 220) {
        farScene.fillRoundedRect(x - 12, 190 + (x % 3) * 15, 24, 220, 10);
        farScene.fillCircle(x, 205 + (x % 3) * 15, 55);
      }
    } else if (world === 1) {
      farScene.fillEllipse(160, 370, 460, 150);
      farScene.fillEllipse(520, 365, 520, 165);
      farScene.fillEllipse(870, 375, 430, 150);
      farScene.fillStyle(0xffe2ef, 0.6);
      for (let x = 90; x < 960; x += 260) farScene.fillCircle(x, 300 + (x % 3) * 12, 34);
    } else if (world === 2) {
      farScene.fillPoints([
        { x: 0, y: 390 }, { x: 125, y: 180 }, { x: 260, y: 390 },
        { x: 400, y: 205 }, { x: 570, y: 390 }, { x: 735, y: 175 },
        { x: 900, y: 390 }, { x: 960, y: 280 }, { x: 960, y: 500 }, { x: 0, y: 500 }
      ], true);
      farScene.fillStyle(0xd8f0ec, 0.9);
      farScene.fillPoints([
        { x: 90, y: 235 }, { x: 125, y: 180 }, { x: 160, y: 235 },
        { x: 400, y: 260 }, { x: 400, y: 205 }, { x: 445, y: 265 },
        { x: 695, y: 230 }, { x: 735, y: 175 }, { x: 780, y: 230 }
      ], false);
    } else if (world === 3) {
      farScene.fillEllipse(180, 385, 520, 170);
      farScene.fillEllipse(560, 390, 620, 185);
      farScene.fillEllipse(940, 385, 480, 160);
      farScene.fillStyle(0xf0c58c, 0.42);
      farScene.fillEllipse(340, 405, 560, 125);
      farScene.fillEllipse(820, 410, 540, 130);
    } else if (world === 5) {
      for (let x = 40; x < 1000; x += 180) {
        const height = 125 + (x % 3) * 24;
        farScene.fillTriangle(x - 68, 440, x, 440 - height, x + 68, 440);
        farScene.fillStyle(0xb9a7ff, 0.32);
        farScene.fillTriangle(x - 12, 440, x, 440 - height, x + 18, 440);
        farScene.fillStyle(farColor, 0.96);
      }
    } else if (world === 6) {
      farScene.fillEllipse(150, 390, 500, 170);
      farScene.fillEllipse(500, 385, 560, 180);
      farScene.fillEllipse(880, 395, 500, 165);
      farScene.lineStyle(18, 0x2b8c91, 0.72);
      farScene.beginPath(); farScene.moveTo(0, 365); farScene.lineTo(250, 340);
      farScene.lineTo(480, 370); farScene.lineTo(720, 342); farScene.lineTo(960, 365); farScene.strokePath();
    } else if (world === 7) {
      for (let x = 90; x < 980; x += 245) {
        const y = 300 + (x % 3) * 16;
        farScene.fillEllipse(x, y, 190, 36);
        farScene.fillTriangle(x - 55, y + 10, x + 55, y + 10, x, y + 95);
      }
      farScene.fillStyle(0xe3f2ff, 0.3);
      farScene.fillEllipse(210, 390, 360, 80);
      farScene.fillEllipse(760, 395, 420, 85);
    } else if (world === 8) {
      farScene.fillPoints([
        { x: 0, y: 430 }, { x: 130, y: 280 }, { x: 230, y: 410 },
        { x: 390, y: 250 }, { x: 540, y: 425 }, { x: 700, y: 270 },
        { x: 850, y: 410 }, { x: 960, y: 300 }, { x: 960, y: 500 }, { x: 0, y: 500 }
      ], true);
      farScene.fillStyle(0xff8b58, 0.34);
      farScene.fillEllipse(470, 420, 620, 90);
    } else {
      for (let x = 80; x < 980; x += 180) {
        const h = 110 + (x % 3) * 28;
        farScene.fillRoundedRect(x - 24, 430 - h, 48, h, 8);
        farScene.fillTriangle(x - 35, 430 - h, x, 390 - h, x + 35, 430 - h);
      }
      farScene.lineStyle(8, 0x7773ba, 0.5);
      farScene.strokeCircle(490, 310, 190);
    }
    const nearHills = this.add.graphics().setDepth(-20);
    nearHills.fillStyle(groundColor, 0.78);
    nearHills.fillEllipse(150, 405, 390, 150);
    nearHills.fillEllipse(500, 402, 430, 160);
    nearHills.fillEllipse(860, 408, 380, 145);

    // The old repeated castle/building backdrop is intentionally removed.
    // Each world now receives its own landmark composition below.
    this.createStageAtmosphere();
    this.createPremiumStageSetpiece();

    this.add.rectangle(480, 505, 960, 70, this.stageConfig.background.ground)
      .setDepth(-5);

    this.add.rectangle(480, 472, 960, 12, this.stageConfig.background.accent)
      .setDepth(-4);

    // Match the arena's lower trim to its world instead of repeating grass
    // and flowers in ice, desert, ocean, volcano, and cosmic stages.
    const groundDetail = this.add.graphics().setDepth(-3);
    const accent = this.stageConfig.background.accent;
    if (world === 0 || world === 4) {
      groundDetail.lineStyle(2, world === 4 ? 0x80c99a : 0x9ce36c, 0.9);
      for (let x = 10; x < 960; x += 30) {
        groundDetail.lineBetween(x, 480, x - 4, 468);
        groundDetail.lineBetween(x + 4, 480, x + 9, 467);
      }
      for (let i = 0; i < 22; i++) {
        const x = 20 + i * 43;
        this.add.circle(x, 490 + (i % 3) * 8, 3,
          world === 4 ? 0x9ce6b0 : (i % 2 ? 0xffe58a : 0xffa7d5)).setDepth(-2);
      }
    } else if (world === 1) {
      for (let x = 24; x < 960; x += 62) {
        groundDetail.fillStyle(x % 2 ? 0xffe5f1 : 0xffd36b, 0.88);
        groundDetail.fillEllipse(x, 485 + (x % 3) * 4, 20, 9);
        groundDetail.fillStyle(0xffffff, 0.7);
        groundDetail.fillCircle(x - 5, 480 + (x % 2) * 5, 3);
      }
    } else if (world === 2) {
      for (let x = 18; x < 960; x += 48) {
        groundDetail.fillStyle(0xbdefff, 0.82);
        groundDetail.fillTriangle(x - 7, 495, x, 472 - (x % 3) * 3, x + 8, 495);
        groundDetail.lineStyle(1, 0xffffff, 0.72);
        groundDetail.lineBetween(x, 478, x, 493);
      }
    } else if (world === 3) {
      for (let x = 20; x < 960; x += 58) {
        groundDetail.fillStyle(x % 2 ? 0xd7a36b : 0xb77b48, 0.9);
        groundDetail.fillEllipse(x, 490 + (x % 3) * 3, 24, 8);
        groundDetail.fillStyle(0xffe09b, 0.72);
        groundDetail.fillCircle(x - 6, 486, 2);
      }
    } else if (world === 5) {
      for (let x = 24; x < 960; x += 68) {
        groundDetail.fillStyle(0x8f80c8, 0.88);
        groundDetail.fillTriangle(x - 11, 497, x, 469 - (x % 3) * 3, x + 12, 497);
        groundDetail.fillStyle(accent, 0.85);
        groundDetail.fillCircle(x, 481, 3);
      }
    } else if (world === 6) {
      for (let x = 18; x < 960; x += 60) {
        groundDetail.lineStyle(3, 0x65c8b7, 0.9);
        groundDetail.beginPath();
        groundDetail.moveTo(x, 500);
        groundDetail.lineTo(x - 4, 482);
        groundDetail.lineTo(x + 5, 474);
        groundDetail.lineTo(x + 2, 462);
        groundDetail.strokePath();
        groundDetail.fillStyle(0xffd49b, 0.9);
        groundDetail.fillCircle(x + 12, 491, 4);
      }
    } else if (world === 7) {
      for (let x = 18; x < 960; x += 72) {
        groundDetail.fillStyle(0xd8efff, 0.62);
        groundDetail.fillEllipse(x, 493, 42, 10);
        groundDetail.fillEllipse(x + 12, 488, 25, 10);
      }
    } else if (world === 8) {
      for (let x = 18; x < 960; x += 58) {
        groundDetail.lineStyle(3, 0x5b4650, 0.95);
        groundDetail.lineBetween(x, 499, x + 7, 479);
        groundDetail.lineBetween(x + 7, 479, x + 14, 499);
        groundDetail.fillStyle(0xff9b55, 0.82);
        groundDetail.fillCircle(x + 8, 486, 2 + (x % 3));
      }
    } else {
      for (let x = 20; x < 960; x += 56) {
        groundDetail.lineStyle(2, 0x7773ba, 0.9);
        groundDetail.lineBetween(x, 498, x + 8, 480);
        groundDetail.lineBetween(x + 8, 480, x + 16, 498);
        groundDetail.fillStyle(0xffdf88, 0.92);
        groundDetail.fillCircle(x + 8, 487, 2.5);
      }
    }
  }

  createStageAtmosphere() {
    // Five deterministic atmosphere variants per world. Keep particle counts
    // deliberately small for smooth performance on Android devices.
    const world = this.stageConfig.worldIndex || 0;
    const variant = this.stageConfig.background.stageVariant || 0;
    const accent = this.stageConfig.background.accent;
    const weatherByWorld = [
      ["sunny", "petals", "rain", "golden", "fireflies"],
      ["sunny", "candy-drift", "petals", "sunset", "starlight"],
      ["snow", "snow", "blizzard", "aurora", "moon-snow"],
      ["sunny", "sand", "sandstorm", "sunset", "desert-night"],
      ["fireflies", "moon-mist", "rain", "moonlight", "fireflies"],
      ["crystal", "crystal", "shimmer-rain", "aurora", "starlight"],
      ["bubbles", "bubbles", "rain", "sunset", "moon-bubbles"],
      ["wind", "clouds", "rain", "aurora", "starlight"],
      ["embers", "ash", "ashfall", "eruption-glow", "embers"],
      ["starlight", "meteor-dust", "starfall", "aurora", "cosmic-night"]
    ];
    const weather = (weatherByWorld[world] || weatherByWorld[0])[variant];
    const night = /night|moon|fireflies|starlight|aurora|cosmic/.test(weather) || [4, 5, 9].includes(world) && variant === 4;
    const stormWeather = ["rain", "shimmer-rain", "blizzard", "sandstorm", "ashfall", "starfall"].includes(weather);
    const atmosphereTints = {
      rain: [0x9dcaff, 0.075], "shimmer-rain": [0xb7d9ff, 0.07],
      snow: [0xc8efff, 0.07], blizzard: [0xd5f4ff, 0.11], "moon-snow": [0x9bbce8, 0.07],
      sand: [0xf4c77e, 0.055], sandstorm: [0xd8a56e, 0.12],
      ash: [0x9b8b91, 0.065], ashfall: [0x817780, 0.12],
      embers: [0xff8b56, 0.055], "eruption-glow": [0xff754d, 0.085],
      aurora: [0x9c8cff, 0.055], starlight: [0x8e8bff, 0.045],
      "meteor-dust": [0xb49cff, 0.055], starfall: [0x8978d9, 0.095],
      "cosmic-night": [0x777de0, 0.065], crystal: [0xc1aaff, 0.045],
      bubbles: [0x7be8e1, 0.04], "moon-bubbles": [0x7daee8, 0.05],
      wind: [0xbad8ff, 0.04], clouds: [0xbad8ff, 0.045],
      sunset: [0xffc48a, 0.05], golden: [0xffd58a, 0.045],
      petals: [0xffb7d6, 0.04], "candy-drift": [0xffb7df, 0.045],
      "moon-mist": [0x8ba6d6, 0.045], moonlight: [0x8ba6d6, 0.04],
      "desert-night": [0x9b8bc4, 0.045], fireflies: [0x9bdc9c, 0.035],
    };
    const tint = atmosphereTints[weather];
    if (tint) {
      const wash = this.add.rectangle(480, 270, 960, 540, tint[0], tint[1]).setDepth(-11);
      this.addAmbientTween({
        targets: wash,
        alpha: tint[1] * 1.18,
        duration: 3200 + variant * 240,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });
    }
    if (["rain", "shimmer-rain"].includes(weather)) {
      for (let i = 0; i < 6; i++) {
        const x = 82 + i * 158;
        const puddle = this.add.ellipse(x, 493, 54 + (i % 3) * 8, 7, 0x9bdcff, 0.17)
          .setDepth(-4);
        const reflection = this.add.ellipse(x - 8, 491, 19, 2, 0xe8fbff, 0.28)
          .setDepth(-4);
        this.addAmbientTween({
          targets: [puddle, reflection],
          alpha: 0.07,
          scaleX: 1.22,
          duration: 1250 + i * 120,
          delay: i * 90,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    } else if (["snow", "blizzard", "moon-snow"].includes(weather)) {
      for (let i = 0; i < 6; i++) {
        const x = 75 + i * 160;
        const drift = this.add.ellipse(x, 493, 48 + (i % 2) * 16, 8, 0xdff8ff, 0.24)
          .setDepth(-4);
        const crystal = this.add.triangle(x + 13, 488, -5, 5, 0, -9, 5, 5, 0xc8f4ff, 0.72)
          .setDepth(-4);
        this.addAmbientTween({
          targets: [drift, crystal],
          alpha: 0.12,
          y: "-=2",
          duration: 1900 + i * 140,
          delay: i * 110,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    } else if (["sand", "sandstorm"].includes(weather)) {
      for (let i = 0; i < 5; i++) {
        const dust = this.add.ellipse(90 + i * 190, 492, 82, 9, 0xe3b77d, 0.14)
          .setDepth(-4);
        this.addAmbientTween({
          targets: dust,
          x: dust.x + (i % 2 ? -18 : 18),
          alpha: 0.04,
          scaleX: 1.3,
          duration: 2300 + i * 170,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    } else if (["ash", "ashfall", "embers", "eruption-glow"].includes(weather)) {
      for (let i = 0; i < 7; i++) {
        const ember = this.add.circle(58 + i * 140, 491 - (i % 3) * 3, 2 + (i % 2), 0xffa05b, 0.48)
          .setDepth(-4);
        this.addAmbientTween({
          targets: ember,
          y: ember.y - 9 - (i % 3) * 3,
          alpha: 0.06,
          scale: 0.35,
          duration: 1350 + i * 145,
          delay: i * 75,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
      }
    }
    const celestial = this.add.container(0, 0).setDepth(-27);
    const halo = this.add.circle(790, 128, 76, night ? 0xb9d7ff : 0xffd36b, 0.11);
    const orb = this.add.circle(790, 128, 35, night ? 0xe4efff : 0xffe69b, 0.96);
    celestial.add([halo, orb]);
    if (stormWeather) celestial.setVisible(false);
    if (night) {
      for (let i = 0; i < 3; i++) {
        celestial.add(this.add.circle(778 + i * 9, 118 + (i % 2) * 12, 5, 0x9aaed1, 0.24));
      }
    } else {
      const rays = this.add.graphics();
      rays.lineStyle(3, 0xffedaa, 0.34);
      for (let i = 0; i < 12; i++) {
        const a = i * Math.PI / 6;
        rays.lineBetween(790 + Math.cos(a) * 46, 128 + Math.sin(a) * 46,
          790 + Math.cos(a) * 62, 128 + Math.sin(a) * 62);
      }
      celestial.add(rays);
      this.addAmbientTween({ targets: rays, angle: 30, alpha: 0.45, duration: 9000, yoyo: true, repeat: -1 });
    }
    this.addAmbientTween({ targets: halo, scale: 1.12, alpha: 0.07, duration: 2600, yoyo: true, repeat: -1 });

    // Soft distant cloud banks add slow sky movement without obscuring play.
    const cloudWeather = ["sunny", "petals", "golden", "sunset", "moonlight", "moon-mist", "clouds"];
    if (cloudWeather.includes(weather) || stormWeather) {
      for (let i = 0; i < 3; i++) {
        const cloudX = 115 + i * 345;
        const cloudY = stormWeather ? 128 + (i % 2) * 34 : 118 + (i % 2) * 52;
        const cloud = this.add.container(cloudX, cloudY).setDepth(-26)
          .setAlpha(stormWeather ? 0.34 : night ? 0.12 : 0.19);
        const cloudTint = stormWeather
          ? (weather === "sandstorm" ? 0xb98c62 : weather === "ashfall" ? 0x82747a : 0x64758f)
          : night ? 0x9fb7d8 : weather === "sunset" ? 0xffc4b2 : 0xf4fbff;
        cloud.add([
          this.add.ellipse(-25, 5, 92, 28, cloudTint, 0.94),
          this.add.ellipse(0, -5, 58, 42, cloudTint, 0.94),
          this.add.ellipse(30, 4, 76, 30, cloudTint, 0.94),
        ]);
        if (stormWeather) {
          cloud.add(this.add.ellipse(0, 14, 106, 13, cloudTint, 0.7));
        }
        this.addAmbientTween({
          targets: cloud, x: cloudX + (i % 2 ? -42 : 42),
          duration: stormWeather ? 6200 + i * 900 : 9000 + i * 1700,
          ease: "Sine.easeInOut", yoyo: true, repeat: -1
        });
      }
    }

    if (weather === "aurora" || weather === "cosmic-night" || weather === "starlight") {
      const aurora = this.add.graphics().setDepth(-25).setAlpha(0.42);
      const auroraColors = [0x62e7c5, 0x8e9cff, 0xe28cff];
      auroraColors.forEach((color, band) => {
        aurora.lineStyle(10 - band * 2, color, 0.2);
        let previous = null;
        for (let step = 0; step <= 28; step++) {
          const x = 30 + step * 33;
          const y = 92 + band * 25 + Math.sin(step * 0.42 + band * 1.7) * (20 + band * 5);
          if (previous) aurora.lineBetween(previous.x, previous.y, x, y);
          previous = { x, y };
        }
      });
      this.addAmbientTween({
        targets: aurora, alpha: 0.72, y: 12, duration: 5200,
        ease: "Sine.easeInOut", yoyo: true, repeat: -1
      });
    }

    const count = weather === "rain" || weather === "blizzard" || weather === "ashfall" || weather === "starfall" ? 18 : 12;
    for (let i = 0; i < count; i++) {
      const x = 24 + (i * 79 + variant * 31) % 910;
      const y = 75 + (i * 53 + world * 17) % 350;
      let particle;
      let target;
      let duration = 1700 + (i % 6) * 190;
      if (weather === "rain" || weather === "shimmer-rain") {
        particle = this.add.line(x, y, 0, 0, -7, 18, 0x9edfff, 0.62).setLineWidth(2).setDepth(-17);
        target = { x: x - 34, y: y + 90, alpha: 0.1 };
        duration = 680 + (i % 5) * 55;
      } else if (weather === "snow" || weather === "blizzard" || weather === "moon-snow") {
        particle = this.add.star(x, y, 6, 2, 5 + (i % 3), 0xeafaff, 0.86).setDepth(-17);
        target = { x: x + (i % 2 ? 28 : -22), y: y + 105, angle: 150, alpha: 0.18 };
        duration = 2400 + (i % 7) * 220;
      } else if (weather === "petals" || weather === "candy-drift") {
        particle = this.add.ellipse(x, y, 8, 13, weather === "petals" ? 0xffa6c8 : 0xffe4f2, 0.85).setDepth(-17);
        target = { x: x + 45, y: y + 75, angle: 220, alpha: 0.12 };
      } else if (weather === "sand" || weather === "sandstorm" || weather === "wind") {
        particle = this.add.ellipse(x, y, 18, 3, weather === "wind" ? 0xe4fff8 : 0xffd69a, 0.55).setDepth(-17);
        target = { x: x + 100, y: y + (i % 2 ? 10 : -12), alpha: 0.08 };
        duration = 1200 + (i % 5) * 130;
      } else if (weather === "embers" || weather === "ash" || weather === "ashfall" || weather === "eruption-glow") {
        particle = this.add.circle(x, y, 2 + (i % 3), weather === "ash" || weather === "ashfall" ? 0xb9a6a0 : 0xffa05b, 0.82).setDepth(-17);
        target = { x: x + (i % 2 ? 20 : -16), y: y - 65, alpha: 0.08, scale: 0.4 };
        duration = 1900 + (i % 6) * 180;
      } else if (weather === "bubbles" || weather === "moon-bubbles") {
        particle = this.add.circle(x, y, 4 + (i % 4), 0x9df5ff, 0.2).setStrokeStyle(2, 0xe4ffff, 0.72).setDepth(-17);
        target = { y: y - 85, alpha: 0.08, scale: 1.35 };
        duration = 2500 + (i % 5) * 210;
      } else if (weather === "fireflies") {
        particle = this.add.circle(x, y, 3, 0xc8ff8c, 0.9).setDepth(-17);
        target = { x: x + (i % 2 ? 22 : -22), y: y - 20, alpha: 0.12, scale: 0.35 };
        duration = 1100 + (i % 6) * 230;
      } else {
        particle = this.add.star(x, y, 5, 2, 6, accent, 0.78).setDepth(-17);
        target = { x: x + (i % 2 ? 12 : -12), y: y + (i % 3) * 12 - 10, alpha: 0.12, scale: 0.55, angle: 35 };
        duration = 1500 + (i % 6) * 220;
      }
      this.addAmbientTween({
        targets: particle,
        ...target,
        duration,
        delay: (i % 6) * 95,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1
      });
    }

    // A subtle distant lightning flash gives storm stages a sense of depth.
    if (weather === "rain" || weather === "shimmer-rain" || weather === "blizzard") {
      const flash = this.add.rectangle(480, 270, 960, 540, 0xd8efff, 0).setDepth(-14);
      this.time.addEvent({
        delay: 5200 + world * 170,
        loop: true,
        callback: () => {
          if (!flash.active) return;
          this.addAmbientTween({ targets: flash, alpha: 0.12, duration: 90, yoyo: true, hold: 55 });
        }
      });
    }
  }

  createPremiumStageSetpiece() {
    const world = this.stageConfig.worldIndex || 0;
    const variant = (this.stageNumber - 1) % 5;
    const accent = this.stageConfig.background.accent;
    const far = this.stageConfig.background.far;
    const g = this.add.graphics().setDepth(-16);
    const glow = this.add.graphics().setDepth(-17);
    const xs = [90 + variant * 24, 280, 680, 870 - variant * 19];
    const base = 430;
    if (world === 0) {
      xs.forEach((x,i)=>{g.fillStyle(i%2?0x245b43:0x1d493d,0.95);g.fillRoundedRect(x-17,185+(i%2)*35,34,250,12);g.fillStyle(far,0.95);g.fillCircle(x,190+(i%2)*35,52+variant*3);g.fillCircle(x-28,218+(i%2)*35,35);g.fillCircle(x+30,220+(i%2)*35,34);g.lineStyle(5,0x3b8052,0.9);g.lineBetween(x-10,220,x-18,300+i*8);});
    } else if (world === 1) {
      xs.forEach((x,i)=>{g.fillStyle(i%2?0xf08ab7:0x9d72c8,0.9);g.fillRoundedRect(x-24,260-(i%2)*35,48,175,15);g.fillStyle(0xffe5f0,0.95);g.fillEllipse(x,260-(i%2)*35,64,30);g.fillStyle(0xffd36b,0.95);g.fillCircle(x,245-(i%2)*35,10+variant);g.lineStyle(7,0xffe5f0,0.85);g.beginPath();g.arc(x,330,40+variant*2,Math.PI,Math.PI*2,false);g.strokePath();});
    } else if (world === 2) {
      [xs[0],265,490,705,xs[3]].forEach((x,i)=>{const h=125+((i+variant)%3)*42;g.fillStyle(0x416f98,0.92);g.fillTriangle(x-58,base,x,base-h,x+58,base);g.fillStyle(0xc8f4ff,0.88);g.fillTriangle(x-14,base-h+30,x,base-h,x+24,base-h+62);g.lineStyle(3,0xffffff,0.55);g.lineBetween(x,base-h+15,x-18,base-25);});
    } else if (world === 3) {
      xs.forEach((x,i)=>{const h=110+((i+variant)%3)*28;g.fillStyle(0x8e5a39,0.95);g.fillRect(x-20,base-h,40,h);g.fillTriangle(x-28,base-h,x,base-h-34,x+28,base-h);g.lineStyle(5,0xf4c77e,0.9);g.lineBetween(x-12,base-h+18,x-12,base-12);g.lineBetween(x+12,base-h+18,x+12,base-12);});g.lineStyle(12,0xc58b59,0.85);g.beginPath();g.arc(490,390,145+variant*8,Math.PI,Math.PI*2,false);g.strokePath();
    } else if (world === 4) {
      xs.forEach((x,i)=>{g.fillStyle(0x172e3b,1);g.fillRoundedRect(x-13,145+(i%2)*30,26,290,10);g.fillStyle(0x315d55,0.95);g.fillEllipse(x,180+(i%2)*30,118,88);g.fillStyle(0x8ee8b1,0.8);g.fillEllipse(x+18,365-i*13,42,13);g.fillRect(x+14,365-i*13,8,32);});
    } else if (world === 5) {
      xs.forEach((x,i)=>{const h=100+((i+variant)%3)*45;g.fillStyle(0x4e4a88,0.95);g.fillTriangle(x-48,base,x-8,base-h,x+14,base);g.fillStyle(0xb9a7ff,0.92);g.fillTriangle(x+4,base,x+32,base-h*0.78,x+58,base);glow.fillStyle(0xc6aaff,0.16);glow.fillCircle(x+5,base-h*0.5,55+variant*4);});
    } else if (world === 6) {
      xs.forEach((x,i)=>{g.lineStyle(13,i%2?0xf09b85:0x3b9f9b,0.92);g.lineBetween(x,base,x,285+(i%2)*35);g.lineBetween(x,350,x-34,305+(i%2)*35);g.lineBetween(x,335,x+34,285+(i%2)*35);g.fillStyle(0xffc4a4,0.9);g.fillCircle(x-34,305+(i%2)*35,13);g.fillCircle(x+34,285+(i%2)*35,13);g.fillCircle(x,280+(i%2)*35,15);});
    } else if (world === 7) {
      xs.forEach((x,i)=>{const y=205+((i+variant)%3)*48;g.fillStyle(0x637fa8,0.9);g.fillEllipse(x,y,150,35);g.fillTriangle(x-48,y+8,x+48,y+8,x,y+85);g.fillStyle(0xf4e4a5,0.95);g.fillRect(x-8,y-42,16,42);g.fillTriangle(x-22,y-42,x,y-65,x+22,y-42);});
    } else if (world === 8) {
      xs.forEach((x,i)=>{g.fillStyle(0x382d3b,1);g.fillTriangle(x-95,base,x,175+(i%2)*30,x+95,base);g.fillStyle(0xff854c,0.95);g.fillTriangle(x-18,245+(i%2)*30,x,195+(i%2)*30,x+18,245+(i%2)*30);g.lineStyle(5,0xff9b55,0.8);g.lineBetween(x-10,260,x-35,390);});
    } else {
      xs.forEach((x,i)=>{const h=145+((i+variant)%3)*35;g.fillStyle(0x262d61,0.98);g.fillRoundedRect(x-25,base-h,50,h,8);g.fillStyle(0x555a9b,0.95);g.fillTriangle(x-34,base-h,x,base-h-48,x+34,base-h);g.fillStyle(0xffdf88,0.95);g.fillCircle(x,base-h-8,8+(variant%2)*3);glow.fillStyle(0xffdf88,0.13);glow.fillCircle(x,base-h-8,48+variant*3);});
    }
    // Small, low-count world glints animate the setpiece without covering
    // platforms or the central combat lane.
    if ([4, 5, 8, 9].includes(world)) {
      const glintColor = world === 4 ? 0xc8ff9a
        : world === 5 ? 0xd8d0ff
          : world === 8 ? 0xffa05b : 0xffe8a3;
      for (let i = 0; i < 5; i++) {
        const x = 105 + i * 185 + (variant % 2) * 24;
        const y = 250 + (i % 3) * 54;
        const mote = this.add.circle(x, y, world === 9 ? 3 : 2.5, glintColor, 0.78)
          .setDepth(-12);
        if (world === 5 || world === 9) {
          mote.setStrokeStyle(1, 0xffffff, 0.65);
        }
        this.addAmbientTween({
          targets: mote,
          y: y - 12 - (i % 3) * 4,
          alpha: 0.18,
          scale: world === 5 ? 1.65 : 1.25,
          duration: 1250 + i * 170,
          delay: i * 130,
          ease: "Sine.easeInOut",
          yoyo: true,
          repeat: -1
        });
      }
    }
    // A second, stage-indexed landmark layer gives each of the five stages
    // in every world a different silhouette, not merely a palette variation.
    this.createStageVariantLandmark(variant, accent, far);
    this.createStageForegroundDetails(world, variant, accent, far);
    glow.fillStyle(accent,0.07);glow.fillEllipse(480,365,780+variant*22,170);
    this.addAmbientTween({targets:glow,alpha:0.72,duration:1800+variant*120,yoyo:true,repeat:-1});
    this.add.rectangle(480,455,960,2,accent,0.18).setDepth(-1);
  }

  createStageForegroundDetails(world, variant, accent, far) {
    // Decorative framing is kept to the outer margins and lower trim so it
    // enriches the stage without covering platforms, enemies, or the hero.
    const g = this.add.graphics().setDepth(-8);
    const gold = 0xffdf88;
    const pale = 0xeaf8ff;
    const left = 28 + variant * 7;
    const right = 932 - variant * 7;

    if (world === 0) {
      // Forest: layered roots, fern fans, and luminous mushrooms.
      [left, right].forEach((x, side) => {
        g.lineStyle(12, 0x503b2e, 0.88);
        g.beginPath();
        g.moveTo(x, 480);
        g.lineTo(x + (side ? -18 : 18), 447);
        g.lineTo(x + (side ? -8 : 8), 414);
        g.strokePath();
        for (let leaf = 0; leaf < 4; leaf++) {
          const y = 438 - leaf * 19;
          g.fillStyle(leaf % 2 ? 0x4f9b62 : 0x80c978, 0.92);
          g.fillEllipse(x + (side ? -18 : 18), y, 34, 12);
        }
        g.fillStyle(0xffa5d1, 0.9);
        g.fillEllipse(x + (side ? -9 : 9), 455, 20, 8);
        g.fillStyle(0xffe6a0, 0.95);
        g.fillCircle(x + (side ? -9 : 9), 451, 3);
      });
      for (let i = 0; i < 9; i++) {
        const x = 100 + i * 95;
        g.lineStyle(2, 0x2d6849, 0.5);
        g.lineBetween(x, 470, x + ((i % 2) ? 10 : -10), 450 - (i % 3) * 7);
      }
    } else if (world === 1) {
      // Candy orchard: pastel sugar hills, striped candy canes and lollipop blooms.
      g.fillStyle(0xffb8d3, 0.2);
      g.fillEllipse(210 + variant * 35, 470, 370, 52);
      g.fillEllipse(760 - variant * 25, 478, 420, 46);
      [left + 22, right - 22].forEach((x, i) => {
        g.fillStyle(i ? 0xffe7f1 : 0xffffff, 0.96);
        g.fillRoundedRect(x - 7, 405, 14, 70, 7);
        g.lineStyle(4, i ? 0xf28ab5 : 0x83cfe0, 0.95);
        for (let stripe = 0; stripe < 4; stripe++) {
          const y = 414 + stripe * 15;
          g.lineBetween(x - 6, y, x + 6, y + 7);
        }
        g.fillStyle(i ? 0xffd36b : 0xff8fbd, 0.96);
        g.fillCircle(x, 398, 17);
        g.fillStyle(0xffffff, 0.78);
        g.fillCircle(x - 5, 393, 4);
        g.fillCircle(x + 6, 403, 3);
      });
      for (let i = 0; i < 8; i++) {
        const x = 112 + i * 104;
        const candyColor = [0xff8fbd, 0x8bd8e8, 0xffd36b, 0xb9a0f4][i % 4];
        g.fillStyle(candyColor, 0.9);
        g.fillCircle(x, 458 - (i % 3) * 5, 8 + (i % 2) * 2);
        g.lineStyle(2, 0xffffff, 0.72);
        g.strokeCircle(x, 458 - (i % 3) * 5, 5);
        g.fillStyle(0xfff5fb, 0.82);
        g.fillCircle(x - 3, 455 - (i % 3) * 5, 2);
      }
    } else if (world === 2) {
      // Ice kingdom: translucent ice shelves, icicles and frosted crystals.
      [left, right].forEach((x, i) => {
        g.fillStyle(0x8edcf4, 0.3);
        g.fillTriangle(x - 34, 476, x + (i ? -3 : 5), 408, x + 38, 476);
        g.fillStyle(0xe8fbff, 0.78);
        g.fillTriangle(x - 5, 430, x + (i ? -3 : 5), 408, x + 12, 449);
        g.lineStyle(3, pale, 0.7);
        g.lineBetween(x - 42, 478, x + 42, 478);
      });
      for (let i = 0; i < 12; i++) {
        const x = 75 + i * 73;
        const length = 12 + ((i + variant) % 4) * 7;
        g.fillStyle(0xb8efff, 0.55);
        g.fillTriangle(x - 5, 0, x + 5, 0, x, length);
      }
    } else if (world === 3) {
      // Desert ruins: sandstone columns, carved bands and warm torch bowls.
      [left + 8, right - 8].forEach((x, i) => {
        g.fillStyle(0x966343, 0.9);
        g.fillRoundedRect(x - 13, 365, 26, 112, 5);
        g.fillStyle(0xc28c5d, 0.95);
        g.fillRect(x - 19, 361, 38, 9);
        g.fillRect(x - 17, 386, 34, 5);
        g.lineStyle(2, 0xf2c58a, 0.7);
        g.lineBetween(x - 7, 398, x - 7, 461);
        g.fillStyle(0x493b4d, 0.9);
        g.fillEllipse(x, 354, 31, 13);
        g.fillStyle(0xffbd62, 0.9);
        g.fillTriangle(x - 5, 351, x, 328 - (i * 4), x + 5, 351);
        g.fillStyle(gold, 0.65);
        g.fillCircle(x, 348, 3);
      });
    } else if (world === 4) {
      // Jungle: layered palm fronds, broad leaves and hanging vines.
      [left, right].forEach((x, i) => {
        g.lineStyle(8, 0x315d46, 0.95);
        g.lineBetween(x, 482, x + (i ? -12 : 12), 385);
        for (let leaf = 0; leaf < 6; leaf++) {
          const angle = -1.15 + leaf * 0.46;
          const endX = x + Math.cos(angle) * 58;
          const endY = 390 + Math.sin(angle) * 35;
          g.lineStyle(7, leaf % 2 ? 0x3f9b61 : 0x68bd70, 0.95);
          g.lineBetween(x + (i ? -12 : 12), 390, endX, endY);
          g.lineStyle(2, 0xb1e58a, 0.7);
          g.lineBetween(x + (i ? -12 : 12), 390, endX, endY);
        }
        g.lineStyle(3, 0x79b77b, 0.75);
        g.lineBetween(x + (i ? -12 : 12), 382, x + (i ? -18 : 18), 300);
      });
      for (let i = 0; i < 8; i++) {
        const x = 120 + i * 102;
        g.fillStyle(i % 2 ? 0xffd66e : 0xff9d83, 0.8);
        g.fillCircle(x, 465 - (i % 3) * 8, 4);
      }
    } else if (world === 5) {
      // Crystal world: faceted geodes and glowing mineral seams.
      [left + 10, right - 10].forEach((x, i) => {
        const h = 48 + ((i + variant) % 3) * 15;
        g.fillStyle(0x51477e, 0.95);
        g.fillTriangle(x - 42, 478, x, 478 - h, x + 42, 478);
        g.fillStyle(i ? 0x9eeaff : 0xd2a8ff, 0.9);
        g.fillTriangle(x - 20, 474, x, 478 - h + 12, x + 18, 474);
        g.fillStyle(0xffffff, 0.75);
        g.fillTriangle(x - 5, 472, x, 478 - h + 15, x + 7, 472);
        g.lineStyle(2, accent, 0.8);
        g.lineBetween(x, 478 - h + 16, x, 474);
      });
      for (let i = 0; i < 5; i++) {
        const x = 250 + i * 115;
        g.fillStyle(pale, 0.65);
        g.fillCircle(x, 468 - (i % 2) * 12, 2 + (i % 2));
      }
    } else if (world === 6) {
      // Ocean: coral fans, sea grass and pearl bubbles at the arena edge.
      [left, right].forEach((x, i) => {
        const coral = i ? 0xff9b9e : 0xffbd78;
        g.lineStyle(7, coral, 0.92);
        g.lineBetween(x, 480, x, 421);
        for (let branch = 0; branch < 4; branch++) {
          const direction = branch % 2 ? 1 : -1;
          const y = 451 - branch * 10;
          g.lineBetween(x, y, x + direction * (16 + branch * 4), y - 15);
          g.fillStyle(coral, 0.95);
          g.fillCircle(x + direction * (16 + branch * 4), y - 15, 4);
        }
        g.lineStyle(3, 0x67c9ad, 0.85);
        for (let blade = 0; blade < 4; blade++) {
          g.lineBetween(x + blade * 5 - 8, 480, x + blade * 8 - 18, 440 - blade * 5);
        }
      });
      for (let i = 0; i < 9; i++) {
        const x = 130 + i * 88;
        g.lineStyle(1, pale, 0.5);
        g.strokeCircle(x, 455 - (i % 3) * 12, 4 + (i % 2) * 2);
      }
    } else if (world === 7) {
      // Sky kingdom: floating cloud banks, gold finials and hanging banners.
      [left + 18, right - 18].forEach((x, i) => {
        g.fillStyle(0xeaf5ff, 0.55);
        g.fillEllipse(x, 468, 100, 24);
        g.fillEllipse(x - 22, 459, 48, 26);
        g.fillEllipse(x + 24, 458, 55, 28);
        g.fillStyle(0xd6c8ff, 0.75);
        g.fillTriangle(x - 6, 451, x, 411 - i * 9, x + 7, 451);
        g.fillStyle(gold, 0.95);
        g.fillCircle(x, 407 - i * 9, 4);
      });
      for (let i = 0; i < 5; i++) {
        const x = 280 + i * 100;
        g.lineStyle(2, far, 0.65);
        g.lineBetween(x, 155, x, 204 + (i % 2) * 12);
        g.fillStyle(accent, 0.75);
        g.fillTriangle(x, 175, x + 23, 183, x, 205);
      }
    } else if (world === 8) {
      // Volcano: obsidian plates, glowing magma seams and ember vents.
      [left + 10, right - 10].forEach((x) => {
        g.fillStyle(0x302b42, 0.96);
        g.fillTriangle(x - 48, 480, x - 20, 423, x + 22, 480);
        g.fillStyle(0xff814e, 0.88);
        g.fillTriangle(x - 18, 477, x - 5, 443, x + 4, 477);
        g.lineStyle(3, 0xffc36b, 0.85);
        g.lineBetween(x + 15, 474, x + 26, 449);
        g.fillStyle(0xffa05b, 0.75);
        g.fillEllipse(x, 477, 56, 8);
      });
      for (let i = 0; i < 7; i++) {
        const x = 170 + i * 103;
        g.fillStyle(0xffa05b, 0.65);
        g.fillCircle(x, 466 - (i % 3) * 9, 2 + (i % 2));
      }
    } else {
      // Cosmic world: observatory runes, orbiting star nodes and a low horizon.
      g.lineStyle(3, accent, 0.55);
      g.strokeEllipse(480, 477, 620, 42);
      g.lineStyle(2, gold, 0.62);
      g.strokeEllipse(480, 477, 430, 24);
      for (let i = 0; i < 11; i++) {
        const x = 90 + i * 78;
        const y = 458 + (i % 3) * 7;
        g.fillStyle(i % 2 ? 0x9eb7ff : gold, 0.85);
        g.fillStar ? g.fillStar(x, y, 5, 2, 5) : g.fillCircle(x, y, 3);
        g.lineStyle(1, pale, 0.45);
        g.lineBetween(x, y - 8, x + 12, y - 17);
      }
    }

    // Fine metallic inlay along the lower frame unifies each world.
    g.lineStyle(2, accent, 0.42);
    g.lineBetween(42, 492, 918, 492);
    g.lineStyle(1, pale, 0.22);
    g.lineBetween(42, 496, 918, 496);
  }

  createStageVariantLandmark(variant, accent, far) {
    const world = this.stageConfig.worldIndex || 0;
    const g = this.add.graphics().setDepth(-14);
    const signature = `world-${world}-stage-variant-${variant}`;
    g.setData("stageLandmarkSignature", signature);
    this.stageVariantLandmark = g;
    const gold = 0xffdf88;
    const pale = 0xeaf8ff;
    const side = variant % 2 === 0 ? -1 : 1;

    if (variant === 0) {
      // Twin monumental arches framing the arena.
      [115, 845].forEach((x, i) => {
        const lean = (i ? -1 : 1) * (world % 3) * 7;
        g.lineStyle(15, far, 0.9);
        g.strokeRoundedRect(x - 48 + lean, 190, 96, 250, 44);
        g.lineStyle(5, accent, 0.95);
        g.strokeRoundedRect(x - 34 + lean, 205, 68, 220, 32);
        g.fillStyle(accent, 0.72);
        g.fillCircle(x + lean, 205, 9 + (world % 4));
      });
    } else if (variant === 1) {
      // Hanging pennants and lanterns create a tall festival-like skyline.
      for (let i = 0; i < 7; i++) {
        const x = 75 + i * 135;
        const top = 125 + ((i + world) % 3) * 24;
        g.lineStyle(4, far, 0.9);
        g.lineBetween(x, top - 35, x, top + 78);
        g.fillStyle(i % 2 ? accent : gold, 0.9);
        g.fillTriangle(x - 23, top, x + 23, top + 8, x - 4, top + 58 + (world % 3) * 7);
        g.fillStyle(pale, 0.8);
        g.fillCircle(x + 25 * side, top + 72, 5 + (i % 3));
      }
    } else if (variant === 2) {
      // Floating stepped monoliths with crystal caps.
      for (let i = 0; i < 5; i++) {
        const x = 95 + i * 190;
        const y = 255 + ((i + world) % 3) * 38;
        const width = 78 + ((i + variant) % 2) * 22;
        g.fillStyle(far, 0.82);
        g.fillRoundedRect(x - width / 2, y, width, 115 + (i % 2) * 25, 12);
        g.fillStyle(accent, 0.9);
        g.fillTriangle(x - 19, y + 5, x, y - 38 - (world % 4) * 5, x + 21, y + 5);
        g.lineStyle(3, pale, 0.72);
        g.lineBetween(x, y + 18, x, y + 95);
      }
    } else if (variant === 3) {
      // A broad sun/moon halo with radiating rays and side pillars.
      g.lineStyle(12, far, 0.82);
      g.strokeCircle(480, 235, 108 + (world % 4) * 8);
      g.lineStyle(4, accent, 0.95);
      g.strokeCircle(480, 235, 82 + (world % 3) * 7);
      for (let i = 0; i < 16; i++) {
        const angle = (Math.PI * 2 * i) / 16;
        const inner = 118;
        const outer = 148 + (i % 3) * 9;
        g.lineBetween(
          480 + Math.cos(angle) * inner,
          235 + Math.sin(angle) * inner,
          480 + Math.cos(angle) * outer,
          235 + Math.sin(angle) * outer
        );
      }
      [145, 815].forEach((x, i) => {
        g.fillStyle(far, 0.92);
        g.fillRoundedRect(x - 20, 250 - i * 18, 40, 190 + i * 18, 9);
        g.fillStyle(accent, 0.9);
        g.fillTriangle(x - 29, 250 - i * 18, x, 205 - i * 18, x + 29, 250 - i * 18);
      });
    } else {
      // A star gate and constellation bridges for the final atmosphere variant.
      g.lineStyle(13, far, 0.92);
      g.strokeRoundedRect(350, 145, 260, 285, 72);
      g.lineStyle(5, accent, 0.95);
      g.strokeRoundedRect(370, 165, 220, 245, 58);
      const nodes = [[390,205],[480,160],[570,205],[550,315],[410,315],[480,375]];
      g.lineStyle(3, gold, 0.7);
      [[0,1],[1,2],[2,3],[3,5],[5,4],[4,0],[0,3],[1,5],[2,4]].forEach(([a,b]) =>
        g.lineBetween(nodes[a][0], nodes[a][1], nodes[b][0], nodes[b][1])
      );
      nodes.forEach(([x,y], i) => {
        g.fillStyle(i % 2 ? accent : gold, 0.95);
        g.fillCircle(x, y, 7 + (i % 3) * 2);
      });
    }
    g.setAlpha(0.78);
    this.addAmbientTween({
      targets: g,
      alpha: 0.86,
      duration: 2400 + variant * 260,
      ease: "Sine.easeInOut",
      yoyo: true,
      repeat: -1,
    });
    if (variant === 4) {
      const landmarkStar = this.add.star(480, 158, 4, 4, 11, gold, 0.82)
        .setStrokeStyle(2, pale, 0.8).setDepth(-13);
      this.addAmbientTween({
        targets: landmarkStar,
        angle: 90,
        scale: 1.55,
        alpha: 0.12,
        duration: 2100,
        ease: "Sine.easeInOut",
        yoyo: true,
        repeat: -1,
      });
    }
  }

  createCastle(x, y) {
    const g = this.add.graphics().setDepth(-15);

    g.fillStyle(0x355b70, 0.25);
    g.fillRoundedRect(x - 125, y - 5, 250, 155, 12);

    g.fillStyle(0xe5c28e);
    g.fillRoundedRect(x - 105, y - 80, 210, 155, 8);

    g.lineStyle(3, 0xb98555, 1);
    g.strokeRoundedRect(x - 105, y - 80, 210, 155, 8);

    g.fillStyle(0xf4d49d);
    g.fillRect(x - 130, y - 120, 45, 160);
    g.fillRect(x + 85, y - 120, 45, 160);

    g.fillStyle(0x9c614e);
    g.fillTriangle(
      x - 138, y - 120,
      x - 107, y - 170,
      x - 77, y - 120
    );

    g.fillTriangle(
      x + 77, y - 120,
      x + 107, y - 170,
      x + 138, y - 120
    );

    g.fillStyle(0x4a7182);
    g.fillRoundedRect(x - 119, y - 95, 18, 32, 8);
    g.fillRoundedRect(x + 99, y - 95, 18, 32, 8);

    g.fillStyle(0x754b39);
    g.fillRoundedRect(x - 27, y + 5, 54, 70, 25);

    g.fillStyle(0xffd77d);
    g.fillCircle(x + 15, y + 40, 4);

    g.fillStyle(0x58899b);
    g.fillRoundedRect(x - 75, y - 48, 27, 40, 12);
    g.fillRoundedRect(x + 48, y - 48, 27, 40, 12);

    g.fillStyle(0xf4c65e);
    g.fillTriangle(
      x - 18, y - 80,
      x, y - 112,
      x + 18, y - 80
    );
    g.fillCircle(x, y - 116, 5);
  }

  createBuilding(x, y, w, h, color) {
    const g = this.add.graphics().setDepth(-12);

    g.fillStyle(0x000000, 0.15);
    g.fillEllipse(x + w / 2, y + h, w + 30, 22);

    g.fillStyle(color);
    g.fillRoundedRect(x, y, w, h, 7);

    g.lineStyle(3, 0x9a6948);
    g.strokeRoundedRect(x, y, w, h, 7);

    g.fillStyle(0x9c5942);
    g.fillTriangle(
      x - 12, y + 5,
      x + w / 2, y - 48,
      x + w + 12, y + 5
    );

    g.fillStyle(0x557c91);
    g.fillRoundedRect(x + 17, y + 30, 25, 37, 10);
    g.fillRoundedRect(x + w - 42, y + 30, 25, 37, 10);

    g.fillStyle(0x754936);
    g.fillRoundedRect(x + w / 2 - 18, y + h - 55, 36, 55, 15);

    g.fillStyle(0xffd68c);
    g.fillCircle(x + w / 2 + 9, y + h - 27, 3);
  }

  createTree(x, y) {
    const g = this.add.graphics().setDepth(-10);

    g.fillStyle(0x76513b);
    g.fillRoundedRect(x - 9, y - 55, 18, 70, 6);

    g.fillStyle(0x267b50);
    g.fillCircle(x, y - 85, 35);

    g.fillStyle(0x319d5c);
    g.fillCircle(x - 20, y - 75, 24);
    g.fillCircle(x + 22, y - 72, 25);
    g.fillCircle(x, y - 112, 22);

    g.fillStyle(0x8ed66d, 0.8);
    g.fillCircle(x - 10, y - 105, 8);
    g.fillCircle(x + 15, y - 83, 7);
  }

  createTextures() {
    const hero = this.make.graphics({ x: 0, y: 0, add: false });
    hero.fillStyle(0xf0e6d0).fillRoundedRect(14, 12, 40, 70, 12);
    hero.fillStyle(0xe9b38b).fillCircle(34, 20, 16);
    hero.generateTexture("ryo", 68, 90);
    hero.destroy();

    this.createEnemyTexture("enemy0", 0x8b42c8, 0xc77bf1, 0xffd45e);
    this.createEnemyTexture("enemy1", 0xe56a42, 0xffa36b, 0x7ff1e4);
    this.createEnemyTexture("enemy2", 0x397cbb, 0x67b8f1, 0xffdc74);

    const shot = this.make.graphics({ x: 0, y: 0, add: false });
    shot.fillStyle(0x00bce9, 0.2).fillCircle(13, 13, 13);
    shot.fillStyle(0x44edff).fillCircle(13, 13, 9);
    shot.lineStyle(3, 0xffffff).strokeCircle(13, 13, 7);
    shot.fillStyle(0xffffff).fillCircle(10, 9, 3);
    shot.fillStyle(0xffffff).fillPoints([{x:13,y:1},{x:24,y:13},{x:13,y:25},{x:2,y:13}], true);
    shot.generateTexture("shot", 26, 26);
    shot.destroy();
    this.createElementProjectileTextures();

    const platform = this.make.graphics({ x: 0, y: 0, add: false });
    platform.fillStyle(0x614a42).fillRoundedRect(0, 4, 180, 28, 5);
    platform.fillStyle(0x8a6a50).fillRect(3, 13, 174, 17);
    platform.fillStyle(0x4a9b53).fillRoundedRect(0, 0, 180, 13, 5);
    platform.fillStyle(0x8ad35b).fillRoundedRect(5, 1, 170, 5, 3);
    platform.generateTexture("platform", 180, 32);
    platform.destroy();
  }

  createElementProjectileTextures() {
    // Premium, power-specific projectile sprites. Each texture is generated once
    // per scene; runtime shots reuse the cached texture (no per-shot Graphics).
    const shapes = {
      fire: g => {
        g.fillPoints([{x:16,y:0},{x:25,y:12},{x:22,y:25},{x:16,y:31},{x:8,y:26},{x:6,y:16}], true);
        g.fillStyle(0xffffff,0.95); g.fillPoints([{x:16,y:8},{x:20,y:17},{x:16,y:25},{x:12,y:19}],true);
        g.lineStyle(1.5,0xffffff,0.8); g.lineBetween(9,23,13,28);
      },
      ice: g => {
        g.lineStyle(4,0xffffff,1);
        for(let i=0;i<6;i++){const a=i*Math.PI/3, ex=16+Math.cos(a)*14, ey=16+Math.sin(a)*14; g.lineBetween(16,16,ex,ey); g.lineBetween(ex,ey,ex-Math.cos(a-.55)*6,ey-Math.sin(a-.55)*6); g.lineBetween(ex,ey,ex-Math.cos(a+.55)*6,ey-Math.sin(a+.55)*6);}
        g.fillStyle(0xffffff,1); g.fillCircle(16,16,3);
      },
      lightning: g => {
        g.fillPoints([{x:18,y:0},{x:7,y:17},{x:14,y:17},{x:9,y:32},{x:26,y:12},{x:18,y:12}],true);
        g.lineStyle(2,0xffffff,0.9); g.lineBetween(18,3,11,15);
      },
      water: g => {
        g.fillPoints([{x:16,y:0},{x:25,y:13},{x:27,y:21},{x:22,y:28},{x:16,y:31},{x:9,y:27},{x:5,y:20},{x:8,y:12}],true);
        g.fillStyle(0xffffff,0.95); g.fillEllipse(12,17,5,10); g.lineStyle(1.5,0xffffff,0.8); g.strokeEllipse(16,20,17,19);
      },
      nature: g => {
        g.fillPoints([{x:16,y:0},{x:27,y:10},{x:24,y:22},{x:16,y:31},{x:7,y:24},{x:4,y:13}],true);
        g.lineStyle(2.5,0xffffff,1); g.lineBetween(8,24,24,7); g.lineBetween(14,18,12,10); g.lineBetween(18,15,24,16);
      },
      wind: g => {
        g.lineStyle(4,0xffffff,1); g.beginPath(); g.moveTo(2,9); g.lineTo(17,6); g.lineTo(28,10); g.moveTo(0,16); g.lineTo(15,13); g.lineTo(26,17); g.moveTo(4,24); g.lineTo(17,21); g.lineTo(25,24); g.strokePath();
        g.lineStyle(1.5,0xffffff,0.8); g.beginPath(); g.moveTo(7,3); g.lineTo(20,2); g.strokePath();
      },
      earth: g => {
        g.fillPoints([{x:3,y:18},{x:9,y:4},{x:22,y:2},{x:30,y:15},{x:23,y:29},{x:8,y:27}],true);
        g.lineStyle(2,0xffffff,0.9); g.lineBetween(9,7,16,16); g.lineBetween(16,16,25,9); g.lineBetween(16,16,21,26);
      },
      light: g => { const p=[]; for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?7:16;p.push({x:16+Math.cos(a)*r,y:16+Math.sin(a)*r});} g.fillPoints(p,true); g.lineStyle(1.5,0xffffff,0.9); g.strokeCircle(16,16,7); },
      shadow: g => {
        g.fillPoints([{x:24,y:3},{x:12,y:2},{x:4,y:12},{x:5,y:23},{x:15,y:30},{x:27,y:25},{x:18,y:20},{x:15,y:13}],true);
        g.lineStyle(2,0xffffff,0.8); g.beginPath(); g.arc(16,16,10,-1.3,1.6,false); g.strokePath();
      },
      plasma: g => {
        g.fillPoints([{x:16,y:0},{x:22,y:10},{x:31,y:15},{x:22,y:20},{x:16,y:31},{x:10,y:21},{x:1,y:16},{x:10,y:11}],true);
        g.fillStyle(0xffffff,0.95); g.fillCircle(16,16,4); g.lineStyle(1.5,0xffffff,0.8); g.strokeCircle(16,16,11);
      },
    };
    Object.entries(shapes).forEach(([id, draw]) => {
      const g=this.make.graphics({x:0,y:0,add:false});
      // Soft-edged layered silhouette with a crisp white specular core.
      g.fillStyle(0xffffff,0.16); g.fillCircle(16,16,15);
      g.lineStyle(2,0xffffff,0.48); g.strokeCircle(16,16,14);
      g.fillStyle(0xffffff,1); draw(g);
      g.generateTexture(`shot-${id}`,32,32);
      g.destroy();
    });
  }

  createHeroVisual(x, y, heroId = this.selectedHero?.id || "ryo") {
    const c = this.add.container(x, y).setDepth(10);

    const shadow = this.add.ellipse(
      0, 41, 49, 12, 0x142c45, 0.07
    );

    const legL = this.add.ellipse(
      -11, 24, 14, 30, 0xf0e6d0
    ).setOrigin(0.5, 0.12);

    const legR = this.add.ellipse(
      11, 24, 14, 30, 0xf0e6d0
    ).setOrigin(0.5, 0.12);

    const shoeL = this.add.ellipse(
      -12, 39, 23, 11, 0x49372e
    );

    const shoeR = this.add.ellipse(
      12, 39, 23, 11, 0x49372e
    );

    const armL = this.add.ellipse(
      -23, 1, 13, 30, 0x168e85
    ).setOrigin(0.5, 0.12);

    const armR = this.add.ellipse(
      23, 1, 13, 30, 0x168e85
    ).setOrigin(0.5, 0.12);

    const handL = this.add.circle(-24, 27, 7, 0xe7ad7d);
    const handR = this.add.circle(24, 27, 7, 0xe7ad7d);

    const kurta = this.add.ellipse(
      0, 3, 43, 48, 0x168e85
    );

    const waistcoat = this.add.rectangle(
      0, 3, 29, 43, 0x263d58
    );

    const button1 = this.add.circle(0, -10, 2, 0xffd36b);
    const button2 = this.add.circle(0, 0, 2, 0xffd36b);
    const button3 = this.add.circle(0, 10, 2, 0xffd36b);

    const neck = this.add.rectangle(
      0, -23, 13, 13, 0xe9b38b
    );

    const face = this.add.ellipse(
      0, -31, 39, 40, 0xe9b38b
    );

    const hair = this.add.ellipse(
      0, -47, 39, 15, 0x30251f
    );

    const cap = this.add.rectangle(
      0, -48, 39, 12, 0x263b54
    );

    const capLine = this.add.rectangle(
      0, -43, 33, 3, 0x47c3b2
    );

    const eyeL = this.add.ellipse(
      -8, -32, 7, 9, 0xffffff
    );

    const eyeR = this.add.ellipse(
      8, -32, 7, 9, 0xffffff
    );

    const pupilL = this.add.circle(
      -7, -31, 2.5, 0x272b35
    );

    const pupilR = this.add.circle(
      9, -31, 2.5, 0x272b35
    );

    const browL = this.add.rectangle(
      -8, -40, 9, 2, 0x443029
    );

    const browR = this.add.rectangle(
      8, -40, 9, 2, 0x443029
    );

    const smile = this.add.arc(
      0, -23, 6, 15, 165, false, 0x844c40
    ).setStrokeStyle(2, 0x844c40);

    const shoulderTrim = this.add.graphics();
    shoulderTrim.lineStyle(3, 0xffd36b, 0.9);
    shoulderTrim.beginPath();
    shoulderTrim.arc(0, -14, 22, Math.PI * 1.08, Math.PI * 1.92, false);
    shoulderTrim.strokePath();
    const collar = this.add.triangle(0, -17, -9, -5, 0, 8, 9, -5, 0xe8d8b8).setStrokeStyle(1, 0x263d58);
    const waistSash = this.add.rectangle(0, 19, 39, 7, 0xb98b52).setStrokeStyle(1, 0xffdf91);
    const buckle = this.add.star(0, 19, 4, 3, 6, 0xffe18a).setStrokeStyle(1, 0x704d37);
    const cuffL = this.add.rectangle(-27, 13, 15, 6, 0xffd36b).setAngle(-18);
    const cuffR = this.add.rectangle(27, 13, 15, 6, 0xffd36b).setAngle(18);
    const capCrest = this.add.star(0, -49, 4, 2, 6, 0xffe18a).setStrokeStyle(1, 0x263b54);
    const shoeTrimL = this.add.rectangle(-12, 38, 17, 3, 0xffd36b);
    const shoeTrimR = this.add.rectangle(12, 38, 17, 3, 0xffd36b);

    c.add([
      shadow,
      legL, legR,
      shoeL, shoeR, shoeTrimL, shoeTrimR,
      armL, armR, handL, handR, cuffL, cuffR,
      kurta, waistcoat, shoulderTrim, collar, waistSash, buckle,
      button1, button2, button3,
      neck, face, hair, cap, capLine, capCrest,
      eyeL, eyeR, pupilL, pupilR,
      browL, browR, smile
    ]);

    c.setData("parts", {
      shadow,
      legL,
      legR,
      shoeL,
      shoeR,
      armL,
      armR,
      handL,
      handR,
      kurta,
      waistcoat,
      face
    });
    c.setData("heroPalette", { kurta, waistcoat, capLine, face, neck, handL, handR, hair, armL, armR });
    

    // Render the authored pixel-art sprite sheet as the visible hero. The
    // legacy vector rig remains hidden so existing pose references stay safe.
    const heroArt = this.add.sprite(0, 0, `hero-sheet-${heroId}`, 0)
      .setOrigin(0.5, 0.5)
      .setScale(0.42);
    c.add(heroArt);
    c.list.forEach((child) => {
      if (child !== shadow && child !== heroArt) child.setVisible(false);
    });
    c.setData("heroSprite", heroArt);
    c.setData("heroRigParts", c.list.filter((child) => child !== shadow && child !== heroArt));
    c.setData("heroSpriteId", heroId);
    this.applyHeroLook(c, getHero(heroId), true);
    heroArt.setVisible(true);
    (c.getData("heroRigParts") || []).forEach((part) => {
      if (part?.active) part.setVisible(false);
    });
    (c.getData("heroLookItems") || []).forEach((part) => {
      if (part?.active) part.setVisible(false);
    });
    this.setHeroSpriteAnimation(c, "idle");

    return c;
  }

  applyHeroLook(visual, hero, forceRigPreview = false) {
    if (!visual?.active || !hero) return;
    const sprite = visual.getData("heroSprite");
    if (sprite && !forceRigPreview) {
      const textureKey = `hero-sheet-${hero.id}`;
      if (sprite.texture.key !== textureKey) sprite.setTexture(textureKey, 0);
      visual.setData("heroSpriteId", hero.id);
      visual.setData("heroLookId", hero.id);
      this.setHeroSpriteAnimation(visual, "idle");
      return;
    }
    if (sprite && forceRigPreview) {
      const textureKey = `hero-sheet-${hero.id}`;
      if (sprite.texture.key !== textureKey) sprite.setTexture(textureKey, 0);
      visual.setData("heroSpriteId", hero.id);
      visual.setData("heroLookId", hero.id);
      sprite.setVisible(false);
      (visual.getData("heroRigParts") || []).forEach((part) => {
        if (part?.active) part.setVisible(true);
      });
    }
    const palette = visual.getData("heroPalette");
    if (palette) {
      const skin = hero.id === "volt" ? 0x62b84f : 0xe9b38b;
      [palette.face, palette.neck, palette.handL, palette.handR].forEach(part => part?.setFillStyle(skin));
      palette.hair?.setFillStyle(hero.id === "kairo" ? 0xf2c34e : hero.id === "volt" ? 0xf28a32 : 0x30251f);
      palette.armL?.setFillStyle(hero.color);
      palette.armR?.setFillStyle(hero.color);
    }
    const old = visual.getData("heroLookItems") || [];
    old.forEach(item => { if (item?.active) item.destroy(); });
    const items = [];
    if (hero.id === "ryo") {
      // White martial-arts gi with a red headband: original hero design.
      const band = this.add.rectangle(0, -44, 44, 7, 0xd94a42).setStrokeStyle(2, 0x792d2d);
      const tail = this.add.ellipse(-29, -39, 22, 7, 0xd94a42).setAngle(-12);
      const belt = this.add.rectangle(0, 15, 34, 6, 0xd94a42);
      const gloveL = this.add.ellipse(-25, 18, 16, 13, 0xf2f2ed).setStrokeStyle(2, 0x9da7b4);
      const gloveR = this.add.ellipse(25, 18, 16, 13, 0xf2f2ed).setStrokeStyle(2, 0x9da7b4);
      items.push(band, tail, belt, gloveL, gloveR);
    } else if (hero.id === "kairo") {
      // Blond hair, red gi and gold trim: original hero design.
      const spike1 = this.add.ellipse(-13, -55, 15, 12, 0xf2c34e).setAngle(-28).setStrokeStyle(1, 0x9b6b22);
      const spike2 = this.add.ellipse(2, -59, 16, 13, 0xf2c34e).setAngle(4).setStrokeStyle(1, 0x9b6b22);
      const spike3 = this.add.ellipse(17, -55, 15, 12, 0xf2c34e).setAngle(28).setStrokeStyle(1, 0x9b6b22);
      const headband = this.add.rectangle(0, -43, 44, 6, 0xd83b32).setStrokeStyle(2, 0xffd16b);
      const belt = this.add.rectangle(0, 15, 34, 6, 0xffd16b);
      // Keep the hero's hair silhouette and outfit; remove the floating flame marker.
      items.push(spike1, spike2, spike3, headband, belt);
    } else if (hero.id === "mei") {
      // Twin hair buns, blue outfit ribbons and gold wrist guards: original hero design.
      const bunL = this.add.circle(-17, -53, 9, 0x30251f).setStrokeStyle(3, 0xffd36b);
      const bunR = this.add.circle(17, -53, 9, 0x30251f).setStrokeStyle(3, 0xffd36b);
      const cuffL = this.add.rectangle(-28, 15, 10, 15, 0xffd36b).setStrokeStyle(2, 0x9b6c2c);
      const cuffR = this.add.rectangle(28, 15, 10, 15, 0xffd36b).setStrokeStyle(2, 0x9b6c2c);
      // Retain Mei's twin buns and wrist guards without directional-looking ribbons.
      items.push(bunL, bunR, cuffL, cuffR);
    } else {
      // Green skin, orange crest and electric markings: original wild fighter design.
      const spike1 = this.add.ellipse(-17, -53, 18, 13, 0xf28a32).setAngle(-25).setStrokeStyle(2, 0x8b4b24);
      const spike2 = this.add.ellipse(0, -59, 20, 15, 0xf28a32).setStrokeStyle(2, 0x8b4b24);
      const spike3 = this.add.ellipse(17, -53, 18, 13, 0xf28a32).setAngle(25).setStrokeStyle(2, 0x8b4b24);
      const stripeL = this.add.rectangle(-18, 4, 7, 27, 0xffe16a).setAngle(-18);
      const stripeR = this.add.rectangle(18, 4, 7, 27, 0xffe16a).setAngle(18);
      // Keep Volt's crest and suit markings; remove the floating lightning glyph.
      items.push(spike1, spike2, spike3, stripeL, stripeR);
    }
    visual.add(items);
    visual.setData("heroLookItems", items);
    visual.setData("heroLookId", hero.id);
  }

  createEnemyVisual(enemy, color, hornColor) {
    const enemyClass = enemy.getData("enemyClass") || "special";
    const isFast = enemyClass === "fast";
    const isHeavy = enemyClass === "heavy";
    const isSpecial = enemyClass === "special";
    const c = this.add.container(
      enemy.x,
      enemy.y
    ).setDepth(9);

    const shadow = this.add.ellipse(
      0, 24, 43, 10, 0x101b35, 0.25
    );

    const legL = this.add.ellipse(
      -10, 15, 13, 20, 0x47364e
    ).setOrigin(0.5, 0.1);

    const legR = this.add.ellipse(
      10, 15, 13, 20, 0x47364e
    ).setOrigin(0.5, 0.1);

    const armL = this.add.ellipse(
      -23, 0, 12, 22, color
    ).setOrigin(0.5, 0.1);

    const armR = this.add.ellipse(
      23, 0, 12, 22, color
    ).setOrigin(0.5, 0.1);

    const body = this.add.ellipse(0, -2,
      isFast ? 42 : isHeavy ? 58 : 50,
      isHeavy ? 50 : 43,
      color).setStrokeStyle(isHeavy ? 3 : 1, isHeavy ? 0xe5c18c : 0x30263e, 0.85);

    const belly = this.add.ellipse(
      0, 7, 25, 20, 0xffffff, 0.25
    );

    const headband = this.add.rectangle(0, -23, isHeavy ? 52 : 43, isSpecial ? 10 : 7, hornColor).setStrokeStyle(1, 0xffffff, 0.75);
    const hornL = this.add.triangle(isHeavy ? -28 : -23, -19, -5, -5, 12, 0, -8, 13, hornColor);
    const hornR = this.add.triangle(isHeavy ? 28 : 23, -19, -12, 0, 5, -5, 8, 13, hornColor);
    const belt = this.add.rectangle(0, 14, 31, 5, 0x282d46).setStrokeStyle(1, 0xffffff, 0.35);

    const eyeL = this.add.ellipse(
      -9, -5, 12, 14, 0xffffff
    );

    const eyeR = this.add.ellipse(
      9, -5, 12, 14, 0xffffff
    );

    const pupilL = this.add.circle(
      -7, -4, 3, 0x25233a
    );

    const pupilR = this.add.circle(
      11, -4, 3, 0x25233a
    );

    const classDetails = [];
    let classCrest;
    let classGuard = null;
    if (isFast) {
      // Agile enemies read as light, aerodynamic runners from a distance.
      const finL = this.add.triangle(-17, -28, 0, 0, 30, -5, 0, 10, hornColor)
        .setAngle(-8).setStrokeStyle(1, 0xffffff, 0.55);
      const finR = this.add.triangle(17, -28, 0, 0, -30, -5, 0, 10, hornColor)
        .setAngle(8).setStrokeStyle(1, 0xffffff, 0.55);
      const runnerBootL = this.add.ellipse(-23, 10, 14, 8, 0xf1e9da);
      const runnerBootR = this.add.ellipse(23, 10, 14, 8, 0xf1e9da);
      classCrest = this.add.triangle(0, -34, -8, 9, 0, -13, 8, 9, 0xffe5a1)
        .setStrokeStyle(1, 0xffffff, 0.85);
      classDetails.push(finL, finR, runnerBootL, runnerBootR, classCrest);
    } else if (isHeavy) {
      // Heavy enemies get a broad plated silhouette and a visible jaw guard.
      const pauldronL = this.add.ellipse(-24, -8, 22, 20, 0x72523f).setStrokeStyle(3, hornColor);
      const pauldronR = this.add.ellipse(24, -8, 22, 20, 0x72523f).setStrokeStyle(3, hornColor);
      const brow = this.add.rectangle(0, -15, 34, 8, 0x4b3741).setStrokeStyle(2, hornColor);
      classGuard = this.add.arc(0, 4, 18, 190, 350, false, 0xc9a377, 0.9)
        .setStrokeStyle(5, hornColor, 0.95);
      classCrest = this.add.rectangle(0, -35, 18, 7, 0x9baabd)
        .setStrokeStyle(1, 0xffffff, 0.75);
      classDetails.push(pauldronL, pauldronR, brow, classGuard, classCrest);
    } else {
      // Special enemies have a floating rune crown to distinguish the caster role.
      const aura = this.add.circle(0, -3, 37, hornColor, 0.08).setStrokeStyle(3, hornColor, 0.86);
      const sigil = this.add.text(0, 1, "✦", {
        fontSize: "23px", color: `#${hornColor.toString(16).padStart(6, "0")}`,
        fontStyle: "bold", stroke: "#251f37", strokeThickness: 3
      }).setOrigin(0.5);
      classCrest = this.add.star(0, -39, 4, 3, 11, hornColor, 0.96)
        .setStrokeStyle(2, 0xffffff, 0.9);
      classGuard = this.add.arc(0, -8, 43, 205, 335, false, hornColor, 0.35)
        .setStrokeStyle(3, hornColor, 0.85);
      classDetails.push(aura, sigil, classCrest, classGuard);
      this.tweens.add({ targets: aura, scale: 1.25, alpha: 0.2, duration: 460, yoyo: true, repeat: -1 });
    }

    const shoulderL = this.add.ellipse(-21, -12, isHeavy ? 25 : 18, isHeavy ? 19 : 14,
      isHeavy ? 0x75899f : 0x59657e, 0.92).setStrokeStyle(2, hornColor, 0.95);
    const shoulderR = this.add.ellipse(21, -12, isHeavy ? 25 : 18, isHeavy ? 19 : 14,
      isHeavy ? 0x75899f : 0x59657e, 0.92).setStrokeStyle(2, hornColor, 0.95);
    const cuffL = this.add.rectangle(-24, 9, 15, 6, hornColor).setStrokeStyle(1, 0xffffff, 0.72);
    const cuffR = this.add.rectangle(24, 9, 15, 6, hornColor).setStrokeStyle(1, 0xffffff, 0.72);
    const eyeGlintL = this.add.circle(-11, -9, 2.5, 0xffffff, 0.95);
    const eyeGlintR = this.add.circle(7, -9, 2.5, 0xffffff, 0.95);
    const cheekL = this.add.ellipse(-16, 3, 7, 3, hornColor, 0.6);
    const cheekR = this.add.ellipse(16, 3, 7, 3, hornColor, 0.6);
    const backPlate = this.add.ellipse(0, -5, isHeavy ? 48 : 36, isHeavy ? 52 : 43,
      isHeavy ? 0x38445e : 0x3c4965, 0.88).setStrokeStyle(2, hornColor, 0.8);
    const foreheadGem = this.add.star(0, -31, 4, 3, isSpecial ? 10 : 7, hornColor, 0.98)
      .setStrokeStyle(1, 0xffffff, 0.9);
    const waistSash = this.add.triangle(isFast ? 7 : 0, 17, -7, -3, 10, -3, isFast ? 31 : 25,
      isFast ? 0xf2c76d : hornColor, 0.95).setStrokeStyle(1, 0xffffff, 0.55);
    const backSpikes = [-1, 1].map((side) =>
      this.add.triangle(side * (isHeavy ? 27 : 21), -24, -7, 7, 0, -17, 8, 7,
        isHeavy ? 0x9baabd : hornColor, 0.92).setStrokeStyle(1, 0xffffff, 0.6)
        .setAngle(side * 90)
    );
    const fastScarf = this.add.triangle(-34, -15, 0, -7, 34, -2, 5, 16, 0xf4bd62, 0.92)
      .setStrokeStyle(1, 0xfff0bf, 0.7).setVisible(isFast);
    const heavyKneeL = this.add.ellipse(-10, 20, 16, 10, 0x71869c, 0.96)
      .setStrokeStyle(2, hornColor, 0.85).setVisible(isHeavy);
    const heavyKneeR = this.add.ellipse(10, 20, 16, 10, 0x71869c, 0.96)
      .setStrokeStyle(2, hornColor, 0.85).setVisible(isHeavy);
    const chestPlate = this.add.ellipse(0, 2, isHeavy ? 43 : 34, 28, isHeavy ? 0x9aa9b8 : 0x64758f, 0.72)
      .setStrokeStyle(3, hornColor, 0.95);
    const chestSigil = this.add.star(0, 2, 5, 4, 8, hornColor, 0.95)
      .setStrokeStyle(1, 0xffffff, 0.85);
    const beltBuckle = this.add.star(0, 14, 4, 3, 7, 0xffd36b).setStrokeStyle(1, 0xffffff, 0.8);
    const bootL = this.add.rectangle(-10, 27, 19, 5, hornColor).setStrokeStyle(1, 0x30263e);
    const bootR = this.add.rectangle(10, 27, 19, 5, hornColor).setStrokeStyle(1, 0x30263e);
    c.add([
      shadow, backPlate, backSpikes[0], backSpikes[1],
      legL, legR, bootL, bootR, heavyKneeL, heavyKneeR,
      armL, armR, shoulderL, shoulderR, cuffL, cuffR,
      body, chestPlate, belly, chestSigil, eyeGlintL, eyeGlintR, cheekL, cheekR,
      headband, hornL, hornR, foreheadGem, waistSash, fastScarf, belt, beltBuckle,
      eyeL, eyeR,
      pupilL, pupilR,
      ...classDetails
    ]);

    const inspiration = enemy.getData("enemyName") || "";
    const identityDetails = [];
    let identityProfile = "standard";
    if (/masked|ninja/i.test(inspiration)) {
      identityProfile = "masked-assassin";
      identityDetails.push(
        this.add.rectangle(0, 4, 31, 9, 0x30263e, 0.96).setStrokeStyle(1, hornColor, 0.9),
        this.add.rectangle(-8, -7, 5, 3, 0xfff2c8),
        this.add.rectangle(8, -7, 5, 3, 0xfff2c8),
        this.add.triangle(0, -39, -12, 8, 0, -15, 12, 8, 0x28243d).setStrokeStyle(2, hornColor)
      );
    } else if (/tiger/i.test(inspiration)) {
      identityProfile = "tiger-striker";
      identityDetails.push(
        this.add.triangle(-16, -1, -8, -7, 8, 0, -8, 7, 0x34283a),
        this.add.triangle(16, -1, 8, -7, -8, 0, 8, 7, 0x34283a),
        this.add.triangle(-12, 11, -7, -5, 8, 0, -7, 5, 0xf6d58a),
        this.add.triangle(12, 11, 7, -5, -8, 0, 7, 5, 0xf6d58a)
      );
    } else if (/sonic|rapid|sky-step|whirlwind/i.test(inspiration)) {
      identityProfile = "sonic-runner";
      identityDetails.push(
        this.add.triangle(-29, -22, 0, -8, 31, 0, 0, 8, 0xd9f5ff, 0.88),
        this.add.triangle(-34, -8, 0, -6, 26, 0, 0, 6, hornColor, 0.86),
        this.add.ellipse(0, 31, 31, 5, 0xb9e8f5, 0.72)
      );
    } else if (/flame|fire|inferno/i.test(inspiration)) {
      identityProfile = "flame-vanguard";
      identityDetails.push(
        this.add.triangle(-11, -37, -8, 8, 0, -17, 8, 8, 0xffa34c),
        this.add.triangle(0, -40, -9, 9, 0, -20, 9, 9, 0xffe17a),
        this.add.triangle(11, -37, -8, 8, 0, -17, 8, 8, 0xff7544),
        this.add.rectangle(-25, 8, 17, 7, 0xffa34c).setStrokeStyle(1, 0xffe7a0),
        this.add.rectangle(25, 8, 17, 7, 0xffa34c).setStrokeStyle(1, 0xffe7a0)
      );
    } else if (/iron guard|stone fist/i.test(inspiration)) {
      identityProfile = "iron-sentinel";
      identityDetails.push(
        this.add.rectangle(0, -1, 36, 23, 0x65798f, 0.96).setStrokeStyle(3, 0xdce7ef),
        this.add.rectangle(0, -1, 19, 5, hornColor).setStrokeStyle(1, 0xffffff),
        this.add.ellipse(-30, -3, 12, 12, 0xb5c5d2).setStrokeStyle(2, 0xffffff),
        this.add.ellipse(30, -3, 12, 12, 0xb5c5d2).setStrokeStyle(2, 0xffffff)
      );
    } else if (/psychic/i.test(inspiration)) {
      identityProfile = "psychic-oracle";
      identityDetails.push(
        this.add.star(-38, -27, 4, 3, 8, 0xd8c5ff).setStrokeStyle(1, 0xffffff),
        this.add.star(38, -27, 4, 3, 8, 0xd8c5ff).setStrokeStyle(1, 0xffffff),
        this.add.arc(0, -2, 51, 205, 335, false, 0xc8aaff, 0.55).setStrokeStyle(2, 0xd9caff, 0.9)
      );
    }
    if (identityDetails.length) c.add(identityDetails);

    if (/claw/i.test(inspiration)) {
      const clawL = this.add.triangle(-30, 13, -2, -8, 8, 0, -3, 14, 0xe8e7ef).setStrokeStyle(2, 0x6c477b);
      const clawR = this.add.triangle(30, 13, 2, -8, -8, 0, 3, 14, 0xe8e7ef).setStrokeStyle(2, 0x6c477b);
      c.add([clawL, clawR]);
    } else if (/boxing|champion|bruiser/i.test(inspiration)) {
      const gloveL = this.add.circle(-27, 13, 11, 0xc94c43).setStrokeStyle(3, 0xffd36b);
      const gloveR = this.add.circle(27, 13, 11, 0xc94c43).setStrokeStyle(3, 0xffd36b);
      c.add([gloveL, gloveR]);
    } else if (/grappler|wrestler|heavyweight/i.test(inspiration)) {
      const padL = this.add.ellipse(-25, -8, 20, 17, 0x8b633f).setStrokeStyle(3, 0xffd36b);
      const padR = this.add.ellipse(25, -8, 20, 17, 0x8b633f).setStrokeStyle(3, 0xffd36b);
      c.add([padL, padR]);
    } else if (/electric|psycho|wild/i.test(inspiration)) {
      const mark = this.add.text(0, 3, "ϟ", { fontSize: "25px", color: "#fff2a6", fontStyle: "bold", stroke: "#493b76", strokeThickness: 3 }).setOrigin(0.5);
      c.add(mark);
    }

    // The enemy's assigned element is always visible, independent of its
    // family name, so the full campaign's ten elemental identities read clearly.
    const elementId = enemy.getData("enemyPowerType") || "fire";
    const elementLooks = {
      fire: ["✦", "#ff9a45"], ice: ["❄", "#a8f3ff"],
      lightning: ["ϟ", "#fff18a"], water: ["◈", "#83eaff"],
      nature: ["❋", "#a8f58a"], wind: ["〰", "#d7f4ff"],
      earth: ["⬟", "#d9b18a"], light: ["✧", "#fff4b0"],
      shadow: ["☾", "#c6a5ff"], plasma: ["✺", "#ff9df2"],
    };
    const [elementGlyph, elementColor] = elementLooks[elementId] || elementLooks.fire;
    const elementHex = Number.parseInt(elementColor.slice(1), 16);
    const elementMark = this.add.text(0, 3, elementGlyph, {
      fontSize: isHeavy ? "17px" : "19px",
      color: elementColor,
      fontStyle: "bold",
      stroke: "#24233b",
      strokeThickness: 3,
    }).setOrigin(0.5).setAlpha(0.96);
    const elementHalo = this.add.ellipse(0, -3, isHeavy ? 62 : 54, isHeavy ? 58 : 50,
      elementHex, 0.08).setStrokeStyle(2, elementHex, 0.62);
    c.addAt(elementHalo, 1);
    c.add(elementMark);
    this.tweens.add({
      targets: elementMark,
      scaleX: 1.16,
      scaleY: 1.16,
      duration: 620 + (inspiration.length % 4) * 90,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({
      targets: elementHalo,
      alpha: 0.2,
      scaleX: 1.12,
      scaleY: 1.12,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    c.setData("parts", {
      shadow,
      legL,
      legR,
      armL,
      armR,
      body,
      chestPlate,
      chestSigil,
      shoulderL, shoulderR, cuffL, cuffR, eyeGlintL, eyeGlintR, cheekL, cheekR,
      backPlate, foreheadGem, waistSash, fastScarf, heavyKneeL, heavyKneeR,
      backSpikes,
      classCrest,
      classGuard,
      bootL,
      bootR,
      belly,
      headband,
      identityDetails,
      elementMark,
      elementHalo,
    });
    c.setData("damageParts", {
  hornL,
  hornR,
  armL,
  armR,
  body,
  belly
});

    // Use the dedicated authored sprite sheet as the visible combatant while
    // retaining the established rig metadata for hit reactions and gameplay.
    c.list.forEach((part) => part.setVisible(part === shadow));
    const archetypeId = enemy.getData("enemyArchetypeId");
    const archetypeFrame = getPremiumEnemyFrameIndex(archetypeId);
    const hasPremiumArtwork = archetypeFrame >= 0 && !enemy.getData("enemyVariantStyle");
    const idleFrame = hasPremiumArtwork ? archetypeFrame * 4 : 0;
    const approvedArt = APPROVED_ENEMY_ART[archetypeId] || APPROVED_ENEMY_ART[enemy.getData("enemyArtBaseId")];
    const enemySprite = this.add.sprite(0, -12,
      hasPremiumArtwork ? "premium-enemy-atlas" : `enemy-sheet-${enemyClass}`, idleFrame)
      .setDisplaySize(isHeavy ? 94 : 86, isHeavy ? 106 : 100);
    c.add(enemySprite);
    let approvedArtSprite = null;
    if (approvedArt) {
      enemySprite.setVisible(false);
      // Give every approved cutout a small, archetype-specific signature:
      // elemental halo + orbiting sparks, with wings/fins on airborne creatures.
      // These are layered behind the character and never touch its physics body.
      const adornmentProfiles = {
        "spirit-pouncer": { glow: 0xff633d, spark: 0xffc16d, motif: "flame" },
        "icicle-hopper": { glow: 0x9beaff, spark: 0xffffff, motif: "ice" },
        "jelly-vault": { glow: 0xff86d6, spark: 0xffd5f1, motif: "wing" },
        "bark-bruiser": { glow: 0x9dcb69, spark: 0xe0f4a1, motif: "leaf" },
        "spore-caster": { glow: 0xb98be8, spark: 0xf3d5ff, motif: "spore" },
        "caramel-mauler": { glow: 0xffb35d, spark: 0xffe2a8, motif: "flame" },
        "moss-scout": { glow: 0x8bd47a, spark: 0xd9ff9d, motif: "leaf" },
        "vine-vault": { glow: 0x75d99a, spark: 0xc6ffd0, motif: "leaf" },
        "acorn-leaper": { glow: 0xd69a55, spark: 0xffe0a0, motif: "leaf" },
        "candy-copter": { glow: 0xffd45e, spark: 0xffffff, motif: "wing" },
        "eclipse-summoner": { glow: 0xb38cff, spark: 0xf0d9ff, motif: "spore" },
        "temple-breaker": { glow: 0x78c9ff, spark: 0xd8f2ff, motif: "ice" },
        "jade-shellback": { glow: 0x78d6a1, spark: 0xc8ffd8, motif: "leaf" },
        "root-burrower": { glow: 0x8bcf83, spark: 0xe2ffb0, motif: "leaf" },
        "mire-burrower": { glow: 0x9edb72, spark: 0xe8ff9d, motif: "wing" },
        "licorice-sniper": { glow: 0xc49bff, spark: 0xf3e4ff, motif: "spore" },
      };
      const variantProfile = enemy.getData("enemyVariantStyle");
      const variantTint = enemy.getData("enemyVariantTint");
      const profile = variantProfile ? ({
        shadow: { glow: 0x70c7ff, spark: 0xd9f5ff, motif: "storm" },
        metal: { glow: 0xb6a7ff, spark: 0xf0edff, motif: "metal" },
        solar: { glow: 0xffd65a, spark: 0xfff4b0, motif: "solar" },
        prism: { glow: 0xa5f4ff, spark: 0xffffff, motif: "prism" },
        flame: { glow: 0xff7046, spark: 0xffe1a1, motif: "flame" },
        storm: { glow: 0x76e8ff, spark: 0xf2ffff, motif: "storm" },
        frostfire: { glow: 0xa9f5ff, spark: 0xffb16a, motif: "frostfire" },
        crystal: { glow: 0xd7a5ff, spark: 0xf8eaff, motif: "crystal" },
        thorn: { glow: 0x9de477, spark: 0xeaffb7, motif: "thorn" },
        ember: { glow: 0xff8152, spark: 0xffe0a1, motif: "flame" },
        toxic: { glow: 0xb6ee58, spark: 0xeaff9a, motif: "toxic" },
        plasma: { glow: 0xe58cff, spark: 0xffd9ff, motif: "plasma" },
        void: { glow: 0xa78bff, spark: 0xe5dcff, motif: "void" },
        astral: { glow: 0xc19cff, spark: 0xf5e9ff, motif: "astral" },
        glacier: { glow: 0x8fe8ff, spark: 0xffffff, motif: "ice" }
      })[variantProfile] : adornmentProfiles[archetypeId] || { glow: hornColor, spark: 0xffffff, motif: "spore" };
      const adornment = this.add.container(0, -12);
      const halo = this.add.ellipse(0, 2, 108, 116, profile.glow, 0.12)
        .setStrokeStyle(3, profile.glow, 0.56);
      adornment.add(halo);
      if (profile.motif === "wing") {
        [-1, 1].forEach((side) => {
          const wing = this.add.ellipse(side * 48, -24, 29, 43, profile.glow, 0.62)
            .setStrokeStyle(2, profile.spark, 0.9).setAngle(side * 24);
          adornment.add(wing);
          this.tweens.add({ targets: wing, scaleY: 0.78, angle: side * 34,
            duration: 360, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        });
      } else if (profile.motif === "ice") {
        [-1, 1].forEach((side) => {
          const shard = this.add.triangle(side * 48, -30, 0, -17, side * 11, 8, -side * 10, 8, profile.spark, 0.82)
            .setStrokeStyle(2, profile.glow, 0.95).setAngle(side * 18);
          adornment.add(shard);
        });
      } else if (["storm", "metal", "solar", "prism", "frostfire", "crystal", "thorn", "toxic", "plasma", "void", "astral"].includes(profile.motif)) {
        const motifColors = [profile.glow, profile.spark];
        if (profile.motif === "metal" || profile.motif === "thorn") {
          [-1, 1].forEach((side) => {
            const plate = this.add.triangle(side * 42, -4, 0, -22, side * 18, 8, -side * 9, 17, motifColors[0], 0.88)
              .setStrokeStyle(3, motifColors[1], 0.95).setAngle(side * 12);
            adornment.add(plate);
          });
        } else if (profile.motif === "solar" || profile.motif === "astral") {
          const crest = this.add.star(0, -65, 8, 3, 13, motifColors[1], 0.92)
            .setStrokeStyle(2, motifColors[0], 1);
          adornment.add(crest);
          this.tweens.add({ targets: crest, angle: 45, scale: 1.16, duration: 900, yoyo: true, repeat: -1 });
        } else {
          [-1, 1].forEach((side) => {
            const wing = this.add.triangle(side * 47, -18, 0, -24, side * 18, 4, -side * 9, 18, motifColors[0], 0.8)
              .setStrokeStyle(2, motifColors[1], 0.95).setAngle(side * 20);
            adornment.add(wing);
            this.tweens.add({ targets: wing, angle: side * 32, scaleY: 0.84, duration: 460, yoyo: true, repeat: -1 });
          });
        }
      } else if (profile.motif === "flame") {
        [-1, 1].forEach((side) => {
          const flame = this.add.triangle(side * 43, 12, 0, 15, side * 8, -15, -side * 8, 8, profile.spark, 0.86)
            .setStrokeStyle(1, profile.glow, 0.9).setAngle(side * 18);
          adornment.add(flame);
          this.tweens.add({ targets: flame, scaleY: 1.3, alpha: 0.48,
            duration: 240, yoyo: true, repeat: -1 });
        });
      } else {
        [-1, 1].forEach((side) => {
          const detail = profile.motif === "leaf"
            ? this.add.ellipse(side * 48, -12, 13, 27, profile.spark, 0.78).setAngle(side * 35)
            : this.add.star(side * 48, -28, 4, 3, 8, profile.spark, 0.9);
          detail.setStrokeStyle(1, profile.glow, 0.9);
          adornment.add(detail);
        });
      }
      [[-38, -52], [39, -43], [-45, 31], [43, 35]].forEach(([x, y], index) => {
        const spark = this.add.circle(x, y, index % 2 ? 3 : 4, profile.spark, 0.9);
        adornment.add(spark);
        this.tweens.add({ targets: spark, alpha: 0.28, scale: 0.55,
          duration: 420 + index * 95, yoyo: true, repeat: -1, delay: index * 80 });
      });
      adornment.setDepth(0);
      c.add(adornment);
      this.tweens.add({ targets: halo, scaleX: 1.08, scaleY: 1.06,
        alpha: 0.06, duration: 760, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      const approvedArtKey = APPROVED_ENEMY_ART[archetypeId] ? archetypeId : enemy.getData("enemyArtBaseId");
      approvedArtSprite = this.add.image(0, -12, `approved-enemy-${approvedArtKey}`)
        .setDisplaySize(isHeavy ? 98 : 92, isHeavy ? 108 : 102);
      if (variantTint) approvedArtSprite.setTint(variantTint);
      c.add(approvedArtSprite);
      c.setData("approvedArtSprite", approvedArtSprite);
      c.setData("approvedAdornment", adornment);
    }
    const enemyIdleKey = hasPremiumArtwork ? `enemy-${archetypeId}-idle` : null;
    const enemyMoveKey = hasPremiumArtwork ? `enemy-${archetypeId}-move` : `enemy-${enemyClass}-move`;
    const enemyAttackKey = hasPremiumArtwork ? `enemy-${archetypeId}-attack` : `enemy-${enemyClass}-strike`;
    enemySprite.setData("idleFrame", idleFrame);
    enemySprite.play(enemyIdleKey || enemyMoveKey);
    enemySprite.on(Phaser.Animations.Events.ANIMATION_COMPLETE, (animation) => {
      if (animation.key !== enemyAttackKey || !enemySprite.active) return;
      if (Math.abs(enemy.body?.velocity?.x || 0) > 18) enemySprite.play(enemyMoveKey);
      else if (enemyIdleKey) enemySprite.play(enemyIdleKey);
      else { enemySprite.anims.stop(); enemySprite.setFrame(idleFrame); }
    });
    c.setData("authoredSprite", enemySprite);
    enemy.setData("visual", c);
    c.setData("enemyClass", enemyClass);
    c.setData("classProfile", isFast ? "swift-scarf" : isHeavy ? "armored-bruiser" : "arcane-aura");
    c.setData("identityProfile", identityProfile);
    c.setData("elementId", elementId);
    enemy.setData("animTime", 0);

    return c;
  }

  createEnemyTexture(key, bodyColor, lightColor, hornColor) {
    const g = this.make.graphics({
      x: 0,
      y: 0,
      add: false
    });

    g.fillStyle(0x101b35, 0.2);
    g.fillEllipse(26, 49, 43, 8);

    g.fillStyle(0x47364e);
    g.fillRoundedRect(7, 39, 17, 10, 5);
    g.fillRoundedRect(29, 39, 17, 10, 5);

    g.fillStyle(hornColor);
    g.fillTriangle(5, 17, 1, 0, 19, 12);
    g.fillTriangle(47, 17, 51, 0, 33, 12);

    g.fillStyle(bodyColor);
    g.fillRoundedRect(4, 10, 44, 37, 15);

    g.fillStyle(lightColor, 0.85);
    g.fillEllipse(19, 17, 23, 15);

    g.fillStyle(0xffffff, 0.2);
    g.fillEllipse(26, 34, 25, 19);

    g.fillStyle(0xffffff);
    g.fillEllipse(17, 25, 12, 14);
    g.fillEllipse(35, 25, 12, 14);

    g.fillStyle(0x25233a);
    g.fillCircle(19, 26, 4);
    g.fillCircle(33, 26, 4);

    g.generateTexture(key, 52, 52);
    g.destroy();
  }

  createPlatforms() {
    this.platforms = this.physics.add.staticGroup();

    // Keep the original continuous floor so no stage can strand the player.
    this.groundPlatform = this.platforms.create(480, 528, "platform")
      .setScale(5.4, 1)
      .setTint(this.stageConfig.background.ground || 0x397c4c)
      .refreshBody();
    this.groundPlatform.setData("isGround", true);

    const authored = this.stageConfig.platforms || [
      { x: 160, y: 420, width: 200, height: 18 },
      { x: 480, y: 345, width: 200, height: 18 },
      { x: 800, y: 420, width: 200, height: 18 }
    ];

    const materialStyles = {
      "polished-stone": { base: 0x6e7788, accent: 0xcbd7e7, detail: 0xeff7ff },
      "candy-glass": { base: 0xb66c9e, accent: 0xffc6e7, detail: 0xffffff },
      "carved-wood": { base: 0x76513b, accent: 0xd6a46b, detail: 0xf2d19b },
      "ice-crystal": { base: 0x668fae, accent: 0xb9f4ff, detail: 0xffffff },
      "cloud-sky": { base: 0x829fca, accent: 0xe1efff, detail: 0xffffff },
      "clockwork-metal": { base: 0x626d82, accent: 0xffd36b, detail: 0xe8f1ff },
      "lava-obsidian": { base: 0x332d3c, accent: 0xff7547, detail: 0xffc078 },
      "rune-energy": { base: 0x51447f, accent: 0xc7aaff, detail: 0xf0e8ff },
      "floating-moss": { base: 0x496d56, accent: 0x9de17b, detail: 0xd7ffad },
      "starfield": { base: 0x34365f, accent: 0x9db5ff, detail: 0xffe7a4 },
    };
    authored.forEach(({ x, y, width = 200, materialId = "polished-stone", shapeId = "stone-block", specialType = null, specialDirection = 1 }, platformIndex) => {
      const style = materialStyles[materialId] || materialStyles["polished-stone"];
      const accent = style.accent || this.stageConfig.background.accent;
      const platform = this.platforms.create(x, y, "platform");
      platform.setScale(getPlatformTextureScale(width), 1).setTint(style.base).refreshBody();
      platform.setData("materialId", materialId);
      platform.setData("specialType", specialType);
      platform.setData("specialDirection", specialDirection);
      platform.setData("specialCooldownUntil", 0);
      this.add.ellipse(x, y - 12, width * 0.9, 15, accent, 0.24).setDepth(1);
      const trim = this.add.rectangle(x, y - 13, width * 0.94, 5, accent, 0.98).setDepth(2);
      const bevel = this.add.rectangle(x, y - 8, width * 0.78, 2, style.detail, 0.34).setDepth(3);
      this.tweens.add({ targets: trim, alpha: 0.52, duration: 1050 + (this.stageNumber % 5) * 140, yoyo: true, repeat: -1 });
      this.tweens.add({ targets: bevel, alpha: 0.08, duration: 1350 + platformIndex * 150, yoyo: true, repeat: -1 });
      // Material-specific ornament makes each platform family readable beyond its tint.
      if (materialId === "ice-crystal" || materialId === "candy-glass" || materialId === "starfield") {
        for (let shard = 0; shard < 3; shard++) {
          const sx = x - width * 0.28 + shard * width * 0.28;
          const crystal = this.add.triangle(sx, y - 15, 0, -12 - shard * 2, 8, 3, -8, 3, style.detail, 0.88)
            .setStrokeStyle(1, accent, 0.85).setDepth(4);
          this.tweens.add({ targets: crystal, alpha: 0.38, angle: shard % 2 ? 8 : -8, duration: 900 + shard * 170, yoyo: true, repeat: -1 });
        }
      } else if (materialId === "clockwork-metal") {
        for (let gear = 0; gear < 3; gear++) {
          const gx = x - width * 0.3 + gear * width * 0.3;
          const cog = this.add.star(gx, y - 8, 8, 4, 7, style.detail, 0.8).setDepth(4);
          this.tweens.add({ targets: cog, angle: 360, duration: 5200 + gear * 500, repeat: -1 });
        }
      } else if (materialId === "lava-obsidian") {
        const seam = this.add.rectangle(x, y - 5, width * 0.7, 2, style.accent, 0.9).setDepth(4);
        this.tweens.add({ targets: seam, alpha: 0.25, duration: 460, yoyo: true, repeat: -1 });
      } else if (materialId === "floating-moss" || materialId === "carved-wood") {
        for (let tuft = 0; tuft < 4; tuft++) {
          const tx = x - width * 0.36 + tuft * width * 0.24;
          this.add.triangle(tx, y - 12, 0, -7, 5, 5, -5, 5, style.detail, 0.78).setDepth(4);
        }
      } else {
        const runeCount = 2 + ((this.stageNumber + platformIndex) % 3);
        for (let runeIndex = 0; runeIndex < runeCount; runeIndex++) {
          const progress = (runeIndex + 1) / (runeCount + 1);
          const runeX = x - width * 0.34 + width * 0.68 * progress;
          const rune = this.add.star(runeX, y - 7, 4, 2.2, 5, accent, 0.68)
            .setStrokeStyle(1, 0xffffff, 0.42).setDepth(3);
          this.tweens.add({ targets: rune, alpha: 0.22, angle: 90 + ((this.stageNumber + platformIndex + runeIndex) % 4) * 90,
            duration: 1150 + ((this.stageNumber + runeIndex) % 5) * 170, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
        }
      }
      this.createPlatformShapeDecoration(x, y, width, shapeId, accent, style.detail);
      if (specialType) this.createSpecialPlatformDecoration(platform, x, y, width, specialType, accent);
    });
  }


  createPlatformShapeDecoration(x, y, width, shapeId, accent, detail) {
    const decor = this.add.container(x, y - 7).setDepth(4);
    const half = width * 0.34;
    if (shapeId === "cloud-island") {
      decor.add([
        this.add.ellipse(-half, 0, 48, 17, detail, 0.88),
        this.add.ellipse(0, -4, 62, 22, detail, 0.92),
        this.add.ellipse(half, 0, 48, 17, detail, 0.88),
      ]);
    } else if (shapeId === "crystal-bridge") {
      decor.add([-1, 0, 1].map((side) =>
        this.add.triangle(side * half, -7, 0, -24, 12, 2, -12, 2, detail, 0.92)
          .setStrokeStyle(2, accent, 0.95)
      ));
    } else if (shapeId === "gear-rail") {
      decor.add([-1, 0, 1].map((side) =>
        this.add.star(side * half, 0, 8, 3, 7, detail, 0.95)
          .setStrokeStyle(1, accent, 0.95)
      ));
      this.tweens.add({ targets: decor.list, angle: 360, duration: 6200, repeat: -1 });
    } else if (shapeId === "vine-branch") {
      const vine = this.add.graphics();
      vine.lineStyle(4, accent, 0.95);
      vine.beginPath();
      vine.moveTo(-width * 0.42, 1);
      vine.lineTo(-width * 0.2, -7);
      vine.lineTo(0, 0);
      vine.lineTo(width * 0.2, -8);
      vine.lineTo(width * 0.42, 0);
      vine.strokePath();
      decor.add(vine);
      for (let leaf = 0; leaf < 4; leaf++) {
        const lx = -width * 0.3 + leaf * width * 0.2;
        decor.add(this.add.ellipse(lx, -9, 13, 6, detail, 0.92).setAngle(leaf % 2 ? 28 : -28));
      }
    } else if (shapeId === "rune-arch") {
      decor.add([
        this.add.rectangle(-width * 0.3, -10, 4, 18, accent, 0.95),
        this.add.rectangle(width * 0.3, -10, 4, 18, accent, 0.95),
        this.add.rectangle(0, -18, width * 0.62, 4, detail, 0.95),
        this.add.star(0, -18, 4, 3, 8, accent, 0.98),
      ]);
    } else if (shapeId === "candy-bubble") {
      decor.add([-1, 0, 1].map((side) =>
        this.add.circle(side * half, -8 - (side === 0 ? 4 : 0), side === 0 ? 9 : 6, detail, 0.86)
          .setStrokeStyle(2, accent, 0.9)
      ));
    } else if (shapeId === "lava-crack") {
      const crack = this.add.graphics();
      crack.lineStyle(3, accent, 0.98);
      crack.beginPath();
      crack.moveTo(-width * 0.42, 0);
      crack.lineTo(-width * 0.24, -9);
      crack.lineTo(-width * 0.08, 0);
      crack.lineTo(width * 0.08, -10);
      crack.lineTo(width * 0.24, 0);
      crack.lineTo(width * 0.42, -8);
      crack.strokePath();
      decor.add(crack);
      this.tweens.add({ targets: crack, alpha: 0.3, duration: 430, yoyo: true, repeat: -1 });
    } else {
      decor.add([-1, 0, 1].map((side) =>
        this.add.star(side * half, -8, 5, 3, 8, detail, 0.95)
          .setStrokeStyle(1, accent, 0.95)
      ));
      this.tweens.add({ targets: decor.list, alpha: 0.35, duration: 980, yoyo: true, repeat: -1 });
    }
  }

  createSpecialPlatformDecoration(platform, x, y, width, specialType, accent) {
    const labels = {
      accelerator: "» » »",
      "spring-bounce": "✦",
      "temporary-fade": "···",
      moving: "↔",
      "slippery-ice": "❄",
      "one-way-drop-through": "↓",
      "elemental-energy": "◇",
    };
    const marker = this.add.text(x, y - 25, labels[specialType] || "✦", {
      fontSize: specialType === "accelerator" ? "17px" : "14px",
      color: "#ffffff", fontStyle: "bold", stroke: "#17243b", strokeThickness: 3,
    }).setOrigin(0.5).setDepth(5);
    platform.setData("specialMarker", marker);
    if (specialType === "accelerator") {
      const stripe = this.add.rectangle(x, y - 3, width * 0.72, 3, accent, 0.95).setDepth(4);
      this.tweens.add({ targets: [marker, stripe], x: `+=${platform.getData("specialDirection") * 5}`, alpha: 0.45, duration: 360, yoyo: true, repeat: -1 });
    } else if (specialType === "spring-bounce") {
      this.tweens.add({ targets: marker, y: y - 34, scale: 1.25, duration: 460, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    } else if (specialType === "elemental-energy") {
      this.tweens.add({ targets: marker, angle: 180, scale: 1.22, alpha: 0.5, duration: 900, yoyo: true, repeat: -1 });
    } else if (specialType === "slippery-ice") {
      this.add.rectangle(x, y - 4, width * 0.8, 2, 0xffffff, 0.9).setDepth(4);
    } else if (specialType === "temporary-fade") {
      this.tweens.add({ targets: marker, alpha: 0.3, duration: 800, yoyo: true, repeat: -1 });
    }
  }

  handleSpecialPlatform(hero, platform) {
    if (!hero?.active || !platform?.active || platform === this.groundPlatform) return;
    const type = platform.getData("specialType");
    if (!type || this.time.now < (platform.getData("specialCooldownUntil") || 0)) return;
    const grounded = hero.body.blocked.down || hero.body.touching.down;
    if (!grounded) return;
    const direction = platform.getData("specialDirection") || 1;
    if (type === "accelerator") {
      hero.setVelocityX(direction * 380);
      platform.setData("specialCooldownUntil", this.time.now + 720);
      this.spawnElementParticles(hero.x, hero.y + 22, "wind", 7, 0.62);
    } else if (type === "spring-bounce") {
      hero.setVelocityY(-690);
      platform.setData("specialCooldownUntil", this.time.now + 900);
      this.spawnElementParticles(hero.x, hero.y + 22, "lightning", 12, 0.78);
      this.audio.play("jump");
    } else if (type === "temporary-fade") {
      platform.setData("specialCooldownUntil", this.time.now + 2600);
      platform.setAlpha(0.32);
      this.time.delayedCall(550, () => {
        if (platform.active) platform.body.enable = false;
      });
      this.time.delayedCall(2100, () => {
        if (platform.active) { platform.body.enable = true; platform.refreshBody(); platform.setAlpha(1); }
      });
    } else if (type === "moving") {
      platform.setData("specialCooldownUntil", this.time.now + 1600);
      this.tweens.add({ targets: platform, x: platform.x + direction * 52, duration: 780, yoyo: true,
        onUpdate: () => platform.refreshBody(), onComplete: () => platform.refreshBody() });
    } else if (type === "slippery-ice") {
      hero.setVelocityX(hero.body.velocity.x * 1.12);
      platform.setData("specialCooldownUntil", this.time.now + 280);
    } else if (type === "elemental-energy") {
      hero.setVelocityY(Math.min(hero.body.velocity.y, -160));
      platform.setData("specialCooldownUntil", this.time.now + 1100);
      this.spawnElementParticles(hero.x, hero.y + 20, this.stageConfig.enemyPowerType || "light", 8, 0.7);
    }
  }

  createHUD() {
    this.add.rectangle(
      480, 30, 960, 60, 0x132e48, 0.94
    ).setScrollFactor(0).setDepth(20);

    this.add.rectangle(
      480, 60, 960, 2, 0x43d9e8, 0.8
    ).setDepth(20);

    this.add.text(20, 7, "ZERO GAME", {
      fontSize: "22px",
      color: "#ffe17a",
      fontStyle: "bold",
      stroke: "#563b37",
      strokeThickness: 3
    }).setDepth(21);

    this.heroTitleLabel = this.add.text(20, 37, `${this.selectedHero.name.toUpperCase()}  |  ${this.stageConfig.world.toUpperCase()}  •  STAGE ${String(this.stageNumber).padStart(2,"0")}`, {
      fontSize: "12px", color: "#d9f6ff", fontStyle: "bold"
    }).setDepth(21);

    this.powerLabel = this.add.text(640, 19, "POWER: FIRE • P1/20 [C]", { fontSize: "13px", color: "#ffb45e", fontStyle: "bold" }).setDepth(21);
    this.enemyLabel = this.add.text(
      390, 19, `ENEMIES: 0/${this.stageEnemyCount}`, {
        fontSize: "18px",
        color: "#ffffff",
        fontStyle: "bold"
      }
    ).setDepth(21);

    this.healthLabel = this.add.text(
      790, 19, "HEARTS: 3/3", {
        fontSize: "16px",
        color: "#62ffb4",
        fontStyle: "bold"
      }
    ).setDepth(21);
    this.chancesLabel = this.add.text(790, 42, "CHANCES: 3", { fontSize: "12px", color: "#9cecff", fontStyle: "bold" }).setDepth(21);
    this.scoreLabel = this.add.text(390, 43, "SCORE: 0", {
      fontSize: "13px", color: "#ffe17a", fontStyle: "bold"
    }).setOrigin(0.5, 0).setDepth(21);
    this.timerLabel = this.add.text(920, 43, "02:00", {
      fontSize: "13px", color: "#ffffff", fontStyle: "bold"
    }).setOrigin(1, 0).setDepth(21);

    this.musicToggleLabel = this.add.text(610, 43, "", {
      fontSize: "10px", color: "#9cecff", fontStyle: "bold"
    }).setDepth(22).setInteractive({ useHandCursor: true });
    this.sfxToggleLabel = this.add.text(690, 43, "", {
      fontSize: "10px", color: "#9cecff", fontStyle: "bold"
    }).setDepth(22).setInteractive({ useHandCursor: true });
    const refreshAudioLabels = () => {
      this.musicToggleLabel.setText(`MUSIC ${this.audio.isMusicEnabled() ? "ON" : "OFF"} ${Math.round(this.audio.getMusicVolume() * 100)}%`);
      this.sfxToggleLabel.setText(`SFX ${this.audio.isSfxEnabled() ? "ON" : "OFF"} ${Math.round(this.audio.getSfxVolume() * 100)}%`);
    };
    // Tap the HUD labels to mute/unmute; volume cycling remains available
    // through cycleAudioVolume so a mute toggle never unexpectedly changes
    // the player's saved volume preference.
    this.musicToggleLabel.on("pointerdown", () => this.toggleAudioChannel("music"));
    this.sfxToggleLabel.on("pointerdown", () => this.toggleAudioChannel("sfx"));
    refreshAudioLabels();

    this.statusLabel = this.add.text(
      480, 112, "STAGE 01 - ENEMIES INCOMING!", {
        fontSize: "23px", color: "#ffffff", fontStyle: "bold",
        stroke: "#173d55", strokeThickness: 5
      }
    ).setOrigin(0.5).setDepth(22);

    this.bossTitle = this.add.text(480, 76, "BOSS", {
      fontSize: "13px", color: "#ffe17a", fontStyle: "bold"
    }).setOrigin(0.5).setDepth(23).setVisible(false);
    this.bossBarBack = this.add.rectangle(480, 96, 300, 13, 0x241b2c, 0.95)
      .setStrokeStyle(2, 0xffd36b).setDepth(23).setVisible(false);
    this.bossBar = this.add.rectangle(331, 96, 296, 7, 0xff594f)
      .setOrigin(0, 0.5).setDepth(24).setVisible(false);
  }

  toggleAudioChannel(channel) {
    if (channel === "music") {
      this.audio.setMusicEnabled(!this.audio.isMusicEnabled());
      this.musicToggleLabel?.setText(`MUSIC ${this.audio.isMusicEnabled() ? "ON" : "OFF"} ${Math.round(this.audio.getMusicVolume() * 100)}%`);
    } else if (channel === "sfx") {
      this.audio.setSfxEnabled(!this.audio.isSfxEnabled());
      this.sfxToggleLabel?.setText(`SFX ${this.audio.isSfxEnabled() ? "ON" : "OFF"} ${Math.round(this.audio.getSfxVolume() * 100)}%`);
    } else {
      return;
    }
    this.audio.play("ui");
  }

  cycleAudioVolume(channel) {
    const levels = [0, 0.25, 0.5, 0.75, 1];
    if (channel === "music") {
      const current = this.audio.getMusicVolume();
      const next = levels.find((level) => level > current + 0.001) ?? 0;
      this.audio.setMusicVolume(next);
      this.musicToggleLabel?.setText(`MUSIC ${this.audio.isMusicEnabled() ? "ON" : "OFF"} ${Math.round(next * 100)}%`);
    } else if (channel === "sfx") {
      const current = this.audio.getSfxVolume();
      const next = levels.find((level) => level > current + 0.001) ?? 0;
      this.audio.setSfxVolume(next);
      this.sfxToggleLabel?.setText(`SFX ${this.audio.isSfxEnabled() ? "ON" : "OFF"} ${Math.round(next * 100)}%`);
    } else {
      return;
    }
    this.audio.unlock();
    this.audio.play("ui");
  }

  pressMobileAction(action) {
    this.audio.unlock();
    if (action === "musicVolume" || action === "sfxVolume") {
      this.cycleAudioVolume(action === "musicVolume" ? "music" : "sfx");
      return;
    }
    if (action === "jump") {
      this.mobileJumpHeld = true;
      this.mobileJumpPressedAt = this.time?.now || 0;
      enqueueMobileAction(this.mobileActionQueue, "jump");
      return;
    }
    if (["super", "special1", "special2", "special3", "cyclePower"].includes(action)) {
      enqueueMobileAction(this.mobileActionQueue, action);
      return;
    }
    this.touch[action] = true;
  }

  consumeMobileAction(action) {
    return consumeMobileAction(this.mobileActionQueue, action);
  }

  setMobileControlsVisible(visible) {
    const overlay = document.getElementById("mobile-controls-overlay");
    if (overlay) overlay.style.display = visible ? "block" : "none";
    (this.mobileControlDecorations || []).forEach((item) => item?.setVisible?.(visible));
    this.mobileControlVisuals?.forEach((control) => {
      control.bg?.setVisible(visible);
      control.ring?.setVisible(visible);
      control.text?.setVisible(visible);
      control.glow?.setVisible(visible);
    });
    if (!visible) {
      // Notify the React touch bridge too: hiding the overlay can prevent a
      // later pointerup from reaching it, so its pointer-id ownership must end.
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("zero-game-controls-hidden"));
      }
      if (this.mobileActionQueue) this.mobileActionQueue.length = 0;
      if (this.touch) {
        this.touch.axis = 0;
        this.touch.left = false;
        this.touch.right = false;
        this.touch.jump = false;
        this.touch.attack = false;
        this.touch.super = false;
        this.touch.special1 = false;
        this.touch.special2 = false;
        this.touch.special3 = false;
      }
    }
  }

  createMobileControls() {
    const cx = 132, cy = 448;
    // Phaser draws controls; DOM pointer handlers receive touch input. This
    // bypasses game-object hit testing and is reliable with multiple fingers.
    this.joystickBase = this.add.circle(cx, cy, 72, 0x102d4b, 0.78)
      .setStrokeStyle(5, 0x8ceeff, 0.95).setDepth(29);
    const joystickInner = this.add.circle(cx, cy, 53, 0x1b4e70, 0.38)
      .setStrokeStyle(2, 0x70dfff, 0.55).setDepth(29);
    this.joystickKnob = this.add.circle(cx, cy, 32, 0x36b9df, 1)
      .setStrokeStyle(4, 0xffffff).setDepth(30);
    this.mobileControlDecorations = [this.joystickBase, joystickInner, this.joystickKnob];
    this.mobileControlVisuals = new Map();
    // All three EXTRA moves remain visible; the same layout also drives hit testing.
    MOBILE_ACTION_BUTTONS.forEach(({ x, y, label, action }) => {
      this.createControl(x, y, label, action);
    });
    this.mobileActionPointers = new Map();
    this.setMobileControlsVisible(false);
  }

  moveJoystick(pointer) {
    const cx = 132, cy = 448;
    const dx = pointer.x - cx, dy = pointer.y - cy;
    const distance = Math.sqrt(dx * dx + dy * dy) || 1;
    const limited = Math.min(52, distance);
    const nx = dx / distance, ny = dy / distance;
    this.joystickKnob.setPosition(cx + nx * limited, cy + ny * limited);
    const rawAxis = Phaser.Math.Clamp(dx / 52, -1, 1);
    this.touch.axis = Math.abs(rawAxis) < 0.16 ? 0 : rawAxis;
    this.touch.left = this.touch.axis < -0.16;
    this.touch.right = this.touch.axis > 0.16;
    this.touch.down = dy > 24;
    this.joystickKnob.setScale(1.08);
  }

  createControl(x, y, label, action) {
    const accents = { attack: 0xffa33c, super: 0xffd36b, jump: 0x75eaff, special1: 0xff8b5e, special2: 0x72e0ff, special3: 0xc69bff, cyclePower: 0x9cebdc };
    const accent = accents[action] || 0x75eaff;
    const baseFill = action === "attack" ? 0x9b451f : (action.startsWith("special") || action === "cyclePower") ? 0x263c72 : 0x176184;
    const glow = this.add.circle(x, y, (action.startsWith("special") || action === "cyclePower") ? 45 : 54, accent, 0.12).setDepth(28);
    const ring = this.add.circle(x, y, 49, 0x000000, 0)
      .setStrokeStyle(4, accent, 0.72).setDepth(29);
    const bg = this.add.circle(x, y, (action.startsWith("special") || action === "cyclePower") ? 35 : 43, baseFill, 0.98)
      .setStrokeStyle(5, accent).setDepth(30);
    const text = this.add.text(x, y, label, {
      fontSize: "17px", color: "#ffffff", fontStyle: "bold",
      stroke: "#10243a", strokeThickness: 4
    }).setOrigin(0.5).setDepth(31);
    this.mobileControlVisuals.set(action, { bg, ring, text, baseFill, glow });
    if (action === "attack") this.attackRing = ring;
  }

  clearMenu() {
    (this.menuObjects || []).forEach(object => { if (object?.active) object.destroy(); });
    this.menuObjects = [];
  }

  showStoryScreen() {
    this.setMobileControlsVisible(false);
    this.audio.playMenuTheme?.();
    this.gameStarted = false;
    this.clearMenu();
    const shade = this.add.rectangle(480, 270, 960, 540, 0x050b19, 0.94).setDepth(60);
    const panel = this.add.rectangle(480, 270, 850, 510, 0x101d38, 0.9).setStrokeStyle(3, 0x53dfff, 0.9).setDepth(61);
    const topLine = this.add.rectangle(480, 154, 760, 3, 0xffc85b, 0.9).setDepth(62);
    const title = this.add.text(480, 82, "ZERO GAME", { fontSize: "62px", color: "#ffe17a", fontStyle: "bold", stroke: "#522b34", strokeThickness: 9, letterSpacing: 5 }).setOrigin(0.5).setDepth(63).setScale(0.7);
    const subtitle = this.add.text(480, 137, "50 STAGES  •  FOUR HEROES  •  FIVE BOSS BATTLES", { fontSize: "14px", color: "#8feaff", fontStyle: "bold", letterSpacing: 2 }).setOrigin(0.5).setDepth(63);
    const tagline = this.add.text(480, 184, "ONE HERO. THREE CHANCES. NINE HEARTS. FIFTY STAGES.", { fontSize: "14px", color: "#e8f6ff", fontStyle: "bold", letterSpacing: 1 }).setOrigin(0.5).setDepth(63);
    this.menuObjects.push(shade, panel, topLine, title, subtitle, tagline);
    const previewXs = [210, 390, 570, 750];
    HEROES.forEach((hero, i) => {
      const visual = this.createHeroVisual(previewXs[i], 312, hero.id);
      const palette = visual.getData("heroPalette");
      palette.kurta.setFillStyle(hero.color); palette.waistcoat.setFillStyle(hero.accent); palette.capLine.setFillStyle(hero.accent);
      this.applyHeroLook(visual, hero);
      visual.setData("heroPreview", true);
      visual.setDepth(64).setScale(0.82).setAlpha(0);
      this.menuObjects.push(visual);
      this.tweens.add({ targets: visual, y: 307 - (i % 2) * 4, alpha: 1, duration: 850, delay: 180 + i * 130, ease: "Back.easeOut" });
      this.tweens.add({ targets: visual, y: 301 - (i % 2) * 4, duration: 800 + i * 100, delay: 1100 + i * 100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      const label = this.add.text(previewXs[i], 360, hero.name.toUpperCase(), { fontSize: "17px", color: "#ffffff", fontStyle: "bold", stroke: "#10243a", strokeThickness: 3 }).setOrigin(0.5).setDepth(65);
      const style = this.add.text(previewXs[i], 385, hero.style.toUpperCase(), { fontSize: "10px", color: "#9feaff", fontStyle: "bold", align: "center", wordWrap: { width: 154, useAdvancedWrap: true }, lineSpacing: 2, fixedWidth: 154, fixedHeight: 34 }).setOrigin(0.5, 0).setDepth(65);
      style.setData("heroDescription", hero.id);
      this.menuObjects.push(label, style);
    });
    this.tweens.add({ targets: title, scale: 1, y: 88, duration: 850, ease: "Back.easeOut" });
    const start = this.add.text(480, 502, "START CAMPAIGN", { fontSize: "20px", color: "#ffffff", backgroundColor: "#087e83", padding: { x: 34, y: 10 }, fontStyle: "bold", stroke: "#062b3a", strokeThickness: 2 }).setOrigin(0.5).setDepth(70).setInteractive({ useHandCursor: true });
    this.menuObjects.push(start);
    this.tweens.add({ targets: start, scale: 1.055, duration: 620, yoyo: true, repeat: -1 });
    start.on("pointerdown", () => { this.audio.unlock(); this.audio.play("ui"); this.startNewCampaign(); });
  }

  showHeroSelect() {
    this.setMobileControlsVisible(false);
    this.gameStarted = false;
    this.clearMenu();
    this.heroSelectionLocked = false;
    const shade = this.add.rectangle(480, 270, 960, 540, 0x050b19, 0.96).setDepth(60);
    const heading = this.add.text(480, 48, "SELECT YOUR HERO", { fontSize: "34px", color: "#ffe17a", fontStyle: "bold", stroke: "#513b43", strokeThickness: 5, letterSpacing: 2 }).setOrigin(0.5).setDepth(61);
    const sub = this.add.text(480, 83, "YOUR HERO WILL STAY WITH YOU THROUGH ALL 50 STAGES", { fontSize: "12px", color: "#9feaff", fontStyle: "bold", letterSpacing: 1 }).setOrigin(0.5).setDepth(61);
    this.menuObjects.push(shade, heading, sub);
    HEROES.forEach((hero, index) => {
      const x = 132 + index * 232;
      const card = this.add.rectangle(x, 295, 216, 390, 0x142b49, 0.98).setStrokeStyle(3, hero.accent).setDepth(61).setInteractive({ useHandCursor: true });
      const glow = this.add.circle(x, 190, 68, hero.accent, 0.1).setStrokeStyle(2, hero.accent, 0.68).setDepth(62);
      const visual = this.createHeroVisual(x, 198, hero.id);
      // Use each hero's authored sprite sheet in the selection cards; never expose the legacy rig.
      this.applyHeroLook(visual, hero);
      visual.setDepth(63).setScale(0.9);
      const name = this.add.text(x, 258, hero.name.toUpperCase(), { fontSize: "20px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5).setDepth(64);
      const title = this.add.text(x, 285, hero.title, { fontSize: "11px", color: "#9feaff", fontStyle: "bold", align: "center", wordWrap: { width: 188 }, fixedWidth: 188, fixedHeight: 30 }).setOrigin(0.5, 0).setDepth(64);
      const description = this.add.text(x, 319, hero.description, { fontSize: "10px", color: "#d4e5f6", align: "center", lineSpacing: 2, wordWrap: { width: 188 }, fixedWidth: 188, fixedHeight: 44 }).setOrigin(0.5, 0).setDepth(64);
      const power = this.add.text(x, 368, hero.superPower.toUpperCase(), { fontSize: "12px", color: "#ffe17a", fontStyle: "bold", align: "center", wordWrap: { width: 188 }, fixedWidth: 188, fixedHeight: 20 }).setOrigin(0.5, 0).setDepth(64);
      const moves = this.add.text(x, 393, hero.specialMoves.map(move => move.name).join("\n"), { fontSize: "9px", color: "#d7eaff", align: "center", lineSpacing: 2, wordWrap: { width: 188 }, fixedWidth: 188, fixedHeight: 54 }).setOrigin(0.5, 0).setDepth(64);
      const choose = this.add.text(x, 463, "SELECT HERO", { fontSize: "12px", color: "#ffffff", backgroundColor: "#126d7b", padding: { x: 14, y: 7 }, fontStyle: "bold" }).setOrigin(0.5).setDepth(64).setInteractive({ useHandCursor: true });
      this.menuObjects.push(card, glow, visual, name, title, description, power, moves, choose);
      this.tweens.add({ targets: visual, y: 210, angle: index % 2 ? 1.5 : -1.5, duration: 760 + index * 120, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      this.tweens.add({ targets: glow, scale: 1.16, alpha: 0.2, duration: 900 + index * 100, yoyo: true, repeat: -1 });
      const select = () => {
        if (this.heroSelectionLocked) return;
        this.heroSelectionLocked = true; this.audio.unlock(); this.audio.play("ui"); this.selectedHero = hero;
        this.applyHeroLook(this.heroVisual, hero, true);
        const selectedSprite = this.heroVisual?.getData("heroSprite");
        selectedSprite?.setVisible(true);
        (this.heroVisual?.getData("heroRigParts") || []).forEach((part) => {
          if (part?.active) part.setVisible(false);
        });
        (this.heroVisual?.getData("heroLookItems") || []).forEach((part) => {
          if (part?.active) part.setVisible(false);
        });
        if (this.heroVisual?.active) this.setHeroSpriteAnimation(this.heroVisual, "idle");
        localStorage.setItem("zero_game_hero", hero.id);
        this.powerType = hero.element; this.campaignActive = true;
        const lives = createCampaignLives();
        this.chances = lives.chances; this.health = lives.hearts;
        this.stageNumber = 1; this.score = 0; this.extraLivesAwarded = 0;
        this.beginCampaign();
      };
      card.on("pointerdown", select); choose.on("pointerdown", select);
    });
    const back = this.add.text(480, 529, "BACK", { fontSize: "12px", color: "#9feaff", backgroundColor: "#173d59", padding: { x: 17, y: 5 } }).setOrigin(0.5).setDepth(65).setInteractive({ useHandCursor: true });
    this.menuObjects.push(back);
    back.on("pointerdown", () => { this.audio.play("ui"); this.showStoryScreen(); });
  }

  startNewCampaign() {
    this.clearMenu();
    this.gameOver = false; this.stageCleared = false; this.campaignActive = false; this.heroSelectionLocked = false;
    this.chanceLossInProgress = false;
    this.stageTransitionActive = false;
    this.pendingStageTransitionDirection = null;
    this.stageAdvancePending = false;
    this.stageNumber = 1; this.score = 0; this.extraLivesAwarded = 0; this.defeated = 0;
    this.chances = 3; this.health = 3; this.snowballTutorialShown = false;
    this.openHeroSelectAfterRestart = true;
    // Rebuild stage-one physics, enemies, HUD and scene objects. This also
    // restores a disabled hero body after a previous Game Over.
    this.scene.restart();
  }

  beginCampaign({ transitionDirection = null } = {}) {
    this.setMobileControlsVisible(true); this.clearMenu();
    this.audio.unlock();
    this.audio.play("stage");
    this.audio.playStageTheme(this.stageNumber);
    this.campaignActive = true; this.gameStarted = true; this.gameOver = false; this.stageCleared = false;
    this.stageAdvancePending = false;
    this.stageStartedAt = this.time.now; this.stageTimeLeft = this.stageConfig.timeLimit || 120;
    this.jumpCount = 0; this.lastDamage = this.time.now; this.nextFootstepAt = this.time.now + 200;
    this.hero.setPosition(480, 450).setVelocity(0, 0).setVisible(false);
    this.heroVisual.setPosition(480, 450).setVisible(true).setAlpha(1).setScale(1);
    this.heroTitleLabel.setText(`${this.selectedHero.name.toUpperCase()}  |  STAGE ${String(this.stageNumber).padStart(2,"0")}`);
    const heroPalette = this.heroVisual.getData("heroPalette");
    heroPalette.kurta.setFillStyle(this.selectedHero.color); heroPalette.waistcoat.setFillStyle(this.selectedHero.accent); heroPalette.capLine.setFillStyle(this.selectedHero.accent);
    this.applyHeroLook(this.heroVisual, this.selectedHero);
    this.powerType = this.selectedHero.element;
    const element = getElement(this.powerType);
    this.powerLabel.setText(`POWER: ${element.name.toUpperCase()} • P${this.particlePowerLevel}/20 [POWER]`).setColor("#" + element.color.toString(16).padStart(6, "0"));
    this.mobileControlVisuals?.get("cyclePower")?.text?.setText(`POWER\n${element.name.toUpperCase()}`).setFontSize("11px");
    this.updateLivesLabel();
    const enterGameplay = () => {
      this.stageTransitionActive = false;
      this.hero.setPosition(480, 450).setVelocity(0, 0);
      this.heroVisual.setPosition(480, 450).setVisible(true).setAlpha(1);
      if (this.stageConfig.isBossStage) this.spawnBoss();
      else { this.spawnEnemies(); this.spawnTreasureChest(); }
      this.statusLabel.setText(`${this.stageConfig.world.toUpperCase()} - STAGE ${this.stageNumber}`).setColor("#ffffff");
      const intro = this.add.text(480, 205, `STAGE ${String(this.stageNumber).padStart(2,"0")}  •  ${this.stageConfig.world.toUpperCase()}\nGET READY!`, {
        fontSize: "27px", color: "#ffe17a", fontStyle: "bold", align: "center", stroke: "#1a2948", strokeThickness: 6, lineSpacing: 8
      }).setOrigin(0.5).setDepth(36).setScale(0.7).setAlpha(0);
      this.tweens.add({ targets: intro, alpha: 1, scale: 1, y: 180, duration: 380, yoyo: true, hold: 450, onComplete: () => intro.destroy() });
      this.setMobileControlsVisible(true);
    };
    if (transitionDirection) this.playStageEntryTransition(transitionDirection, enterGameplay);
    else {
      this.stageTransitionActive = false;
      this.heroVisual.setPosition(1040, 450);
      this.tweens.add({ targets: this.heroVisual, x: 480, duration: 900, ease: "Cubic.easeOut" });
      enterGameplay();
    }
  }

  playStageEntryTransition(direction, onComplete) {
    const offsets = { up: { x: 0, y: 540 }, down: { x: 0, y: -540 }, right: { x: -960, y: 0 }, left: { x: 960, y: 0 } };
    const offset = offsets[direction] || offsets.down;
    const moving = this.children.list.filter((object) => object?.active && (object.depth ?? 0) < 20);
    const origins = moving.map((object) => ({ object, x: object.x, y: object.y }));
    this.stageTransitionActive = true; this.setMobileControlsVisible(false); this.physics.world.pause();
    origins.forEach(({ object, x, y }) => {
      object.setPosition(x + offset.x, y + offset.y);
      if (object.body?.updateFromGameObject) object.body.updateFromGameObject();
    });
    if (!origins.length) { this.physics.world.resume(); onComplete(); return; }
    // One shared progress tween keeps transition work linear in object count.
    const progress = { value: 0 };
    this.tweens.add({
      targets: progress,
      value: 1,
      duration: 820,
      ease: "Cubic.easeOut",
      onUpdate: () => {
        const remaining = 1 - progress.value;
        origins.forEach(({ object, x, y }) => {
          object.setPosition(x + offset.x * remaining, y + offset.y * remaining);
          if (object.body?.updateFromGameObject) object.body.updateFromGameObject();
        });
      },
      onComplete: () => {
        origins.forEach(({ object, x, y }) => {
          object.setPosition(x, y);
          if (object.body?.updateFromGameObject) object.body.updateFromGameObject();
        });
        this.physics.world.resume();
        onComplete();
      },
    });
  }


  spawnEnemyProjectile(enemy, pattern = "single") {
    if (!enemy?.active || !this.hero?.active || this.gameOver || this.bossDefeated) return;
    const palette = getElement(enemy.getData("enemyPowerType") || "shadow");
    const direction = this.hero.x >= enemy.x ? 1 : -1;
    const baseAngle = Phaser.Math.Angle.Between(enemy.x, enemy.y - 8, this.hero.x, this.hero.y - 8);
    const spreads = pattern === "triple" ? [-0.22, 0, 0.22] : [0];
    spreads.forEach((spread, index) => {
      const shot = this.physics.add.image(enemy.x + direction * 24, enemy.y - 12, "shot")
        .setTint(palette.color).setDepth(18).setScale(pattern === "triple" ? 0.62 : 0.78);
      this.bossShots.add(shot);
      shot.body.setAllowGravity(false);
      shot.body.setCircle(pattern === "triple" ? 7 : 9);
      const angle = baseAngle + spread;
      const speed = pattern === "triple" ? 205 : 235;
      shot.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      shot.setData("isEnemyProjectile", true);
      this.tweens.add({ targets: shot, scale: 1.35, duration: 180 + index * 35, yoyo: true, repeat: -1 });
      this.time.delayedCall(2600, () => { if (shot.active) shot.destroy(); });
    });
  }

  spawnEnemies() {
    if (this.stageConfig.isBossStage || this.stageEnemyCount <= 0) return;
    const authoredPositions = this.stageConfig.enemySpawnPositions;
    const positions = Array.isArray(authoredPositions) && authoredPositions.length === this.stageEnemyCount
      ? [...authoredPositions]
      : Array.from({ length: this.stageEnemyCount }, (_, i) =>
        70 + i * (820 / Math.max(1, this.stageEnemyCount - 1)));

    const premiumRoster = this.stageConfig.enemyRoster?.length
      ? this.stageConfig.enemyRoster : getPremiumStageEnemyRoster(this.stageNumber);
    const familyPalettes = {
      striker: { colors: [0x8b4a3e, 0x355b8a, 0x6d4b83], horns: [0xffd36b, 0x8feaff, 0xffa3a3] },
      agile: { colors: [0x356f83, 0x8a4f77, 0x4f7b55], horns: [0x9cecff, 0xffc4d2, 0xc9f28a] },
      power: { colors: [0x76513c, 0x4d536d, 0x8b633f], horns: [0xffd36b, 0xb7c7ff, 0xffb56e] }
    };
    const palette = familyPalettes[this.stageConfig.enemyFamily] || familyPalettes.striker;
    const colors = palette.colors;
    const horns = palette.horns;

    positions.forEach((x, i) => {
      this.time.delayedCall(600 + i * 650, () => {
        if (this.gameOver || this.stageCleared) return;

        const enemy = this.enemies.create(
          x, -50, `enemy${i % 3}`
        );

        enemy.setDepth(9);
        enemy.setBounce(0);
        enemy.setCollideWorldBounds(true);
        enemy.body.setAllowGravity(true);
        enemy.setData("frozen", false);
        enemy.setData("baseTexture", `enemy${i % 3}`);
        const archetype = premiumRoster[i % premiumRoster.length];
        enemy.setData("enemyName", archetype?.name || this.stageConfig.enemyTypes[i % this.stageConfig.enemyTypes.length]);
        enemy.setData("enemyArchetypeId", archetype?.id || "legacy-enemy");
        enemy.setData("enemyRole", archetype?.role || "runner");
        enemy.setData("enemyTier", archetype?.tier || "common");
        enemy.setData("enemyVariantStyle", archetype?.style || null);
        enemy.setData("enemyVariantTint", archetype?.tint || null);
        enemy.setData("enemyArtBaseId", archetype?.artBaseId || archetype?.id || null);
        const roleClass = { runner: "fast", leaper: "fast", flying: "fast", ambusher: "special", ranged: "special", bomber: "special", illusionist: "special", summoner: "special", shield: "heavy", heavy: "heavy", charger: "heavy" };
        const enemyClass = roleClass[archetype?.role] || ["fast", "heavy", "special"][i % 3];
        enemy.setData("enemyClass", enemyClass);
        const enemyPowerType = this.stageConfig.enemyPowerType || "fire";
        enemy.setData("enemyPowerType", enemyPowerType);
        enemy.setData("snowballPowerTier", getSnowballPowerTier(enemyClass, enemyPowerType, this.stageNumber));
        const roleAi = { runner: "runner", leaper: "jumper", flying: "flyer", ambusher: "ambusher", ranged: "ranged", bomber: "bomber", illusionist: "ambusher", summoner: "summoner", shield: "guard", heavy: "chaser", charger: "charger" };
        const aiType = roleAi[archetype?.role] || ["chaser", "runner", "jumper", "guard", "charger", "chaser"][i % 6];
        enemy.setData("aiType", aiType);
        enemy.setData("aiState", ["runner", "charger", "ambusher", "bomber"].includes(aiType) ? "tell" : aiType === "guard" ? "guard" : "patrol");
        enemy.setData("aiStateUntil", this.time.now + 900 + (i % 3) * 350);
        enemy.setData("nextRangedAt", this.time.now + 1500 + (i % 3) * 450);
        enemy.setData("nextBlastAt", this.time.now + 2100 + (i % 3) * 500);
        if (aiType === "flyer") { enemy.setPosition(x, 220 + (i % 3) * 42); enemy.body.setAllowGravity(false); }
        enemy.setData("nextHop", this.time.now + 650 + (i % 3) * 280);
        enemy.setData("patrolDirection", i % 2 ? -1 : 1);
        enemy.setData("aiAnim", 0);
        enemy.setVisible(false);

        const scale = (i % 2 === 0 ? 1.12 : 1) * REGULAR_ENEMY_VISUAL_SCALE;
        enemy.setScale(scale);

        const visual = this.createEnemyVisual(
          enemy,
          colors[i % 3],
          horns[i % 3]
        );

        visual.setScale(scale);
        enemy.setData("visualScale", scale);
      });
    });
  }

  spawnSignatureParticles(x, y, heroId, moveId, scale = 1) {
    const palettes = {
      ryo: [0xffef9a, 0xffa52e, 0xff5428],
      kairo: [0xfff0a0, 0xffcf42, 0xe94a22],
      mei: [0xf4fdff, 0x8deaff, 0x4d8dff],
      volt: [0xf4ffb0, 0xffe34d, 0x75e65b],
    };
    const colors = palettes[heroId] || palettes.ryo;
    const addArc = (radius, start, end, color, width, rotation = 0) => {
      const arc = this.add.arc(x, y, radius, start, end, false, color, 0.92)
        .setStrokeStyle(width, 0xffffff, 0.8).setDepth(27).setAngle(rotation);
      this.tweens.add({ targets: arc, angle: rotation + 145, scale: 1.28, alpha: 0,
        duration: 360 + Math.round(scale * 90), onComplete: () => arc.destroy() });
    };
    const addBolt = (offsetX, offsetY, color, length = 34) => {
      const bolt = this.add.graphics().setPosition(x + offsetX, y + offsetY).setDepth(28);
      bolt.lineStyle(4, color, 1);
      bolt.beginPath();
      bolt.moveTo(-7, -length * 0.5);
      bolt.lineTo(5, -length * 0.12);
      bolt.lineTo(-4, length * 0.04);
      bolt.lineTo(8, length * 0.5);
      bolt.strokePath();
      this.tweens.add({ targets: bolt, x: bolt.x + Phaser.Math.Between(-18, 18),
        y: bolt.y + Phaser.Math.Between(-20, 20), alpha: 0, duration: 260,
        onComplete: () => bolt.destroy() });
    };
    const addFlame = (offsetX, offsetY, color, width, height, angle = 0) => {
      const flame = this.add.ellipse(x + offsetX, y + offsetY, width, height, color, 0.96)
        .setDepth(27).setAngle(angle);
      this.tweens.add({ targets: flame, y: flame.y - Phaser.Math.Between(18, 42),
        x: flame.x + Phaser.Math.Between(-20, 20), scaleX: 0.12, scaleY: 0.35,
        alpha: 0, angle: angle + Phaser.Math.Between(-75, 75), duration: 300 + Math.round(scale * 80),
        onComplete: () => flame.destroy() });
    };

    switch (moveId) {
      case "ember-wave":
        addArc(42, 205, 335, colors[1], 12);
        for (let i = 0; i < 7; i++) addFlame(Phaser.Math.Between(-24, 24), Phaser.Math.Between(-12, 12), colors[i % 3], 7, 19, -25);
        break;
      case "guardian-rise":
        for (let i = 0; i < 10; i++) addFlame(Phaser.Math.Between(-25, 25), 18 + i * 2, colors[i % 3], 6, 25, -10);
        addArc(28, 200, 340, colors[0], 7, -90);
        break;
      case "ember-cyclone":
      case "inferno-spin":
        addArc(38, 15, 160, colors[1], 10);
        addArc(55, 195, 340, colors[0], 7, 28);
        for (let i = 0; i < 8; i++) addFlame(Math.cos(i) * 25, Math.sin(i) * 18, colors[i % 3], 6, 16, i * 45);
        break;
      case "flare-wave":
        addArc(54, 205, 335, colors[0], 16);
        addArc(38, 205, 335, colors[1], 8, 0);
        for (let i = 0; i < 9; i++) addFlame(Phaser.Math.Between(-34, 34), Phaser.Math.Between(-15, 15), colors[i % 3], 9, 22, 0);
        break;
      case "flare-uppercut":
        addArc(35, 205, 335, colors[0], 10, -90);
        for (let i = 0; i < 12; i++) addFlame(Phaser.Math.Between(-28, 28), 20 + i * 2, colors[i % 3], 8, 28, -18);
        break;
      case "flash-barrage":
        for (let i = 0; i < 5; i++) addBolt(Phaser.Math.Between(-42, 42), Phaser.Math.Between(-34, 34), colors[i % 3], 30 + i * 3);
        break;
      case "skywheel":
        addArc(42, 25, 155, colors[1], 9, -35);
        addArc(58, 205, 330, colors[0], 6, 55);
        break;
      case "thunder-orb": {
        const orb = this.add.circle(x, y, 19, colors[1], 0.42).setStrokeStyle(5, colors[0], 1).setDepth(27);
        this.tweens.add({ targets: orb, scale: 2.6, alpha: 0, duration: 420, onComplete: () => orb.destroy() });
        for (let i = 0; i < 6; i++) addBolt(Math.cos(i * Math.PI / 3) * 28, Math.sin(i * Math.PI / 3) * 28, colors[i % 3], 22);
        break;
      }
      case "storm-burst":
        for (let i = 0; i < 10; i++) addBolt(Math.cos(i * Math.PI / 5) * 32, Math.sin(i * Math.PI / 5) * 26, colors[i % 3], 38);
        break;
      case "thunder-roll":
        for (let i = 0; i < 7; i++) {
          const streak = this.add.ellipse(x - i * 8, y + Phaser.Math.Between(-18, 18), 34, 5, colors[i % 3], 0.95)
            .setDepth(27).setAngle(Phaser.Math.Between(-10, 10));
          this.tweens.add({ targets: streak, x: streak.x - 62, scaleX: 0.1, alpha: 0, duration: 310,
            onComplete: () => streak.destroy() });
        }
        break;
      case "wild-fang":
        [-1, 0, 1].forEach((side, i) => addArc(28 + i * 12, 210, 330, colors[i % 3], 7, side * 18));
        break;
      default:
        addArc(38, 205, 335, colors[1], 9);
        break;
    }
  }

  spawnSnowballParticles(x, y, kind = "freeze", count = 12, scale = 1, elementId = this.powerType) {
    // Legacy snowball call sites now use the same compact, element-aware
    // renderer, removing the old generic blue star/dot particle cloud.
    this.spawnElementParticles(x, y, elementId, count, scale, kind);
  }

  spawnElementParticles(x, y, elementId = this.powerType, count = 12, scale = 1, attackVariant = "default") {
    const element = getElement(elementId || "fire");
    const colors = {
      fire: [0xffe45c, 0xff7628], ice: [0xffffff, 0x8beaff],
      lightning: [0xffffff, 0xffdf4d], water: [0xeaffff, 0x32b9f2],
      nature: [0xeaffb5, 0x55bd58], wind: [0xffffff, 0x9cefe0],
      earth: [0xffd29a, 0x9b6338], light: [0xffffff, 0xffdc55],
      shadow: [0xc9a9ff, 0x392354], plasma: [0xffe4fb, 0xff4f9b],
    };
    const palette = colors[element.id] || colors.fire;
    const powerLevel = Phaser.Math.Clamp(this.particlePowerLevel || 1, 1, this.particlePowerMaxLevel || 20);
    const upgrade = (powerLevel - 1) / 19;
    // One lightweight Graphics object per burst replaces dozens/hundreds of
    // individual display objects, per-particle tweens and extra glow objects.
    const shapeCount = Math.min(element.id === "fire" ? 7 : 5, Math.max(2, Math.ceil(count / 5)));
    const graphic = this.add.graphics().setPosition(x, y).setDepth(25);
    const size = Phaser.Math.Clamp(7 * scale * (1 + upgrade * 0.22), 5, 12);
    for (let i = 0; i < shapeCount; i++) {
      const ox = Phaser.Math.Between(-9, 9);
      const oy = Phaser.Math.Between(-9, 9);
      const color = palette[i % palette.length];
      const s = size * Phaser.Math.FloatBetween(0.8, 1.2);
      graphic.lineStyle(Math.max(1.5, s * 0.22), color, 1);
      graphic.fillStyle(color, 0.96);
      switch (element.id) {
        case "fire":
          graphic.fillPoints([{x:ox-s*0.55,y:oy+s},{x:ox-s*0.35,y:oy},{x:ox,y:oy-s*1.45},{x:ox+s*0.2,y:oy-s*0.35},{x:ox+s*0.62,y:oy-s*0.85},{x:ox+s*0.58,y:oy+s}], true);
          break;
        case "ice":
          for (let arm = 0; arm < 6; arm++) {
            const a = arm * Math.PI / 3;
            const ex = ox + Math.cos(a) * s;
            const ey = oy + Math.sin(a) * s;
            graphic.lineBetween(ox, oy, ex, ey);
            graphic.lineBetween(ex, ey, ex - Math.cos(a - 0.55) * s * 0.38, ey - Math.sin(a - 0.55) * s * 0.38);
            graphic.lineBetween(ex, ey, ex - Math.cos(a + 0.55) * s * 0.38, ey - Math.sin(a + 0.55) * s * 0.38);
          }
          break;
        case "lightning":
          graphic.beginPath();
          graphic.moveTo(ox - s * 0.2, oy - s);
          graphic.lineTo(ox + s * 0.45, oy - s * 0.15);
          graphic.lineTo(ox - s * 0.12, oy + s * 0.05);
          graphic.lineTo(ox + s * 0.28, oy + s);
          graphic.strokePath();
          break;
        case "water":
          graphic.fillPoints([{x:ox,y:oy-s*1.3},{x:ox+s*0.7,y:oy-s*0.05},{x:ox+s*0.62,y:oy+s*0.65},{x:ox,y:oy+s},{x:ox-s*0.62,y:oy+s*0.65},{x:ox-s*0.7,y:oy-s*0.05}], true);
          graphic.lineStyle(1.5, 0xffffff, 0.95);
          graphic.lineBetween(ox - s * 0.18, oy - s * 0.35, ox - s * 0.35, oy + s * 0.25);
          break;
        case "nature":
          graphic.fillPoints([{x:ox,y:oy-s*1.2},{x:ox+s*0.9,y:oy-s*0.25},{x:ox+s*0.45,y:oy+s*0.75},{x:ox,y:oy+s*1.1},{x:ox-s*0.65,y:oy+s*0.3},{x:ox-s*0.75,y:oy-s*0.45}], true);
          graphic.lineStyle(1.5, 0xf4ffe0, 1);
          graphic.lineBetween(ox, oy - s, ox, oy + s * 0.85);
          break;
        case "wind":
          for (let line = 0; line < 3; line++) {
            const yy = oy + (line - 1) * s * 0.55;
            graphic.beginPath();
            graphic.moveTo(ox - s, yy + s * 0.2);
            graphic.lineTo(ox - s * 0.25, yy - s * 0.2);
            graphic.lineTo(ox + s * 0.35, yy - s * 0.2);
            graphic.lineTo(ox + s, yy + s * 0.15);
            graphic.strokePath();
          }
          break;
        case "earth":
          graphic.fillPoints([{x:ox-s,y:oy-s*0.25},{x:ox-s*0.25,y:oy-s},{x:ox+s*0.75,y:oy-s*0.55},{x:ox+s,y:oy+s*0.45},{x:ox+s*0.05,y:oy+s},{x:ox-s*0.8,y:oy+s*0.55}], true);
          break;
        case "light": {
          const points = [];
          for (let p = 0; p < 10; p++) {
            const a = -Math.PI / 2 + p * Math.PI / 5;
            const r = p % 2 === 0 ? s * 1.2 : s * 0.48;
            points.push({x:ox + Math.cos(a) * r,y:oy + Math.sin(a) * r});
          }
          graphic.fillPoints(points, true);
          break;
        }
        case "shadow":
          graphic.beginPath();
          graphic.moveTo(ox + s * 0.75, oy - s * 0.85);
          graphic.lineTo(ox - s * 0.15, oy - s * 0.9);
          graphic.lineTo(ox - s, oy - s * 0.1);
          graphic.lineTo(ox - s * 0.45, oy + s * 0.85);
          graphic.lineTo(ox + s * 0.75, oy + s * 0.65);
          graphic.strokePath();
          break;
        default:
          graphic.fillPoints([{x:ox,y:oy-s*1.2},{x:ox+s*0.4,y:oy-s*0.35},{x:ox+s*1.1,y:oy},{x:ox+s*0.35,y:oy+s*0.3},{x:ox,y:oy+s*1.2},{x:ox-s*0.35,y:oy+s*0.3},{x:ox-s*1.1,y:oy},{x:ox-s*0.4,y:oy-s*0.35}], true);
          break;
      }
    }
    // A restrained elemental signature makes impacts and kicks readable
    // without spawning separate sprites or a large particle cloud.
    if (attackVariant === "impact" || attackVariant === "kick") {
      const edge = element.edge || 0xffffff;
      const glow = element.glow || palette[0];
      graphic.lineStyle(2.5 * scale, edge, 0.9);
      graphic.strokeCircle(0, 0, (attackVariant === "kick" ? 13 : 10) * scale);
      graphic.lineStyle(1.5 * scale, glow, 0.85);
      for (let ray = 0; ray < 4; ray++) {
        const a = ray * Math.PI / 2 + 0.35;
        const r1 = 12 * scale, r2 = (attackVariant === "kick" ? 23 : 19) * scale;
        graphic.lineBetween(Math.cos(a) * r1, Math.sin(a) * r1, Math.cos(a) * r2, Math.sin(a) * r2);
      }
    } else if (attackVariant === "trail" || attackVariant === "roll") {
      graphic.lineStyle(2 * scale, element.trail || palette[0], 0.72);
      graphic.lineBetween(-13 * scale, -4 * scale, 7 * scale, -4 * scale);
      graphic.lineBetween(-10 * scale, 3 * scale, 5 * scale, 3 * scale);
    }
    const angle = Phaser.Math.FloatBetween(-Math.PI, Math.PI);
    const travel = Phaser.Math.Between(18, 42) * scale;
    const duration = attackVariant === "kick" ? 240 : attackVariant === "impact" ? 330 : 300;
    this.tweens.add({
      targets: graphic,
      x: x + Math.cos(angle) * travel,
      y: y + Math.sin(angle) * travel - (element.id === "fire" ? 12 : 0),
      alpha: 0,
      scale: 0.45,
      angle: Phaser.Math.Between(-35, 35),
      duration,
      ease: "Cubic.easeOut",
      onComplete: () => graphic.destroy(),
    });
  }

  createElementBall(x, y, palette) {
    // Cached high-resolution elemental emblems keep the rolling ball crisp while
    // avoiding per-enemy Graphics trees and expensive runtime drawing.
    const textureKey = `element-ball-${palette.id}`;
    if (!this.textures.exists(textureKey)) {
      const g = this.make.graphics({ x: 0, y: 0, add: false });
      const base = palette.ball;
      const edge = palette.edge;
      const glow = palette.glow;
      const points = (values) => values.map(([px, py]) => ({ x: 48 + px, y: 48 + py }));
      g.fillStyle(glow, 0.22); g.fillCircle(48, 48, 46);
      g.lineStyle(3, edge, 0.72); g.strokeCircle(48, 48, 42);
      g.fillStyle(base, 1); g.fillCircle(48, 48, 35);
      g.fillStyle(edge, 0.2); g.fillCircle(38, 34, 24);
      g.lineStyle(4, edge, 1); g.strokeCircle(48, 48, 34);
      g.lineStyle(2, 0xffffff, 0.72); g.beginPath(); g.arc(48, 48, 29, -2.65, -1.15, false); g.strokePath();
      g.fillStyle(0xffffff, 0.88); g.fillEllipse(34, 29, 10, 5);
      g.lineStyle(3, edge, 1); g.fillStyle(edge, 0.96);
      switch (palette.id) {
        case "fire":
          g.fillPoints(points([[-19,18],[-17,-4],[-7,-18],[-2,-5],[9,-27],[14,-8],[23,8],[14,23],[-12,23]]), true);
          g.fillStyle(0xfff5bf, 1); g.fillPoints(points([[-7,17],[-3,1],[4,10],[10,-6],[12,17]]), true);
          break;
        case "ice":
          for (let n=0;n<6;n++){const a=n*Math.PI/3, ex=48+Math.cos(a)*25, ey=48+Math.sin(a)*25;g.lineBetween(48,48,ex,ey);g.lineBetween(ex,ey,ex-Math.cos(a-0.55)*9,ey-Math.sin(a-0.55)*9);g.lineBetween(ex,ey,ex-Math.cos(a+0.55)*9,ey-Math.sin(a+0.55)*9);}
          g.fillStyle(0xffffff,1);g.fillCircle(48,48,5);
          break;
        case "lightning":
          g.fillPoints(points([[-6,-29],[14,-5],[3,1],[13,27],[-17,0],[-4,-5]]), true);
          g.lineStyle(3,0xffffff,0.9);g.lineBetween(43,22,39,39);
          break;
        case "water":
          g.fillPoints(points([[0,-29],[15,-8],[22,7],[18,20],[7,28],[-7,28],[-18,19],[-21,6],[-13,-9]]), true);
          g.fillStyle(0xffffff,0.95);g.fillEllipse(38,39,8,19);
          g.lineStyle(2,0xffffff,0.9);g.strokeEllipse(48,51,27,30);
          break;
        case "nature":
          g.fillPoints(points([[0,-29],[20,-14],[22,2],[12,19],[0,29],[-15,14],[-22,-3],[-14,-19]]), true);
          g.lineStyle(3,0xf1ffd2,1);g.lineBetween(31,65,65,31);g.lineBetween(43,53,40,39);g.lineBetween(52,44,64,47);
          break;
        case "wind":
          g.lineStyle(7,edge,0.98);g.beginPath();g.moveTo(23,27);g.lineTo(73,27);g.lineTo(65,39);g.moveTo(29,45);g.lineTo(67,45);g.lineTo(59,57);g.moveTo(36,63);g.lineTo(59,63);g.lineTo(53,73);g.strokePath();
          g.lineStyle(3,0xffffff,0.9);g.beginPath();g.moveTo(30,19);g.lineTo(70,19);g.strokePath();
          break;
        case "earth":
          g.fillPoints(points([[-27,-10],[-12,-27],[8,-23],[27,-6],[20,18],[2,28],[-23,15]]), true);
          g.lineStyle(3,edge,1);g.lineBetween(35,31,48,48);g.lineBetween(48,48,66,35);g.lineBetween(48,48,58,70);
          break;
        case "light": {
          const star=[];for(let n=0;n<10;n++){const a=-Math.PI/2+n*Math.PI/5,r=n%2?12:29;star.push({x:48+Math.cos(a)*r,y:48+Math.sin(a)*r});}
          g.fillPoints(star,true);g.lineStyle(3,0xffffff,0.95);g.strokeCircle(48,48,12);break;
        }
        case "shadow":
          g.fillPoints(points([[20,-25],[3,-29],[-16,-18],[-25,1],[-18,21],[-1,29],[20,19],[5,13],[-2,1],[3,-12]]),true);
          g.lineStyle(3,edge,0.9);g.beginPath();g.arc(48,48,25,-1.5,1.55,false);g.strokePath();
          break;
        default:
          g.fillPoints(points([[0,-30],[10,-12],[28,-3],[13,7],[5,29],[-8,12],[-28,3],[-11,-9]]),true);
          g.fillStyle(0xffffff,0.95);g.fillCircle(48,48,7);g.lineStyle(3,edge,0.9);g.strokeCircle(48,48,20);
          break;
      }
      g.generateTexture(textureKey, 96, 96);
      g.destroy();
    }
    const ball = this.add.image(x, y, textureKey).setDepth(16).setDisplaySize(56, 56);
    ball.setData("elementId", palette.id);
    ball.setData("motionStyle", ({
      fire: "flame", ice: "ice-roll", lightning: "spark-dash", water: "flow",
      nature: "leaf-roll", wind: "twister", earth: "rock-roll", light: "radiant",
      shadow: "shade", plasma: "plasma"
    })[palette.id] || "plasma");
    this.tweens.add({ targets: ball, scale: 1.08, duration: 260, yoyo: true, ease: "Sine.easeInOut" });
    this.spawnElementParticles(x, y, palette.id, 4, 0.55);
    return ball;
  }

  spawnElementBallEffects(x, y, elementId, kind = "trail", scale = 1) {
    // Reuse the same batched, low-object-count renderer for kick, trail and impact.
    const count = kind === "kick" ? 8 : kind === "impact" ? 6 : 3;
    this.spawnElementParticles(x, y, elementId, count, scale, kind);
  }

  recordEnemyDefeat(enemy) {
    if (!enemy?.active || enemy.getData("defeatCounted")) return false;
    enemy.setData("defeatCounted", true);
    // The time-hunter is a timed bonus threat, not part of the stage's quota.
    if (enemy.getData("isTimeHunter")) return true;
    if (enemy.getData("isBossAttendant")) {
      if (!this.bossDefeated) this.time.delayedCall(90, () => this.replenishBossAttendants());
      return true;
    }
    this.defeated = Math.min(this.stageEnemyCount, this.defeated + 1);
    this.enemyLabel?.setText(`ENEMIES: ${this.defeated}/${this.stageEnemyCount}`);
    return true;
  }

  playEnemyReactionAnimation(enemy, state) {
    const visual = enemy?.getData("visual");
    const sprite = visual?.getData("authoredSprite");
    const approvedArtSprite = visual?.getData("approvedArtSprite");
    const archetypeId = enemy?.getData("enemyArchetypeId");
    const key = `enemy-${archetypeId}-${state}`;
    if (!visual?.active) return null;
    visual.setVisible(true).setAlpha(1);
    if (state === "attack" && approvedArtSprite?.active) {
      // Give single-frame cutouts a distinct anticipation/strike pose without
      // changing enemy physics, attack timing, or collision behaviour.
      visual.setData("approvedAttackStartedAt", this.time.now);
      visual.setData("approvedAttackUntil", this.time.now + 280);
    }
    if (!sprite?.active || !this.anims.exists(key)) return approvedArtSprite?.active ? visual : null;
    sprite.play(key, true);
    return visual;
  }

  hitEnemy(projectile, enemy) {
    if (!projectile.active || !enemy.active || enemy.getData("defeatCounted")) return;
    if (enemy.getData("frozen") || enemy.getData("rolling")) {
      const blockedGlow = projectile.getData("glow");
      const blockedTrail = projectile.getData("trail");
      if (blockedGlow?.active) blockedGlow.destroy();
      if (blockedTrail?.active) blockedTrail.destroy();
      projectile.destroy();
      return;
    }
    const projectilePower = projectile.getData("powerType") || this.powerType;
    // The frozen shape follows the power that hit it, not a random enemy tint.
    const ballElement = getElement(projectilePower);
    const hitPalette = { id: ballElement.id, effect: ballElement.effect, ball: ballElement.ball,
      edge: ballElement.edge, glow: ballElement.glow, trail: ballElement.trail };
    this.audio.play("ballImpact");
    this.spawnElementParticles(enemy.x, enemy.y - 10, projectilePower, 18, 1.1);
    const superHit = !!projectile.getData("superAttack");
    const specialHit = !!projectile.getData("specialAttack");
    const glow = projectile.getData("glow");
    const trail = projectile.getData("trail");
    if (glow && glow.active) glow.destroy();
    if (trail && trail.active) trail.destroy();
    projectile.destroy();

    if (enemy.getData("isBoss")) {
      this.hitBoss(enemy, superHit ? 4 : specialHit ? 3 : 1);
      return;
    }
    const hits = (enemy.getData("hitCount") || 0) + (superHit || specialHit ? 2 : 1);
    enemy.setData("hitCount", hits);
    this.addScore(100);
    const visual = enemy.getData("visual");
    if (hits === 1) {
      enemy.setData("frozen", true); enemy.setVelocity(0, 0);
      const hitVisual = this.playEnemyReactionAnimation(enemy, "hit");
      const approvedHitSprite = visual?.getData("approvedArtSprite");
      if (approvedHitSprite?.active) {
        // Static approved cutouts still get a readable impact reaction while
        // the original atlas animation remains available for non-cutout enemies.
        this.tweens.add({
          targets: approvedHitSprite,
          scaleX: approvedHitSprite.scaleX * 0.82,
          scaleY: approvedHitSprite.scaleY * 1.12,
          angle: enemy.x < this.hero.x ? -8 : 8,
          y: approvedHitSprite.y + 5,
          duration: 105,
          yoyo: true,
          ease: "Sine.easeOut",
        });
      }
      if (hitVisual) {
        this.time.delayedCall(230, () => {
          if (enemy.active && hitVisual.active && enemy.getData("frozen")) hitVisual.setVisible(false);
        });
      } else if (visual?.active) visual.setVisible(false);
      const palette = hitPalette;
      this.spawnSnowballParticles(enemy.x, enemy.y, "freeze", 18, 1.1, hitPalette.id);
      const ball = this.createElementBall(enemy.x, enemy.y, palette);
      const powerTier = enemy.getData("snowballPowerTier") || 1;
      ball.setScale(1.15 + Math.min(20, powerTier) * 0.018);
      enemy.setData("elementBall", ball);
      enemy.setData("ballPalette", palette);
      this.tweens.add({ targets: ball, scale: 1.18, duration: 180, yoyo: true });
      if (!this.snowballTutorialShown) {
        this.snowballTutorialShown = true;
        this.statusLabel.setText("FROZEN! MOVE CLOSE AND TAP FIRE TO KICK").setColor("#9feaff");
      }
    } else {
      const ball = enemy.getData("elementBall");
      if (ball?.active) { ball.setScale(1 + hits * 0.12); this.tweens.add({ targets: ball, angle: ball.angle + 18, duration: 90, yoyo: true }); }
    }
    const burst = this.add.circle(enemy.x, enemy.y, 20 + hits * 5,
      hits === 1 ? hitPalette.glow : hitPalette.edge, 0.82)
      .setStrokeStyle(3, 0xffffff).setDepth(18);
    this.tweens.add({ targets: burst, scale: 2.4, alpha: 0, duration: 230,
      onComplete: () => burst.destroy() });
    this.spawnElementBallEffects(enemy.x, enemy.y, hitPalette.id, "impact", 0.9);

    if (enemy.getData("frozen") || !visual || !visual.active) {
      if (hits >= 3) {
        const ball = enemy.getData("elementBall");
        if (ball?.active) this.tweens.add({ targets: ball, scale: 1.9, alpha: 0, duration: 220, onComplete: () => ball.destroy() });
        this.spawnSnowballParticles(enemy.x, enemy.y, "impact", 24, 1.2, hitPalette.id);
        const pop = this.add.circle(enemy.x, enemy.y, 28, hitPalette.edge, 0.9).setStrokeStyle(4, 0xffffff).setDepth(20);
        this.spawnElementParticles(enemy.x, enemy.y, hitPalette.id, 24, 1.25);
        this.tweens.add({ targets: pop, scale: 3.2, alpha: 0, duration: 260, onComplete: () => pop.destroy() });
        this.audio.play("defeat");
        const defeatVisual = this.playEnemyReactionAnimation(enemy, "defeat");
        if (defeatVisual) {
          this.tweens.add({ targets: defeatVisual, alpha: 0, scale: 0.42, angle: 18, duration: 320,
            onComplete: () => { if (defeatVisual.active) defeatVisual.destroy(); } });
        }
        this.dropReward(enemy.x, enemy.y); this.addScore(500); this.recordEnemyDefeat(enemy); enemy.destroy();
        this.statusLabel.setText("ELEMENTAL ORB POPPED!"); this.statusLabel.setColor("#62ffb4");
      }
      return;
    }
    const damage = visual.getData("damageParts");
    if (hits === 1) {
      if (damage.hornL?.active) damage.hornL.destroy();
      this.statusLabel.setText("SUPER FIRE HIT!");
      this.statusLabel.setColor("#ffe17a");
      this.tweens.add({ targets: visual, x: visual.x + this.facing * 12,
        angle: 7, duration: 65, yoyo: true });
      return;
    }
    if (hits === 2) {
      if (damage.hornR?.active) damage.hornR.destroy();
      if (damage.armR?.active) damage.armR.destroy();
      this.statusLabel.setText("ENEMY BADLY DAMAGED!");
      this.statusLabel.setColor("#ffad5c");
      this.tweens.add({ targets: visual, angle: 14,
        duration: 75, yoyo: true, repeat: 1 });
      return;
    }

    const finalBurst = this.add.circle(enemy.x, enemy.y, 28, 0xffd45e, 1)
      .setStrokeStyle(5, 0xffffff).setDepth(20);
    this.tweens.add({ targets: finalBurst, scale: 3.8, alpha: 0,
      duration: 320, onComplete: () => finalBurst.destroy() });
    const defeatVisual = this.playEnemyReactionAnimation(enemy, "defeat");
    if (defeatVisual) {
      this.tweens.add({ targets: defeatVisual, alpha: 0, scale: 0.42, angle: 18, duration: 320,
        onComplete: () => { if (defeatVisual.active) defeatVisual.destroy(); } });
    } else if (visual.active) visual.destroy();
    this.audio.play("defeat");
    this.dropReward(enemy.x, enemy.y);
    this.addScore(500);
    this.recordEnemyDefeat(enemy);
    enemy.destroy();
    this.statusLabel.setText("ENEMY DEFEATED!");
    this.statusLabel.setColor("#62ffb4");

  }

  createBossVisual(enemy) {
    const c = this.add.container(enemy.x, enemy.y).setDepth(11);
    const shadow = this.add.ellipse(0, 44, 112, 22, 0x11152a, 0.38);
    const legL = this.add.ellipse(-27, 28, 30, 34, 0x463044);
    const legR = this.add.ellipse(27, 28, 30, 34, 0x463044);
    const footL = this.add.ellipse(-31, 44, 38, 17, 0x34263c);
    const footR = this.add.ellipse(31, 44, 38, 17, 0x34263c);
    const armL = this.add.ellipse(-57, -1, 25, 55, 0x9b3e65);
    const armR = this.add.ellipse(57, -1, 25, 55, 0x9b3e65);
    const bossColor = this.stageConfig.boss?.color || 0xb94770;
    const bossElement = this.stageConfig.boss?.element || "fire";
    const bossStyle = this.stageConfig.boss?.style || "";
    const bossId = this.stageConfig.boss?.id || "";
    const isBoxer = bossId === "iron-comet" || bossStyle.includes("boxing");
    const isAgile = bossId === "gale-talon" || bossStyle.includes("agile");
    const isMaster = bossId === "suncrest" || bossStyle.includes("master");
    const isFinal = bossId === "void-sovereign" || bossStyle.includes("final");
    const isGatekeeper = bossId === "gatekeeper" || bossStyle.includes("grappler");
    const bossElementPalette = getElement(bossElement);
    const fistL = this.add.circle(-62, 24, isBoxer ? 23 : 17,
      isBoxer ? 0x5a2638 : bossElementPalette.color)
      .setStrokeStyle(isBoxer ? 5 : 2, bossElementPalette.edge);
    const fistR = this.add.circle(62, 24, isBoxer ? 23 : 17,
      isBoxer ? 0x5a2638 : bossElementPalette.color)
      .setStrokeStyle(isBoxer ? 5 : 2, bossElementPalette.edge);
    const aura = this.add.circle(0, -8, 83, bossElementPalette.glow, 0.13)
      .setStrokeStyle(5, bossElementPalette.edge, 0.8);
    const body = this.add.ellipse(0, -8, isAgile ? 100 : isGatekeeper ? 142 : isFinal ? 132 : 124,
      isAgile ? 124 : isGatekeeper ? 104 : isFinal ? 126 : 112, bossColor).setStrokeStyle(5, 0x30243f);
    const belly = this.add.ellipse(0, 12, 72, 58, 0xf2b77e);
    const bellyMark = this.add.ellipse(0, 15, 39, 31, 0xffd69b, 0.75);
    const headband = this.add.rectangle(0, -62, isMaster ? 108 : 94, isFinal ? 15 : 9, isFinal ? 0x9d83ff : 0xffd36b).setStrokeStyle(2, 0x8c4a3c);
    const hornL = this.add.triangle(-51, -56, -4, -8, 12, 0, -18, 23, 0xffd36b).setStrokeStyle(2, 0x8c4a3c);
    const hornR = this.add.triangle(51, -56, -12, 0, 4, -8, 18, 23, 0xffd36b).setStrokeStyle(2, 0x8c4a3c);
    const browL = this.add.rectangle(-23, -28, 28, 8, 0x49243d).setAngle(-12);
    const browR = this.add.rectangle(23, -28, 28, 8, 0x49243d).setAngle(12);
    const eyeL = this.add.ellipse(-23, -12, 25, 29, 0xffffff);
    const eyeR = this.add.ellipse(23, -12, 25, 29, 0xffffff);
    const pupilL = this.add.circle(-18, -10, 7, 0x251b31);
    const pupilR = this.add.circle(28, -10, 7, 0x251b31);
    const nose = this.add.ellipse(0, 5, 20, 15, 0x8b3458);
    const mouth = this.add.arc(0, 17, 17, 15, 165, false, 0x54243d).setStrokeStyle(4, 0x54243d);
    const orbitA = this.add.circle(-72, -18, isFinal ? 13 : 9, bossColor, 0.95).setStrokeStyle(2, 0xffffff);
    const orbitB = this.add.circle(72, -18, isFinal ? 13 : 9, bossColor, 0.95).setStrokeStyle(2, 0xffffff);
    const styleDetails = [];
    if (isGatekeeper) {
      styleDetails.push(
        this.add.ellipse(-55, -22, 36, 54, 0x6f8295).setStrokeStyle(4, 0xd8e6f2),
        this.add.ellipse(55, -22, 36, 54, 0x6f8295).setStrokeStyle(4, 0xd8e6f2),
        this.add.rectangle(0, -76, 112, 13, 0x8da5b8).setStrokeStyle(3, 0xe4f4ff),
        this.add.circle(0, -76, 10, 0xffd36b).setStrokeStyle(2, 0xffffff)
      );
    } else if (isBoxer) {
      styleDetails.push(
        this.add.rectangle(-62, 4, 31, 8, 0xffd36b),
        this.add.rectangle(62, 4, 31, 8, 0xffd36b)
      );
    } else if (isAgile) {
      [-1, 0, 1].forEach((n) => {
        styleDetails.push(
          this.add.triangle(-79 - n * 3, 23 + n * 7, 0, -5, 24, 0, 0, 5, 0xe8f7ff).setAngle(-18),
          this.add.triangle(79 + n * 3, 23 + n * 7, 0, -5, 24, 0, 0, 5, 0xe8f7ff).setAngle(198)
        );
      });
    } else if (isMaster) {
      styleDetails.push(
        this.add.rectangle(0, 36, 112, 9, 0xffd36b).setAngle(-7),
        this.add.triangle(40, 43, -5, -2, 23, 4, -8, 30, 0xf4e6c8)
      );
    } else if (isFinal) {
      [-1, 0, 1].forEach((n) => styleDetails.push(
        this.add.triangle(n * 25, -86, -12, 12, 0, -22, 12, 12, 0x9d83ff).setStrokeStyle(2, 0xe7dcff)
      ));
      styleDetails.push(this.add.circle(0, -8, 94, 0x7555d8, 0.08).setStrokeStyle(3, 0xc7aaff));
    }
    const elementPalette = {
      fire: { trim: 0xff9a52, dark: 0x73344a, glow: 0xffd06b },
      ice: { trim: 0xb9f2ff, dark: 0x416b91, glow: 0xffffff },
      lightning: { trim: 0xf4e17a, dark: 0x514a88, glow: 0xd9c6ff },
      water: { trim: 0x8bdcff, dark: 0x245b83, glow: 0xe0fbff },
      nature: { trim: 0x9ce58b, dark: 0x315f4b, glow: 0xe3ffc0 },
      wind: { trim: 0xb5f5e8, dark: 0x3c6978, glow: 0xffffff },
      earth: { trim: 0xe0b27a, dark: 0x684b3c, glow: 0xffe0a0 },
      light: { trim: 0xfff0a3, dark: 0x8b713e, glow: 0xffffff },
      shadow: { trim: 0xc7a8ff, dark: 0x38294f, glow: 0xe5d9ff },
      plasma: { trim: 0xff9bd8, dark: 0x703d78, glow: 0xffd6f1 },
    };
    const palette = elementPalette[bossElement] || elementPalette.fire;
    const cape = this.add.triangle(0, 30, -48, -8, 48, -8, 0, 118, palette.dark, 0.96)
      .setStrokeStyle(4, palette.trim, 0.9);
    const chestPlate = this.add.triangle(0, -2, -37, -24, 37, -24, 0, 38, palette.trim, 0.92)
      .setStrokeStyle(3, palette.glow, 0.85);
    const chestInset = this.add.ellipse(0, 7, 48, 42, palette.dark, 0.9)
      .setStrokeStyle(2, palette.glow, 0.9);
    const armorRidges = [-1, 1].map((side) =>
      this.add.triangle(side * 49, -31, -13, 8, 0, -20, 15, 8, palette.trim)
        .setStrokeStyle(2, palette.glow, 0.85).setAngle(side * 90)
    );
    const cheekMarks = [-1, 1].map((side) =>
      this.add.triangle(side * 37, -5, -7, -5, 7, -5, 0, 13, palette.trim, 0.9)
    );
    const crownGem = this.add.star(0, -79, 4, 7, 13, palette.glow, 0.98)
      .setStrokeStyle(2, palette.trim, 0.95);
    const chestEmblem = this.add.star(0, 5, isFinal ? 8 : 6, isFinal ? 7 : 5, isFinal ? 25 : 18,
      isFinal ? 0xe5d5ff : 0xffd36b, 0.95).setStrokeStyle(3, bossColor, 0.95);
    const shoulderL = this.add.ellipse(-55, -25, 39, 24, isFinal ? 0x6550a6 : 0x6b5266)
      .setStrokeStyle(3, 0xffd36b, 0.9);
    const shoulderR = this.add.ellipse(55, -25, 39, 24, isFinal ? 0x6550a6 : 0x6b5266)
      .setStrokeStyle(3, 0xffd36b, 0.9);
    const belt = this.add.rectangle(0, 39, 91, 10, isFinal ? 0x332b58 : 0x4c3347)
      .setStrokeStyle(2, 0xffd36b, 0.95);
    const beltGem = this.add.star(0, 39, 5, 4, 10, bossElement === "shadow" ? 0xc5a8ff : 0xffe17a)
      .setStrokeStyle(2, 0xffffff, 0.9);
    c.add([aura, shadow, cape, orbitA, orbitB, legL, legR, footL, footR, armL, armR,
      shoulderL, shoulderR, armorRidges[0], armorRidges[1], fistL, fistR, body, belly,
      chestPlate, chestInset, bellyMark, chestEmblem, cheekMarks[0], cheekMarks[1],
      headband, crownGem, hornL, hornR, browL, browR, eyeL, eyeR,
      pupilL, pupilR, nose, mouth, belt, beltGem, ...styleDetails]);
    this.tweens.add({ targets: aura, scale: 1.16, alpha: 0.28, duration: bossElement === "lightning" ? 260 : 700, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: orbitA, x: -86, y: -48, duration: bossElement === "ice" ? 620 : 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    this.tweens.add({ targets: orbitB, x: 86, y: -48, duration: bossElement === "shadow" ? 620 : 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    c.setData("parts", { shadow, legL, legR, footL, footR, armL, armR,
      fistL, fistR, body, belly, pupilL, pupilR, aura, chestEmblem, chestInset,
      cape, armorRidges, crownGem, cheekMarks,
      shoulderL, shoulderR, belt, beltGem, headband, orbitA, orbitB });
    const bossSheetId = bossId || (isGatekeeper ? "gatekeeper" : isBoxer ? "iron-comet"
      : isAgile ? "gale-talon" : isMaster ? "suncrest" : "void-sovereign");
    c.list.forEach((part) => part.setVisible(part === shadow));
    // Approved boss cutouts are single-frame base artwork; action motion stays in Phaser tweens.
    const bossSprite = this.add.image(0, -22, `boss-image-${bossSheetId}`)
      .setDisplaySize(150, 150);
    c.add(bossSprite);
    // Living idle motion for the approved single-frame boss artwork.
    this.tweens.add({
      targets: bossSprite,
      y: isAgile ? -27 : -25,
      scaleX: isFinal ? 1.045 : 1.025,
      scaleY: isFinal ? 0.975 : 0.985,
      duration: isBoxer ? 520 : isAgile ? 430 : isFinal ? 820 : 680,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    c.setData("authoredSprite", bossSprite);
    c.setData("bossSheetId", bossSheetId);
    return c;
  }


  countBossAttendants() {
    return this.enemies?.getChildren().filter((enemy) =>
      enemy.active && enemy.getData("isBossAttendant") && !enemy.getData("defeatCounted")
    ).length || 0;
  }

  spawnBossAttendantPair() {
    if (this.gameOver || this.bossDefeated || !this.boss?.active) return 0;
    const current = this.countBossAttendants();
    const waveSize = getBossAttendantWaveSize(current);
    if (waveSize <= 0) return 0;
    const region = getPremiumEnemyRegion(this.stageNumber);
    const eliteRoster = region.enemies.filter((entry) => entry.tier !== "common");
    const palette = getElement(this.stageConfig.boss?.element || "fire");
    const colors = [palette.color, palette.glow];
    const horns = [palette.edge, 0xffffff];
    let spawned = 0;
    for (let slot = 0; slot < waveSize && current + spawned < BOSS_ATTENDANT_MAX_ACTIVE; slot++) {
      const rosterIndex = (this.bossAttendantSerial || 0) % eliteRoster.length;
      const archetype = eliteRoster[rosterIndex];
      this.bossAttendantSerial = (this.bossAttendantSerial || 0) + 1;
      const x = slot === 0 ? 235 : 725;
      const enemy = this.enemies.create(x, -42, `enemy${(this.bossAttendantSerial + 1) % 3}`);
      enemy.setDepth(9).setBounce(0).setCollideWorldBounds(true);
      enemy.body.setAllowGravity(true);
      enemy.setScale(1.42);
      enemy.setData("isBossAttendant", true);
      enemy.setData("enemyName", archetype.name);
      enemy.setData("enemyArchetypeId", archetype.id);
      enemy.setData("enemyRole", archetype.role);
      enemy.setData("enemyTier", "boss-attendant");
      enemy.setData("enemyClass", archetype.role === "shield" || archetype.role === "heavy" ? "heavy" : "special");
      enemy.setData("baseTexture", `enemy${(this.bossAttendantSerial + 1) % 3}`);
      enemy.setData("frozen", false);
      enemy.setData("hitCount", 0);
      enemy.setData("enemyPowerType", this.stageConfig.boss?.element || "fire");
      enemy.setData("snowballPowerTier", 4);
      const roleAi = { runner: "runner", leaper: "jumper", flying: "flyer", ambusher: "ambusher", ranged: "ranged", bomber: "bomber", illusionist: "ambusher", summoner: "summoner", shield: "guard", heavy: "chaser", charger: "charger" };
      const aiType = roleAi[archetype.role] || "charger";
      enemy.setData("aiType", aiType);
      enemy.setData("aiState", ["runner", "charger", "ambusher", "bomber"].includes(aiType) ? "tell" : "patrol");
      enemy.setData("aiStateUntil", this.time.now + 650);
      enemy.setData("nextRangedAt", this.time.now + 1200);
      enemy.setData("nextBlastAt", this.time.now + 1800);
      if (aiType === "flyer") { enemy.setPosition(x, 220 + slot * 40); enemy.body.setAllowGravity(false); }
      enemy.setData("nextHop", this.time.now + 850);
      enemy.setData("patrolDirection", slot === 0 ? 1 : -1);
      enemy.setData("aiAnim", 0);
      enemy.setVisible(false);
      const visual = this.createEnemyVisual(enemy, colors[slot], horns[slot]);
      visual.setScale(1.42);
      enemy.setData("visualScale", 1.42);
      spawned++;
    }
    return spawned;
  }

  replenishBossAttendants() {
    if (this.gameOver || this.bossDefeated || !this.boss?.active ||
      this.bossAttendantSpawnQueued || getBossAttendantWaveSize(this.countBossAttendants()) <= 0) return;
    this.bossAttendantSpawnQueued = true;
    this.time.delayedCall(520, () => {
      this.bossAttendantSpawnQueued = false;
      if (this.gameOver || this.bossDefeated || !this.boss?.active) return;
      this.spawnBossAttendantPair();
      if (this.countBossAttendants() < 8) this.replenishBossAttendants();
    });
  }

  spawnBoss() {
    if (this.gameOver || this.boss) return;
    const bossIndex = Math.floor(this.stageNumber / 10) - 1;
    if (this.audio.playBossEntrance) this.audio.playBossEntrance(bossIndex);
    else this.audio.play("boss");
    this.bossTitle.setText(this.stageConfig.boss?.name?.toUpperCase() || "BOSS");
    this.statusLabel.setText(`${this.stageConfig.boss?.name || "BOSS"} BATTLE!`);
    this.statusLabel.setColor("#ff6d69");
    this.bossTitle.setVisible(true);
    this.bossBarBack.setVisible(true);
    this.bossBar.setVisible(true);

    const boss = this.enemies.create(480, -100, "enemy0");
    boss.setDepth(10).setCollideWorldBounds(true).setBounce(0);
    boss.setSize(82, 78);
    boss.setOffset(-15, -8);
    boss.setScale(2.15);
    boss.setData("isBoss", true);
    boss.setData("bossJumpAt", this.time.now + 1800);
    boss.setData("bossAttackAt", this.time.now + 1800);
    boss.setData("bossAttackState", "rest");
    boss.setData("bossAttackIndex", 0);
    boss.setData("bossStyle", this.stageConfig.boss?.style || "intro bruiser");
    this.bossPhase = 1;
    this.bossDefeated = false;
    boss.setData("wasAirborne", true);
    boss.setData("bossAnim", 0);
    boss.setVisible(false);
    this.boss = boss;
    this.bossAttendantSerial = 0;
    this.bossAttendantSpawnQueued = false;
    this.bossVisual = this.createBossVisual(boss);
    this.bossVisual.setScale(1.15);
    this.audio.playBossTheme(Math.floor(this.stageNumber / 10) - 1);
    this.time.delayedCall(1250, () => {
      if (!this.bossDefeated && this.boss?.active) {
        this.spawnBossAttendantPair();
        this.replenishBossAttendants();
      }
    });

    const entrancePalette = getElement(this.stageConfig.boss?.element || "fire");
    const entrance = this.add.container(480, 160).setDepth(8);
    const entranceCore = this.add.circle(0, 0, 46, entrancePalette.color, 0.24)
      .setStrokeStyle(4, entrancePalette.edge, 0.95);
    const entranceRing = this.add.circle(0, 0, 66, entrancePalette.glow, 0)
      .setStrokeStyle(5, entrancePalette.edge, 0.92);
    const entranceRune = this.add.star(0, 0, 8, 8, 23, entrancePalette.edge, 0.9)
      .setStrokeStyle(2, 0xffffff, 0.95);
    const bossStyle = this.stageConfig.boss?.style || "";
    const entranceDetails = [];
    if (bossStyle.includes("boxing")) {
      [-1, 1].forEach((side) => {
        const glove = this.add.circle(side * 82, 2, 18, entrancePalette.color, 0.94)
          .setStrokeStyle(4, entrancePalette.edge, 0.98);
        entranceDetails.push(glove);
        this.tweens.add({ targets: glove, x: side * 42, scale: 0.55, alpha: 0, duration: 520, ease: "Cubic.easeIn" });
      });
    } else if (bossStyle.includes("agile")) {
      [-1, 0, 1].forEach((side) => {
        const talon = this.add.star(side * 54, -12 - Math.abs(side) * 15, 5, 5, 16, entrancePalette.color, 0.92)
          .setStrokeStyle(2, entrancePalette.edge, 0.98);
        entranceDetails.push(talon);
        this.tweens.add({ targets: talon, angle: side * 145 + 180, x: side * 22, y: -42, alpha: 0, duration: 620, ease: "Cubic.easeOut" });
      });
    } else if (bossStyle.includes("master")) {
      const sunArc = this.add.arc(0, 0, 91, 205, 335, false, entrancePalette.edge, 0.9)
        .setStrokeStyle(5, entrancePalette.edge, 0.95);
      const sunCore = this.add.star(0, -4, 8, 8, 35, entrancePalette.color, 0.92)
        .setStrokeStyle(2, 0xffffff, 0.95);
      entranceDetails.push(sunArc, sunCore);
      this.tweens.add({ targets: sunArc, angle: 180, alpha: 0, duration: 650, ease: "Cubic.easeOut" });
      this.tweens.add({ targets: sunCore, scale: 1.6, alpha: 0, duration: 620, ease: "Cubic.easeOut" });
    } else if (bossStyle.includes("final")) {
      const eclipse = this.add.circle(0, 0, 86, 0x17152f, 0.92)
        .setStrokeStyle(5, entrancePalette.edge, 0.95);
      const orbit = this.add.ellipse(0, 0, 174, 54, entrancePalette.glow, 0)
        .setStrokeStyle(4, entrancePalette.color, 0.95);
      entranceDetails.push(eclipse, orbit);
      this.tweens.add({ targets: orbit, angle: 220, scaleY: 1.8, alpha: 0, duration: 700, ease: "Cubic.easeOut" });
      this.tweens.add({ targets: eclipse, scale: 0.45, alpha: 0, duration: 680, ease: "Cubic.easeIn" });
    } else {
      [0, 1, 2].forEach((index) => {
        const groundRing = this.add.ellipse(0, 48, 68 + index * 22, 12 + index * 3, entrancePalette.glow, 0)
          .setStrokeStyle(3, entrancePalette.edge, 0.9);
        entranceDetails.push(groundRing);
        this.tweens.add({ targets: groundRing, scaleX: 1.8 + index * 0.35, alpha: 0, duration: 620 + index * 55, delay: index * 45 });
      });
    }
    entrance.add([entranceRing, entranceCore, entranceRune, ...entranceDetails]);
    this.tweens.add({ targets: entrance, scale: 3.2, alpha: 0, angle: 55, duration: 700,
      ease: "Cubic.easeOut", onComplete: () => entrance.destroy() });
    this.cameras.main.shake(500, 0.012);
  }

  hitBoss(boss, damage = 1) {
    if (this.bossDefeated) return;
    this.audio.play("bossHit");
    this.bossHealth = Math.max(0, this.bossHealth - damage);
    this.bossBar.scaleX = this.bossHealth / this.bossMaxHealth;
    const v = this.bossVisual;
    if (v?.active) {
      this.tweens.add({ targets: v, angle: this.facing * 9, scaleX: 1.28,
        duration: 65, yoyo: true, repeat: 1,
        onComplete: () => { if (v.active) { v.setAngle(0); v.setScale(1.15); } } });
    }
    const impactColors = {
      fire: 0xff794d, earth: 0xc58a55, wind: 0x8debdc,
      ice: 0x8deaff, lightning: 0xb18aff, shadow: 0x9b78e8,
      light: 0xffe36a, water: 0x319cff, nature: 0x65d878, plasma: 0xff5ca8,
    };
    const impactColor = impactColors[this.stageConfig.boss?.element] || 0xffe17a;
    const burst = this.add.container(boss.x, boss.y - 12).setDepth(25);
    const impactCore = this.add.star(0, 0, 8, 7, 23, impactColor, 0.94)
      .setStrokeStyle(3, 0xffffff, 0.96);
    const impactRing = this.add.circle(0, 0, 29, impactColor, 0)
      .setStrokeStyle(4, impactColor, 0.95);
    const impactFlash = this.add.circle(0, 0, 10, 0xffffff, 0.88);
    burst.add([impactRing, impactCore, impactFlash]);
    this.tweens.add({ targets: burst, scale: 2.25, alpha: 0, angle: 22, duration: 270,
      ease: "Cubic.easeOut", onComplete: () => burst.destroy() });
    const previousBossPhase = this.bossPhase;
    this.bossPhase = getBossPhase(this.bossHealth, this.bossMaxHealth);
    if (this.bossPhase > previousBossPhase && v?.active) {
      const parts = v.getData("parts");
      if (parts?.aura?.active) {
        parts.aura.setAlpha(0.48).setScale(1.42);
        this.tweens.add({ targets: parts.aura, alpha: 0.2, scale: 1.16, duration: 620, ease: "Cubic.easeOut" });
      }
      const phasePalette = getElement(this.stageConfig.boss?.element || "fire");
      const phaseFlash = this.add.circle(boss.x, boss.y - 12, 48, phasePalette.color, 0.28)
        .setStrokeStyle(7, phasePalette.edge, 0.96).setDepth(26);
      this.tweens.add({ targets: phaseFlash, scale: 3.2, alpha: 0, duration: 520, onComplete: () => phaseFlash.destroy() });
      this.cameras.main.shake(260, 0.006);
      this.audio.play("bossPhase");
    }
    this.statusLabel.setText(this.bossPhase === 3 ? "FINAL PHASE! BOSS UNLEASHED!" : this.bossPhase === 2 ? "BOSS IS ENRAGED!" : "KEEP FIRING!");
    this.statusLabel.setColor(this.bossPhase === 3 ? "#ff6b8a" : "#ffe17a");

    this.addScore(250);
    if (this.bossHealth <= 0) {
      this.audio.play("stageClear");
      this.audio.playVictoryTheme?.();
      this.addScore(5000);
      this.dropBossRewardShower(boss.x, boss.y);
      const defeatPalette = getElement(this.stageConfig.boss?.element || "fire");
      this.spawnElementParticles(boss.x, boss.y - 12, defeatPalette.id, 30, 1.45);
      const defeatBurst = this.add.container(boss.x, boss.y - 12).setDepth(27);
      const defeatStar = this.add.star(0, 0, 10, 10, 42, defeatPalette.color, 0.9)
        .setStrokeStyle(4, defeatPalette.edge, 0.98);
      const defeatRing = this.add.circle(0, 0, 54, defeatPalette.glow, 0)
        .setStrokeStyle(5, defeatPalette.edge, 0.95);
      const defeatStyle = this.stageConfig.boss?.style || "";
      const finaleDetails = [];
      if (defeatStyle.includes("boxing")) {
        [-1, 1].forEach((side) => {
          finaleDetails.push(this.add.circle(side * 38, 8, 13, defeatPalette.color, 0.9)
            .setStrokeStyle(3, defeatPalette.edge, 0.98));
        });
      } else if (defeatStyle.includes("agile")) {
        [-1, 0, 1].forEach((side) => {
          finaleDetails.push(this.add.star(side * 35, -25, 5, 3, 10, defeatPalette.edge, 0.96));
        });
      } else if (defeatStyle.includes("master")) {
        for (let ray = 0; ray < 8; ray++) {
          const angle = (Math.PI * 2 * ray) / 8;
          const rayShape = this.add.rectangle(Math.cos(angle) * 47, Math.sin(angle) * 47, 5, 28, defeatPalette.edge, 0.9)
            .setAngle(angle * 180 / Math.PI + 90);
          finaleDetails.push(rayShape);
        }
      } else if (defeatStyle.includes("final")) {
        const eclipseRing = this.add.ellipse(0, 0, 104, 42, defeatPalette.glow, 0)
          .setStrokeStyle(5, defeatPalette.edge, 0.98);
        finaleDetails.push(eclipseRing);
        this.tweens.add({ targets: eclipseRing, angle: 240, scaleY: 1.8, alpha: 0, duration: 690 });
      } else {
        [0, 1, 2].forEach((index) => {
          finaleDetails.push(this.add.ellipse(0, 0, 72 + index * 24, 18 + index * 5, defeatPalette.glow, 0)
            .setStrokeStyle(3, defeatPalette.edge, 0.92));
        });
      }
      defeatBurst.add([defeatRing, defeatStar, ...finaleDetails]);
      this.tweens.add({
        targets: defeatBurst,
        scale: 3.1,
        alpha: 0,
        angle: 35,
        duration: 720,
        ease: "Cubic.easeOut",
        onComplete: () => defeatBurst.destroy(),
      });
      this.bossDefeated = true;
      this.bossAttendantSpawnQueued = false;
      this.enemies.getChildren().filter((enemy) => enemy.getData("isBossAttendant")).forEach((attendant) => {
        const attendantVisual = attendant.getData("visual");
        if (attendantVisual?.active) attendantVisual.destroy();
        const attendantBall = attendant.getData("elementBall");
        if (attendantBall?.active) attendantBall.destroy();
        attendant.destroy();
      });
      boss.setVelocity(0, 0);
      this.tweens.add({ targets: this.bossVisual, angle: 360, scale: 0.1,
        alpha: 0, duration: 850, ease: "Back.easeIn",
        onComplete: () => { if (this.bossVisual?.active) this.bossVisual.destroy(); } });
      this.cameras.main.shake(700, 0.018);
      this.time.delayedCall(1000, () => {
        boss.destroy();
        this.boss = null;
        this.stageCleared = false;
        this.completeStage();
      });
    }
  }

  updateBoss(enemy, delta) {
    if (this.bossDefeated || !enemy.active) return;
    const direction = this.hero.x >= enemy.x ? 1 : -1;
    const attackState = enemy.getData("bossAttackState") || "rest";
    if (attackState === "volley" && this.time.now >= (enemy.getData("bossVolleyUntil") || 0)) {
      enemy.setData("bossAttackState", "rest");
    }
    const attackIndex = enemy.getData("bossAttackIndex") || 0;
    const bossStyle = enemy.getData("bossStyle") || "";
    const baseSpeed = bossStyle.includes("agile") ? 148
      : bossStyle.includes("boxing") ? 78
      : bossStyle.includes("master") ? 104
      : bossStyle.includes("final") ? 136
      : bossStyle.includes("grappler") ? 64 : 82;
    const speed = this.bossPhase === 3 ? baseSpeed * 1.65 : this.bossPhase === 2 ? baseSpeed * 1.3 : baseSpeed;
    enemy.setVelocityX(attackState === "dash"
      ? (enemy.getData("bossDashDirection") || direction) * (this.bossPhase === 3 ? 500 : 390)
      : attackState === "volley" ? 0 : direction * speed);
    const visual = this.bossVisual;
    if (visual?.active) {
      visual.setPosition(enemy.x, enemy.y);
      visual.setScale(direction * 1.15, 1.15);
      const authoredBossSprite = visual.getData("authoredSprite");
      if (authoredBossSprite?.active) {
        const attackPose = ["tell", "dash", "volley", "slam"].includes(attackState);
        const bossId = visual.getData("bossSheetId");
        authoredBossSprite.setData("lastAttackState", attackState);
        const signatureTilt = bossId === "gale-talon" ? 9
          : bossId === "iron-comet" ? -4
            : bossId === "suncrest" ? 2
              : bossId === "void-sovereign" ? Math.sin(this.time.now * 0.018) * 7 : 0;
        const attackTilt = attackState === "slam" ? signatureTilt + 8
          : attackState === "dash" ? signatureTilt - 10
            : attackState === "volley" ? signatureTilt + 4 : signatureTilt;
        authoredBossSprite.setAngle(attackPose ? attackTilt + Math.sin(this.time.now * 0.025) * 2
          : Math.sin(this.time.now * (bossId === "void-sovereign" ? 0.009 : 0.004)) * (bossId === "gale-talon" ? 3 : 1.8));
        authoredBossSprite.setScale(attackState === "slam" ? (bossId === "iron-comet" ? 1.12 : 1.08)
          : attackState === "dash" ? (bossId === "gale-talon" ? 1.16 : 1.045)
            : attackState === "volley" ? (bossId === "suncrest" ? 1.14 : 1.045) : 1);
      }
      const p = visual.getData("parts");
      const t = (enemy.getData("bossAnim") || 0) + delta;
      enemy.setData("bossAnim", t);
      const swing = Math.sin(t * (this.bossPhase === 2 ? 0.014 : 0.009));
      p.legL.rotation = swing * 0.32;
      p.legR.rotation = -swing * 0.32;
      p.footL.y = 44 + Math.max(0, swing) * -5;
      p.footR.y = 44 + Math.max(0, -swing) * -5;
      p.armL.rotation = -0.22 + swing * 0.24;
      p.armR.rotation = 0.22 - swing * 0.24;
      const breath = Math.sin(t * 0.0032);
      const powerPulse = 0.82 + (Math.sin(t * 0.007) + 1) * 0.09;
      p.fistL.y = 24 + Math.sin(t * 0.006) * 3;
      p.fistR.y = 24 - Math.sin(t * 0.006) * 3;
      p.body.setScale(1 + breath * 0.018, 1 - breath * 0.014);
      p.belly.setScale(1 + breath * 0.025, 1 - breath * 0.018);
      if (p.chestEmblem?.active) {
        p.chestEmblem.rotation = Math.sin(t * 0.0025) * 0.08;
        p.chestEmblem.setScale(powerPulse);
      }
      if (p.beltGem?.active) p.beltGem.setAlpha(powerPulse);
      if (p.shoulderL?.active) p.shoulderL.rotation = swing * 0.045;
      if (p.shoulderR?.active) p.shoulderR.rotation = -swing * 0.045;
      if (p.headband?.active) p.headband.rotation = swing * 0.025;
      if (p.orbitA?.active) p.orbitA.setAlpha(0.7 + (Math.sin(t * 0.004) + 1) * 0.13);
      if (p.orbitB?.active) p.orbitB.setAlpha(0.7 + (Math.cos(t * 0.004) + 1) * 0.13);
      const bossStyle = enemy.getData("bossStyle") || "";
      if (p.cape?.active) {
        const capeMotion = bossStyle.includes("agile") ? 0.075 : bossStyle.includes("final") ? 0.055 : 0.045;
        p.cape.rotation = Math.sin(t * (bossStyle.includes("agile") ? 0.006 : 0.003) + swing) * capeMotion;
      }
      if (p.shadow?.active) p.shadow.setScale(1 + Math.abs(swing) * 0.055, 1 - Math.abs(swing) * 0.04);
      if (p.footL?.active) p.footL.rotation = p.legL.rotation * 0.55;
      if (p.footR?.active) p.footR.rotation = p.legR.rotation * 0.55;
      if (p.fistL?.active && bossStyle.includes("boxing")) {
        p.fistL.setScale(1 + (Math.sin(t * 0.009) + 1) * 0.035);
        p.fistR.setScale(1 + (Math.cos(t * 0.009) + 1) * 0.035);
      }
      if (p.crownGem?.active) {
        p.crownGem.rotation = Math.sin(t * 0.004) * 0.12;
        p.crownGem.setAlpha(0.76 + (Math.sin(t * 0.008) + 1) * 0.12);
      }
      if (p.chestInset?.active) p.chestInset.setScale(1 + Math.sin(t * 0.005) * 0.025);
      if (Array.isArray(p.armorRidges)) {
        p.armorRidges.forEach((ridge, index) => {
          if (ridge?.active) ridge.rotation = (index === 0 ? -1 : 1) * (0.04 + swing * 0.035);
        });
      }
      if (Array.isArray(p.cheekMarks)) {
        p.cheekMarks.forEach((mark) => {
          if (mark?.active) mark.setAlpha(0.7 + (Math.sin(t * 0.006) + 1) * 0.12);
        });
      }
      visual.y = enemy.y + Math.abs(swing) * -2;

      // Bosses now use readable, style-specific anticipation and attack poses.
      // These are visual-only poses layered over the shared physics movement.
      if (attackState === "tell") {
        const kind = enemy.getData("bossAttackKind");
        const crouch = kind === 0 ? 0.34 : 0.16;
        p.legL.rotation -= crouch;
        p.legR.rotation += crouch;
        if (bossStyle.includes("boxing")) {
          p.armL.rotation = -1.05;
          p.armR.rotation = 1.05;
          p.fistL.y = 2;
          p.fistR.y = 2;
          visual.setAngle(direction * -0.045);
        } else if (bossStyle.includes("agile")) {
          p.armL.rotation = -1.85;
          p.armR.rotation = 1.85;
          p.fistL.y = 13;
          p.fistR.y = 13;
          visual.setAngle(direction * 0.035);
        } else if (bossStyle.includes("master")) {
          p.armL.rotation = -1.35;
          p.armR.rotation = 0.55;
          p.fistL.y = 8;
          p.fistR.y = 30;
          visual.setAngle(direction * -0.025);
        } else if (bossStyle.includes("grappler")) {
          // Gatekeeper braces low with both fists forward before a ground pulse.
          p.armL.rotation = -0.82;
          p.armR.rotation = 0.82;
          p.fistL.y = 16;
          p.fistR.y = 16;
          p.legL.rotation = -0.52;
          p.legR.rotation = 0.52;
          visual.setAngle(direction * 0.018);
        } else if (bossStyle.includes("final")) {
          p.armL.rotation = -2.25;
          p.armR.rotation = 2.25;
          p.fistL.y = -8;
          p.fistR.y = -8;
          visual.setAngle(0);
        }
        visual.setScale(direction * (1.15 + crouch * 0.05), 1 - crouch * 0.08);
      } else if (attackState === "dash") {
        p.armL.rotation = -0.35;
        p.armR.rotation = 0.35;
        p.legL.rotation = -0.78;
        p.legR.rotation = 0.78;
        visual.setAngle(direction * -0.16);
        visual.setScale(direction * 1.28, 0.88);
      } else if (attackState === "slam") {
        const gatekeeperSlam = bossStyle.includes("grappler");
        p.armL.rotation = gatekeeperSlam ? -1.65 : -2.15;
        p.armR.rotation = gatekeeperSlam ? 1.65 : 2.15;
        p.legL.rotation = gatekeeperSlam ? -0.58 : -0.95;
        p.legR.rotation = gatekeeperSlam ? 0.58 : 0.95;
        p.fistL.y = gatekeeperSlam ? 10 : 4;
        p.fistR.y = gatekeeperSlam ? 10 : 4;
        visual.setAngle(direction * (gatekeeperSlam ? 0.025 : 0.08));
        visual.setScale(direction * (gatekeeperSlam ? 1.16 : 1.2), gatekeeperSlam ? 1.08 : 1.12);
      } else if (attackState === "volley") {
        p.armL.rotation = -2.05;
        p.armR.rotation = 2.05;
        p.fistL.y = -13;
        p.fistR.y = -13;
        visual.setAngle(0);
        visual.setScale(direction * 1.18, 1.06);
      }
    }
    if (attackState === "rest" && this.time.now >= enemy.getData("bossAttackAt") && enemy.body.blocked.down) {
      const attackPattern = bossStyle.includes("boxing") ? [2, 0, 2, 1]
        : bossStyle.includes("agile") ? [2, 2, 1, 2]
        : bossStyle.includes("master") ? [1, 0, 1, 2]
        : bossStyle.includes("final") ? [0, 2, 1, 0, 1, 2]
        : bossStyle.includes("grappler") ? [0, 0, 2, 1] : [0, 1, 2];
      const nextAttack = attackPattern[attackIndex % attackPattern.length];
      enemy.setData("bossAttackIndex", attackIndex + 1);
      enemy.setData("bossAttackState", "tell");
      enemy.setData("bossAttackKind", nextAttack);
      enemy.setData("bossTellUntil", this.time.now + (this.bossPhase === 3 ? 300 : this.bossPhase === 2 ? 430 : 650));
      enemy.setVelocityX(0);
      const bossCallouts = bossStyle.includes("boxing")
        ? ["IRON UPPERCUT!", "RING-SHATTER VOLLEY!", "CHAMPION RUSH!"]
        : bossStyle.includes("agile")
          ? ["TALON DROP!", "GALE SHARDS!", "SKY-STEP RUSH!"]
          : bossStyle.includes("master")
            ? ["SUNLINE CRASH!", "MASTER'S FAN!", "DISCIPLINED DASH!"]
            : bossStyle.includes("final")
              ? ["VOID CROWN SLAM!", "DARK STAR VOLLEY!", "SOVEREIGN BLITZ!"]
              : ["STONE FIST CRASH!", "GATEKEEPER SHARDS!", "FORTRESS CHARGE!"];
      this.statusLabel.setText(bossCallouts[nextAttack] || "BOSS ATTACK!");
      this.statusLabel.setColor("#ff806d");
      const bossElement = this.stageConfig.boss?.element || "fire";
      const telegraphColors = {
        fire: 0xff7148, earth: 0xc58a55, wind: 0x8debdc,
        ice: 0x8deaff, lightning: 0xb18aff, shadow: 0x9b78e8,
        light: 0xffe36a, water: 0x319cff, nature: 0x65d878, plasma: 0xff5ca8,
      };
      const telegraphColor = telegraphColors[bossElement] || 0xff7148;
      const warningX = Phaser.Math.Clamp(this.hero.x, 72, 888);
      const warning = this.add.container(warningX, 478).setDepth(8);
      const warningCore = this.add.ellipse(0, 0, nextAttack === 0 ? 150 : 90, 16,
        telegraphColor, 0.22).setStrokeStyle(3, telegraphColor, 0.95);
      const warningRing = this.add.ellipse(0, 0, nextAttack === 0 ? 170 : 108, 24,
        telegraphColor, 0).setStrokeStyle(2, 0xffffff, 0.82);
      const warningRune = this.add.star(0, -15, 4, 4, 9, telegraphColor, 0.95)
        .setStrokeStyle(1, 0xffffff, 0.9);
      warning.add([warningRing, warningCore, warningRune]);
      this.tweens.add({ targets: warning, alpha: 0.28, scaleX: 1.18, duration: 170,
        yoyo: true, repeat: 2, onComplete: () => warning.destroy() });
      if (visual?.active) this.tweens.add({ targets: visual, scaleY: 0.86, duration: 120, yoyo: true });
    }
    if (attackState === "tell" && this.time.now >= enemy.getData("bossTellUntil")) {
      const kind = enemy.getData("bossAttackKind");
      if (kind === 0) {
        this.audio.play("bossAttack");
        enemy.setData("bossAttackState", "slam");
        const slamLift = bossStyle.includes("boxing") ? 590
          : bossStyle.includes("agile") ? 540
            : bossStyle.includes("master") ? 565
              : bossStyle.includes("final") ? 670
                : bossStyle.includes("grappler") ? 455 : 490;
        const slamDrift = bossStyle.includes("agile") ? 230
          : bossStyle.includes("boxing") ? 155
            : bossStyle.includes("final") ? 125 : bossStyle.includes("grappler") ? 55 : 95;
        enemy.setVelocityY(-(slamLift + (this.bossPhase - 1) * 65));
        enemy.setVelocityX(direction * slamDrift);
      } else if (kind === 1) {
        this.audio.play("bossAttack");
        enemy.setData("bossAttackState", "volley");
        enemy.setData("bossVolleyUntil", this.time.now + 460);
        enemy.setData("bossAttackAt", this.time.now + (this.bossPhase === 3 ? 700 : this.bossPhase === 2 ? 1050 : 1650));
        enemy.setVelocityX(0);
        this.fireBossVolley(enemy);
      } else {
        this.audio.play("bossAttack");
        enemy.setData("bossAttackState", "dash");
        enemy.setData("bossDashDirection", direction);
        enemy.setData("bossDashUntil", this.time.now + (this.bossPhase === 3 ? 680 : this.bossPhase === 2 ? 520 : 390));
      }
    }
    if (attackState === "dash" && this.time.now >= enemy.getData("bossDashUntil")) {
      enemy.setVelocityX(0);
      enemy.setData("bossAttackState", "rest");
      enemy.setData("bossAttackAt", this.time.now + 1300);
    }
    const airborne = !enemy.body.blocked.down;
    if (enemy.getData("wasAirborne") && !airborne) {
      const landingElement = this.stageConfig.boss?.element || "fire";
      const landingPalette = getElement(landingElement);
      const shock = this.add.ellipse(enemy.x, 480, 55, 13, landingPalette.color, 0.78)
        .setStrokeStyle(3, landingPalette.edge).setDepth(8);
      const shockRing = this.add.ellipse(enemy.x, 480, 72, 19, landingPalette.glow, 0)
        .setStrokeStyle(2, landingPalette.edge, 0.9).setDepth(8);
      this.tweens.add({ targets: shock, scaleX: 6.2, alpha: 0, duration: 520,
        onComplete: () => shock.destroy() });
      this.tweens.add({ targets: shockRing, scaleX: 5.4, scaleY: 1.8, alpha: 0, duration: 460,
        onComplete: () => shockRing.destroy() });
      this.cameras.main.shake(220, 0.007);
      if (Math.abs(this.hero.x - enemy.x) < 145) this.damageHero(this.hero, enemy);
      if (enemy.getData("bossAttackState") === "slam") {
        enemy.setData("bossAttackState", "rest");
        enemy.setData("bossAttackAt", this.time.now + (this.bossPhase === 2 ? 900 : 1450));
      }
    }
    enemy.setData("wasAirborne", airborne);
  }

  fireBossVolley(boss) {
    if (!this.hero?.active) return;
    const bossData = this.stageConfig.boss || {};
    const bossId = bossData.id || "gatekeeper";
    const element = bossData.element || "fire";
    const shotPalette = getElement(element);
    const base = Phaser.Math.Angle.Between(boss.x, boss.y - 15, this.hero.x, this.hero.y - 10);
    const phase = this.bossPhase || 1;
    const profile = getBossSignatureProfile(bossId);
    const count = profile.counts[phase - 1] || profile.counts[0];
    this.statusLabel.setText(`${bossData.attack || "SPECIAL ATTACK"}!`);
    for (let i = 0; i < count; i++) {
      const progress = count <= 1 ? 0.5 : i / (count - 1);
      const angle = profile.radial
        ? (Math.PI * 2 * i / profile.count) + (bossId === "void-sovereign" ? this.time.now * 0.00035 : -Math.PI / 2)
        : base + (progress - 0.5) * profile.spread;
      const radius = bossId === "iron-comet" ? 8 : bossId === "void-sovereign" ? 13 : 10 + (phase === 3 ? 3 : 0);
      let shot;
      if (profile.shape === "stone") {
        shot = this.add.polygon(boss.x, boss.y - 18, [0, -14, 12, -3, 8, 12, -9, 10, -13, -2], 0x9b7957, 0.98);
      } else if (profile.shape === "punch") {
        shot = this.add.rectangle(boss.x, boss.y - 18, 34, 15, 0xffbd69, 0.98).setAngle(angle * 180 / Math.PI);
      } else if (profile.shape === "talon") {
        shot = this.add.star(boss.x, boss.y - 18, 4, 5, 17, 0x9cecff, 0.98).setAngle(angle * 180 / Math.PI);
      } else if (profile.shape === "sun") {
        shot = this.add.star(boss.x, boss.y - 18, 8, 5, 15, 0xffdf69, 0.98).setStrokeStyle(3, 0xffffff, 0.95);
      } else {
        shot = this.add.circle(boss.x, boss.y - 18, radius * 1.35, 0x32245e, 0.98)
          .setStrokeStyle(3, 0xbca4ff, 0.95);
      }
      shot.setStrokeStyle(3, shotPalette.edge || 0xffffff, 0.98).setDepth(18);
      shot.setData("elementId", element);
      shot.setData("bossSignature", bossId);
      this.physics.add.existing(shot);
      this.bossShots.add(shot);
      shot.body.setAllowGravity(false);
      shot.body.setCircle(radius);
      const phaseBoost = phase === 3 ? 1.2 : phase === 2 ? 1.08 : 1;
      const velocity = profile.speed * phaseBoost;
      shot.body.setVelocity(Math.cos(angle) * velocity, Math.sin(angle) * velocity);
      shot.setData("bossShot", true);
      if (bossId === "void-sovereign") {
        this.tweens.add({ targets: shot, angle: 360, scale: 1.55, duration: 560, repeat: -1 });
      } else {
        this.tweens.add({ targets: shot, scale: bossId === "iron-comet" ? 1.12 : 1.35,
          duration: bossId === "gale-talon" ? 130 : 220, yoyo: true, repeat: -1 });
      }
      this.time.delayedCall(3000, () => { if (shot.active) shot.destroy(); });
    }
    if (bossId === "gatekeeper") {
      const quake = this.add.rectangle(boss.x, 493, 130, 7, 0xd7ad76, 0.8).setDepth(17);
      this.tweens.add({ targets: quake, x: this.hero.x, scaleX: 1.6, alpha: 0, duration: 420,
        onComplete: () => quake.destroy() });
    } else if (bossId === "suncrest") {
      const flare = this.add.circle(boss.x, boss.y - 20, 38, 0xffe36a, 0.18)
        .setStrokeStyle(4, 0xffffff, 0.95).setDepth(17);
      this.tweens.add({ targets: flare, scale: 2.4, alpha: 0, duration: 520,
        onComplete: () => flare.destroy() });
    } else if (bossId === "void-sovereign") {
      const rift = this.add.circle(boss.x, boss.y - 18, 54, 0x38256e, 0.16)
        .setStrokeStyle(5, 0xbba4ff, 0.9).setDepth(17);
      this.tweens.add({ targets: rift, angle: 180, scale: 1.9, alpha: 0, duration: 650,
        onComplete: () => rift.destroy() });
    }
  }

  hitBossShot(hero, shot) {
    if (!shot?.active) return;
    this.damageHero(hero, shot);
    if (shot.active) shot.destroy();
  }

  addScore(points) {
    this.score += points;
    const extra = Math.floor(this.score / 10000);
    if (extra > this.extraLivesAwarded) {
      if (this.health < 3) {
        this.health = Math.min(3, this.health + 1);
        this.statusLabel.setText("10,000 BONUS! +1 HEART").setColor("#ffe17a");
      } else if (this.chances < 3) {
        this.chances = Math.min(3, this.chances + 1);
        this.statusLabel.setText("10,000 BONUS! +1 CHANCE").setColor("#ffe17a");
      } else {
        this.statusLabel.setText("10,000 BONUS! CAMPAIGN LIVES ARE FULL").setColor("#ffe17a");
      }
      this.extraLivesAwarded = extra;
      this.updateLivesLabel();
    }
    if (this.scoreLabel?.active) this.scoreLabel.setText(`SCORE: ${this.score.toLocaleString()}`);
  }

  updateLivesLabel() {
    if (this.healthLabel?.active) this.healthLabel.setText(`HEARTS: ${this.health}/3`);
    if (this.chancesLabel?.active) this.chancesLabel.setText(`CHANCES: ${this.chances}`);
  }

  spawnTreasureChest() {
    const x = Phaser.Math.Between(130, 830);
    const y = Phaser.Math.Between(280, 390);
    const chest = this.add.container(x, y).setDepth(7);
    const shadow = this.add.ellipse(0, 20, 66, 14, 0x101426, 0.34);
    const base = this.add.rectangle(0, 1, 54, 34, 0x8a431f).setStrokeStyle(4, 0xffd36b);
    const front = this.add.rectangle(0, 2, 46, 26, 0xb96a2d).setStrokeStyle(2, 0xffc65c);
    const lid = this.add.rectangle(0, -19, 60, 18, 0xd98a37).setStrokeStyle(4, 0xffe08a);
    const lock = this.add.rectangle(0, 2, 10, 16, 0xffdf72).setStrokeStyle(2, 0x9a5a1c);
    const shine = this.add.star(-18, -19, 4, 2, 7, 0xffffff, 0.95);
    chest.add([shadow, base, front, lid, lock, shine]);
    chest.setSize(62, 48);
    chest.setData("opened", false);
    this.treasureChest = chest;
    this.tweens.add({ targets: chest, y: y - 5, duration: 850, yoyo: true, repeat: -1 });
  }

  openTreasureChest() {
    const chest = this.treasureChest;
    if (!chest?.active || chest.getData("opened")) return;
    chest.setData("opened", true);
    const lid = chest.list[2];
    this.tweens.add({ targets: lid, angle: -105, y: -28, duration: 220, ease: "Back.easeOut" });
    const reward = Phaser.Math.Between(0, 9);
    if (reward <= 4) {
      const element = ELEMENTS[Phaser.Math.Between(0, ELEMENTS.length - 1)];
      this.powerType = element.id;
      this.upgradeParticlePower();
      this.powerLabel.setText(`POWER: ${element.name.toUpperCase()} • P${this.particlePowerLevel}/20 [C]`).setColor("#" + element.color.toString(16).padStart(6, "0"));
      this.statusLabel.setText(`PARTICLE POWER ${this.particlePowerLevel}/20 UPGRADED!`).setColor("#ffe17a");
    } else if (reward <= 6) {
      if (this.health < 3) {
        this.health = Math.min(3, this.health + 1);
        this.statusLabel.setText("TREASURE! +1 HEART").setColor("#62ffb4");
      } else {
        this.statusLabel.setText("TREASURE! HEARTS ALREADY FULL").setColor("#9feaff");
      }
      this.updateLivesLabel();
    } else if (reward <= 8) {
      this.addScore(1500);
      this.statusLabel.setText("TREASURE! +1500 SCORE").setColor("#ffe17a");
    } else {
      this.addScore(3000);
      this.startBonusStage();
    }
    const powerVisual = this.add.container(chest.x, chest.y - 38).setDepth(30);
    const elementVisual = getElement(this.powerType);
    const halo = this.add.circle(0, 0, 29, elementVisual.glow, 0.28).setStrokeStyle(4, 0xffffff, 0.95);
    let icon;
    if (this.powerType === "fire") {
      icon = this.add.ellipse(0, 1, 19, 28, 0xff7138).setStrokeStyle(2, 0xffe6a0);
      const core = this.add.ellipse(0, 6, 9, 16, 0xfff2a0);
      powerVisual.add([halo, icon, core]);
    } else if (this.powerType === "ice") {
      icon = this.add.star(0, 0, 6, 4, 21, 0x9beaff).setStrokeStyle(3, 0xffffff);
      powerVisual.add([halo, icon]);
    } else if (this.powerType === "lightning") {
      icon = this.add.polygon(0, 0, [-5,-21,9,-4,2,-4,7,20,-10,0,-3,0], 0xe3c6ff).setStrokeStyle(3, 0xffffff);
      powerVisual.add([halo, icon]);
    } else if (this.powerType === "water") {
      icon = this.add.circle(0, 1, 15, 0x4fc8ff).setStrokeStyle(3, 0xe6fbff);
      powerVisual.add([halo, icon, this.add.circle(-5,-5,5,0xffffff,0.8)]);
    } else {
      icon = this.add.star(0, 0, 6, 5, 19, elementVisual.color).setStrokeStyle(3, 0xffffff);
      powerVisual.add([halo, icon]);
    }
    this.tweens.add({ targets: powerVisual, y: powerVisual.y - 72, scale: 1.7, alpha: 0, duration: 950, onComplete: () => powerVisual.destroy() });
    this.spawnElementParticles(chest.x, chest.y - 12, this.powerType, 32, 1.35, "treasure-burst");
    this.cameras.main.flash(260, 255, 220, 120);
    this.time.delayedCall(950, () => { if (chest.active) chest.destroy(); });
  }

  startBonusStage() {
    if (this.bonusMode) return;
    this.bonusMode = true;
    this.bonusUntil = this.time.now + 30000;
    this.bonusStartedAt = this.time.now;
    this.bossShots.clear(true, true);
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active && !enemy.getData("isTimeHunter")) enemy.setVelocity(0, 0);
    });
    const banner = this.add.text(480, 155, "BONUS REALM! COLLECT THE STAR ORBS!", {
      fontSize: "24px", color: "#ffe17a", fontStyle: "bold", stroke: "#442b66", strokeThickness: 6
    }).setOrigin(0.5).setDepth(35);
    this.tweens.add({ targets: banner, y: 125, alpha: 0, duration: 2200, onComplete: () => banner.destroy() });
    for (let i = 0; i < 12; i++) {
      const x = Phaser.Math.Between(70, 890);
      const y = Phaser.Math.Between(130, 440);
      const orb = this.add.circle(x, y, 15, i % 2 ? 0xffd36b : 0x8ceeff, 0.98)
        .setStrokeStyle(4, 0xffffff).setDepth(24);
      this.physics.add.existing(orb);
      orb.body.setAllowGravity(false);
      orb.body.setCircle(15);
      orb.setData("bonusOrb", true);
      this.bonusItems.add(orb);
      this.tweens.add({ targets: orb, scale: 1.35, y: y - 12, duration: 450 + i * 25, yoyo: true, repeat: -1 });
    }
  }

  dropReward(x, y, bossTier = 0) {
    const rewards = bossTier > 0
      ? [{ type: "cake", label: "CAKE", value: 500, color: 0xff8eb4 }, { type: "fruit", label: "STRAWBERRY", value: 750, color: 0xff5b58 }, { type: "apple", label: "APPLE", value: 850, color: 0xe83d42 }, { type: "chicken", label: "CHICKEN", value: 1000, color: 0xffc45e }, { type: "diamond", label: "DIAMOND", value: 1500, color: 0x69eaff }, { type: "gold", label: "GOLD", value: 2500, color: 0xffd447 }]
      : [{ type: "cake", label: "CAKE", value: 250, color: 0xff8eb4 }, { type: "fruit", label: "STRAWBERRY", value: 400, color: 0xff5b58 }, { type: "apple", label: "APPLE", value: 450, color: 0xe83d42 }, { type: "chicken", label: "CHICKEN", value: 500, color: 0xffc45e }, { type: "diamond", label: "DIAMOND", value: 1000, color: 0x69eaff }, { type: "gold", label: "GOLD", value: 1500, color: 0xffd447 }];
    const reward = rewards[Phaser.Math.Between(0, rewards.length - 1)];
    const item = this.add.container(x, y).setDepth(25);
    const glow = this.add.circle(0, 0, 22, reward.color, 0.22).setStrokeStyle(2, 0xffffff, 0.8);
    item.add(glow);
    // Draw recognizable collectible artwork instead of text-only placeholders.
    if (reward.type === "fruit") {
      const berry = this.add.ellipse(0, 2, 24, 29, 0xe93445).setStrokeStyle(2, 0xffb0a6);
      const leaf1 = this.add.ellipse(-6, -14, 13, 7, 0x38a84b).setAngle(-28);
      const leaf2 = this.add.ellipse(6, -14, 13, 7, 0x57c65b).setAngle(28);
      const seeds = [-6,-1,5].map((sx, i) => this.add.ellipse(sx, -2 + (i%2)*8, 2, 4, 0xfff0a5));
      item.add([berry, leaf1, leaf2, ...seeds]);
    } else if (reward.type === "apple") {
      const left = this.add.circle(-6, 3, 12, 0xe93442).setStrokeStyle(2, 0xffa1a1);
      const right = this.add.circle(6, 3, 12, 0xd92337).setStrokeStyle(2, 0xffa1a1);
      const stem = this.add.rectangle(1, -12, 4, 10, 0x76502c).setAngle(12);
      const leaf = this.add.ellipse(8, -14, 12, 6, 0x45b94d).setAngle(-25);
      item.add([left, right, stem, leaf]);
    } else if (reward.type === "cake") {
      item.add([this.add.rectangle(0, 4, 28, 17, 0xffd2e4).setStrokeStyle(2, 0xffffff), this.add.ellipse(0, -5, 30, 13, 0xff86b4), this.add.circle(0, -13, 5, 0xff4e67)]);
    } else if (reward.type === "chicken") {
      item.add([this.add.ellipse(0, 1, 27, 19, 0xffc45e), this.add.circle(12, -8, 7, 0xffd47a), this.add.circle(16, -10, 2, 0x202033), this.add.ellipse(-15, 7, 12, 7, 0xfff0cf)]);
    } else if (reward.type === "diamond") {
      item.add([this.add.polygon(0, 0, [0,-19,17,-5,10,17,-10,17,-17,-5], 0x69eaff).setStrokeStyle(3, 0xffffff), this.add.line(-8,-5,8,10, -8,0xffffff,0.8)]);
    } else {
      item.add([this.add.star(0, 0, 8, 9, 17, 0xffd447).setStrokeStyle(3, 0xfff2a6), this.add.circle(-5,-6,4,0xffffff,0.9)]);
    }
    item.setData("rewardType", reward.type);
    item.setData("rewardValue", reward.value);
    this.physics.add.existing(item);
    item.body.setCircle(15);
    item.body.setBounce(0.32, 0.2);
    item.body.setCollideWorldBounds(true);
    item.body.setMaxVelocity(260, 700);
    item.body.setVelocity(Phaser.Math.Between(-180, 180), Phaser.Math.Between(-300, -180));
    this.bonusItems.add(item);
    this.physics.add.collider(item, this.platforms);
    this.tweens.add({ targets: item, angle: Phaser.Math.Between(-18, 18), duration: 420, yoyo: true, repeat: -1 });
    this.time.delayedCall(12000, () => { if (item.active) item.destroy(); });
    return item;
  }

  dropBossRewardShower(x, y) {
    const tier = this.bossMaxHealth >= 50 ? 2 : this.bossMaxHealth >= 30 ? 1 : 0;
    const count = 9 + tier * 2;
    for (let i = 0; i < count; i++) {
      this.time.delayedCall(i * 65, () => {
        if (!this.scene.isActive()) return;
        const spread = (i - (count - 1) / 2) * 15;
        this.dropReward(x + spread, y - 20, tier);
      });
    }
    const banner = this.add.text(x, y - 88, "BOSS TREASURE!", { fontSize: "22px", color: "#ffe17a", fontStyle: "bold", stroke: "#492c65", strokeThickness: 5 }).setOrigin(0.5).setDepth(28);
    this.tweens.add({ targets: banner, y: banner.y - 42, alpha: 0, duration: 1500, onComplete: () => banner.destroy() });
  }

  collectBonusItem(hero, orb) {
    if (!orb?.active) return;
    this.audio.play("collect");
    if (orb.getData("bonusOrb") && !this.bonusMode) return;
    const isBonusOrb = !!orb.getData("bonusOrb");
    const value = isBonusOrb ? 750 : (orb.getData("rewardValue") || 250);
    const rewardType = orb.getData("rewardType") || "bonus";
    const burst = this.add.circle(orb.x, orb.y, 18, 0xffe27a, 0.9).setDepth(26);
    this.tweens.add({ targets: burst, scale: 2.4, alpha: 0, duration: 180, onComplete: () => burst.destroy() });
    orb.destroy();
    this.addScore(value);
    this.statusLabel.setText(isBonusOrb ? "BONUS ORB! +750" : `${rewardType.toUpperCase()} COLLECTED! +${value}`).setColor("#ffe17a");
  }

  finishBonusStage() {
    this.bonusMode = false;
    this.stageStartedAt += 30000;
    this.bonusItems.clear(true, true);
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.active && !enemy.getData("isTimeHunter")) {
        enemy.setVelocity(Phaser.Math.Between(-80, 80), 0);
      }
    });
    this.statusLabel.setText("BONUS ROUND COMPLETE! BACK TO THE STAGE!").setColor("#9feaff");
  }

  spawnTimeHunter() {
    if (this.timeHunterSpawned || this.gameOver || this.stageCleared) return;
    this.timeHunterSpawned = true;
    const hunter = this.enemies.create(this.hero.x < 480 ? 900 : 60, 120, "enemy2");
    hunter.setDepth(12).setCollideWorldBounds(true);
    hunter.setTint(0x222233);
    hunter.setScale(1.8);
    hunter.setData("isTimeHunter", true);
    hunter.setData("bornAt", this.time.now);
    hunter.setData("visual", this.createEnemyVisual(hunter, 0x29243f, 0xc4a5ff));
    const warning = this.add.text(480, 145, "TIME IS UP! THE SHADOW HUNTER IS HERE!", {
      fontSize: "19px", color: "#ff8a9c", fontStyle: "bold", stroke: "#24152e", strokeThickness: 5
    }).setOrigin(0.5).setDepth(25);
    this.tweens.add({ targets: warning, alpha: 0, y: 110, duration: 1800, onComplete: () => warning.destroy() });
    this.cameras.main.shake(320, 0.009);
  }

  completeStage() {
    if (this.stageCleared) return;
    this.audio.play("stageClear");
    this.audio.playVictoryTheme?.();
    this.stageCleared = true;
    this.stageCollectionActive = false;
    this.hero.setVelocity(0, 0);
    this.physics.world.pause();
    this.statusLabel.setText(`STAGE ${String(this.stageNumber).padStart(2,"0")} COMPLETE! COLLECT YOUR POINTS!`).setColor("#ffe17a");
    // Keep the hero on the arena floor. The five-second bonus is playable so
    // the player can run/jump through the remaining reward drops.
    this.time.delayedCall(180, () => {
      if (!this.hero?.active || this.gameOver) return;
      this.physics.world.resume();
      this.stageCollectionActive = true;
      this.setMobileControlsVisible(true);
      this.hero.setVelocity(0, 0);
      const countdown = this.add.text(480, 112, "COLLECT POINTS: 5", {
        fontSize: "25px", color: "#ffe17a", fontStyle: "bold", stroke: "#402b4e", strokeThickness: 6
      }).setOrigin(0.5).setDepth(48);
      let remaining = 5;
      this.time.addEvent({ delay: 1000, repeat: 4, callback: () => {
        remaining -= 1;
        if (countdown.active) countdown.setText(remaining > 0 ? `COLLECT POINTS: ${remaining}` : "SCORE LOCKED!");
        if (remaining === 0) {
          this.stageCollectionActive = false;
          this.physics.world.pause();
          this.setMobileControlsVisible(false);
          this.time.delayedCall(250, () => {
            if (countdown.active) countdown.destroy();
            this.showVictory();
          });
        }
      }});
    });
  }

  advanceToNextStage() {
    if (this.stageAdvancePending || this.stageNumber >= 50 || !this.stageCleared) return;
    this.stageAdvancePending = true;
    this.stageNumber++;
    this.pendingStageTransitionDirection = getStageTransitionDirection(this.stageNumber);
    this.scene.restart();
  }

  showVictory() {
    const shade = this.add.rectangle(480, 270, 960, 540, 0x071426, 0.72).setDepth(40);
    const title = this.add.text(480, 225, "VICTORY!", { fontSize: "58px", color: "#ffe17a", fontStyle: "bold", stroke: "#6b321f", strokeThickness: 8 }).setOrigin(0.5).setDepth(41).setScale(0.2);
    const subtitle = this.add.text(480, 290, this.stageNumber === 50 ? `${this.selectedHero.name.toUpperCase()} - THE LEGENDARY GUARDIAN!` : `${this.stageConfig.name.toUpperCase()} COMPLETED`, { fontSize: "19px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5).setDepth(41).setAlpha(0);
    this.tweens.add({ targets: title, scale: 1, duration: 550, ease: "Back.easeOut" });
    this.tweens.add({ targets: subtitle, alpha: 1, y: 305, duration: 500, delay: 300 });
    if (this.stageNumber < 50) {
      const nextLabel = this.add.text(480, 365, "NEXT STAGE LOADING…  ▶", { fontSize: "18px", color: "#9feaff", fontStyle: "bold", backgroundColor: "#173d59", padding: { x: 18, y: 10 } }).setOrigin(0.5).setDepth(41).setInteractive({ useHandCursor: true });
      nextLabel.on("pointerdown", () => { this.audio.play("ui"); this.advanceToNextStage(); });
      this.time.delayedCall(2300, () => this.advanceToNextStage());
    } else {
      const ending = this.add.text(480, 366, "THE 50 STAGE QUEST IS COMPLETE", { fontSize: "18px", color: "#9feaff", fontStyle: "bold" }).setOrigin(0.5).setDepth(41);
      const legend = this.add.text(480, 405, `${this.selectedHero.superPower.toUpperCase()} - THE KINGDOM IS SAFE!`, { fontSize: "16px", color: "#ffe17a", fontStyle: "bold" }).setOrigin(0.5).setDepth(45);
      this.tweens.add({ targets: [ending, legend], alpha: 0.72, duration: 1100, yoyo: true, repeat: -1 });
      const replay = this.add.text(365, 474, "PLAY AGAIN", {
        fontSize: "15px", color: "#ffffff", fontStyle: "bold",
        backgroundColor: "#126d7b", padding: { x: 22, y: 11 },
      }).setOrigin(0.5).setDepth(46).setInteractive({ useHandCursor: true });
      const changeHero = this.add.text(595, 474, "CHANGE HERO", {
        fontSize: "15px", color: "#ffffff", fontStyle: "bold",
        backgroundColor: "#513f82", padding: { x: 22, y: 11 },
      }).setOrigin(0.5).setDepth(46).setInteractive({ useHandCursor: true });
      replay.on("pointerdown", () => {
        this.audio.unlock();
        this.audio.play("ui");
        this.startNewCampaign();
      });
      changeHero.on("pointerdown", () => {
        this.audio.unlock();
        this.audio.play("ui");
        this.showHeroSelect();
      });
    }
    this.tweens.add({ targets: shade, alpha: 0.82, duration: 350 });
  }

  damageHero(hero, enemy) {
    if (this.gameOver || this.stageCleared || this.stageTransitionActive || this.chanceLossInProgress ||
        !hero?.active || !enemy?.active || enemy.getData("frozen")) return;
    const now = this.time.now;
    const validJumpStomp = isValidJumpStomp({
      heroBottom: hero.body?.bottom ?? Infinity, enemyTop: enemy.body?.top ?? -Infinity,
      heroY: hero.y, enemyY: enemy.y, velocityY: hero.body?.velocity?.y || 0,
      isBoss: Boolean(enemy.getData("isBoss")),
    });
    if (validJumpStomp) {
      enemy.setData("stompStunnedUntil", now + 620);
      enemy.setVelocity(0, -95);
      const visual = enemy.getData("visual");
      if (visual?.active) this.tweens.add({ targets: visual, angle: 8, duration: 90, yoyo: true,
        onComplete: () => { if (visual.active) visual.setAngle(0); } });
      const stomp = this.add.ellipse(enemy.x, enemy.y + 18, 54, 12, 0x9feaff, 0.9)
        .setStrokeStyle(3, 0xffffff).setDepth(24);
      this.tweens.add({ targets: stomp, scaleX: 2.1, alpha: 0, duration: 260, onComplete: () => stomp.destroy() });
      hero.setVelocityY(-250);
      this.audio.play("ballImpact");
      return;
    }
    if (now - this.lastDamage < 1200 || this.health <= 0) return;
    this.lastDamage = now;
    this.audio.play("hit");
    const lives = loseCampaignHeart({ chances: this.chances, hearts: this.health, gameOver: false });
    this.chances = lives.chances;
    this.health = lives.hearts;
    this.updateLivesLabel();
    if (this.healthLabel?.active) this.healthLabel.setColor("#ff7777");
    const direction = hero.x < enemy.x ? -1 : 1;
    hero.setVelocityX(direction * 260); hero.setVelocityY(-220);
    this.heroHitStartedAt = now;
    this.heroHitUntil = now + 360;
    this.heroHitDirection = direction;
    if (this.heroVisual?.active) this.tweens.add({ targets: this.heroVisual, alpha: 0.25, duration: 90, yoyo: true, repeat: 3 });
    if (lives.chanceLost) {
      this.chanceLossInProgress = true;
      hero.setVelocity(0, 0); hero.body.enable = false;
      if (this.heroVisual?.active) this.heroVisual.setVisible(false).setAlpha(1).setAngle(0);
      if (lives.gameOver) {
        this.audio.play("gameOver");
        this.gameOver = true;
        this.showContinueScreen();
        return;
      }
      this.lastDamage = this.time.now + 900;
      this.statusLabel.setText(`CHANCE LOST! ${this.chances} CHANCE(S) LEFT`).setColor("#ffe17a");
      this.time.delayedCall(950, () => {
        if (this.gameOver || !hero.active) return;
        hero.body.enable = true; hero.setPosition(480, 450).setVelocity(0, 0);
        this.heroVisual?.setPosition(480, 450).setVisible(true).setAlpha(1).setScale(1);
        this.lastDamage = this.time.now;
        this.chanceLossInProgress = false;
        this.statusLabel.setText("NEW CHANCE! THREE HEARTS RESTORED").setColor("#62ffb4");
      });
    } else {
      this.time.delayedCall(650, () => {
        if (!this.gameOver && hero.active) {
          hero.setPosition(480, 450); hero.setVelocity(0, 0);
          if (this.heroVisual?.active) { this.heroVisual.setPosition(480, 450).setVisible(true).setAlpha(1); this.tweens.add({ targets: this.heroVisual, scaleY: 1.12, duration: 180, yoyo: true }); }
        }
      });
    }
  }

  showContinueScreen() {
    this.setMobileControlsVisible(false);
    this.audio.playDefeatTheme?.();
    const shade = this.add.rectangle(480, 270, 960, 540, 0x071426, 0.9).setDepth(50);
    const title = this.add.text(480, 175, "GAME OVER", { fontSize: "52px", color: "#ff8b9c", fontStyle: "bold", stroke: "#351b35", strokeThickness: 7 }).setOrigin(0.5).setDepth(51);
    const info = this.add.text(480, 250, "ALL THREE CHANCES HAVE BEEN USED", { fontSize: "19px", color: "#ffffff", fontStyle: "bold", align: "center" }).setOrigin(0.5).setDepth(51);
    const stats = this.add.text(480, 292, `FINAL SCORE: ${this.score.toLocaleString()}   •   STAGE: ${this.stageNumber}`, { fontSize: "15px", color: "#ffe17a", fontStyle: "bold" }).setOrigin(0.5).setDepth(51);
    const restart = this.add.text(480, 365, "START NEW CAMPAIGN", { fontSize: "19px", color: "#ffffff", backgroundColor: "#236b65", padding: { x: 22, y: 12 }, fontStyle: "bold" }).setOrigin(0.5).setDepth(52).setInteractive({ useHandCursor: true });
    this.menuObjects.push(shade, title, info, stats, restart);
    restart.on("pointerdown", () => this.startNewCampaign());
  }

  upgradeParticlePower() {
    const current = Phaser.Math.Clamp(this.particlePowerLevel || 1, 1, 20);
    this.particlePowerLevel = Math.min(20, current + 1);
    if (this.powerLabel) {
      const element = getElement(this.powerType);
      this.powerLabel.setText(`POWER: ${element.name.toUpperCase()} • P${this.particlePowerLevel}/20 [C]`);
    }
    return this.particlePowerLevel;
  }

  getPowerPalette() {
    const element = getElement(this.powerType);
    return { id: element.id, effect: element.effect, ball: element.ball, edge: element.edge, glow: element.glow, trail: element.trail };
  }

  cyclePower() {
    const modes = ELEMENTS.map(element => element.id);
    this.powerType = modes[(modes.indexOf(this.powerType) + 1) % modes.length];
    const colors = Object.fromEntries(ELEMENTS.map(element => [element.id, "#" + element.color.toString(16).padStart(6, "0")]));
    const element = getElement(this.powerType);
    this.powerLabel.setText(`POWER: ${element.name.toUpperCase()} • P${this.particlePowerLevel}/20 [POWER]`).setColor(colors[this.powerType]);
    this.statusLabel.setText(`${element.name.toUpperCase()} POWER READY!`).setColor(colors[this.powerType]);
    this.audio.play("powerSwitch");
    this.spawnElementParticles(this.hero.x + this.facing * 24, this.hero.y - 22, this.powerType, 12, 0.65);
    this.mobileControlVisuals?.get("cyclePower")?.text?.setText(`POWER\n${element.name.toUpperCase()}`).setFontSize("11px");
    this.audio.play("powerSwitch");
    this.cameras.main.flash(120, 150, 220, 255, false);
  }

  kickNearestElementBall() {
    const candidates = this.enemies.getChildren();
    let chosen = null, best = 118;
    for (const enemy of candidates) {
      const dx = enemy.x - this.hero.x;
      const dy = enemy.y - this.hero.y;
      if (canKickElementBall({
        active: enemy.active,
        frozen: enemy.getData("frozen"),
        rolling: enemy.getData("rolling"),
        dx, dy, facing: this.facing, maxDistance: best,
      })) { best = Math.abs(dx); chosen = enemy; }
    }
    if (!chosen) return false;
    this.startElementBallRoll(chosen);
    return true;
  }

  startElementBallRoll(enemy) {
    this.audio.unlock(); this.audio.play("ballKick");
    const ball = enemy.getData("elementBall");
    if (!ball?.active) return;
    const direction = this.facing;
    const palette = enemy.getData("ballPalette") || this.getPowerPalette();
    const elementId = palette.id || "fire";
    enemy.setData("rolling", true); enemy.setData("rollDirection", direction);
    enemy.setData("rollHits", []); enemy.setData("rollWallBounces", 0);
    enemy.setData("rollStartedAt", this.time.now); enemy.setData("rollDistanceOrigin", enemy.x);
    enemy.setData("rollElementId", elementId);
    enemy.body.setAllowGravity(true); enemy.setCollideWorldBounds(true);
    enemy.setBounce(0, 0); enemy.setDragX(0, false); enemy.setMaxVelocity(700, 950);
    enemy.setVelocity(0, 0); enemy.body.setSize(54, 54); enemy.body.setOffset(-1, -1);
    const speed = elementId === "lightning" ? 510 : elementId === "wind" ? 440 : elementId === "earth" ? 320 : elementId === "water" ? 365 : 390;
    enemy.setVelocityX(direction * speed);
    ball.setScale(1.45);
    this.tweens.add({ targets: ball, scale: 1.7, duration: 130, yoyo: true });
    this.spawnElementBallEffects(enemy.x, enemy.y, elementId, "kick", 1.15);
    const flash = this.add.circle(enemy.x, enemy.y, 36, palette.glow, 0.8).setStrokeStyle(5, palette.edge).setDepth(20);
    this.tweens.add({ targets: flash, scale: 2.3, alpha: 0, duration: 220, onComplete: () => flash.destroy() });
    this.audio.play("ballRoll");
    this.statusLabel.setText(elementId === "wind" ? "TWISTER! CLEAR THE PATH!" : elementId === "water" ? "WATER SURGE! FLOW FORWARD!" : "ELEMENTAL POWER! CLEAR THE PATH!").setColor("#ffe17a");
    this.cameras.main.shake(130, 0.004);
  }

  finishRollingBallCarrier(enemy, ball, animate = true) {
    if (!enemy?.active || enemy.getData("rollingCarrierResolved")) return;
    enemy.setData("rollingCarrierResolved", true);
    // The enemy inside the kicked ball is still a stage enemy. Count it when
    // the rolling-ball lifecycle ends, otherwise the stage quota can never clear.
    this.recordEnemyDefeat(enemy);
    this.dropReward(enemy.x, enemy.y);
    this.addScore(500);
    this.audio.play("ballEnd");
    const endElement = enemy.getData("rollElementId") || ball?.getData("elementId") || "fire";
    const endPalette = getElement(endElement);
    this.spawnElementBallEffects(enemy.x, enemy.y, endElement, "impact", 1.25);
    const endRing = this.add.circle(enemy.x, enemy.y, 34, endPalette.glow, 0)
      .setStrokeStyle(4, endPalette.edge, 0.96).setDepth(20);
    this.tweens.add({
      targets: endRing,
      scale: 2.8,
      alpha: 0,
      duration: 300,
      ease: "Cubic.easeOut",
      onComplete: () => endRing.destroy(),
    });
    if (animate && ball?.active) {
      this.tweens.add({
        targets: ball,
        scale: 0.2,
        alpha: 0,
        duration: 180,
        onComplete: () => {
          if (ball.active) ball.destroy();
          if (enemy.active) enemy.destroy();
        }
      });
    } else {
      if (ball?.active) ball.destroy();
      enemy.destroy();
    }
  }

  updateRollingBall(enemy, delta) {
    const ball = enemy.getData("elementBall");
    if (!ball?.active) { this.finishRollingBallCarrier(enemy, null, false); return; }
    const elementId = enemy.getData("rollElementId") || ball.getData("elementId") || "fire";
    const motion = calculateRollingBallMotion({
      velocityX: enemy.body.velocity.x, direction: enemy.getData("rollDirection") || 1, deltaMs: delta,
      grounded: enemy.body.blocked.down,
      blockedLeft: enemy.body.blocked.left && this.time.now - (enemy.getData("rollLastWallImpactAt") || 0) > 170,
      blockedRight: enemy.body.blocked.right && this.time.now - (enemy.getData("rollLastWallImpactAt") || 0) > 170,
      wallBounces: enemy.getData("rollWallBounces") || 0,
    });
    enemy.setData("rollDirection", motion.direction); enemy.setData("rollWallBounces", motion.wallBounces || 0);
    if (motion.hitWall) {
      enemy.setData("rollLastWallImpactAt", this.time.now); this.cameras.main.shake(150, 0.006);
      this.spawnElementBallEffects(enemy.x, enemy.y, elementId, "impact", 1.2);
      enemy.setX(Phaser.Math.Clamp(enemy.x + motion.direction * 8, 32, 928));
    }
    if (motion.finished) {
      enemy.setVelocity(0, 0); enemy.body.enable = false; this.finishRollingBallCarrier(enemy, ball, true); return;
    }
    // Keep collision physics stable while each element gets a clearly different
    // visual motion profile. All animation is applied to the cached sprite.
    enemy.setVelocityX(motion.velocityX);
    const now = this.time.now;
    const direction = enemy.getData("rollDirection") || 1;
    const motionStyle = ball.getData("motionStyle") || elementId;
    const phase = now * 0.001;
    const bobProfiles = {
      fire: Math.sin(phase * 10) * 2.5,
      ice: Math.sin(phase * 3) * 1.2,
      lightning: Math.sin(phase * 18) * 3.2,
      water: Math.sin(phase * 7) * 3.5,
      nature: Math.sin(phase * 4) * 2.2,
      wind: Math.sin(phase * 11) * 6,
      earth: Math.abs(Math.sin(phase * 5)) * -2.4,
      light: Math.sin(phase * 5) * 1.5,
      shadow: Math.sin(phase * 3) * 1.8,
      plasma: Math.sin(phase * 13) * 3,
    };
    ball.setPosition(enemy.x, enemy.y + (bobProfiles[elementId] || 0));

    // Element-specific trail cadence: water leaves flowing ripples, wind a
    // continuous spiral wake, and fast elements get tighter energetic accents.
    const trailIntervals = { fire: 310, ice: 520, lightning: 190, water: 235, nature: 430, wind: 245, earth: 480, light: 360, shadow: 470, plasma: 220 };
    const nextTrailAt = enemy.getData("nextSnowTrailAt") || 0;
    if (now >= nextTrailAt) {
      enemy.setData("nextSnowTrailAt", now + (trailIntervals[elementId] || 400));
      const trailX = enemy.x - direction * (elementId === "wind" ? 24 : 19);
      const trailY = enemy.y + (elementId === "water" ? 9 : 5);
      this.spawnElementBallEffects(trailX, trailY, elementId, "trail", elementId === "water" || elementId === "wind" ? 0.9 : 0.7);
    }

    const spinRates = { wind: 2.35, water: 0.16, lightning: 2.7, ice: 0.62, nature: 0.9, earth: 0.72, light: 1.5, shadow: 0.58, plasma: 1.85, fire: 1.35 };
    ball.angle += motion.rotationDelta * (spinRates[elementId] || 1);
    const pulseRates = { fire: 0.025, ice: 0.009, lightning: 0.032, water: 0.015, nature: 0.012, wind: 0.02, earth: 0.007, light: 0.018, shadow: 0.011, plasma: 0.024 };
    const pulse = Math.sin(now * (pulseRates[elementId] || 0.015));
    // Stretch/squash and spin communicate the material: water flows sideways,
    // wind forms a tall vortex, earth stays dense, and lightning snaps rapidly.
    switch (motionStyle) {
      case "twister":
        ball.setScale(1.35 + pulse * 0.07, 1.72 + Math.cos(phase * 8) * 0.14);
        ball.angle += direction * 0.9;
        break;
      case "flow":
        ball.setScale(1.72 + pulse * 0.12, 1.12 + Math.cos(phase * 9) * 0.13);
        ball.angle = Phaser.Math.Linear(ball.angle, 0, 0.16);
        break;
      case "spark-dash":
        ball.setScale(1.38 + pulse * 0.13, 1.46 - pulse * 0.1);
        ball.angle += Phaser.Math.Between(-2, 2);
        break;
      case "flame":
      case "plasma":
        ball.setScale(1.48 + pulse * 0.09, 1.42 - pulse * 0.05);
        break;
      case "ice-roll":
        ball.setScale(1.43 + pulse * 0.025, 1.48 - pulse * 0.025);
        break;
      case "leaf-roll":
        ball.setScale(1.52 + pulse * 0.05, 1.34 - pulse * 0.04);
        break;
      case "rock-roll":
        ball.setScale(1.43 + pulse * 0.018, 1.43 - pulse * 0.018);
        break;
      case "radiant":
        ball.setScale(1.48 + pulse * 0.055);
        break;
      case "shade":
        ball.setScale(1.5 + pulse * 0.04, 1.53 - pulse * 0.05);
        break;
      default:
        ball.setScale(1.45 + pulse * 0.03);
        break;
    }
    const hits = enemy.getData("rollHits") || [];
    for (const target of this.enemies.getChildren()) {
      if (!target.active || target === enemy || hits.includes(target)) continue;
      if (!canRollingBallHitTarget(target.x - enemy.x, target.y - enemy.y)) continue;
      hits.push(target); enemy.setData("rollHits", hits); this.audio.play("ballImpact");
      this.spawnElementBallEffects(target.x, target.y, elementId, "impact", 1.05);
      if (target.getData("isBoss")) {
        this.hitBoss(target, 3 + (enemy.getData("snowballPowerTier") || 1) * 2);
        this.statusLabel.setText("BOSS HIT BY ELEMENTAL BALL!").setColor("#ffe17a");
      } else {
        const visual = target.getData("visual"); if (visual?.active) visual.destroy();
        const oldBall = target.getData("elementBall"); if (oldBall?.active) oldBall.destroy();
        const ballPalette = enemy.getData("ballPalette") || this.getPowerPalette();
        const burst = this.add.circle(target.x, target.y, 32, ballPalette.edge, 0.95).setStrokeStyle(5, 0xffffff).setDepth(22);
        this.tweens.add({ targets: burst, scale: 2.8, alpha: 0, duration: 260, onComplete: () => burst.destroy() });
        this.spawnElementBallEffects(target.x, target.y, elementId, "impact", 1.2);
        this.dropReward(target.x, target.y); this.addScore(500); this.recordEnemyDefeat(target); target.destroy();
      }
    }
    if (isRollingBallOutOfBounds(enemy.x)) this.finishRollingBallCarrier(enemy, ball, false);
  }

  specialMove(moveIndex = 0) {
    if (!this.gameStarted || this.gameOver || this.stageCleared) return;
    const moves = this.selectedHero?.specialMoves || [];
    if (!moves.length) return;
    // EXTRA buttons are immediately reusable: no cooldown, countdown, meter,
    // limited-use counter or animation lock.
    const selectedIndex = Math.max(0, Math.min(2, moveIndex));
    const move = moves[selectedIndex];
    const now = this.time.now;
    this.specialActivationCount = (this.specialActivationCount || 0) + 1;
    this.audio.unlock();
    this.audio.play(`${this.selectedHero.id}Power${selectedIndex + 1}`);
    this.specialPoseType = move.type;
    this.specialPoseStartedAt = now;
    this.specialPoseUntil = now + (move.type === "rapid" ? 900 : move.type === "throw" ? 980 : 1050);
    this.specialImpactAt = now + (move.type === "rapid" ? 390 : move.type === "uppercut" ? 420 : 470);
    this.specialImpactTriggered = false;
    this.normalAttackUntil = 0;
    const accent = this.selectedHero.accent || 0x7deaff;
    const title = move.name.toUpperCase();
    this.statusLabel.setText(title + "!").setColor("#ffe17a");
    this.spawnSignatureParticles(this.hero.x + this.facing * 24, this.hero.y - 18, this.selectedHero.id, move.id, 1);
    const ring = this.add.circle(this.hero.x, this.hero.y - 12, 34, accent, 0.16)
      .setStrokeStyle(7, accent, 0.95).setDepth(19);
    this.tweens.add({ targets: ring, scale: move.type === "spin" || move.type === "electric" ? 5.5 : 3.6, alpha: 0, duration: 420, onComplete: () => ring.destroy() });
    this.cameras.main.shake(110, 0.0035);

    const candidates = this.enemies.getChildren().filter(enemy =>
      enemy.active && !enemy.getData("frozen") && !enemy.getData("isTimeHunter") &&
      Math.abs(enemy.x - this.hero.x) < 320 && Math.abs(enemy.y - this.hero.y) < 175
    );
    const inFront = candidates.filter(enemy => (enemy.x - this.hero.x) * this.facing > -28);
    const nearest = inFront.sort((a, b) =>
      Phaser.Math.Distance.Between(this.hero.x, this.hero.y, a.x, a.y) -
      Phaser.Math.Distance.Between(this.hero.x, this.hero.y, b.x, b.y)
    )[0] || null;
    const boss = candidates.find(enemy => enemy.getData("isBoss")) || null;
    const normalTargets = candidates.filter(enemy => !enemy.getData("isBoss"));

    const impact = (enemy, vx, vy) => {
      if (!enemy?.active || enemy.getData("isBoss")) return;
      enemy.setData("wasFlyingBeforeSpecial", enemy.body.allowGravity === false);
      enemy.body.setAllowGravity(true);
      enemy.setCollideWorldBounds(true);
      enemy.setBounce(0);
      enemy.setData("specialKnockback", true);
      enemy.setData("specialKnockbackUntil", this.time.now + 620);
      enemy.setVelocity(vx, vy);

      // Route special impacts through the same authoritative hit pipeline as fire.
      // This keeps enemy damage, defeat counters, score and boss-stage progression in sync.
      const impactProjectile = this.projectiles.create(this.hero.x, this.hero.y - 12, `shot-${this.powerType}`);
      impactProjectile.setData("specialAttack", true);
      impactProjectile.setData("powerType", this.powerType);
      this.hitEnemy(impactProjectile, enemy);

      const visual = enemy.getData("visual");
      if (visual?.active) {
        this.tweens.add({ targets: visual, angle: this.facing * 22, scaleX: 1.2, duration: 95, yoyo: true, repeat: 1 });
      }
      const spark = this.add.star(enemy.x, enemy.y - 10, 7, 5, 12, accent, 0.95)
        .setStrokeStyle(2, 0xffffff).setDepth(24);
      this.tweens.add({ targets: spark, angle: 180, scale: 2.2, alpha: 0, duration: 320, onComplete: () => spark.destroy() });
      this.spawnSignatureParticles(enemy.x, enemy.y - 12, this.selectedHero.id, move.id, 0.8);
      this.addScore(75);
    };

    const launchWave = () => {
      const x = this.hero.x + this.facing * 42;
      const y = this.hero.y - 13;
      const projectile = this.projectiles.create(x, y, `shot-${this.powerType}`);
      projectile.setTint(accent).setScale(2.5).setDepth(17);
      projectile.body.setAllowGravity(false);
      projectile.body.setSize(30, 24);
      projectile.setVelocity(this.facing * 760, -18);
      projectile.setData("powerType", this.powerType);
      projectile.setData("specialAttack", true);
      const glow = this.add.circle(x, y, 24, accent, 0.5).setDepth(16);
      projectile.setData("glow", glow);
      this.tweens.add({ targets: projectile, angle: 360, duration: 180, repeat: -1 });
      this.time.delayedCall(1350, () => {
        if (projectile.active) projectile.destroy();
        if (glow.active) glow.destroy();
      });
      this.cameras.main.flash(90, 255, 235, 170, false);
    };

    if (move.type === "wave") {
      launchWave();
    } else if (move.type === "uppercut") {
      this.hero.setVelocity(this.facing * 115, -560);
      this.jumpCount = Math.max(this.jumpCount, 1);
      const risingTrail = this.add.particles(this.hero.x, this.hero.y + 20, "shot", {
        speed: { min: 35, max: 115 }, angle: { min: 245, max: 295 },
        scale: { start: 0.75, end: 0 }, alpha: { start: 0.75, end: 0 },
        lifespan: 380, quantity: 3, frequency: 28, tint: [accent, 0xffffff], emitting: false
      }).setDepth(18);
      risingTrail.explode(16, this.hero.x, this.hero.y + 22);
      this.time.delayedCall(520, () => { if (risingTrail.active) risingTrail.destroy(); });
      if (nearest && !nearest.getData("isBoss")) impact(nearest, this.facing * 190, -680);
      if (boss) this.hitBoss(boss, 4);
    } else if (move.type === "spin") {
      this.specialPoseType = "spin";
      this.hero.setVelocityX(this.facing * 310);
      this.specialDashUntil = this.time.now + 390;
      const spinArc = this.add.arc(this.hero.x, this.hero.y - 8, 66, 205, 155, false, accent, 0.85)
        .setStrokeStyle(12, accent, 0.9).setDepth(20);
      this.tweens.add({ targets: spinArc, angle: 360, alpha: 0, scale: 1.55, duration: 480, onComplete: () => spinArc.destroy() });
      normalTargets.filter(enemy => Math.abs(enemy.x - this.hero.x) < 245 && Math.abs(enemy.y - this.hero.y) < 145)
        .forEach(enemy => {
          const direction = enemy.x >= this.hero.x ? 1 : -1;
          impact(enemy, direction * 470, -390);
        });
      if (boss) this.hitBoss(boss, 4);
    } else if (move.type === "rapid") {
      normalTargets.filter(enemy => Math.abs(enemy.x - this.hero.x) < 210 && Math.abs(enemy.y - this.hero.y) < 145)
        .forEach((enemy, index) => {
          const direction = enemy.x >= this.hero.x ? 1 : -1;
          impact(enemy, direction * (330 + index * 18), -300);
        });
      if (boss) this.hitBoss(boss, 4);
      this.tweens.add({ targets: this.heroVisual, scaleX: 1.2, duration: 75, yoyo: true, repeat: 3 });
    } else if (move.type === "electric") {
      const burst = this.add.circle(this.hero.x, this.hero.y - 8, 48, accent, 0.28)
        .setStrokeStyle(7, accent, 0.95).setDepth(21);
      this.tweens.add({ targets: burst, scale: 4.4, alpha: 0, duration: 430, onComplete: () => burst.destroy() });
      normalTargets.filter(enemy => Math.abs(enemy.x - this.hero.x) < 235 && Math.abs(enemy.y - this.hero.y) < 155)
        .forEach(enemy => {
          const direction = enemy.x >= this.hero.x ? 1 : -1;
          impact(enemy, direction * 360, -460);
        });
      if (boss) this.hitBoss(boss, 5);
    } else if (move.type === "roll") {
      this.hero.setVelocityX(this.facing * 520);
      this.specialDashUntil = this.time.now + 420;
      this.tweens.add({ targets: this.heroVisual, angle: this.facing * 540, scaleX: 1.35, scaleY: 0.82, duration: 420 });
      normalTargets.filter(enemy => (enemy.x - this.hero.x) * this.facing > -20 && Math.abs(enemy.x - this.hero.x) < 270 && Math.abs(enemy.y - this.hero.y) < 130)
        .forEach(enemy => impact(enemy, this.facing * 560, -360));
      if (boss) this.hitBoss(boss, 4);
    } else if (move.type === "throw") {
      if (boss) {
        this.hitBoss(boss, 3);
        this.statusLabel.setText("BOSS RESISTS THE THROW!").setColor("#ffcf75");
      } else if (nearest) {
        impact(nearest, this.facing * 650, -590);
        this.statusLabel.setText("WILD FANG THROW!").setColor("#ffe17a");
      }
    }

    if (!nearest && !boss && !normalTargets.length && move.type !== "wave") {
      this.statusLabel.setText(title + " - NO ENEMY IN RANGE").setColor("#9feaff");
    }
  }

  superAttack() {
    if (this.time.now < this.superReadyAt) {
      this.statusLabel.setText("SUPER POWER IS RECHARGING!").setColor("#d9f6ff");
      return;
    }
    this.superReadyAt = this.time.now + 12000;
    const palette = this.getPowerPalette();
    const label = this.selectedHero?.superPower || "Guardian Burst";
    const ring = this.add.circle(this.hero.x, this.hero.y - 12, 35, palette.glow, 0.18)
      .setStrokeStyle(8, palette.edge, 0.95).setDepth(18);
    this.tweens.add({ targets: ring, scale: 5.5, alpha: 0, duration: 520, onComplete: () => ring.destroy() });
    this.cameras.main.flash(180, 210, 235, 255, false);
    this.cameras.main.shake(180, 0.006);
    this.statusLabel.setText(`${label.toUpperCase()}!`).setColor("#ffe17a");
    const heroId = this.selectedHero?.id || "ryo";
    const spread = heroId === "mei"
      ? [-0.9, -0.6, -0.3, 0, 0.3, 0.6, 0.9]
      : heroId === "volt" ? [-0.12, 0, 0.12] : [-0.62, -0.31, 0, 0.31, 0.62];
    const speed = heroId === "volt" ? 920 : heroId === "mei" ? 560 : 680;
    spread.forEach((offset, index) => {
      const projectile = this.projectiles.create(this.hero.x + this.facing * 40, this.hero.y - 8, `shot-${this.powerType}`);
      projectile.setTint(palette.ball).setScale(heroId === "volt" ? 3.4 : 2.8).setDepth(16);
      projectile.body.setAllowGravity(false);
      projectile.body.setSize(28, 28);
      const angle = offset * this.facing;
      projectile.body.setVelocity(Math.cos(angle) * this.facing * speed, Math.sin(angle) * speed);
      projectile.setData("superAttack", true);
      projectile.setData("powerType", this.powerType);
      this.spawnElementParticles(projectile.x, projectile.y, this.powerType, 8, 0.7);
      const glow = this.add.circle(projectile.x, projectile.y, 22, palette.glow, 0.55).setDepth(15);
      projectile.setData("glow", glow);
      this.tweens.add({ targets: projectile, angle: 360, duration: 170 + index * 15, repeat: -1 });
      this.time.delayedCall(1500, () => {
        if (projectile.active) projectile.destroy();
        if (glow.active) glow.destroy();
      });
    });
  }

  fireAttack(charge = 0) {
    const now = this.time.now;
    if (now - this.lastAttack < 170) return;
    this.lastAttack = now;
    this.audio.unlock();
    this.audio.play(`${this.selectedHero?.id || "ryo"}Attack`);
    this.audio.play(`element-${this.powerType}`);
    this.normalAttackUntil = now + 190;
    const combo = now - (this.lastComboAt || 0) < 620 ? ((this.normalComboCount || 0) + 1) % 3 : 0;
    this.normalComboCount = combo;
    this.lastComboAt = now;
    this.normalAttackKind = combo === 2 ? "kick" : "punch";
    if (this.kickNearestElementBall()) return;
    const meleeTarget = this.enemies.getChildren().find((enemy) => enemy.active &&
      !enemy.getData("frozen") && Math.abs(enemy.y - this.hero.y) < 72 &&
      (enemy.x - this.hero.x) * this.facing > -18 &&
      (enemy.x - this.hero.x) * this.facing < 88);
    if (meleeTarget) {
      this.audio.play(combo === 2 ? "kick" : "punch");
      if (meleeTarget.getData("isBoss")) this.hitBoss(meleeTarget, combo === 2 ? 3 : 2);
      else {
        const strike = this.projectiles.create(this.hero.x + this.facing * 42, this.hero.y - 12, `shot-${this.powerType}`);
        strike.setData("specialAttack", combo === 2);
        strike.setData("powerType", this.powerType);
        this.hitEnemy(strike, meleeTarget);
        meleeTarget.setVelocity(this.facing * (combo === 2 ? 310 : 185), combo === 2 ? -260 : -120);
        this.addScore(40);
      }
      const impact = this.add.circle(meleeTarget.x, meleeTarget.y - 12, combo === 2 ? 26 : 18,
        combo === 2 ? 0xffc766 : 0xffffff, 0.82).setDepth(25);
      this.tweens.add({ targets: impact, scale: 2.4, alpha: 0, duration: 180, onComplete: () => impact.destroy() });
    }
    const power = this.getPowerPalette();
    const strength = Phaser.Math.Clamp(charge / 1500, 0, 1);
    const isFire = this.powerType === "fire";
    // Fire has three mechanically distinct normal attacks: quick Ember Shot,
    // a two-lane Flame Fan, and a slower wide Dragon Wave on the kick beat.
    const fireKind = isFire ? (combo === 1 ? "fan" : combo === 2 ? "dragon-wave" : "ember-shot") : "element-shot";
    const radius = 22 + strength * 22;
    const startX = this.hero.x + this.facing * 43, startY = this.hero.y - 8;
    const shots = fireKind === "fan" ? [{ y: -13, vy: -72 }, { y: 13, vy: 72 }] : [{ y: 0, vy: 0 }];
    shots.forEach((shot) => {
      const wide = fireKind === "dragon-wave";
      const shotX = startX, shotY = startY + shot.y;
      const glow = this.add.circle(shotX, shotY, wide ? radius * 1.8 : radius * 1.15, power.glow, wide ? 0.68 : 0.5).setDepth(12);
      const projectile = this.projectiles.create(shotX, shotY, `shot-${this.powerType}`);
      projectile.setTint(power.ball).setScale(wide ? 2.9 + strength * 1.1 : fireKind === "fan" ? 1.35 + strength : 1.8 + strength * 1.8).setDepth(14);
      const speed = wide ? 560 + strength * 160 : fireKind === "fan" ? 660 + strength * 180 : 780 + strength * 300;
      projectile.setVelocityX(this.facing * speed).setVelocityY(shot.vy);
      projectile.body.setAllowGravity(false);
      projectile.body.setSize(wide ? 48 : fireKind === "fan" ? 18 : 22 + strength * 24, wide ? 34 : 18 + strength * 12);
      projectile.body.setOffset(0, 0); projectile.setData("glow", glow);
      projectile.setData("powerType", this.powerType); projectile.setData("charge", strength);
      projectile.setData("fireAttackType", fireKind);
      this.spawnElementParticles(shotX, shotY, this.powerType, wide ? 18 : 8, wide ? 1.15 : 0.75, fireKind);
      const trail = this.add.circle(shotX - this.facing * (wide ? 24 : 12), shotY, wide ? 17 : 9 + strength * 8, power.trail, 0.9).setDepth(13);
      projectile.setData("trail", trail);
      this.tweens.add({ targets: projectile, angle: this.facing * (wide ? 18 : 360), duration: wide ? 260 : 240, repeat: -1 });
      this.tweens.add({ targets: glow, scale: wide ? 2.5 : 1.9 + strength, alpha: 0.04, duration: 170, yoyo: true, repeat: -1 });
      this.time.delayedCall(1500, () => { if (projectile.active) { if (glow.active) glow.destroy(); if (trail.active) trail.destroy(); projectile.destroy(); } });
    });
    if (fireKind === "dragon-wave") {
      const arc = this.add.arc(startX + this.facing * 18, startY, 42, 205, 155, false, 0xffa23b, 0.85)
        .setStrokeStyle(9, 0xffdf75, 0.95).setDepth(13);
      this.tweens.add({ targets: arc, scaleX: 2.2, scaleY: 1.35, alpha: 0, duration: 320, onComplete: () => arc.destroy() });
    }
    this.tweens.add({ targets: this.heroVisual, scaleX: this.facing * (fireKind === "dragon-wave" ? 1.2 : 1.12), duration: 80, yoyo: true });
  }

  update(time, delta) {
    if (
      this.keys.restart &&
      Phaser.Input.Keyboard.JustDown(this.keys.restart) &&
      this.stageCleared
    ) {
      this.advanceToNextStage();
      return;
    }

    if (this.stageTransitionActive) return;
    if (this.defeated >= this.stageEnemyCount && !this.stageConfig.boss && !this.stageCleared) this.completeStage();
    const collectingStagePoints = this.stageCleared && this.stageCollectionActive;
    if ((this.stageCleared && !collectingStagePoints) || this.gameOver) {
      this.setMobileControlsVisible(false);
      return;
    }
    if (!this.hero || !this.gameStarted) return;
    if (!collectingStagePoints) {
      const elapsedSeconds = Math.floor((time - this.stageStartedAt - (this.bonusMode ? time - this.bonusStartedAt : 0)) / 1000);
      this.stageTimeLeft = Math.max(0, (this.stageConfig.timeLimit || 120) - elapsedSeconds);
      if (this.timerLabel?.active) {
        const mm = Math.floor(this.stageTimeLeft / 60).toString().padStart(2, "0");
        const ss = (this.stageTimeLeft % 60).toString().padStart(2, "0");
        this.timerLabel.setText(`${mm}:${ss}`).setColor(this.stageTimeLeft <= 15 ? "#ff7777" : "#ffffff");
      }
      if (this.stageTimeLeft <= 0 && !this.timeHunterSpawned && !this.stageConfig.isBossStage) this.spawnTimeHunter();
      if (this.bonusMode) {
        const remaining = Math.max(0, Math.ceil((this.bonusUntil - time) / 1000));
        if (this.statusLabel?.active) this.statusLabel.setText(`BONUS ROUND: ${remaining}s`).setColor("#ff8cda");
        if (time >= this.bonusUntil) this.finishBonusStage();
      }
    } else {
      this.setMobileControlsVisible(true);
    }
    if (this.treasureChest?.active && !this.treasureChest.getData("opened") &&
        Phaser.Math.Distance.Between(this.hero.x, this.hero.y, this.treasureChest.x, this.treasureChest.y) < 58) {
      this.openTreasureChest();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.cyclePower) || this.consumeMobileAction("cyclePower")) this.cyclePower();
    if (Phaser.Input.Keyboard.JustDown(this.keys.musicToggle)) this.toggleAudioChannel("music");
    if (Phaser.Input.Keyboard.JustDown(this.keys.sfxToggle)) this.toggleAudioChannel("sfx");
    if (Phaser.Input.Keyboard.JustDown(this.keys.super) || this.touch.super || this.consumeMobileAction("super")) {
      this.superAttack();
      this.touch.super = false;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.special1) || this.touch.special1 || this.consumeMobileAction("special1")) {
      this.specialMove(0);
      this.touch.special1 = false;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.special2) || this.touch.special2 || this.consumeMobileAction("special2")) {
      this.specialMove(1);
      this.touch.special2 = false;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.special3) || this.touch.special3 || this.consumeMobileAction("special3")) {
      this.specialMove(2);
      this.touch.special3 = false;
    }

    const keyAxis = (this.keys.left.isDown || this.keys.a.isDown ? -1 : 0) +
      (this.keys.right.isDown || this.keys.d.isDown ? 1 : 0);
    const moveAxis = keyAxis || this.touch.axis || 0;
    const left = moveAxis < -0.16;
    const right = moveAxis > 0.16;

    if (Phaser.Input.Keyboard.JustDown(this.keys.attack) || (this.touch.attack && !this.attackHeld)) {
      this.attackHeld = true; this.attackChargeStart = time;
    }
    const attackDown = this.keys.attack.isDown || this.touch.attack;
    if (attackDown && this.attackHeld) {
      this.attackCharge = Phaser.Math.Clamp(time - this.attackChargeStart, 0, 1500);
      if (this.attackRing) this.attackRing.setScale(1 + this.attackCharge / 1500 * 0.45).setAlpha(0.65 + this.attackCharge / 1500 * 0.35);
    } else if (this.attackHeld) {
      this.attackHeld = false; this.fireAttack(this.attackCharge); this.attackCharge = 0;
      if (this.attackRing) this.attackRing.setScale(1).setAlpha(0.65);
    }

    const jump =
      Phaser.Input.Keyboard.JustDown(this.keys.jump) ||
      Phaser.Input.Keyboard.JustDown(this.keys.up) ||
      this.touch.jump || this.consumeMobileAction("jump") ||
      (this.mobileJumpHeld && this.jumpCount === 1 && !this.hero.body.blocked.down &&
        time - this.mobileJumpPressedAt >= 180);
    const wantsDropThrough = shouldDropThroughPlatform({
      jumpPressed: jump,
      downHeld: this.keys.down.isDown || this.touch.down,
      grounded: this.hero.body.blocked.down,
      isGround: this.hero.y >= 455,
    });

    if (time < (this.specialDashUntil || 0)) {
      this.hero.setVelocityX(this.facing * 500);
    } else if (Math.abs(moveAxis) > 0.16) {
      this.hero.setVelocityX(moveAxis * 270);
      this.facing = moveAxis < 0 ? -1 : 1;
    } else {
      this.hero.setVelocityX(0);
    }

    if (this.hero.body.blocked.down) this.jumpCount = 0;
    if (wantsDropThrough) {
      this.dropThroughUntil = time + 190;
      this.jumpCount = 0;
      this.hero.setVelocityY(190);
      this.audio.unlock();
      this.audio.play("jump");
      this.statusLabel.setText("DROP THROUGH!").setColor("#8feaff");
    } else if (jump && this.jumpCount < 2) {
      this.audio.unlock();
      this.audio.play(this.jumpCount === 0 ? "jump" : "doubleJump");
      this.jumpCount++;
      const movingLeft = left && !right, movingRight = right && !left;
      this.jumpFlipDirection = movingLeft ? -1 : 1;
      this.jumpWasMoving = movingLeft || movingRight;
      this.jumpStartedAt = time;
      this.hero.setVelocityY(this.jumpCount === 1 ? -470 : -445);
      if (this.jumpCount === 1) {
        this.tweens.add({ targets: this.heroVisual, scaleY: 0.88, duration: 90, yoyo: true, ease: "Quad.easeOut" });
      } else {
        this.hero.setVelocityY(-445);
        this.heroVisual.setAngle(this.facing * 360);
        const palette = this.getPowerPalette();
        const burst = this.add.circle(this.hero.x, this.hero.y + 12, 18, palette.glow, 0.72)
          .setStrokeStyle(4, palette.edge).setDepth(18);
        this.tweens.add({ targets: burst, scale: 2.7, alpha: 0, duration: 280,
          onComplete: () => burst.destroy() });
        this.tweens.add({ targets: this.heroVisual, angle: this.facing * 720,
          scaleX: this.facing * 1.12, scaleY: 0.9, duration: 260, ease: "Cubic.easeOut" });
        this.statusLabel.setText("DOUBLE JUMP!").setColor("#ffe17a");
      }
    }

    this.touch.jump = false;

    // Hero animation
    const h = this.hero;
    const visual = this.heroVisual;
    const p = visual.getData("parts");

    this.heroAnimTime += delta;

    const t = this.heroAnimTime * 0.012;
    const moving = Math.abs(h.body.velocity.x) > 10;
    const airborne = !h.body.blocked.down;
    const heroId = this.selectedHero?.id || "ryo";
    if (!airborne && moving && time >= (this.nextFootstepAt || 0)) {
      this.audio.play("step");
      this.nextFootstepAt = time + (heroId === "volt" ? 235 : 275);
    }
    const gait = {
      ryo:   { stride: 0.44, guard: 0.76, bounce: 2.0, cadence: 2.25 },
      kairo: { stride: 0.58, guard: 0.68, bounce: 2.8, cadence: 2.65 },
      mei:   { stride: 0.38, guard: 0.92, bounce: 1.7, cadence: 2.05 },
      volt:  { stride: 0.68, guard: 0.62, bounce: 3.2, cadence: 2.9 }
    }[heroId] || { stride: 0.44, guard: 0.76, bounce: 2.0, cadence: 2.25 };

    const attacking =
      this.touch.attack ||
      this.keys.attack.isDown;

    if (time >= (this.heroEntryUntil || 0)) visual.setPosition(h.x, h.y);
    visual.setScale(this.facing, 1);

    // Restore every articulated part to its authored anchor before posing.
    // This prevents hand/foot offsets from one special move leaking into later
    // movement, previews, facing changes, or another character selection.
    p.handL.setPosition(-24, 27);
    p.handR.setPosition(24, 27);
    p.shoeL.setPosition(-12, 39);
    p.shoeR.setPosition(12, 39);
    p.legL.setPosition(-11, 24);
    p.legR.setPosition(11, 24);
    p.armL.setPosition(-23, 1);
    p.armR.setPosition(23, 1);

    if (airborne) {
      const jumpProgress = Phaser.Math.Clamp((time - this.jumpStartedAt) / 620, 0, 1);
      const flipAngle = Math.sin(jumpProgress * Math.PI) * 360 * this.jumpFlipDirection;
      const tuck = Math.sin(jumpProgress * Math.PI);
      visual.setAngle(this.jumpWasMoving ? flipAngle : Math.sin(jumpProgress * Math.PI) * 18);
      p.legL.rotation = -0.78 + Math.sin(t * 2) * 0.12 - tuck * 0.12;
      p.legR.rotation = 0.78 - Math.sin(t * 2) * 0.12 + tuck * 0.12;
      p.armL.rotation = -1.05 - gait.guard * 0.12;
      p.armR.rotation = 1.05 + gait.guard * 0.12;
      p.handL.y = 15; p.handR.y = 15;
      p.shoeL.y = 38; p.shoeR.y = 38;
      visual.y = h.y - tuck * 2;
      visual.setScale(this.facing, 1.04 + tuck * 0.025);
    } else if (moving) {
      visual.setAngle(0);
      const swing = Math.sin(t * gait.cadence);
      // Distinct footwork rhythm for each fighter while keeping the guard up.
      p.legL.rotation = -0.12 + swing * gait.stride;
      p.legR.rotation = 0.12 - swing * gait.stride;
      p.armL.rotation = -gait.guard + swing * 0.13;
      p.armR.rotation = gait.guard + swing * 0.13;
      p.handL.y = 13 + Math.max(0, swing) * 3;
      p.handR.y = 12 + Math.max(0, -swing) * 3;
      p.shoeL.y = 39 + Math.max(0, swing) * -5;
      p.shoeR.y = 39 + Math.max(0, -swing) * -5;
      visual.y = h.y - Math.abs(swing) * gait.bounce;
    } else {
      // Individual fighting idle rhythms; no detached or duplicated direction marks.
      const breath = Math.sin(t * (heroId === "mei" ? 0.72 : 0.9));
      visual.setAngle(0);
      p.handL.y = 13 + breath * 1.35;
      p.handR.y = 12 - breath * 1.35;
      p.legL.rotation = -0.1 + breath * 0.025;
      p.legR.rotation = 0.1 - breath * 0.025;
      p.armL.rotation = -gait.guard + breath * 0.045;
      p.armR.rotation = gait.guard - breath * 0.045;
      p.shoeL.y = 39;
      p.shoeR.y = 39;
      visual.y = h.y + breath * 1.5;
    }

    if (attacking) {
      p.armL.rotation = -0.78;
      p.armR.rotation = this.facing * -1.25;
      p.handL.y = 13;
      p.handR.y = 10;
    } else if (time < (this.normalAttackUntil || 0)) {
      if (this.normalAttackKind === "kick") {
        const kick = Math.sin(Phaser.Math.Clamp((this.normalAttackUntil - time) / 190, 0, 1) * Math.PI);
        p.armL.rotation = -0.7;
        p.armR.rotation = this.facing * -0.9;
        p.legR.rotation = this.facing * (1.2 + kick * 0.9);
        p.shoeR.x = 12 + kick * 21;
        p.shoeR.y = 35 - kick * 8;
        visual.setAngle(this.facing * -kick * 0.045);
      } else {
      // Quick straight punch with a planted rear foot and torso lean.
      const punchProgress = Phaser.Math.Clamp((this.normalAttackUntil - time) / 190, 0, 1);
      const punch = Math.sin((1 - punchProgress) * Math.PI);
      p.armL.rotation = -0.78;
      p.armR.rotation = this.facing * (-1.35 - punch * 1.05);
      p.handL.y = 13;
      p.handR.y = 8 - punch * 3;
      p.legL.rotation = -0.2;
      p.legR.rotation = 0.3;
      visual.setAngle(this.facing * -punch * 0.055);
      }
    } else {
      p.handR.y = 12;
    }

    const specialActive = time < (this.specialPoseUntil || 0);
    const hitActive = time < (this.heroHitUntil || 0);
    const heroSprite = visual.getData("heroSprite");
    const heroRigParts = visual.getData("heroRigParts") || [];
    const heroLookItems = visual.getData("heroLookItems") || [];

    // Keep the selected hero's authored sprite visible during every action.
    // The legacy vector rig is a shared fallback model and looks like the old
    // default hero when it is swapped in for attacks/specials/hit reactions.
    // Action poses are now played by the selected hero's own sprite sheet.
    if (heroSprite?.active) heroSprite.setVisible(true);
    heroRigParts.forEach((part) => {
      if (part?.active) part.setVisible(false);
    });
    heroLookItems.forEach((part) => {
      if (part?.active) part.setVisible(false);
    });
    const specialProgress = specialActive
      ? Phaser.Math.Clamp((time - (this.specialPoseStartedAt || time)) / Math.max(1, (this.specialPoseUntil || time) - (this.specialPoseStartedAt || time)), 0, 1)
      : 0;

    // One decisive impact beat makes every special read like a fighting-game move:
    // the strike lands after its wind-up, then a sharp hit-stop and directional burst sell contact.
    if (this.specialPoseType && !this.specialImpactTriggered && time >= (this.specialImpactAt || Infinity)) {
      this.specialImpactTriggered = true;
      const accent = this.selectedHero?.accent || 0x7deaff;
      const impactX = h.x + this.facing * (this.specialPoseType === "uppercut" ? 18 : 58);
      const impactY = h.y - (this.specialPoseType === "uppercut" ? 42 : 14);
      const burst = this.add.circle(impactX, impactY, 12, 0xffffff, 0.9)
        .setStrokeStyle(5, accent, 1).setDepth(28);
      const slash = this.add.graphics().setDepth(27);
      slash.lineStyle(this.specialPoseType === "electric" ? 8 : 6, accent, 0.95);
      const rays = this.specialPoseType === "uppercut" ? 7 : this.specialPoseType === "rapid" ? 10 : 8;
      for (let i = 0; i < rays; i++) {
        const angle = this.specialPoseType === "uppercut"
          ? -Math.PI / 2 + (i - (rays - 1) / 2) * 0.19
          : (Math.PI * 2 * i) / rays;
        const inner = this.specialPoseType === "throw" ? 10 : 18;
        const outer = this.specialPoseType === "wave" || this.specialPoseType === "roll" ? 72 : 48;
        slash.lineBetween(
          impactX + Math.cos(angle) * inner,
          impactY + Math.sin(angle) * inner,
          impactX + Math.cos(angle) * outer,
          impactY + Math.sin(angle) * outer
        );
      }
      this.tweens.add({ targets: burst, scale: 3.8, alpha: 0, duration: 210, ease: "Cubic.easeOut", onComplete: () => burst.destroy() });
      this.tweens.add({ targets: slash, alpha: 0, duration: 190, onComplete: () => slash.destroy() });
      this.cameras.main.shake(95, this.specialPoseType === "electric" || this.specialPoseType === "throw" ? 0.007 : 0.0045);
      this.cameras.main.flash(65, 255, 245, 220, false);
      // A brief visual hit-stop (not a move lock or cooldown); inputs remain usable.
      this.specialHitStopUntil = time + 48;
    }

    if (specialActive) {
      const sign = this.facing;
      const progress = specialProgress;
      const smooth = (a, b, value) => {
        const v = Phaser.Math.Clamp((value - a) / (b - a), 0, 1);
        return v * v * (3 - 2 * v);
      };
      // Every move has readable anticipation, strike, impact hold and recovery.
      // The pose is driven by the animation clock, not by attack cooldowns.
      const windUp = 1 - smooth(0.04, 0.25, progress);
      const strike = smooth(0.20, 0.36, progress) * (1 - smooth(0.56, 0.73, progress));
      const recoil = smooth(0.68, 0.98, progress);
      const impactPulse = Math.sin(smooth(0.34, 0.43, progress) * Math.PI);
      visual.setAngle(0);
      p.handL.y = 14;
      p.handR.y = 14;

      if (this.specialPoseType === "wave") {
        // Two-hand energy strike: compact chamber, hip turn, extended lead palm and recoil.
        const chamber = windUp;
        const extension = strike * (1 - recoil * 0.25);
        p.armL.rotation = sign * (-1.35 + chamber * 0.48 - extension * 0.18);
        p.armR.rotation = sign * (-2.15 + extension * 1.72 - recoil * 0.24);
        p.handL.x = -24 - extension * 5;
        p.handR.x = 24 + extension * 24;
        p.handL.y = 11 + chamber * 5;
        p.handR.y = 7 - extension * 12;
        p.legL.rotation = -0.42 - extension * 0.18 + recoil * 0.18;
        p.legR.rotation = 0.58 + extension * 0.16;
        visual.x = h.x + sign * (chamber * -7 + extension * 12 - recoil * 4);
        visual.y = h.y + chamber * 3 - extension * 4 + recoil * 3;
        visual.setAngle(sign * (-0.035 - extension * 0.055));
        visual.setScale(sign * (1 + extension * 0.13), 1 - extension * 0.06);
      } else if (this.specialPoseType === "uppercut") {
        // Street-fighter uppercut silhouette: deep squat, loaded rear shoulder, rising fist.
        const launch = smooth(0.14, 0.43, progress);
        const follow = 1 - smooth(0.66, 0.99, progress);
        p.armL.rotation = sign * (-1.42 + windUp * 0.38);
        p.armR.rotation = sign * (-2.72 - launch * 0.62 + recoil * 1.55);
        p.handR.x = 24 + launch * 12;
        p.handR.y = 8 - launch * 20 + recoil * 7;
        p.legL.rotation = -0.2 - windUp * 0.78 - launch * 0.42 + recoil * 0.25;
        p.legR.rotation = 0.2 + windUp * 0.88 + launch * 0.5 - recoil * 0.22;
        visual.x = h.x + sign * (launch * 8);
        visual.y = h.y + windUp * 8 - launch * 8 + recoil * 4;
        visual.setAngle(sign * (-launch * 0.22 + follow * 0.05));
        visual.setScale(sign * (1 - launch * 0.07), 1 + launch * 0.18);
      } else if (this.specialPoseType === "spin") {
        // Pivoting hurricane kick: counter-lean, chambered knee, fully extended kicking leg.
        const turn = smooth(0.16, 0.78, progress);
        const kick = Math.sin(turn * Math.PI);
        const chamber = 1 - smooth(0.12, 0.34, progress);
        p.armL.rotation = sign * (-1.62 - kick * 0.42);
        p.armR.rotation = sign * (1.62 + kick * 0.42);
        p.legL.rotation = -0.55 - chamber * 0.38 + kick * 0.22;
        p.legR.rotation = 0.52 + chamber * 0.35 + kick * 1.52;
        p.shoeR.x = 12 + kick * 24;
        p.shoeR.y = 35 - kick * 13;
        visual.x = h.x + sign * kick * 5;
        visual.setAngle(sign * (turn * 115 - kick * 12));
        visual.setScale(sign * (1 + kick * 0.18), 1 - kick * 0.08);
      } else if (this.specialPoseType === "rapid") {
        // Alternating left-right punches with a visible shoulder/body snap.
        const combo = Math.sin(progress * Math.PI * 12);
        const leftHit = Math.max(0, combo);
        const rightHit = Math.max(0, -combo);
        p.armL.rotation = sign * (-1.55 - leftHit * 1.38 + rightHit * 0.18);
        p.armR.rotation = sign * (-1.55 - rightHit * 1.38 + leftHit * 0.18);
        p.handL.y = 12 - leftHit * 8;
        p.handR.y = 12 - rightHit * 8;
        p.legL.rotation = -0.22 - leftHit * 0.12 + rightHit * 0.12;
        p.legR.rotation = 0.22 + rightHit * 0.12 - leftHit * 0.12;
        visual.x = h.x + sign * combo * 2.5;
        visual.setAngle(sign * combo * 0.065);
        visual.setScale(sign * (1 + Math.max(leftHit, rightHit) * 0.055), 1);
      } else if (this.specialPoseType === "electric") {
        // Low charge crouch, grounded double-fist release and electrical recoil.
        p.armL.rotation = sign * (-1.55 - windUp * 0.62 + strike * 0.58);
        p.armR.rotation = sign * (1.55 + windUp * 0.62 - strike * 0.58);
        p.handL.y = 12 - strike * 9;
        p.handR.y = 12 - strike * 9;
        p.legL.rotation = -0.18 - windUp * 0.55 + recoil * 0.18;
        p.legR.rotation = 0.18 + windUp * 0.55 - recoil * 0.18;
        visual.y = h.y + windUp * 5 - strike * 3 + recoil * 2;
        visual.setScale(sign * (1 + strike * 0.18 + impactPulse * 0.035), 1 - windUp * 0.08);
      } else if (this.specialPoseType === "roll") {
        // Low shoulder-first rush with a forward lean; avoid spinning the whole
        // character like a wheel so the charge reads as a fighting move.
        const dash = smooth(0.12, 0.42, progress) * (1 - smooth(0.72, 0.98, progress));
        p.armL.rotation = sign * (-0.45 - dash * 0.35);
        p.armR.rotation = sign * (0.45 + dash * 0.35);
        p.legL.rotation = -0.65 - dash * 0.35;
        p.legR.rotation = 0.65 + dash * 0.35;
        visual.setAngle(sign * (-0.12 - dash * 0.12));
        visual.setScale(sign * (1.12 + dash * 0.08), 0.82);
      } else if (this.specialPoseType === "throw") {
        // Grapple: secure the opponent, pivot hips, then heave with both arms.
        const grab = smooth(0.10, 0.34, progress);
        const heave = smooth(0.34, 0.56, progress);
        p.armL.rotation = sign * (-1.0 - grab * 0.85 + heave * 0.25);
        p.armR.rotation = sign * (-1.0 - grab * 0.85 - heave * 1.0);
        p.handL.y = 12 - grab * 7;
        p.handR.y = 12 - heave * 10;
        p.legL.rotation = -0.25 - grab * 0.42;
        p.legR.rotation = 0.32 + grab * 0.5;
        visual.x = h.x + sign * (grab * -3 + heave * 7);
        visual.setAngle(sign * (grab * -0.10 + heave * 0.18));
        visual.setScale(sign * (1 + heave * 0.07), 1 - heave * 0.04);
      } else {
        p.armL.rotation = sign * -1.5;
        p.armR.rotation = sign * 1.5;
        p.legL.rotation = -0.3;
        p.legR.rotation = 0.3;
      }
      if (p.kurta?.active) p.kurta.setScale(1, 1 + Math.sin(progress * Math.PI) * 0.06);
      if (p.waistcoat?.active) p.waistcoat.setScale(1, 1 + Math.sin(progress * Math.PI) * 0.06);
    } else if (this.specialPoseType) {
      this.specialPoseType = null;
      this.specialImpactTriggered = false;
      visual.setPosition(h.x, h.y);
      visual.setAngle(0);
      visual.setScale(this.facing, 1);
      if (p.handL?.active) p.handL.setPosition(-24, 27);
      if (p.handR?.active) p.handR.setPosition(24, 27);
      if (p.shoeL?.active) p.shoeL.setPosition(-12, 39);
      if (p.shoeR?.active) p.shoeR.setPosition(12, 39);
      if (p.armL?.active) p.armL.setPosition(-23, 1);
      if (p.armR?.active) p.armR.setPosition(23, 1);
      if (p.legL?.active) p.legL.setPosition(-11, 24);
      if (p.legR?.active) p.legR.setPosition(11, 24);
      if (p.kurta?.active) p.kurta.setScale(1, 1);
      if (p.waistcoat?.active) p.waistcoat.setScale(1, 1);
    }

    if (hitActive && !specialActive) {
      const hitProgress = Phaser.Math.Clamp(
        1 - (this.heroHitUntil - time) / Math.max(1, this.heroHitUntil - this.heroHitStartedAt), 0, 1
      );
      const recoil = 1 - hitProgress;
      const hitDirection = this.heroHitDirection || -this.facing;
      p.armL.rotation = -hitDirection * (0.9 + recoil * 0.25);
      p.armR.rotation = hitDirection * (1.1 + recoil * 0.35);
      p.legL.rotation = -0.18 - recoil * 0.24;
      p.legR.rotation = 0.18 + recoil * 0.24;
      p.handL.y = 16;
      p.handR.y = 16;
      visual.setAngle(-hitDirection * recoil * 0.14);
      visual.setScale(this.facing, 1 - Math.sin(hitProgress * Math.PI) * 0.055);
    }

    // Landing animation
    if (this.heroWasAirborne && !airborne) {
      this.audio.play("land");
      this.setHeroSpriteAnimation(visual, "land");
      this.heroLandAnimUntil = time + 250;
      visual.setScale(this.facing, 0.88);

      this.tweens.add({
        targets: visual,
        scaleY: 1,
        duration: 160,
        ease: "Back.easeOut"
      });
    }

    if (!airborne && moving && this.lastHeroSpriteFacing !== this.facing) {
      this.heroTurnAnimUntil = time + 200;
    }
    this.lastHeroSpriteFacing = this.facing;
    const spriteState = time < (this.heroLandAnimUntil || 0) ? "land"
      : time < (this.heroTurnAnimUntil || 0) && !airborne ? "turn"
        : this.specialPoseType ? "victory"
          : airborne ? "jump"
            : moving ? "walk" : "idle";
    this.setHeroSpriteAnimation(visual, spriteState);

    this.heroWasAirborne = airborne;

    // Enemy AI and animation
    this.enemies.getChildren().forEach(enemy => {
      if (!enemy || !enemy.active) return;

      const enemyVisual = enemy.getData("visual");
      if (this.bonusMode) {
        enemy.setVelocity(0, 0);
        if (enemyVisual?.active) enemyVisual.setPosition(enemy.x, enemy.y);
        return;
      }

      if (enemy.getData("isBoss")) {
        this.updateBoss(enemy, delta);
        return;
      }

      if (this.time.now < (enemy.getData("stompStunnedUntil") || 0)) {
        enemy.setVelocityX(0);
        if (enemyVisual?.active) enemyVisual.setPosition(enemy.x, enemy.y);
        return;
      }

      if (enemy.getData("specialKnockback")) {
        if (enemyVisual?.active) enemyVisual.setPosition(enemy.x, enemy.y);
        if (enemy.body.blocked.down && this.time.now >= (enemy.getData("specialKnockbackUntil") || 0)) {
          enemy.setData("specialKnockback", false);
          enemy.setVelocityX(0);
          if (enemy.getData("wasFlyingBeforeSpecial")) enemy.body.setAllowGravity(false);
          enemy.setData("wasFlyingBeforeSpecial", false);
          if (enemyVisual?.active) enemyVisual.setAngle(0);
        }
        return;
      }

      if (enemyVisual) {
        enemyVisual.setPosition(enemy.x, enemy.y);
      }

      if (enemy.getData("rolling")) {
        this.updateRollingBall(enemy, delta);
        return;
      }

      if (enemy.getData("frozen")) {
        const ball = enemy.getData("elementBall");
        if (ball?.active) { ball.setPosition(enemy.x, enemy.y); ball.angle += delta * 0.12; }
        return;
      }

      if (enemy.getData("isTimeHunter")) {
        const hunterAge = this.time.now - enemy.getData("bornAt");
        const hunterDirection = this.hero.x > enemy.x ? 1 : -1;
        enemy.setVelocityX(hunterDirection * (hunterAge < 10000 ? 48 : 220));
        if (enemy.body.blocked.down && hunterAge > 10000 && this.time.now % 1500 < 30) enemy.setVelocityY(-300);
        if (enemyVisual?.active) {
          enemyVisual.setPosition(enemy.x, enemy.y + Math.sin(this.time.now * 0.012) * 3);
          enemyVisual.setScale(hunterDirection * 1.7, 1.7);
        }
        return;
      }
      const aiType = enemy.getData("aiType") || "chaser";
      const direction = this.hero.x > enemy.x ? 1 : -1;
      const elapsed = this.time.now;
      let speed = 58;
      let visualBob = 0;
      let facing = direction;
      if (aiType === "chaser") {
        const state = enemy.getData("aiState") || "patrol";
        if (state === "patrol" && elapsed >= enemy.getData("aiStateUntil")) {
          enemy.setData("aiState", "chase");
          enemy.setData("aiStateUntil", elapsed + 1250);
        } else if (state === "chase" && elapsed >= enemy.getData("aiStateUntil")) {
          enemy.setData("aiState", "patrol");
          enemy.setData("patrolDirection", -(enemy.getData("patrolDirection") || 1));
          enemy.setData("aiStateUntil", elapsed + 900);
        }
        speed = state === "chase" ? 105 : 52;
        facing = state === "chase" ? direction : enemy.getData("patrolDirection");
      } else if (aiType === "runner") {
        let state = enemy.getData("aiState") || "tell";
        if (state === "tell" && elapsed >= enemy.getData("aiStateUntil")) {
          this.audio.play("enemyAttack");
          state = "dash"; enemy.setData("aiState", state); enemy.setData("aiStateUntil", elapsed + 430);
          enemy.setData("dashDirection", direction);
          this.tweens.add({ targets: enemyVisual, scaleX: 1.35, scaleY: 0.78, duration: 110, yoyo: true });
        } else if (state === "dash" && elapsed >= enemy.getData("aiStateUntil")) {
          state = "recover"; enemy.setData("aiState", state); enemy.setData("aiStateUntil", elapsed + 650);
        } else if (state === "recover" && elapsed >= enemy.getData("aiStateUntil")) {
          state = "tell"; enemy.setData("aiState", state); enemy.setData("aiStateUntil", elapsed + 850);
        }
        speed = state === "dash" ? 245 : state === "recover" ? 0 : 42;
        facing = state === "dash" ? enemy.getData("dashDirection") : direction;
        if (state === "tell" && enemyVisual) enemyVisual.setAlpha(0.65 + Math.sin(elapsed * 0.025) * 0.3);
        else if (enemyVisual) enemyVisual.setAlpha(1);
      } else if (aiType === "guard") {
        const distance = Math.abs(this.hero.x - enemy.x);
        const guarding = distance > 175;
        speed = guarding ? 0 : 138;
        facing = direction;
        if (enemyVisual) enemyVisual.setScale(guarding ? 1.12 : 1, 1);
        if (!guarding && enemy.body.blocked.down && elapsed >= (enemy.getData("nextHop") || elapsed + 900)) {
          enemy.setVelocityY(-190);
          enemy.setData("nextHop", elapsed + 1250);
        }
      } else if (aiType === "charger") {
        let state = enemy.getData("aiState") || "tell";
        if (state === "tell" && elapsed >= enemy.getData("aiStateUntil")) {
          this.audio.play("enemyAttack");
          state = "charge";
          enemy.setData("aiState", state);
          enemy.setData("aiStateUntil", elapsed + 520);
          enemy.setData("dashDirection", direction);
          this.tweens.add({ targets: enemyVisual, scaleX: 1.42, scaleY: 0.72, duration: 120, yoyo: true });
        } else if (state === "charge" && elapsed >= enemy.getData("aiStateUntil")) {
          state = "recover";
          enemy.setData("aiState", state);
          enemy.setData("aiStateUntil", elapsed + 780);
        } else if (state === "recover" && elapsed >= enemy.getData("aiStateUntil")) {
          state = "tell";
          enemy.setData("aiState", state);
          enemy.setData("aiStateUntil", elapsed + 1000);
        }
        speed = state === "charge" ? 285 : state === "recover" ? 0 : 35;
        facing = state === "charge" ? enemy.getData("dashDirection") : direction;
        if (state === "tell" && enemyVisual) enemyVisual.setAlpha(0.55 + Math.sin(elapsed * 0.03) * 0.35);
        else if (enemyVisual) enemyVisual.setAlpha(1);

      } else if (aiType === "flyer") {
        enemy.body.setAllowGravity(false);
        speed = 74 + Math.min(36, Math.abs(this.hero.y - enemy.y) * 0.08);
        facing = direction;
        enemy.setY(225 + Math.sin(elapsed * 0.0025 + (enemy.getData("animTime") || 0)) * 28);
        if (Math.abs(this.hero.x - enemy.x) < 250 && elapsed >= (enemy.getData("nextRangedAt") || 0)) {
          enemy.setData("nextRangedAt", elapsed + 2600);
          this.playEnemyReactionAnimation(enemy, "attack");
          this.spawnEnemyProjectile(enemy, "single");
          if (enemyVisual) enemyVisual.setAlpha(0.5);
          this.time.delayedCall(260, () => { if (enemyVisual?.active) enemyVisual.setAlpha(1); });
        }
      } else if (aiType === "ranged" || aiType === "summoner") {
        const distance = Math.abs(this.hero.x - enemy.x);
        speed = distance > (aiType === "summoner" ? 330 : 285) ? 62 : distance < 175 ? -48 : 0;
        facing = direction;
        if (elapsed >= (enemy.getData("nextRangedAt") || 0)) {
          enemy.setData("nextRangedAt", elapsed + (aiType === "summoner" ? 3200 : 2500));
          this.playEnemyReactionAnimation(enemy, "attack");
          if (enemyVisual) this.tweens.add({ targets: enemyVisual, scaleY: 1.18, duration: 140, yoyo: true });
          this.spawnEnemyProjectile(enemy, aiType === "summoner" ? "triple" : "single");
        }
      } else if (aiType === "ambusher") {
        let state = enemy.getData("aiState") || "tell";
        const distance = Math.abs(this.hero.x - enemy.x);
        if (state === "tell" && distance < 260 && elapsed >= (enemy.getData("aiStateUntil") || 0)) {
          state = "vanish";
          enemy.setData("aiState", state);
          enemy.setData("aiStateUntil", elapsed + 360);
          if (enemyVisual) enemyVisual.setAlpha(0.08);
          enemy.setVelocityX(0);
        } else if (state === "vanish" && elapsed >= enemy.getData("aiStateUntil")) {
          enemy.setPosition(Phaser.Math.Clamp(this.hero.x - direction * 100, 44, 916), enemy.y);
          state = "pounce";
          enemy.setData("aiState", state);
          enemy.setData("aiStateUntil", elapsed + 420);
          enemy.setData("dashDirection", direction);
          this.playEnemyReactionAnimation(enemy, "attack");
          if (enemyVisual) enemyVisual.setAlpha(1);
          this.audio.play("enemyAttack");
        } else if (state === "pounce" && elapsed >= enemy.getData("aiStateUntil")) {
          state = "recover";
          enemy.setData("aiState", state);
          enemy.setData("aiStateUntil", elapsed + 850);
        } else if (state === "recover" && elapsed >= enemy.getData("aiStateUntil")) {
          state = "tell";
          enemy.setData("aiState", state);
          enemy.setData("aiStateUntil", elapsed + 900);
        }
        speed = state === "pounce" ? 310 : state === "recover" || state === "vanish" ? 0 : 34;
        facing = state === "pounce" ? enemy.getData("dashDirection") : direction;
      } else if (aiType === "bomber") {
        const distance = Phaser.Math.Distance.Between(enemy.x, enemy.y, this.hero.x, this.hero.y);
        speed = distance > 110 ? 115 : 0;
        facing = direction;
        if (distance < 118 && elapsed >= (enemy.getData("nextBlastAt") || 0)) {
          enemy.setData("nextBlastAt", elapsed + 3000);
          this.playEnemyReactionAnimation(enemy, "attack");
          this.audio.play("enemyAttack");
          const blast = this.add.circle(enemy.x, enemy.y, 28, 0xff9b55, 0.42)
            .setStrokeStyle(4, 0xffe17a, 0.95).setDepth(24);
          this.tweens.add({ targets: blast, scale: 3.4, alpha: 0, duration: 420, onComplete: () => blast.destroy() });
          this.time.delayedCall(420, () => {
            if (!this.gameOver && enemy.active && this.hero?.active &&
              Phaser.Math.Distance.Between(enemy.x, enemy.y, this.hero.x, this.hero.y) < 118) {
              this.damageHero(this.hero, enemy);
            }
          });
          if (enemyVisual) this.tweens.add({ targets: enemyVisual, scale: 1.65, alpha: 0.35, duration: 130, yoyo: true });
        }
      } else if (aiType === "jumper") {
        speed = 42;
        if (enemy.body.blocked.down && elapsed >= (enemy.getData("nextHop") || elapsed + 700)) {
          enemy.setVelocityY(-360);
          enemy.setData("nextHop", elapsed + 1450);
          speed = 95;
        }
        visualBob = Math.sin(elapsed * 0.012) * 3;
      }
      speed = getEnemyMovementSpeed(aiType, speed);
      enemy.setVelocityX(facing * speed);
      if (enemy.x < 28) { enemy.setX(28); if (aiType === "chaser") enemy.setData("patrolDirection", 1); }
      if (enemy.x > 932) { enemy.setX(932); if (aiType === "chaser") enemy.setData("patrolDirection", -1); }
      if (enemyVisual) {
        const visualScale = enemy.getData("visualScale") || 1;
        enemyVisual.setScale(facing * visualScale, visualScale);
        const parts = enemyVisual.getData("parts");
        const et = (enemy.getData("animTime") || 0) + delta;
        enemy.setData("animTime", et);
        const swing = Math.sin(et * (aiType === "runner" ? 0.026 : 0.018));
        parts.legL.rotation = swing * (aiType === "runner" ? 0.9 : 0.65);
        parts.legR.rotation = -swing * (aiType === "runner" ? 0.9 : 0.65);
        const authoredSprite = enemyVisual.getData("authoredSprite");
        const approvedArtSprite = enemyVisual.getData("approvedArtSprite");
        if (approvedArtSprite?.active) {
          const vx = enemy.body?.velocity?.x || 0;
          const moving = Math.abs(vx) > 18;
          const charging = Math.abs(vx) > 180;
          if (Math.abs(vx) > 2) approvedArtSprite.setFlipX(vx < 0);
          const motionPhase = et * (moving ? 0.026 : 0.009);
          const bob = Math.sin(motionPhase) * (moving ? 2.8 : 1.4);
          const stridePulse = Math.sin(et * 0.042);
          const squash = charging ? 0.94 : moving ? 1 + Math.abs(stridePulse) * 0.035 : 1;
          const attackStartedAt = enemyVisual.getData("approvedAttackStartedAt") || 0;
          const attackUntil = enemyVisual.getData("approvedAttackUntil") || 0;
          const attackActive = this.time.now < attackUntil;
          const attackProgress = attackActive ? Phaser.Math.Clamp((this.time.now - attackStartedAt) / 280, 0, 1) : 0;
          const attackPulse = attackActive ? Math.sin(attackProgress * Math.PI) : 0;
          const facingDirection = Math.abs(vx) > 2 ? (vx < 0 ? -1 : 1) : (this.hero.x < enemy.x ? -1 : 1);
          approvedArtSprite.setPosition(attackActive ? facingDirection * attackPulse * 5 : 0,
            -12 + (attackActive ? -attackPulse * 4 : bob));
          approvedArtSprite.setScale(
            attackActive ? (1 + attackPulse * 0.1) : charging ? 1.08 : squash,
            attackActive ? (1 - attackPulse * 0.09) : charging ? 0.92 : moving ? 1 - Math.abs(stridePulse) * 0.025 : 1
          );
          approvedArtSprite.setAngle(attackActive ? facingDirection * attackPulse * 11
            : charging ? (vx < 0 ? -9 : 9)
              : moving ? Math.sin(et * 0.024) * 2.4 : Math.sin(et * 0.008) * 1.1);
        }
        if (authoredSprite?.active) {
          const enemyKind = enemy.getData("enemyClass") || "special";
          const archetypeId = enemy.getData("enemyArchetypeId");
          const hasPremiumArtwork = getPremiumEnemyFrameIndex(archetypeId) >= 0;
          const idleKey = hasPremiumArtwork ? `enemy-${archetypeId}-idle` : null;
          const animationKey = hasPremiumArtwork ? `enemy-${archetypeId}-move` : `enemy-${enemyKind}-move`;
          const attackKey = hasPremiumArtwork ? `enemy-${archetypeId}-attack` : `enemy-${enemyKind}-strike`;
          const moving = Math.abs(enemy.body.velocity.x) > 18;
          const charging = Math.abs(enemy.body.velocity.x) > 180;
          const wasCharging = Boolean(authoredSprite.getData("attackPose"));
          if (charging && !wasCharging) authoredSprite.play(attackKey, true);
          if (!charging && wasCharging && moving && authoredSprite.anims.currentAnim?.key === attackKey) {
            authoredSprite.play(animationKey, true);
          }
          authoredSprite.setData("attackPose", charging);
          if (moving && !charging && authoredSprite.anims.currentAnim?.key !== attackKey) {
            if (authoredSprite.anims.currentAnim?.key !== animationKey || !authoredSprite.anims.isPlaying) {
              authoredSprite.play(animationKey, true);
            }
          } else if (!moving && authoredSprite.anims.currentAnim?.key !== attackKey) {
            if (idleKey && authoredSprite.anims.currentAnim?.key !== idleKey) authoredSprite.play(idleKey, true);
            else if (!idleKey && authoredSprite.anims.isPlaying) {
              authoredSprite.anims.stop();
              authoredSprite.setFrame(authoredSprite.getData("idleFrame") || 0);
            }
          }
        }
        const stride = aiType === "runner" || aiType === "charger" ? 1.25 : 1;
        parts.armL.rotation = -swing * 0.5 * stride;
        parts.armR.rotation = swing * 0.5 * stride;
        if (parts.body?.active) {
          const bodyPulse = Math.abs(swing) * (aiType === "guard" ? 0.025 : 0.045);
          parts.body.setScale(1 - bodyPulse * 0.45, 1 + bodyPulse);
        }
        if (parts.chestPlate?.active) {
          parts.chestPlate.rotation = swing * 0.055;
          parts.chestPlate.setScale(1 + Math.abs(swing) * 0.025, 1);
        }
        if (parts.chestSigil?.active) {
          parts.chestSigil.rotation = Math.sin(et * 0.004) * 0.12;
          parts.chestSigil.setAlpha(0.78 + (Math.sin(et * 0.006) + 1) * 0.11);
        }
        if (parts.shoulderL?.active) parts.shoulderL.rotation = -swing * 0.07;
        if (parts.shoulderR?.active) parts.shoulderR.rotation = swing * 0.07;
        if (parts.cuffL?.active) parts.cuffL.rotation = -swing * 0.1;
        if (parts.cuffR?.active) parts.cuffR.rotation = swing * 0.1;
        if (parts.eyeGlintL?.active) parts.eyeGlintL.setAlpha(0.7 + (Math.sin(et * 0.005) + 1) * 0.12);
        if (parts.eyeGlintR?.active) parts.eyeGlintR.setAlpha(0.7 + (Math.cos(et * 0.005) + 1) * 0.12);
        if (parts.headband?.active) parts.headband.rotation = swing * 0.035;
        if (parts.foreheadGem?.active) {
          parts.foreheadGem.rotation = Math.sin(et * 0.0035) * 0.16;
          parts.foreheadGem.setAlpha(0.78 + (Math.sin(et * 0.007) + 1) * 0.1);
        }
        if (parts.waistSash?.active) parts.waistSash.rotation = -swing * 0.12;
        if (parts.fastScarf?.active && parts.fastScarf.visible) {
          parts.fastScarf.rotation = -0.12 + Math.sin(et * 0.02) * 0.16;
          parts.fastScarf.setScale(1 + Math.abs(swing) * 0.08, 1);
        }
        if (Array.isArray(parts.backSpikes)) {
          parts.backSpikes.forEach((spike, index) => {
            if (spike?.active) spike.rotation = (index === 0 ? -1 : 1) * (0.04 + swing * 0.035);
          });
        }
        if (parts.heavyKneeL?.active) parts.heavyKneeL.rotation = swing * 0.12;
        if (parts.heavyKneeR?.active) parts.heavyKneeR.rotation = -swing * 0.12;
        if (parts.classCrest?.active) {
          parts.classCrest.rotation = isNaN(et) ? 0 : Math.sin(et * (aiType === "runner" ? 0.018 : 0.004)) * 0.12;
          parts.classCrest.setAlpha(0.82 + (Math.sin(et * 0.006) + 1) * 0.08);
        }
        if (parts.classGuard?.active) {
          const guardMotion = enemy.getData("enemyClass") === "special"
            ? Math.sin(et * 0.004) * 0.06
            : swing * 0.035;
          parts.classGuard.rotation = guardMotion;
        }
        if (parts.bootL?.active) parts.bootL.rotation = parts.legL.rotation * 0.72;
        if (parts.bootR?.active) parts.bootR.rotation = parts.legR.rotation * 0.72;
        if (parts.shadow?.active) parts.shadow.setScale(1 + Math.abs(swing) * 0.045, 1 - Math.abs(swing) * 0.035);
        if (Array.isArray(parts.identityDetails)) {
          parts.identityDetails.forEach((detail, index) => {
            if (!detail?.active) return;
            detail.rotation = Math.sin(et * 0.0035 + index * 0.8) * 0.035;
            detail.setAlpha(0.88 + (Math.sin(et * 0.005 + index) + 1) * 0.055);
          });
        }
        const enemyState = enemy.getData("aiState") || "";
        if ((aiType === "runner" || aiType === "charger") && enemyState === "tell") {
          parts.armL.rotation = -0.9;
          parts.armR.rotation = 0.9;
          parts.legL.rotation = -0.18;
          parts.legR.rotation = 0.18;
          if (parts.body?.active) parts.body.setScale(1.08, 0.9);
        } else if ((aiType === "runner" && enemyState === "dash")
          || (aiType === "charger" && enemyState === "charge")) {
          parts.armL.rotation = -0.42;
          parts.armR.rotation = 0.42;
          parts.legL.rotation = -0.95;
          parts.legR.rotation = 0.95;
          if (parts.body?.active) parts.body.setScale(1.12, 0.88);
          if (parts.fastScarf?.active && parts.fastScarf.visible) {
            parts.fastScarf.rotation = -0.3 + Math.sin(et * 0.035) * 0.12;
          }
        } else if (aiType === "guard") {
          parts.armL.rotation = 0.82;
          parts.armR.rotation = -0.82;
          if (parts.body?.active) parts.body.setScale(1.04, 0.98);
        } else if (aiType === "jumper" && !enemy.body.blocked.down) {
          parts.armL.rotation = -1.05;
          parts.armR.rotation = 1.05;
          parts.legL.rotation = -0.55;
          parts.legR.rotation = 0.55;
        }
        enemyVisual.y = enemy.y + Math.abs(swing) * -2 + visualBob;
        enemyVisual.angle = 0;
      }
    });
    

        // Projectile effects follow the fire
    this.projectiles.getChildren().forEach(projectile => {
      if (!projectile.active) return;

      const elementId = getElement(projectile.getData("powerType") || this.powerType).id;
      if (projectile.getData("elementTextureApplied") !== elementId) {
        projectile.setTexture(`shot-${elementId}`);
        projectile.setData("elementTextureApplied", elementId);
      }
      const velocity = projectile.body?.velocity;
      if (velocity && (Math.abs(velocity.x) + Math.abs(velocity.y) > 1)) {
        const travelAngle = Math.atan2(velocity.y, velocity.x);
        const uprightElements = ["fire", "water", "lightning", "nature", "earth", "shadow", "plasma"];
        projectile.rotation = travelAngle + (uprightElements.includes(elementId) ? Math.PI / 2 : 0);
      }
      const glow = projectile.getData("glow");
      const trail = projectile.getData("trail");

      if (glow && glow.active) {
        glow.setPosition(projectile.x, projectile.y);
      }

      if (trail && trail.active) {
        const direction = Math.sign(projectile.body.velocity.x) || this.facing;
        trail.setPosition(projectile.x - direction * 20, projectile.y);
      }
      const particleClock = projectile.getData("nextElementParticleAt") || 0;
      if (time >= particleClock) {
        projectile.setData("nextElementParticleAt", time + 52);
        this.spawnElementParticles(projectile.x - Math.sign(projectile.body.velocity.x || this.facing) * 13, projectile.y,
          projectile.getData("powerType") || this.powerType, 2, 0.55, projectile.getData("fireAttackType") || "default");
      }
    });

  } // update() CLOSE

} // ZeroGameScene class CLOSE

export default function App() {
  const gameRef = useRef(null);
  const mobilePointers = useRef(new Map());
  const isNativeAndroid = Capacitor.getPlatform() === "android" ||
    (import.meta.env.DEV && window.__ZERO_GAME_TEST_NATIVE_TOUCH__ === true);

  const getPlayableScene = useCallback(() => {
    const game = gameRef.current;
    if (!game) return null;
    const scene = game.scene.getScene("ZeroGameScene");
    if (!scene || !scene.sys.isActive() || !scene.gameStarted || scene.gameOver ||
        (scene.stageCleared && !scene.stageCollectionActive)) return null;
    return scene;
  }, []);

  const getTouchTarget = useCallback((event) => {
    const overlay = event.currentTarget;
    const scene = getPlayableScene();
    // All touch targets use the exact same overlay coordinate system as the
    // rendered game controls. This avoids canvas/WebView scaling mismatches.
    const rect = overlay.getBoundingClientRect();
    if (!rect.width || !rect.height) return null;
    const x = ((event.clientX - rect.left) / rect.width) * 960;
    const y = ((event.clientY - rect.top) / rect.height) * 540;
    const distance = (cx, cy) => Math.hypot(x - cx, y - cy);

    // Keep the established joystick center, radius and movement logic.
    if (distance(132, 448) <= 94) {
      // One finger owns the analog stick; other fingers remain free for any
      // combination of attack buttons, avoiding stale vectors on lift.
      if ([...mobilePointers.current.values()].includes("stick")) return null;
      return "stick";
    }

    const fallbackButtons = [
      ["musicVolume", 610, 43, 34],
      ["sfxVolume", 690, 43, 34],
      ...MOBILE_ACTION_BUTTONS.map(({ action, x, y, radius }) => [action, x, y, radius])
    ];
    const buttons = fallbackButtons.map(([action, fallbackX, fallbackY, radius]) => {
      const visual = scene?.mobileControlVisuals?.get(action);
      return [action, visual?.bg?.x ?? fallbackX, visual?.bg?.y ?? fallbackY, radius];
    });
    let nearest = null;
    let nearestDistance = Infinity;
    for (const [action, cx, cy, radius] of buttons) {
      const d = distance(cx, cy);
      if (d <= radius && d < nearestDistance) {
        nearest = action;
        nearestDistance = d;
      }
    }
    return nearest;
  }, [getPlayableScene]);

  const updateDomJoystick = (event) => {
    if (mobilePointers.current.get(event.pointerId) !== "stick") return;
    const scene = getPlayableScene();
    if (!scene) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 960;
    const y = ((event.clientY - rect.top) / rect.height) * 540;
    scene.moveJoystick({ x, y });
  };

  const startDomPointer = (event) => {
    const scene = getPlayableScene();
    if (!scene) return;
    const target = getTouchTarget(event);
    if (!target) return;
    event.preventDefault();
    event.stopPropagation();
    mobilePointers.current.set(event.pointerId, target);
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Pointer capture is optional on Android WebView. */ }
    if (target === "stick") {
      updateDomJoystick(event);
    } else {
      scene.pressMobileAction(target);
    }
  };

  const endDomPointer = (event) => {
    const action = mobilePointers.current.get(event.pointerId);
    if (!action) return;
    mobilePointers.current.delete(event.pointerId);
    const scene = gameRef.current?.scene.getScene("ZeroGameScene");
    if (scene && action === "stick") {
      const anotherStickHeld = [...mobilePointers.current.values()].includes("stick");
      if (!anotherStickHeld) {
        scene.touch.axis = 0;
        scene.touch.left = false;
        scene.touch.right = false;
        scene.touch.down = false;
        scene.joystickKnob?.setPosition(132, 448).setScale(1);
      }
    } else if (scene) {
      const stillPressed = [...mobilePointers.current.values()].includes(action);
      if (action === "jump") {
        scene.mobileJumpHeld = stillPressed;
        if (!stillPressed) scene.mobileJumpPressedAt = 0;
      } else {
        scene.touch[action] = stillPressed;
      }
      if (action === "attack" && !stillPressed && !scene.attackHeld) {
        scene.fireAttack(0);
      }
    }
    try { event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* Pointer capture is optional on Android WebView. */ }
    event.preventDefault();
    event.stopPropagation();
  };

  // Android WebView receives native TouchEvents with stable identifiers for
  // every finger. Use these directly in the APK instead of relying on the
  // WebView's PointerEvent/pointer-capture implementation.
  useEffect(() => {
    if (!isNativeAndroid) return undefined;
    const overlay = document.getElementById("mobile-controls-overlay");
    if (!overlay) return undefined;

    const pointFromTouch = (touch) => {
      const rect = overlay.getBoundingClientRect();
      if (!rect.width || !rect.height) return null;
      return {
        x: ((touch.clientX - rect.left) / rect.width) * 960,
        y: ((touch.clientY - rect.top) / rect.height) * 540
      };
    };

    const onTouchStart = (event) => {
      const scene = getPlayableScene();
      if (!scene) return;
      for (const touch of event.changedTouches) {
        const target = getTouchTarget({
          currentTarget: overlay,
          clientX: touch.clientX,
          clientY: touch.clientY
        });
        if (!target) continue;
        mobilePointers.current.set(touch.identifier, target);
        if (target === "stick") {
          const point = pointFromTouch(touch);
          if (point) scene.moveJoystick(point);
        } else {
          scene.pressMobileAction(target);
        }
      }
      event.preventDefault();
      event.stopPropagation();
    };

    const onTouchMove = (event) => {
      const scene = getPlayableScene();
      if (!scene) return;
      for (const touch of event.changedTouches) {
        if (mobilePointers.current.get(touch.identifier) !== "stick") continue;
        const point = pointFromTouch(touch);
        if (point) scene.moveJoystick(point);
      }
      event.preventDefault();
      event.stopPropagation();
    };

    const releaseTouch = (touch) => {
      const action = mobilePointers.current.get(touch.identifier);
      if (!action) return;
      mobilePointers.current.delete(touch.identifier);
      const scene = gameRef.current?.scene.getScene("ZeroGameScene");
      if (!scene) return;
      if (action === "stick") {
        const anotherStickHeld = [...mobilePointers.current.values()].includes("stick");
        if (!anotherStickHeld) {
          scene.touch.axis = 0;
          scene.touch.left = false;
          scene.touch.right = false;
          scene.touch.down = false;
          scene.joystickKnob?.setPosition(132, 448).setScale(1);
        }
      } else if (action === "jump") {
        const stillPressed = [...mobilePointers.current.values()].includes("jump");
        scene.mobileJumpHeld = stillPressed;
        if (!stillPressed) scene.mobileJumpPressedAt = 0;
      } else if (action === "attack") {
        const stillPressed = [...mobilePointers.current.values()].includes("attack");
        scene.touch.attack = stillPressed;
        if (!stillPressed && !scene.attackHeld) {
          scene.fireAttack(0);
        }
      }
      // SUPER and JUMP are queued once on press; do not mirror them into
      // held-touch flags on release. Their dedicated update handlers consume
      // only the matching action queue entries.
    };

    const onTouchEnd = (event) => {
      for (const touch of event.changedTouches) releaseTouch(touch);
      event.preventDefault();
      event.stopPropagation();
    };

    const onTouchCancel = (event) => {
      for (const touch of event.changedTouches) releaseTouch(touch);
      event.preventDefault();
      event.stopPropagation();
    };

    // Start touches on the control layer, then track every finger globally.
    // This prevents a joystick finger from being lost when it drifts outside
    // the visible control circle while another finger presses an action.
    const onWindowTouchMove = (event) => onTouchMove(event);
    const onWindowTouchEnd = (event) => onTouchEnd(event);
    const onWindowTouchCancel = (event) => onTouchCancel(event);

    overlay.addEventListener("touchstart", onTouchStart, { passive: false });
    window.addEventListener("touchmove", onWindowTouchMove, { passive: false });
    window.addEventListener("touchend", onWindowTouchEnd, { passive: false });
    window.addEventListener("touchcancel", onWindowTouchCancel, { passive: false });
    const resetTouches = () => {
      mobilePointers.current.clear();
      const scene = gameRef.current?.scene.getScene("ZeroGameScene");
      if (scene?.touch) {
        scene.touch.axis = 0;
        scene.touch.left = false;
        scene.touch.right = false;
        scene.touch.jump = false;
        scene.touch.attack = false;
        scene.touch.super = false;
        scene.touch.special1 = false;
        scene.touch.special2 = false;
        scene.touch.special3 = false;
        if (scene.mobileActionQueue) scene.mobileActionQueue.length = 0;
        scene.mobileJumpHeld = false;
        scene.mobileJumpPressedAt = 0;
        scene.attackHeld = false;
        Object.values(scene.keys || {}).forEach((key) => key?.reset?.());
      }
    };
    window.addEventListener("blur", resetTouches);
    window.addEventListener("zero-game-controls-hidden", resetTouches);
    return () => {
      overlay.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onWindowTouchMove);
      window.removeEventListener("touchend", onWindowTouchEnd);
      window.removeEventListener("touchcancel", onWindowTouchCancel);
      window.removeEventListener("blur", resetTouches);
      window.removeEventListener("zero-game-controls-hidden", resetTouches);
      resetTouches();
    };
  }, [isNativeAndroid, getTouchTarget, getPlayableScene]);

  useEffect(() => {
    if (gameRef.current) return;

    const game = new Phaser.Game({
      type: Phaser.CANVAS,
      parent: "game-container",
      width: 960,
      height: 540,
      backgroundColor: "#75c9ef",
      render: {
        antialias: true,
        pixelArt: false,
        roundPixels: true
      },
      physics: {
        default: "arcade",
        arcade: {
          gravity: { y: 1000 },
          debug: false
        }
      },
      // Allow simultaneous joystick + action-button touches on phones/tablets.
      input: {
        activePointers: 10,
        touch: { capture: true }
      },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 960,
        height: 540
      },
      scene: [ZeroGameScene]
    });

    gameRef.current = game;
    if (import.meta.env.DEV) window.__ZERO_GAME_TEST__ = game;

    // Suspend gameplay while the app is backgrounded. This prevents held
    // touch/keyboard input from sticking and stops audio timers/oscillators;
    // audio is unlocked again only by the player's next interaction.
    const handleVisibilityChange = () => {
      const scene = game.scene.getScene("ZeroGameScene");
      if (document.hidden) {
        // A WebView may background while one or more fingers are still down.
        // Clear pointer ownership as well as scene flags so a lost touchend
        // cannot leave the joystick or an EXTRA button permanently captured.
        mobilePointers.current.clear();
        if (scene?.touch) {
          Object.keys(scene.touch).forEach((key) => {
            if (typeof scene.touch[key] === "boolean") scene.touch[key] = false;
          });
          scene.touch.axis = 0;
        }
        if (scene?.mobileActionQueue) scene.mobileActionQueue.length = 0;
        if (scene) {
          scene.mobileJumpHeld = false;
          scene.mobileJumpPressedAt = 0;
          scene.attackHeld = false;
          Object.values(scene.keys || {}).forEach((key) => key?.reset?.());
        }
        scene?.audio?.stop?.();
        game.scene.pause("ZeroGameScene");
      } else if (game.isRunning) {
        game.scene.resume("ZeroGameScene");
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (import.meta.env.DEV && window.__ZERO_GAME_TEST__ === game) {
        delete window.__ZERO_GAME_TEST__;
      }
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <main className="game-page">
      <section className="game-frame">
        <div
          id="game-container"
          role="application"
          aria-roledescription="game"
          aria-label="ZERO GAME interactive 50-stage arcade campaign"
          aria-describedby="game-instructions"
        />
        <p id="game-instructions" className="sr-only">
          Use A and D or the arrow keys to move, Space or Up to jump, and the on-screen controls on touch devices.
          The campaign has fifty stages across ten worlds, four selectable heroes, and five boss encounters.
        </p>
        <div
          id="mobile-controls-overlay"
          className="mobile-controls-overlay"
          role="group"
          aria-label="Touch control surface: left side movement joystick; right side jump, fire, super, power and three extra actions."
          aria-describedby="game-instructions"
          onPointerDown={isNativeAndroid ? undefined : startDomPointer}
          onPointerMove={isNativeAndroid ? undefined : updateDomJoystick}
          onPointerUp={isNativeAndroid ? undefined : endDomPointer}
          onPointerCancel={isNativeAndroid ? undefined : endDomPointer}
          onLostPointerCapture={isNativeAndroid ? undefined : endDomPointer}
        />
      </section>
    </main>
  );
}