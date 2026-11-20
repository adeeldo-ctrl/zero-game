
import { useEffect, useRef } from "react";
import Phaser from "phaser";
import { Capacitor } from "@capacitor/core";
import { ELEMENTS, HEROES, getElement, getStage, getHero } from "./gameData";
import { createGameAudio } from "./gameAudio";
import { createCampaignLives, loseCampaignHeart, getStageTransitionDirection } from "./campaignRules";
import { shouldHeroCollideWithPlatform, shouldDropThroughPlatform } from "./platformRules";
import { getBossPhase, getSpecialCooldownStatus, SPECIAL_MOVE_COOLDOWN_MS } from "./combatRules";
import { canKickElementBall, canRollingBallHitTarget, isRollingBallOutOfBounds } from "./snowballRules";
import "./App.css";

class ZeroGameScene extends Phaser.Scene {
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
    this.attackHeld = false;
    this.attackChargeStart = 0;
    this.attackCharge = 0;
    this.superReadyAt = 0;
    this.specialReadyAt = [0, 0, 0];
    this.jumpFlipDirection = 1;
    this.jumpStartedAt = 0;
    this.jumpWasMoving = false;
    this.jumpCount = 0;
    this.dropThroughUntil = 0;
    this.touch.axis = 0;
    this.touch.down = false;
    this.mobileActionQueue = new Set();
    this.mobileJumpHeld = false;
    this.mobileJumpPressedAt = 0;
    this.audio = createGameAudio();
    this.netSocket = null;
    this.netConnected = false;
    this.netRole = null;
    this.netSendAt = 0;
    this.remoteVisual = null;
    this.netStatusText = null;
  }

  create() {
    const W = 960;
    const H = 540;

    this.physics.world.setBounds(0, 0, W, H);
    this.cameras.main.setScroll(0, 0);

    this.stageConfig = getStage(this.stageNumber);
    this.stageEnemyCount = this.stageConfig.enemyCount;
    this.bossHealth = this.stageConfig.boss?.hp || 24;
    this.bossMaxHealth = this.bossHealth;
    this.stageTimeLeft = this.stageConfig.timeLimit || 120;
    this.stageStartedAt = this.time.now;
    this.timeHunterSpawned = false;
    this.bonusMode = false;
    this.createBackground();
    this.createTextures();
    this.createPlatforms();

    // Invisible physics body for Ibrahim
    this.hero = this.physics.add.sprite(480, 450, "ryo");
    this.hero.setCollideWorldBounds(true);
    this.hero.setDepth(10);
    this.hero.setSize(34, 64);
    this.hero.setOffset(15, 18);
    this.hero.setVisible(false);

    // Animated visual character
    this.heroVisual = this.createHeroVisual(480, 450);

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
    this.events.once("shutdown", () => { this.audio.stop(); if (this.netSocket) this.netSocket.close(); });
    this.defeated = 0;
    this.stageCleared = false;
    this.gameOver = false;
    if (this.campaignActive && this.selectedHero) {
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

    const isNightWorld = [4, 5, 9].includes(this.stageConfig.worldIndex);
    const skyLight = isNightWorld ? 0xc8d9ff : 0xffe7a1;
    this.add.circle(790, 135, 75, skyLight, 0.13).setDepth(-29);
    this.add.circle(790, 135, 43, isNightWorld ? 0xd8e4ff : 0xffe69b, 0.9).setDepth(-28);

    for (let i = 0; i < 6; i++) {
      const x = 60 + i * 175;
      const y = 85 + (i % 2) * 40;

      const cloud = this.add.container(x, y).setDepth(-25);

      cloud.add([
        this.add.ellipse(0, 12, 76, 28, 0xffffff, 0.85),
        this.add.circle(-20, 0, 19, 0xffffff, 0.9),
        this.add.circle(4, -10, 25, 0xffffff, 0.9),
        this.add.circle(28, 3, 18, 0xffffff, 0.9)
      ]);

      this.tweens.add({
        targets: cloud,
        x: x + 12,
        duration: 5000 + i * 500,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut"
      });
    }

    const mountains = this.add.graphics().setDepth(-22);

    mountains.fillStyle(this.stageConfig.background.far, 1);
    mountains.fillPoints([
      { x: 0, y: 390 },
      { x: 125, y: 180 },
      { x: 260, y: 390 },
      { x: 400, y: 205 },
      { x: 570, y: 390 },
      { x: 735, y: 175 },
      { x: 900, y: 390 },
      { x: 960, y: 280 },
      { x: 960, y: 500 },
      { x: 0, y: 500 }
    ], true);

    mountains.fillStyle(0xd8f0ec, 0.9);
    mountains.fillPoints([
      { x: 90, y: 235 },
      { x: 125, y: 180 },
      { x: 160, y: 235 },
      { x: 400, y: 260 },
      { x: 400, y: 205 },
      { x: 445, y: 265 },
      { x: 695, y: 230 },
      { x: 735, y: 175 },
      { x: 780, y: 230 }
    ], false);

    const hills = this.add.graphics().setDepth(-20);
    hills.fillStyle(this.stageConfig.background.ground);
    hills.fillEllipse(150, 390, 390, 180);
    hills.fillEllipse(500, 390, 430, 190);
    hills.fillEllipse(860, 390, 380, 170);

    // The old repeated castle/building backdrop is intentionally removed.
    // Each world now receives its own landmark composition below.
    this.createStageAtmosphere();
    this.createPremiumStageSetpiece();

    this.add.rectangle(480, 505, 960, 70, this.stageConfig.background.ground)
      .setDepth(-5);

    this.add.rectangle(480, 472, 960, 12, this.stageConfig.background.accent)
      .setDepth(-4);

    const grass = this.add.graphics().setDepth(-3);
    grass.lineStyle(2, 0x9ce36c, 0.9);

    for (let x = 10; x < 960; x += 30) {
      grass.lineBetween(x, 480, x - 4, 468);
      grass.lineBetween(x + 4, 480, x + 9, 467);
    }

    for (let i = 0; i < 22; i++) {
      const x = 20 + i * 43;
      const y = 490 + (i % 3) * 12;

      this.add.circle(
        x, y, 3,
        i % 2 ? 0xffe58a : 0xffa7d5
      ).setDepth(-2);
    }
  }

  createStageAtmosphere() {
    const variant = this.stageConfig.background.stageVariant || 0;
    const accent = this.stageConfig.background.accent;
    for (let i = 0; i < 26; i++) {
      const x = 24 + (i * 71) % 910;
      const y = 95 + (i * 47) % 315;
      if (variant === 0) {
        const mote = this.add.circle(x, y, 3 + (i % 3), accent, 0.7).setDepth(-18);
        this.tweens.add({ targets: mote, y: y - 18, alpha: 0.15, duration: 1100 + i * 35, yoyo: true, repeat: -1 });
      } else if (variant === 1) {
        const bubble = this.add.circle(x, y, 5 + (i % 4), accent, 0.24).setStrokeStyle(2, 0xffffff, 0.45).setDepth(-18);
        this.tweens.add({ targets: bubble, scale: 1.45, y: y - 22, duration: 1300 + i * 25, yoyo: true, repeat: -1 });
      } else if (variant === 2) {
        const flake = this.add.star(x, y, 4, 3, 8, 0xe9fbff, 0.8).setDepth(-18);
        this.tweens.add({ targets: flake, angle: 90, y: y + 25, duration: 1900 + i * 30, yoyo: true, repeat: -1 });
      } else if (variant === 3) {
        const duneSpark = this.add.ellipse(x, y, 16 + (i % 4) * 5, 4, accent, 0.45).setDepth(-18);
        this.tweens.add({ targets: duneSpark, x: x + 18, alpha: 0.08, duration: 1500 + i * 20, yoyo: true, repeat: -1 });
      } else {
        const star = this.add.star(x, y, 5, 2, 6, accent, 0.8).setDepth(-18);
        this.tweens.add({ targets: star, alpha: 0.18, scale: 0.5, duration: 800 + i * 25, yoyo: true, repeat: -1 });
      }
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
    glow.fillStyle(accent,0.07);glow.fillEllipse(480,365,780+variant*22,170);
    this.tweens.add({targets:glow,alpha:0.72,duration:1800+variant*120,yoyo:true,repeat:-1});
    this.add.rectangle(480,455,960,2,accent,0.18).setDepth(-1);
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
    const hero = this.make.graphics({
      x: 0,
      y: 0,
      add: false
    });

    hero.fillStyle(0x142c45, 0.2);
    hero.fillEllipse(34, 85, 48, 9);

    hero.fillStyle(0x49372e);
    hero.fillRoundedRect(9, 73, 22, 10, 5);
    hero.fillRoundedRect(37, 73, 22, 10, 5);

    hero.fillStyle(0x806044);
    hero.fillRoundedRect(12, 73, 16, 4, 3);
    hero.fillRoundedRect(40, 73, 16, 4, 3);

    hero.fillStyle(0xf0e6d0);
    hero.fillRoundedRect(13, 48, 20, 28, 8);
    hero.fillRoundedRect(34, 48, 20, 28, 8);

    hero.fillStyle(0x168e85);
    hero.fillRoundedRect(12, 28, 44, 32, 9);

    hero.fillStyle(0x263d58);
    hero.fillRoundedRect(10, 27, 45, 32, 8);

    hero.fillStyle(0x168e85);
    hero.fillRoundedRect(2, 32, 15, 24, 7);
    hero.fillRoundedRect(51, 32, 15, 24, 7);

    hero.fillStyle(0xe9b38b);
    hero.fillRect(25, 22, 17, 12);
    hero.fillEllipse(33, 18, 42, 43);

    hero.fillStyle(0x30251f);
    hero.fillEllipse(33, 5, 42, 18);

    hero.fillStyle(0x263b54);
    hero.fillRoundedRect(13, 0, 40, 13, 5);

    hero.fillStyle(0x47c3b2);
    hero.fillRect(16, 8, 34, 3);

    hero.fillStyle(0xffffff);
    hero.fillEllipse(24, 19, 9, 11);
    hero.fillEllipse(42, 19, 9, 11);

    hero.fillStyle(0x272b35);
    hero.fillCircle(25, 20, 3);
    hero.fillCircle(41, 20, 3);

    hero.generateTexture("ryo", 68, 90);
    hero.destroy();

    this.createEnemyTexture("enemy0", 0x8b42c8, 0xc77bf1, 0xffd45e);
    this.createEnemyTexture("enemy1", 0xe56a42, 0xffa36b, 0x7ff1e4);
    this.createEnemyTexture("enemy2", 0x397cbb, 0x67b8f1, 0xffdc74);

    const shot = this.make.graphics({
      x: 0,
      y: 0,
      add: false
    });

    shot.fillStyle(0x00bce9, 0.2);
    shot.fillCircle(13, 13, 13);

    shot.fillStyle(0x44edff);
    shot.fillCircle(13, 13, 9);

    shot.lineStyle(3, 0xffffff);
    shot.strokeCircle(13, 13, 7);

    shot.fillStyle(0xffffff);
    shot.fillCircle(10, 9, 3);

    shot.generateTexture("shot", 26, 26);
    shot.destroy();

    const platform = this.make.graphics({
      x: 0,
      y: 0,
      add: false
    });

    platform.fillStyle(0x614a42);
    platform.fillRoundedRect(0, 4, 180, 28, 5);

    platform.fillStyle(0x8a6a50);
    platform.fillRect(3, 13, 174, 17);

    platform.fillStyle(0x4a9b53);
    platform.fillRoundedRect(0, 0, 180, 13, 5);

    platform.fillStyle(0x8ad35b);
    platform.fillRoundedRect(5, 1, 170, 5, 3);

    platform.generateTexture("platform", 180, 32);
    platform.destroy();
  }

  createHeroVisual(x, y) {
    const c = this.add.container(x, y).setDepth(10);

    const shadow = this.add.ellipse(
      0, 41, 49, 12, 0x142c45, 0.25
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

    c.add([
      shadow,
      legL, legR,
      shoeL, shoeR,
      armL, armR,
      handL, handR,
      kurta, waistcoat,
      button1, button2, button3,
      neck, face, hair, cap, capLine,
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
      handR
    });
    c.setData("heroPalette", { kurta, waistcoat, capLine, face, neck, handL, handR, hair, armL, armR });
    

    return c;
  }

  applyHeroLook(visual, hero) {
    if (!visual?.active || !hero) return;
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
      // White martial-arts gi with a red headband: Ryu-inspired original hero.
      const band = this.add.rectangle(0, -44, 44, 7, 0xd94a42).setStrokeStyle(2, 0x792d2d);
      const tail = this.add.triangle(-25, -39, 0, 0, 18, 5, 0, 22, 0xd94a42);
      const belt = this.add.rectangle(0, 15, 34, 6, 0xd94a42);
      const gloveL = this.add.ellipse(-25, 18, 16, 13, 0xf2f2ed).setStrokeStyle(2, 0x9da7b4);
      const gloveR = this.add.ellipse(25, 18, 16, 13, 0xf2f2ed).setStrokeStyle(2, 0x9da7b4);
      items.push(band, tail, belt, gloveL, gloveR);
    } else if (hero.id === "kairo") {
      // Blond hair, red gi and gold trim: Ken-inspired original hero.
      const spike1 = this.add.triangle(-13, -57, -12, 15, 0, -17, 12, 12, 0xf2c34e).setStrokeStyle(1, 0x9b6b22);
      const spike2 = this.add.triangle(2, -60, -11, 14, 0, -19, 12, 14, 0xf2c34e).setStrokeStyle(1, 0x9b6b22);
      const spike3 = this.add.triangle(17, -54, -12, 12, 0, -16, 13, 14, 0xf2c34e).setStrokeStyle(1, 0x9b6b22);
      const headband = this.add.rectangle(0, -43, 44, 6, 0xd83b32).setStrokeStyle(2, 0xffd16b);
      const belt = this.add.rectangle(0, 15, 34, 6, 0xffd16b);
      const flame = this.add.triangle(0, -66, -8, 12, 0, -14, 10, 12, 0xff783b);
      items.push(spike1, spike2, spike3, headband, belt, flame);
    } else if (hero.id === "mei") {
      // Twin hair buns, blue outfit ribbons and gold wrist guards: Chun-Li-inspired.
      const bunL = this.add.circle(-17, -53, 9, 0x30251f).setStrokeStyle(3, 0xffd36b);
      const bunR = this.add.circle(17, -53, 9, 0x30251f).setStrokeStyle(3, 0xffd36b);
      const ribbonL = this.add.triangle(-24, -47, -8, -8, -2, 9, -18, 14, 0x9cecff);
      const ribbonR = this.add.triangle(24, -47, 8, -8, 2, 9, 18, 14, 0x9cecff);
      const sashL = this.add.triangle(-22, 7, -8, -9, 10, 7, -5, 27, 0x9cecff);
      const sashR = this.add.triangle(22, 7, -8, -9, 10, 7, -5, 27, 0x9cecff);
      const cuffL = this.add.rectangle(-28, 15, 10, 15, 0xffd36b).setStrokeStyle(2, 0x9b6c2c);
      const cuffR = this.add.rectangle(28, 15, 10, 15, 0xffd36b).setStrokeStyle(2, 0x9b6c2c);
      items.push(bunL, bunR, ribbonL, ribbonR, sashL, sashR, cuffL, cuffR);
    } else {
      // Green skin, orange crest and electric markings: Blanka-inspired wild fighter.
      const spike1 = this.add.triangle(-17, -54, -11, 15, 0, -19, 12, 14, 0xf28a32).setStrokeStyle(2, 0x8b4b24);
      const spike2 = this.add.triangle(0, -60, -12, 16, 0, -22, 12, 16, 0xf28a32).setStrokeStyle(2, 0x8b4b24);
      const spike3 = this.add.triangle(17, -54, -12, 14, 0, -18, 12, 15, 0xf28a32).setStrokeStyle(2, 0x8b4b24);
      const stripeL = this.add.rectangle(-18, 4, 7, 27, 0xffe16a).setAngle(-18);
      const stripeR = this.add.rectangle(18, 4, 7, 27, 0xffe16a).setAngle(18);
      const bolt = this.add.text(0, -9, "ϟ", { fontSize: "27px", color: "#fff2a6", fontStyle: "bold", stroke: "#276d43", strokeThickness: 3 }).setOrigin(0.5);
      items.push(spike1, spike2, spike3, stripeL, stripeR, bolt);
    }
    visual.add(items);
    visual.setData("heroLookItems", items);
    visual.setData("heroLookId", hero.id);
  }

  createEnemyVisual(enemy, color, hornColor) {
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

    const body = this.add.ellipse(
      0, -2, 48, 43, color
    );

    const belly = this.add.ellipse(
      0, 7, 25, 20, 0xffffff, 0.25
    );

    const headband = this.add.rectangle(0, -23, 43, 7, hornColor).setStrokeStyle(1, 0xffffff, 0.75);
    const hornL = this.add.triangle(-23, -19, -5, -5, 12, 0, -8, 13, hornColor);
    const hornR = this.add.triangle(23, -19, -12, 0, 5, -5, 8, 13, hornColor);
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

    c.add([
      shadow,
      legL, legR,
      armL, armR,
      body, belly,
      headband, hornL, hornR, belt,
      eyeL, eyeR,
      pupilL, pupilR
    ]);

    const inspiration = enemy.getData("enemyName") || "";
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

    c.setData("parts", {
      shadow,
      legL,
      legR,
      armL,
      armR
    });
    c.setData("damageParts", {
  hornL,
  hornR,
  armL,
  armR,
  body,
  belly
});

    enemy.setData("visual", c);
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

    authored.forEach(({ x, y, width = 200 }) => {
      const platform = this.platforms.create(x, y, "platform");
      platform.setScale(width / 100, 1).setTint(this.stageConfig.background.platform || 0x8a6a50).refreshBody();
      this.add.ellipse(x, y - 12, width * 0.9, 15,
        this.stageConfig.background.accent, 0.22).setDepth(1);
      const trim = this.add.rectangle(x, y - 13, width * 0.94, 4,
        this.stageConfig.background.accent, 0.95).setDepth(2);
      this.tweens.add({ targets: trim, alpha: 0.55, duration: 1300 + (this.stageNumber % 5) * 120, yoyo: true, repeat: -1 });
    });
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

    this.heroTitleLabel = this.add.text(20, 37, `${this.selectedHero.name.toUpperCase()}  |  STAGE ${String(this.stageNumber).padStart(2,"0")}`, {
      fontSize: "12px", color: "#d9f6ff", fontStyle: "bold"
    }).setDepth(21);

    this.powerLabel = this.add.text(640, 19, "POWER: FIRE [C]", { fontSize: "13px", color: "#ffb45e", fontStyle: "bold" }).setDepth(21);
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
    this.musicToggleLabel.on("pointerdown", () => this.cycleAudioVolume("music"));
    this.sfxToggleLabel.on("pointerdown", () => this.cycleAudioVolume("sfx"));
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
      this.mobileActionQueue.add("jump");
      return;
    }
    if (["super", "special1", "special2", "special3"].includes(action)) {
      this.mobileActionQueue.add(action);
      return;
    }
    this.touch[action] = true;
  }

  setMobileControlsVisible(visible) {
    const overlay = document.getElementById("mobile-controls-overlay");
    if (overlay) overlay.style.display = visible ? "block" : "none";
    if (!visible) {
      this.mobileActionQueue?.clear();
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
    this.add.circle(cx, cy, 53, 0x1b4e70, 0.38)
      .setStrokeStyle(2, 0x70dfff, 0.55).setDepth(29);
    this.joystickKnob = this.add.circle(cx, cy, 32, 0x36b9df, 1)
      .setStrokeStyle(4, 0xffffff).setDepth(30);
    this.mobileControlVisuals = new Map();
    this.createControl(665, 340, "EXTRA 1", "special1");
    this.createControl(775, 340, "EXTRA 2", "special2");
    this.createControl(885, 340, "EXTRA 3", "special3");
    this.createControl(650, 448, "SUPER", "super");
    this.createControl(765, 448, "FIRE", "attack");
    this.createControl(885, 448, "JUMP", "jump");
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
    const accents = { attack: 0xffa33c, super: 0xffd36b, jump: 0x75eaff, special1: 0xff8b5e, special2: 0x72e0ff, special3: 0xb69cff };
    const accent = accents[action] || 0x75eaff;
    const baseFill = action === "attack" ? 0x9b451f : action.startsWith("special") ? 0x263c72 : 0x176184;
    const glow = this.add.circle(x, y, action.startsWith("special") ? 45 : 54, accent, 0.12).setDepth(28);
    const ring = this.add.circle(x, y, 49, 0x000000, 0)
      .setStrokeStyle(4, accent, 0.72).setDepth(29);
    const bg = this.add.circle(x, y, action.startsWith("special") ? 35 : 43, baseFill, 0.98)
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

  sendNet(payload) {
    if (this.netSocket?.readyState === WebSocket.OPEN) {
      this.netSocket.send(JSON.stringify(payload));
    }
  }

  ensureRemoteVisual() {
    if (this.remoteVisual?.active) return;
    this.remoteVisual = this.createHeroVisual(720, 450);
    this.remoteVisual.setDepth(11).setScale(1).setAlpha(0.9);
    const ring = this.add.circle(0, -58, 28, 0x62eaff, 0.14)
      .setStrokeStyle(2, 0x62eaff, 0.9);
    this.remoteVisual.add(ring);
    this.remoteVisual.setData("remoteRing", ring);
    this.remoteVisual.setData("remoteHeroId", "ryo");
    this.tweens.add({ targets: ring, scale: 1.35, alpha: 0.35,
      duration: 650, yoyo: true, repeat: -1 });
  }

  applyRemoteHero(heroId) {
    const hero = getHero(heroId);
    if (!hero) return;
    this.ensureRemoteVisual();
    if (this.remoteVisual.getData("heroLookId") === hero.id) return;
    const palette = this.remoteVisual.getData("heroPalette");
    palette.kurta.setFillStyle(hero.color);
    palette.waistcoat.setFillStyle(hero.accent);
    palette.capLine.setFillStyle(hero.accent);
    this.applyHeroLook(this.remoteVisual, hero);
    this.remoteVisual.setData("remoteHeroId", heroId);
  }

  spawnRemoteShot(data, superShot = false) {
    const element = getElement(data.powerType || "fire");
    const palette = { ball: element.ball, edge: element.edge, glow: element.glow, trail: element.trail };
    const directions = superShot
      ? (data.heroId === "mei" ? [-0.65, -0.32, 0, 0.32, 0.65] : data.heroId === "volt" ? [-0.12, 0, 0.12] : [-0.45, 0, 0.45])
      : [0];
    directions.forEach(offset => {
      const projectile = this.projectiles.create(data.x, data.y, "shot");
      projectile.setTint(palette.ball).setScale(superShot ? 2.7 : 1.8 + Math.min(1, (data.charge || 0) / 1500) * 1.8).setDepth(16);
      projectile.body.setAllowGravity(false);
      projectile.body.setSize(26, 26);
      const angle = offset * (data.direction || 1);
      const speed = superShot ? (data.heroId === "volt" ? 900 : 650) : 720 + Math.min(1, (data.charge || 0) / 1500) * 330;
      projectile.body.setVelocity(Math.cos(angle) * (data.direction || 1) * speed, Math.sin(angle) * speed);
      projectile.setData("powerType", data.powerType || "fire");
      projectile.setData("superAttack", superShot);
      const glow = this.add.circle(projectile.x, projectile.y, superShot ? 20 : 15, palette.glow, 0.45).setDepth(15);
      projectile.setData("glow", glow);
      this.tweens.add({ targets: projectile, angle: 360, duration: 190, repeat: -1 });
      this.time.delayedCall(1500, () => {
        if (projectile.active) projectile.destroy();
        if (glow.active) glow.destroy();
      });
    });
  }

  connectMultiplayer(role) {
    if (this.netSocket && this.netSocket.readyState <= WebSocket.OPEN) {
      this.netStatusText?.setText("ALREADY CONNECTING / CONNECTED");
      return;
    }
    let host = window.location.hostname || "127.0.0.1";
    if (window.Capacitor?.isNativePlatform?.() || host === "localhost" || host === "127.0.0.1") {
      const entered = window.prompt("Enter the HOST device Wi-Fi IPv4 address (example: 192.168.1.10)", host === "localhost" ? "" : host);
      if (!entered) return;
      host = entered.trim();
    }
    const address = `ws://${host}:3001`;
    this.netRole = role;
    this.netStatusText?.setText(`CONNECTING TO ${host}:3001 ...`).setColor("#ffe17a");
    let socket;
    try { socket = new WebSocket(address); }
    catch { this.netStatusText?.setText("COULD NOT OPEN WI-FI CONNECTION").setColor("#ff8b8b"); return; }
    this.netSocket = socket;
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "join", room: "DASTAAN" }));
    };
    socket.onmessage = event => {
      let msg;
      try { msg = JSON.parse(event.data); } catch { return; }
      if (msg.type === "joined") {
        this.netConnected = true;
        this.netStatusText?.setText(`WI-FI READY • PLAYER ${msg.playerId} • ROOM ${msg.room}`).setColor("#62ffb4");
        this.ensureRemoteVisual();
      } else if (msg.type === "peer-joined") {
        this.ensureRemoteVisual();
        this.netStatusText?.setText("PLAYER 2 CONNECTED • CO-OP READY").setColor("#62ffb4");
      } else if (msg.type === "peer-left") {
        if (this.remoteVisual?.active) this.remoteVisual.setAlpha(0.25);
        this.netStatusText?.setText("PLAYER DISCONNECTED • WAITING").setColor("#ffe17a");
      } else if (msg.type === "room-full") {
        this.netStatusText?.setText("ROOM FULL • ONLY 2 PLAYERS").setColor("#ff8b8b");
        socket.close();
      } else if (msg.type === "state") {
        this.ensureRemoteVisual();
        this.remoteVisual.setPosition(msg.x, msg.y).setAlpha(0.92);
        this.remoteVisual.setScale(msg.facing || 1, msg.airborne ? 1.05 : 1);
      } else if (msg.type === "hero") {
        this.applyRemoteHero(msg.heroId);
      } else if (msg.type === "shot") {
        this.spawnRemoteShot(msg, false);
      } else if (msg.type === "super") {
        this.spawnRemoteShot(msg, true);
      }
    };
    socket.onerror = () => this.netStatusText?.setText("WI-FI SERVER NOT FOUND • START SERVER ON HOST PC").setColor("#ff8b8b");
    socket.onclose = () => {
      this.netConnected = false;
      if (this.netStatusText?.active && this.netStatusText.text.includes("READY")) {
        this.netStatusText.setText("WI-FI DISCONNECTED").setColor("#ff8b8b");
      }
    };
  }

  showStoryScreen() {
    this.setMobileControlsVisible(false);
    this.gameStarted = false;
    this.clearMenu();
    const shade = this.add.rectangle(480, 270, 960, 540, 0x050b19, 0.94).setDepth(60);
    const panel = this.add.rectangle(480, 270, 850, 510, 0x101d38, 0.9).setStrokeStyle(3, 0x53dfff, 0.9).setDepth(61);
    const topLine = this.add.rectangle(480, 154, 760, 3, 0xffc85b, 0.9).setDepth(62);
    const title = this.add.text(480, 82, "ZERO GAME", { fontSize: "62px", color: "#ffe17a", fontStyle: "bold", stroke: "#522b34", strokeThickness: 9, letterSpacing: 5 }).setOrigin(0.5).setDepth(63).setScale(0.7);
    const subtitle = this.add.text(480, 137, "50 STAGES  •  FOUR HEROES  •  FIVE BOSS BATTLES", { fontSize: "14px", color: "#8feaff", fontStyle: "bold", letterSpacing: 2 }).setOrigin(0.5).setDepth(63);
    const tagline = this.add.text(480, 184, "ONE HERO. THREE CHANCES. NINE HEARTS. FIFTY STAGES.", { fontSize: "14px", color: "#e8f6ff", fontStyle: "bold", letterSpacing: 1 }).setOrigin(0.5).setDepth(63);
    this.menuObjects.push(shade, panel, topLine, title, subtitle, tagline);
    const previewXs = [315, 425, 535, 645];
    HEROES.forEach((hero, i) => {
      const visual = this.createHeroVisual(previewXs[i], 328);
      const palette = visual.getData("heroPalette");
      palette.kurta.setFillStyle(hero.color); palette.waistcoat.setFillStyle(hero.accent); palette.capLine.setFillStyle(hero.accent);
      this.applyHeroLook(visual, hero);
      visual.setDepth(64).setScale(0.82).setAlpha(0);
      this.menuObjects.push(visual);
      this.tweens.add({ targets: visual, y: 321 - (i % 2) * 5, alpha: 1, duration: 850, delay: 180 + i * 130, ease: "Back.easeOut" });
      this.tweens.add({ targets: visual, y: 315 - (i % 2) * 5, duration: 800 + i * 100, delay: 1100 + i * 100, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      const label = this.add.text(previewXs[i], 382, hero.name.toUpperCase(), { fontSize: "16px", color: "#ffffff", fontStyle: "bold", stroke: "#10243a", strokeThickness: 3 }).setOrigin(0.5).setDepth(65);
      const style = this.add.text(previewXs[i], 402, hero.style.toUpperCase(), { fontSize: "9px", color: "#9feaff", fontStyle: "bold", align: "center" }).setOrigin(0.5).setDepth(65);
      this.menuObjects.push(label, style);
    });
    this.tweens.add({ targets: title, scale: 1, y: 88, duration: 850, ease: "Back.easeOut" });
    const start = this.add.text(480, 474, "START CAMPAIGN", { fontSize: "22px", color: "#ffffff", backgroundColor: "#087e83", padding: { x: 38, y: 13 }, fontStyle: "bold", stroke: "#062b3a", strokeThickness: 2 }).setOrigin(0.5).setDepth(70).setInteractive({ useHandCursor: true });
    const host = this.add.text(365, 430, "HOST WI-FI", { fontSize: "12px", color: "#ffffff", backgroundColor: "#235a80", padding: { x: 13, y: 7 }, fontStyle: "bold" }).setOrigin(0.5).setDepth(70).setInteractive({ useHandCursor: true });
    const join = this.add.text(595, 430, "JOIN WI-FI", { fontSize: "12px", color: "#ffffff", backgroundColor: "#235a80", padding: { x: 13, y: 7 }, fontStyle: "bold" }).setOrigin(0.5).setDepth(70).setInteractive({ useHandCursor: true });
    this.netStatusText = this.add.text(480, 405, "2-PLAYER WI-FI CO-OP", { fontSize: "10px", color: "#9feaff", fontStyle: "bold" }).setOrigin(0.5).setDepth(70);
    this.menuObjects.push(start, host, join, this.netStatusText);
    host.on("pointerdown", () => this.connectMultiplayer("HOST"));
    join.on("pointerdown", () => this.connectMultiplayer("JOIN"));
    this.tweens.add({ targets: start, scale: 1.055, duration: 620, yoyo: true, repeat: -1 });
    start.on("pointerdown", () => this.startNewCampaign());
  }

  showHeroSelect() {
    this.setMobileControlsVisible(false);
    this.clearMenu();
    this.heroSelectionLocked = false;
    const shade = this.add.rectangle(480, 270, 960, 540, 0x050b19, 0.96).setDepth(60);
    const heading = this.add.text(480, 48, "SELECT YOUR HERO", { fontSize: "34px", color: "#ffe17a", fontStyle: "bold", stroke: "#513b43", strokeThickness: 5, letterSpacing: 2 }).setOrigin(0.5).setDepth(61);
    const sub = this.add.text(480, 83, "YOUR HERO WILL STAY WITH YOU THROUGH ALL 50 STAGES", { fontSize: "12px", color: "#9feaff", fontStyle: "bold", letterSpacing: 1 }).setOrigin(0.5).setDepth(61);
    this.menuObjects.push(shade, heading, sub);
    HEROES.forEach((hero, index) => {
      const x = 120 + index * 240;
      const card = this.add.rectangle(x, 292, 214, 365, 0x142b49, 0.98).setStrokeStyle(3, hero.accent).setDepth(61).setInteractive({ useHandCursor: true });
      const glow = this.add.circle(x, 205, 77, hero.accent, 0.12).setStrokeStyle(3, hero.accent, 0.75).setDepth(62);
      const visual = this.createHeroVisual(x, 230);
      const palette = visual.getData("heroPalette");
      palette.kurta.setFillStyle(hero.color); palette.waistcoat.setFillStyle(hero.accent); palette.capLine.setFillStyle(hero.accent);
      this.applyHeroLook(visual, hero); visual.setDepth(63).setScale(1.03);
      const name = this.add.text(x, 319, hero.name.toUpperCase(), { fontSize: "22px", color: "#ffffff", fontStyle: "bold" }).setOrigin(0.5).setDepth(64);
      const title = this.add.text(x, 348, hero.title, { fontSize: "12px", color: "#9feaff", fontStyle: "bold", align: "center" }).setOrigin(0.5).setDepth(64);
      const power = this.add.text(x, 382, hero.superPower.toUpperCase(), { fontSize: "14px", color: "#ffe17a", fontStyle: "bold" }).setOrigin(0.5).setDepth(64);
      const moves = this.add.text(x, 421, hero.specialMoves.map(move => move.name).join("\n"), { fontSize: "11px", color: "#d7eaff", align: "center", lineSpacing: 5 }).setOrigin(0.5).setDepth(64);
      const choose = this.add.text(x, 486, "SELECT HERO", { fontSize: "13px", color: "#ffffff", backgroundColor: "#126d7b", padding: { x: 16, y: 8 }, fontStyle: "bold" }).setOrigin(0.5).setDepth(64).setInteractive({ useHandCursor: true });
      this.menuObjects.push(card, glow, visual, name, title, power, moves, choose);
      this.tweens.add({ targets: visual, y: 222, angle: index % 2 ? 3 : -3, duration: 760 + index * 120, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
      this.tweens.add({ targets: glow, scale: 1.16, alpha: 0.2, duration: 900 + index * 100, yoyo: true, repeat: -1 });
      const select = () => {
        if (this.heroSelectionLocked) return;
        this.heroSelectionLocked = true; this.selectedHero = hero;
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
    back.on("pointerdown", () => this.showStoryScreen());
  }

  startNewCampaign() {
    this.clearMenu();
    this.gameOver = false; this.stageCleared = false; this.campaignActive = false; this.heroSelectionLocked = false;
    this.chanceLossInProgress = false;
    this.specialReadyAt = [0, 0, 0];
    this.stageNumber = 1; this.score = 0; this.extraLivesAwarded = 0; this.defeated = 0;
    this.chances = 3; this.health = 3; this.snowballTutorialShown = false;
    this.showHeroSelect();
  }

  beginCampaign({ transitionDirection = null } = {}) {
    this.setMobileControlsVisible(true); this.clearMenu();
    this.audio.unlock();
    this.audio.play("stage");
    this.campaignActive = true; this.gameStarted = true; this.gameOver = false; this.stageCleared = false;
    this.stageAdvancePending = false;
    this.stageStartedAt = this.time.now; this.stageTimeLeft = this.stageConfig.timeLimit || 120;
    this.jumpCount = 0; this.lastDamage = this.time.now;
    this.hero.setPosition(480, 450).setVelocity(0, 0).setVisible(false);
    this.heroVisual.setPosition(480, 450).setVisible(true).setAlpha(1).setScale(1);
    this.heroTitleLabel.setText(`${this.selectedHero.name.toUpperCase()}  |  STAGE ${String(this.stageNumber).padStart(2,"0")}`);
    const heroPalette = this.heroVisual.getData("heroPalette");
    heroPalette.kurta.setFillStyle(this.selectedHero.color); heroPalette.waistcoat.setFillStyle(this.selectedHero.accent); heroPalette.capLine.setFillStyle(this.selectedHero.accent);
    this.applyHeroLook(this.heroVisual, this.selectedHero);
    this.powerType = this.selectedHero.element;
    const element = getElement(this.powerType);
    this.powerLabel.setText(`POWER: ${element.name.toUpperCase()} [C]`).setColor("#" + element.color.toString(16).padStart(6, "0"));
    this.updateLivesLabel();
    const enterGameplay = () => {
      this.stageTransitionActive = false;
      this.hero.setPosition(480, 450).setVelocity(0, 0);
      this.heroVisual.setPosition(480, 450).setVisible(true).setAlpha(1);
      this.spawnEnemies(); this.spawnTreasureChest();
      this.sendNet({ type: "hero", heroId: this.selectedHero.id });
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
    const offsets = { down: { x: 0, y: -540 }, right: { x: -960, y: 0 }, left: { x: 960, y: 0 } };
    const offset = offsets[direction] || offsets.down;
    const moving = this.children.list.filter((object) => object?.active && (object.depth ?? 0) < 20);
    const origins = moving.map((object) => ({ object, x: object.x, y: object.y }));
    this.stageTransitionActive = true; this.setMobileControlsVisible(false); this.physics.world.pause();
    origins.forEach(({ object, x, y }) => {
      object.setPosition(x + offset.x, y + offset.y);
      if (object.body?.updateFromGameObject) object.body.updateFromGameObject();
    });
    if (!origins.length) { this.physics.world.resume(); onComplete(); return; }
    let remaining = origins.length;
    origins.forEach(({ object, x, y }) => {
      this.tweens.add({
        targets: object, x, y, duration: 820, ease: "Cubic.easeOut",
        onUpdate: () => origins.forEach(({ object: item }) => { if (item.body?.updateFromGameObject) item.body.updateFromGameObject(); }),
        onComplete: () => { remaining--; if (remaining === 0) { this.physics.world.resume(); onComplete(); } },
      });
    });
  }

  spawnEnemies() {
    const positions = Array.from({ length: this.stageEnemyCount }, (_, i) => 70 + i * (820 / Math.max(1, this.stageEnemyCount - 1)));

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
        enemy.setCollideWorldBounds(false);
        enemy.setData("frozen", false);
        enemy.setData("baseTexture", `enemy${i % 3}`);
        enemy.setData("enemyName", this.stageConfig.enemyTypes[i % this.stageConfig.enemyTypes.length]);
        const aiTypes = ["chaser", "runner", "jumper", "guard", "charger", "chaser"];
        const aiType = aiTypes[i % aiTypes.length];
        enemy.setData("aiType", aiType);
        enemy.setData("aiState", aiType === "runner" || aiType === "charger" ? "tell" : aiType === "guard" ? "guard" : "patrol");
        enemy.setData("aiStateUntil", this.time.now + 900 + (i % 3) * 350);
        enemy.setData("nextHop", this.time.now + 650 + (i % 3) * 280);
        enemy.setData("patrolDirection", i % 2 ? -1 : 1);
        enemy.setData("aiAnim", 0);
        if (aiType === "flyer") {
          enemy.body.setAllowGravity(false);
          enemy.setY(180 + (i % 3) * 45);
          enemy.setData("flyBaseY", enemy.y);
        }

        enemy.setVisible(false);

        const scale = i % 2 === 0 ? 1.12 : 1;
        enemy.setScale(scale);

        const visual = this.createEnemyVisual(
          enemy,
          colors[i % 3],
          horns[i % 3]
        );

        visual.setScale(scale);
      });
    });
  }

  hitEnemy(projectile, enemy) {
    if (!projectile.active || !enemy.active || enemy.getData("isTimeHunter")) return;
    this.audio.play("hit");
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
      if (visual?.active) visual.setVisible(false);
      const palette = this.getPowerPalette();
      const ball = this.add.container(enemy.x, enemy.y).setDepth(16);
      const outer = this.add.circle(0, 0, 27, palette.ball, 1).setStrokeStyle(5, palette.edge);
      const inner = this.add.circle(-7, -8, 8, 0xffffff, 0.8);
      const shine = this.add.arc(0, 0, 22, 205, 320, false, palette.edge).setStrokeStyle(4, palette.edge);
      ball.add([outer, inner, shine]);
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
      hits === 1 ? 0x65eaff : 0xffbd55, 0.95)
      .setStrokeStyle(3, 0xffffff).setDepth(18);
    this.tweens.add({ targets: burst, scale: 2.4, alpha: 0, duration: 230,
      onComplete: () => burst.destroy() });

    if (enemy.getData("frozen") || !visual || !visual.active) {
      if (hits >= 3) {
        const ball = enemy.getData("elementBall");
        if (ball?.active) this.tweens.add({ targets: ball, scale: 1.9, alpha: 0, duration: 220, onComplete: () => ball.destroy() });
        const pop = this.add.circle(enemy.x, enemy.y, 28, this.getPowerPalette().edge, 0.9).setStrokeStyle(4, 0xffffff).setDepth(20);
        this.tweens.add({ targets: pop, scale: 3.2, alpha: 0, duration: 260, onComplete: () => pop.destroy() });
        this.audio.play("defeat");
        enemy.destroy(); this.defeated++; this.addScore(500); this.enemyLabel.setText(`ENEMIES: ${this.defeated}/${this.stageEnemyCount}`);
        this.statusLabel.setText("ELEMENTAL ORB POPPED!"); this.statusLabel.setColor("#62ffb4");
        if (this.defeated >= this.stageEnemyCount && !this.boss && this.stageConfig.boss) {
          this.statusLabel.setText("WARNING! THE BOSS IS COMING!"); this.statusLabel.setColor("#ff795e");
          this.cameras.main.shake(350, 0.008); this.time.delayedCall(1100, () => this.spawnBoss());
        }
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
    if (visual.active) visual.destroy();
    this.audio.play("defeat");
    enemy.destroy();
    this.defeated++;
    this.addScore(500);
    this.enemyLabel.setText(`ENEMIES: ${this.defeated}/${this.stageEnemyCount}`);
    this.statusLabel.setText("ENEMY DEFEATED!");
    this.statusLabel.setColor("#62ffb4");

    if (this.defeated >= this.stageEnemyCount && !this.boss && this.stageConfig.boss) {
      this.statusLabel.setText("WARNING! THE BOSS IS COMING!");
      this.statusLabel.setColor("#ff795e");
      this.cameras.main.shake(350, 0.008);
      this.time.delayedCall(1100, () => this.spawnBoss());
    }
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
    const isBoxer = bossStyle.includes("boxing");
    const isAgile = bossStyle.includes("agile");
    const isMaster = bossStyle.includes("master");
    const isFinal = bossStyle.includes("final");
    const fistL = this.add.circle(-62, 24, isBoxer ? 23 : 17, isBoxer ? 0x5a2638 : 0xffb45e).setStrokeStyle(isBoxer ? 5 : 2, 0xffd36b);
    const fistR = this.add.circle(62, 24, isBoxer ? 23 : 17, isBoxer ? 0x5a2638 : 0xffb45e).setStrokeStyle(isBoxer ? 5 : 2, 0xffd36b);
    const aura = this.add.circle(0, -8, 83, bossColor, 0.13).setStrokeStyle(5, bossColor, 0.8);
    const body = this.add.ellipse(0, -8, isAgile ? 106 : 124, isAgile ? 118 : 112, bossColor).setStrokeStyle(5, 0x30243f);
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
    if (isBoxer) {
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
    c.add([aura, shadow, orbitA, orbitB, legL, legR, footL, footR, armL, armR, fistL, fistR,
      body, belly, bellyMark, headband, hornL, hornR, browL, browR, eyeL, eyeR,
      pupilL, pupilR, nose, mouth, ...styleDetails]);
    this.tweens.add({ targets: aura, scale: 1.16, alpha: 0.28, duration: bossElement === "lightning" ? 260 : 700, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: orbitA, x: -86, y: -48, duration: bossElement === "ice" ? 620 : 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    this.tweens.add({ targets: orbitB, x: 86, y: -48, duration: bossElement === "shadow" ? 620 : 900, yoyo: true, repeat: -1, ease: "Sine.easeInOut" });
    c.setData("parts", { shadow, legL, legR, footL, footR, armL, armR,
      fistL, fistR, body, belly, pupilL, pupilR });
    return c;
  }

  spawnBoss() {
    if (this.gameOver || this.boss) return;
    this.audio.play("boss");
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
    this.bossVisual = this.createBossVisual(boss);
    this.bossVisual.setScale(1.15);

    const entrance = this.add.circle(480, 160, 55, 0xff5b43, 0.35)
      .setStrokeStyle(5, 0xffd36b).setDepth(8);
    this.tweens.add({ targets: entrance, scale: 3.2, alpha: 0, duration: 700,
      onComplete: () => entrance.destroy() });
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
    const burst = this.add.circle(boss.x, boss.y - 12, 27, 0xffe17a, 0.95)
      .setStrokeStyle(4, 0xffffff).setDepth(25);
    this.tweens.add({ targets: burst, scale: 2.7, alpha: 0, duration: 260,
      onComplete: () => burst.destroy() });
    this.bossPhase = getBossPhase(this.bossHealth, this.bossMaxHealth);
    this.statusLabel.setText(this.bossPhase === 3 ? "FINAL PHASE! BOSS UNLEASHED!" : this.bossPhase === 2 ? "BOSS IS ENRAGED!" : "KEEP FIRING!");
    this.statusLabel.setColor(this.bossPhase === 3 ? "#ff6b8a" : "#ffe17a");

    this.addScore(250);
    if (this.bossHealth <= 0) {
      this.addScore(5000);
      this.bossDefeated = true;
      boss.setVelocity(0, 0);
      this.tweens.add({ targets: this.bossVisual, angle: 360, scale: 0.1,
        alpha: 0, duration: 850, ease: "Back.easeIn",
        onComplete: () => { if (this.bossVisual?.active) this.bossVisual.destroy(); } });
      this.cameras.main.shake(700, 0.018);
      this.time.delayedCall(1000, () => {
        boss.destroy();
        this.boss = null;
        this.stageCleared = true;
        this.hero.setVelocity(0, 0);
        this.statusLabel.setText(`STAGE ${String(this.stageNumber).padStart(2,"0")} COMPLETE!`);
        this.statusLabel.setColor("#ffe35b");
        if (this.heroVisual?.active) {
          this.tweens.add({ targets: this.heroVisual, y: -120, alpha: 0, scale: 0.72, duration: 720, ease: "Cubic.easeIn",
            onComplete: () => this.showVictory() });
        } else {
          this.showVictory();
        }
      });
    }
  }

  updateBoss(enemy, delta) {
    if (this.bossDefeated || !enemy.active) return;
    const targetX = this.remoteVisual?.active && this.remoteVisual.alpha > 0.7 && Math.abs(this.remoteVisual.x - enemy.x) < Math.abs(this.hero.x - enemy.x) ? this.remoteVisual.x : this.hero.x;
    const direction = targetX >= enemy.x ? 1 : -1;
    const attackState = enemy.getData("bossAttackState") || "rest";
    const attackIndex = enemy.getData("bossAttackIndex") || 0;
    const bossStyle = enemy.getData("bossStyle") || "";
    const baseSpeed = bossStyle.includes("agile") ? 132
      : bossStyle.includes("boxing") ? 72
      : bossStyle.includes("master") ? 102
      : bossStyle.includes("final") ? 126 : 82;
    const speed = this.bossPhase === 3 ? baseSpeed * 1.65 : this.bossPhase === 2 ? baseSpeed * 1.3 : baseSpeed;
    enemy.setVelocityX(attackState === "dash" ? (enemy.getData("bossDashDirection") || direction) * (this.bossPhase === 3 ? 500 : 390) : direction * speed);
    const visual = this.bossVisual;
    if (visual?.active) {
      visual.setPosition(enemy.x, enemy.y);
      visual.setScale(direction * 1.15, 1.15);
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
      p.fistL.y = 24 + Math.sin(t * 0.006) * 3;
      p.fistR.y = 24 - Math.sin(t * 0.006) * 3;
      visual.y = enemy.y + Math.abs(swing) * -2;
    }
    if (attackState === "rest" && this.time.now >= enemy.getData("bossAttackAt") && enemy.body.blocked.down) {
      const attackPattern = bossStyle.includes("boxing") ? [0, 2, 0]
        : bossStyle.includes("agile") ? [2, 1, 2]
        : bossStyle.includes("master") ? [1, 0, 1] : [0, 1, 2];
      const nextAttack = attackPattern[attackIndex % attackPattern.length];
      enemy.setData("bossAttackIndex", attackIndex + 1);
      enemy.setData("bossAttackState", "tell");
      enemy.setData("bossAttackKind", nextAttack);
      enemy.setData("bossTellUntil", this.time.now + (this.bossPhase === 3 ? 300 : this.bossPhase === 2 ? 430 : 650));
      enemy.setVelocityX(0);
      this.statusLabel.setText(nextAttack === 0 ? "BOSS: GROUND SLAM!" : nextAttack === 1 ? "BOSS: ENERGY VOLLEY!" : "BOSS: DASH INCOMING!");
      this.statusLabel.setColor("#ff806d");
      const warning = this.add.ellipse(this.hero.x, 478, nextAttack === 0 ? 150 : 90, 16, 0xff594f, 0.24)
        .setStrokeStyle(3, 0xffd36b).setDepth(8);
      this.tweens.add({ targets: warning, alpha: 0.9, scaleX: 1.25, duration: 170, yoyo: true, repeat: 2,
        onComplete: () => warning.destroy() });
      if (visual?.active) this.tweens.add({ targets: visual, scaleY: 0.86, duration: 120, yoyo: true });
    }
    if (attackState === "tell" && this.time.now >= enemy.getData("bossTellUntil")) {
      const kind = enemy.getData("bossAttackKind");
      if (kind === 0) {
        enemy.setData("bossAttackState", "slam");
        enemy.setVelocityY(this.bossPhase === 3 ? -650 : this.bossPhase === 2 ? -560 : -490);
        enemy.setVelocityX(direction * 95);
      } else if (kind === 1) {
        enemy.setData("bossAttackState", "rest");
        enemy.setData("bossAttackAt", this.time.now + (this.bossPhase === 3 ? 700 : this.bossPhase === 2 ? 1050 : 1650));
        this.fireBossVolley(enemy);
      } else {
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
      const shock = this.add.ellipse(enemy.x, 480, 55, 13, 0xff714e, 0.78)
        .setStrokeStyle(3, 0xffd36b).setDepth(8);
      this.tweens.add({ targets: shock, scaleX: 6.2, alpha: 0, duration: 520,
        onComplete: () => shock.destroy() });
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
    const element = bossData.element || "fire";
    const base = Phaser.Math.Angle.Between(boss.x, boss.y - 15, this.hero.x, this.hero.y - 10);
    const count = this.bossPhase === 3 ? 7 : this.bossPhase === 2 ? 5 : 3;
    const spreadWidth = element === "lightning" ? 0.15 : element === "ice" ? 0.28 : element === "shadow" ? 0.34 : 0.22;
    const speed = (element === "fire" ? 310 : element === "lightning" ? 350 : element === "ice" ? 210 : 265) + this.bossPhase * 28;
    const radius = this.bossPhase === 3 ? 13 : 10;
    const color = bossData.color || 0xff735d;
    this.statusLabel.setText(`${bossData.attack || "SPECIAL ATTACK"}!`);
    for (let i = 0; i < count; i++) {
      const spread = (i - (count - 1) / 2) * spreadWidth;
      const angle = base + spread;
      const shot = this.add.circle(boss.x, boss.y - 18, radius, color, 0.95)
        .setStrokeStyle(3, 0xffffff).setDepth(18);
      this.physics.add.existing(shot);
      this.bossShots.add(shot);
      shot.body.setAllowGravity(false);
      shot.body.setCircle(radius);
      const wave = element === "shadow" ? Math.sin(i * 1.7) * 0.12 : 0;
      shot.body.setVelocity(Math.cos(angle + wave) * speed, Math.sin(angle + wave) * speed);
      shot.setData("bossShot", true);
      this.tweens.add({ targets: shot, scale: 1.35, duration: element === "lightning" ? 120 : 220, yoyo: true, repeat: -1 });
      this.time.delayedCall(2600, () => { if (shot.active) shot.destroy(); });
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
    const shadow = this.add.ellipse(0, 17, 58, 12, 0x101426, 0.28);
    const base = this.add.rectangle(0, 0, 48, 30, 0x9a5527).setStrokeStyle(3, 0xffd36b);
    const lid = this.add.rectangle(0, -17, 52, 14, 0xd98a37).setStrokeStyle(3, 0xffe08a);
    const lock = this.add.rectangle(0, 0, 9, 13, 0xffdf72);
    chest.add([shadow, base, lid, lock]);
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
      this.powerLabel.setText(`POWER: ${element.name.toUpperCase()} [C]`).setColor("#" + element.color.toString(16).padStart(6, "0"));
      this.statusLabel.setText(`${element.name.toUpperCase()} POWER FOUND!`).setColor("#ffe17a");
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
    this.cameras.main.flash(180, 255, 220, 120);
    this.time.delayedCall(800, () => { if (chest.active) chest.destroy(); });
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
      this.bonusItems.add(orb);
      this.tweens.add({ targets: orb, scale: 1.35, y: y - 12, duration: 450 + i * 25, yoyo: true, repeat: -1 });
    }
  }

  collectBonusItem(hero, orb) {
    if (!orb?.active || !this.bonusMode) return;
    const burst = this.add.circle(orb.x, orb.y, 18, 0xffe27a, 0.9).setDepth(26);
    this.tweens.add({ targets: burst, scale: 2.4, alpha: 0, duration: 180, onComplete: () => burst.destroy() });
    orb.destroy();
    this.addScore(750);
    this.statusLabel.setText("BONUS ORB! +750").setColor("#ffe17a");
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
    this.stageCleared = true;
    this.hero.setVelocity(0, 0);
    this.statusLabel.setText(`STAGE ${String(this.stageNumber).padStart(2,"0")} COMPLETE!`).setColor("#ffe17a");
    if (this.heroVisual?.active) {
      this.tweens.add({ targets: this.heroVisual, y: -120, alpha: 0, scale: 0.72, duration: 720, ease: "Cubic.easeIn",
        onComplete: () => this.showVictory() });
    } else {
      this.showVictory();
    }
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
      nextLabel.on("pointerdown", () => this.advanceToNextStage());
      this.time.delayedCall(2300, () => this.advanceToNextStage());
    } else {
      const ending = this.add.text(480, 380, "THE 50 STAGE QUEST IS COMPLETE", { fontSize: "18px", color: "#9feaff", fontStyle: "bold" }).setOrigin(0.5).setDepth(41);
      const legend = this.add.text(480, 430, `${this.selectedHero.superPower.toUpperCase()} - THE KINGDOM IS SAFE!`, { fontSize: "17px", color: "#ffe17a", fontStyle: "bold" }).setOrigin(0.5).setDepth(45);
      this.tweens.add({ targets: [ending, legend], alpha: 0.65, duration: 1100, yoyo: true, repeat: -1 });
    }
    this.tweens.add({ targets: shade, alpha: 0.82, duration: 350 });
  }

  damageHero(hero, enemy) {
    if (this.gameOver || this.stageCleared || this.stageTransitionActive || this.chanceLossInProgress ||
        !hero?.active || !enemy?.active || enemy.getData("frozen")) return;
    const now = this.time.now;
    if (now - this.lastDamage < 1200 || this.health <= 0) return;
    this.lastDamage = now;
    const lives = loseCampaignHeart({ chances: this.chances, hearts: this.health, gameOver: false });
    this.chances = lives.chances;
    this.health = lives.hearts;
    this.updateLivesLabel();
    if (this.healthLabel?.active) this.healthLabel.setColor("#ff7777");
    const direction = hero.x < enemy.x ? -1 : 1;
    hero.setVelocityX(direction * 260); hero.setVelocityY(-220);
    if (this.heroVisual) this.tweens.add({ targets: this.heroVisual, angle: direction * 12, duration: 100, yoyo: true, repeat: 2 });
    this.time.delayedCall(450, () => { if (hero.active && !this.gameOver && this.heroVisual) this.heroVisual.setAngle(0); });
    if (this.heroVisual?.active) this.tweens.add({ targets: this.heroVisual, alpha: 0.25, duration: 90, yoyo: true, repeat: 3 });
    if (lives.chanceLost) {
      this.chanceLossInProgress = true;
      hero.setVelocity(0, 0); hero.body.enable = false;
      if (this.heroVisual?.active) this.heroVisual.setVisible(false).setAlpha(1).setAngle(0);
      if (lives.gameOver) {
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
    const shade = this.add.rectangle(480, 270, 960, 540, 0x071426, 0.9).setDepth(50);
    const title = this.add.text(480, 175, "GAME OVER", { fontSize: "52px", color: "#ff8b9c", fontStyle: "bold", stroke: "#351b35", strokeThickness: 7 }).setOrigin(0.5).setDepth(51);
    const info = this.add.text(480, 250, "ALL THREE CHANCES HAVE BEEN USED", { fontSize: "19px", color: "#ffffff", fontStyle: "bold", align: "center" }).setOrigin(0.5).setDepth(51);
    const stats = this.add.text(480, 292, `FINAL SCORE: ${this.score.toLocaleString()}   •   STAGE: ${this.stageNumber}`, { fontSize: "15px", color: "#ffe17a", fontStyle: "bold" }).setOrigin(0.5).setDepth(51);
    const restart = this.add.text(480, 365, "START NEW CAMPAIGN", { fontSize: "19px", color: "#ffffff", backgroundColor: "#236b65", padding: { x: 22, y: 12 }, fontStyle: "bold" }).setOrigin(0.5).setDepth(52).setInteractive({ useHandCursor: true });
    this.menuObjects.push(shade, title, info, stats, restart);
    restart.on("pointerdown", () => this.startNewCampaign());
  }

  getPowerPalette() {
    const element = getElement(this.powerType);
    return { ball: element.ball, edge: element.edge, glow: element.glow, trail: element.trail };
  }

  cyclePower() {
    const modes = ELEMENTS.map(element => element.id);
    this.powerType = modes[(modes.indexOf(this.powerType) + 1) % modes.length];
    const colors = Object.fromEntries(ELEMENTS.map(element => [element.id, "#" + element.color.toString(16).padStart(6, "0")]));
    this.powerLabel.setText(`POWER: ${this.powerType.toUpperCase()} [C]`).setColor(colors[this.powerType]);
    this.statusLabel.setText(`${this.powerType.toUpperCase()} POWER READY!`).setColor(colors[this.powerType]);
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
    this.audio.unlock();
    this.audio.play("kick");
    const ball = enemy.getData("elementBall");
    if (!ball?.active) return;
    const direction = this.facing;
    enemy.setData("rolling", true);
    enemy.setData("rollDirection", direction);
    enemy.setData("rollHits", []);
    enemy.body.setAllowGravity(false);
    enemy.setVelocity(0, 0);
    enemy.body.setSize(58, 58);
    enemy.body.setOffset(-3, -3);
    enemy.setVelocityX(direction * 760);
    ball.setScale(1.45);
    this.tweens.add({ targets: ball, scale: 1.7, duration: 130, yoyo: true });
    this.tweens.add({ targets: ball, angle: direction * 720, duration: 420, repeat: -1 });
    const palette = enemy.getData("ballPalette") || this.getPowerPalette();
    const flash = this.add.circle(enemy.x, enemy.y, 36, palette.glow, 0.8).setStrokeStyle(5, palette.edge).setDepth(20);
    this.tweens.add({ targets: flash, scale: 2.3, alpha: 0, duration: 220, onComplete: () => flash.destroy() });
    this.statusLabel.setText("ELEMENTAL BALL! CLEAR THE PATH!").setColor("#ffe17a");
    this.cameras.main.shake(130, 0.004);
  }

  updateRollingBall(enemy, delta) {
    const ball = enemy.getData("elementBall");
    if (!ball?.active) { enemy.destroy(); return; }
    const direction = enemy.getData("rollDirection") || 1;
    enemy.setVelocityX(direction * 760);
    ball.setPosition(enemy.x, enemy.y);
    ball.angle += delta * 0.8;
    const hits = enemy.getData("rollHits") || [];
    for (const target of this.enemies.getChildren()) {
      if (!target.active || target === enemy || hits.includes(target)) continue;
      if (!canRollingBallHitTarget(target.x - enemy.x, target.y - enemy.y)) continue;
      hits.push(target);
      enemy.setData("rollHits", hits);
      if (target.getData("isBoss")) {
        this.hitBoss(target, 5);
        this.statusLabel.setText("BOSS HIT BY ELEMENTAL BALL!").setColor("#ffe17a");
      } else {
        const visual = target.getData("visual");
        if (visual?.active) visual.destroy();
        const oldBall = target.getData("elementBall");
        if (oldBall?.active) oldBall.destroy();
        const ballPalette = enemy.getData("ballPalette") || this.getPowerPalette();
        const burst = this.add.circle(target.x, target.y, 32, ballPalette.edge, 0.95).setStrokeStyle(5, 0xffffff).setDepth(22);
        this.tweens.add({ targets: burst, scale: 2.8, alpha: 0, duration: 260, onComplete: () => burst.destroy() });
        target.destroy();
        this.defeated++;
        this.enemyLabel.setText(`ENEMIES: ${Math.min(this.defeated, this.stageEnemyCount)}/${this.stageEnemyCount}`);
        if (this.defeated >= this.stageEnemyCount && !this.boss && this.stageConfig.boss) {
          this.statusLabel.setText("WARNING! THE BOSS IS COMING!").setColor("#ff795e");
          this.time.delayedCall(800, () => this.spawnBoss());
        }
      }
    }
    if (isRollingBallOutOfBounds(enemy.x)) {
      if (ball.active) ball.destroy();
      enemy.destroy();
    }
  }

  specialMove(moveIndex = 0) {
    if (!this.gameStarted || this.gameOver || this.stageCleared) return;
    const moves = this.selectedHero?.specialMoves || [];
    if (!moves.length) return;
    // Each extra button maps to its own signature move and independent cooldown.
    const selectedIndex = Math.max(0, Math.min(2, moveIndex));
    const move = moves[selectedIndex];
    const cooldown = getSpecialCooldownStatus(this.specialReadyAt[selectedIndex] || 0, this.time.now);
    if (!cooldown.ready) {
      this.statusLabel.setText(`EXTRA ${selectedIndex + 1} RECHARGING: ${cooldown.remainingSeconds}s`).setColor("#9feaff");
      return;
    }
    this.specialReadyAt[selectedIndex] = this.time.now + SPECIAL_MOVE_COOLDOWN_MS;
    this.audio.unlock();
    this.audio.play("special");
    this.specialPoseType = move.type;
    this.specialPoseUntil = this.time.now + 520;
    const accent = this.selectedHero.accent || 0x7deaff;
    const title = move.name.toUpperCase();
    this.statusLabel.setText(title + "!").setColor("#ffe17a");
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
      const impactProjectile = this.projectiles.create(this.hero.x, this.hero.y - 12, "shot");
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
      this.addScore(75);
    };

    const launchWave = () => {
      const x = this.hero.x + this.facing * 42;
      const y = this.hero.y - 13;
      const projectile = this.projectiles.create(x, y, "shot");
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
      this.hero.setVelocityY(-430);
      this.tweens.add({ targets: this.heroVisual, angle: -this.facing * 18, y: this.heroVisual.y - 20, duration: 150, yoyo: true });
      if (nearest && !nearest.getData("isBoss")) impact(nearest, this.facing * 190, -680);
      if (boss) this.hitBoss(boss, 4);
    } else if (move.type === "spin") {
      this.specialPoseType = "spin";
      this.tweens.add({ targets: this.heroVisual, angle: this.facing * 360, duration: 420, ease: "Cubic.easeOut" });
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
    this.sendNet({ type: "super", x: this.hero.x, y: this.hero.y - 8, direction: this.facing, powerType: this.powerType, heroId: this.selectedHero?.id || "ryo" });
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
      const projectile = this.projectiles.create(this.hero.x + this.facing * 40, this.hero.y - 8, "shot");
      projectile.setTint(palette.ball).setScale(heroId === "volt" ? 3.4 : 2.8).setDepth(16);
      projectile.body.setAllowGravity(false);
      projectile.body.setSize(28, 28);
      const angle = offset * this.facing;
      projectile.body.setVelocity(Math.cos(angle) * this.facing * speed, Math.sin(angle) * speed);
      projectile.setData("superAttack", true);
      projectile.setData("powerType", this.powerType);
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
    this.audio.unlock();
    this.audio.play("fire");
    const now = this.time.now;
    if (now - this.lastAttack < 170) return;
    this.lastAttack = now;
    this.sendNet({ type: "shot", x: this.hero.x, y: this.hero.y - 8, direction: this.facing, powerType: this.powerType, charge });
    if (this.kickNearestElementBall()) return;
    const power = this.getPowerPalette();
    const strength = Phaser.Math.Clamp(charge / 1500, 0, 1);
    const radius = 22 + strength * 22;
    const startX = this.hero.x + this.facing * 43, startY = this.hero.y - 8;
    const glow = this.add.circle(startX, startY, radius * 1.35, power.glow, 0.55).setDepth(12);
    const projectile = this.projectiles.create(startX, startY, "shot");
    projectile.setTint(power.ball).setScale(1.8 + strength * 1.8).setDepth(14);
    projectile.setVelocityX(this.facing * (720 + strength * 330)).setVelocityY(0);
    projectile.body.setAllowGravity(false); projectile.body.setSize(22 + strength * 24, 22 + strength * 24);
    projectile.body.setOffset(0, 0); projectile.setData("glow", glow);
    projectile.setData("powerType", this.powerType); projectile.setData("charge", strength);
    const trail = this.add.circle(startX - this.facing * 12, startY, 9 + strength * 8, power.trail, 0.9).setDepth(13);
    projectile.setData("trail", trail);
    this.tweens.add({ targets: projectile, angle: 360, duration: 240, repeat: -1 });
    this.tweens.add({ targets: glow, scale: 1.9 + strength, alpha: 0.04, duration: 170, yoyo: true, repeat: -1 });
    this.tweens.add({ targets: this.heroVisual, scaleX: this.facing * 1.12, duration: 80, yoyo: true });
    this.time.delayedCall(1500, () => { if (projectile.active) { if (glow.active) glow.destroy(); if (trail.active) trail.destroy(); projectile.destroy(); } });
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
    if (this.stageCleared || this.gameOver) this.setMobileControlsVisible(false);
    if (!this.hero || !this.gameStarted || this.gameOver || this.stageCleared) return;
    const elapsedSeconds = Math.floor((time - this.stageStartedAt - (this.bonusMode ? time - this.bonusStartedAt : 0)) / 1000);
    this.stageTimeLeft = Math.max(0, (this.stageConfig.timeLimit || 120) - elapsedSeconds);
    if (this.timerLabel?.active) {
      const mm = Math.floor(this.stageTimeLeft / 60).toString().padStart(2, "0");
      const ss = (this.stageTimeLeft % 60).toString().padStart(2, "0");
      this.timerLabel.setText(`${mm}:${ss}`).setColor(this.stageTimeLeft <= 15 ? "#ff7777" : "#ffffff");
    }
    if (this.stageTimeLeft <= 0 && !this.timeHunterSpawned) this.spawnTimeHunter();
    if (this.bonusMode) {
      const remaining = Math.max(0, Math.ceil((this.bonusUntil - time) / 1000));
      if (this.statusLabel?.active) this.statusLabel.setText(`BONUS ROUND: ${remaining}s`).setColor("#ff8cda");
      if (time >= this.bonusUntil) this.finishBonusStage();
    }
    if (this.treasureChest?.active && !this.treasureChest.getData("opened") &&
        Phaser.Math.Distance.Between(this.hero.x, this.hero.y, this.treasureChest.x, this.treasureChest.y) < 58) {
      this.openTreasureChest();
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.cyclePower)) this.cyclePower();
    if (Phaser.Input.Keyboard.JustDown(this.keys.musicToggle)) {
      this.audio.setMusicEnabled(!this.audio.isMusicEnabled());
      this.musicToggleLabel?.setText(`MUSIC ${this.audio.isMusicEnabled() ? "ON" : "OFF"} ${Math.round(this.audio.getMusicVolume() * 100)}%`);
      this.audio.play("ui");
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.sfxToggle)) {
      this.audio.setSfxEnabled(!this.audio.isSfxEnabled());
      this.sfxToggleLabel?.setText(`SFX ${this.audio.isSfxEnabled() ? "ON" : "OFF"} ${Math.round(this.audio.getSfxVolume() * 100)}%`);
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.super) || this.touch.super || this.mobileActionQueue.delete("super")) {
      this.superAttack();
      this.touch.super = false;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.special1) || this.touch.special1 || this.mobileActionQueue.delete("special1")) {
      this.specialMove(0);
      this.touch.special1 = false;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.special2) || this.touch.special2 || this.mobileActionQueue.delete("special2")) {
      this.specialMove(1);
      this.touch.special2 = false;
    }
    if (Phaser.Input.Keyboard.JustDown(this.keys.special3) || this.touch.special3 || this.mobileActionQueue.delete("special3")) {
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
      this.touch.jump || this.mobileActionQueue.delete("jump") ||
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

    const attacking =
      this.touch.attack ||
      this.keys.attack.isDown;

    if (time >= (this.heroEntryUntil || 0)) visual.setPosition(h.x, h.y);
    visual.setScale(this.facing, 1);

    if (airborne) {
      const jumpProgress = Phaser.Math.Clamp((time - this.jumpStartedAt) / 620, 0, 1);
      const flipAngle = Math.sin(jumpProgress * Math.PI) * 360 * this.jumpFlipDirection;
      visual.setAngle(this.jumpWasMoving ? flipAngle : Math.sin(jumpProgress * Math.PI) * 18);
      p.legL.rotation = -0.78 + Math.sin(t * 2) * 0.12; p.legR.rotation = 0.78 - Math.sin(t * 2) * 0.12;
      p.armL.rotation = -1.05; p.armR.rotation = 1.05; p.handL.y = 15; p.handR.y = 15;
      p.shoeL.y = 38; p.shoeR.y = 38; visual.y = h.y; visual.setScale(this.facing, 1.04);
    } else if (moving) {
      visual.setAngle(0);
      const swing = Math.sin(t * 2.2);

      p.legL.rotation = swing * 0.65;
      p.legR.rotation = -swing * 0.65;

      p.armL.rotation = -swing * 0.55;
      p.armR.rotation = swing * 0.55;

      p.shoeL.y = 39 + Math.max(0, swing) * -5;
      p.shoeR.y = 39 + Math.max(0, -swing) * -5;

      visual.y = h.y + Math.abs(swing) * -2;
    } else {
      visual.setAngle(0); p.handL.y = 27;
      p.legL.rotation = 0;
      p.legR.rotation = 0;

      p.armL.rotation = Math.sin(t) * 0.035;
      p.armR.rotation = -Math.sin(t) * 0.035;

      p.shoeL.y = 39;
      p.shoeR.y = 39;

      visual.y = h.y + Math.sin(t * 0.5) * 1.5;
    }

    if (attacking) {
      p.armR.rotation = this.facing * -1.2;
      p.handR.y = 18;
    } else {
      p.handR.y = 27;
    }

    if (time < (this.specialPoseUntil || 0)) {
      const poseWave = Math.sin(time * 0.035);
      if (this.specialPoseType === "throw") {
        p.armL.rotation = -1.15;
        p.armR.rotation = this.facing * -1.55;
        p.handL.y = 17;
        p.handR.y = 16;
      } else if (this.specialPoseType === "wave") {
        p.armL.rotation = -0.72;
        p.armR.rotation = this.facing * -1.72;
        p.handL.y = 18;
        p.handR.y = 13 + Math.abs(poseWave) * 4;
        p.legL.rotation = -0.16;
        p.legR.rotation = 0.2;
      } else if (this.specialPoseType === "uppercut") {
        p.armL.rotation = -0.85;
        p.armR.rotation = this.facing * -2.45;
        p.handR.y = 4;
        p.legL.rotation = -0.42;
        p.legR.rotation = 0.62;
      } else if (this.specialPoseType === "spin") {
        p.armL.rotation = -1.72;
        p.armR.rotation = 1.72;
        p.legL.rotation = -0.58;
        p.legR.rotation = 0.58;
      } else if (this.specialPoseType === "rapid") {
        p.armL.rotation = -1.0 + poseWave * 0.42;
        p.armR.rotation = this.facing * (-1.65 - poseWave * 0.42);
        p.legL.rotation = poseWave * 0.35;
        p.legR.rotation = -poseWave * 0.35;
      } else if (this.specialPoseType === "electric") {
        p.armL.rotation = -1.9;
        p.armR.rotation = 1.9;
        p.handL.y = 12 + Math.abs(poseWave) * 5;
        p.handR.y = 12 + Math.abs(poseWave) * 5;
        p.legL.rotation = -0.32;
        p.legR.rotation = 0.32;
      } else if (this.specialPoseType === "roll") {
        p.armL.rotation = -0.35;
        p.armR.rotation = 0.35;
        p.legL.rotation = -0.9;
        p.legR.rotation = 0.9;
        visual.setScale(this.facing, 0.78);
      } else {
        p.armL.rotation = -1.35;
        p.armR.rotation = 1.35;
        p.legL.rotation = -0.25;
        p.legR.rotation = 0.25;
      }
    } else if (this.specialPoseType) {
      this.specialPoseType = null;
      visual.setAngle(0);
    }

    // Landing animation
    if (this.heroWasAirborne && !airborne) {
      visual.setScale(this.facing, 0.88);

      this.tweens.add({
        targets: visual,
        scaleY: 1,
        duration: 160,
        ease: "Back.easeOut"
      });
    }

    this.heroWasAirborne = airborne;

    if (this.netConnected && time - this.netSendAt > 45) {
      this.netSendAt = time;
      this.sendNet({ type: "state", x: Math.round(h.x), y: Math.round(h.y),
        facing: this.facing, airborne, heroId: this.selectedHero?.id || "ryo" });
    }

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
      const targetX = this.remoteVisual?.active && this.remoteVisual.alpha > 0.7 && Math.abs(this.remoteVisual.x - enemy.x) < Math.abs(this.hero.x - enemy.x) ? this.remoteVisual.x : this.hero.x;
      const direction = targetX > enemy.x ? 1 : -1;
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
        const distance = Math.abs(targetX - enemy.x);
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
      } else if (aiType === "jumper") {
        speed = 42;
        if (enemy.body.blocked.down && elapsed >= (enemy.getData("nextHop") || elapsed + 700)) {
          enemy.setVelocityY(-360);
          enemy.setData("nextHop", elapsed + 1450);
          enemy.setVelocityX(direction * 95);
        }
        visualBob = Math.sin(elapsed * 0.012) * 3;
      } else if (aiType === "flyer") {
        speed = 112;
        const baseY = enemy.getData("flyBaseY") || 190;
        const wave = Math.sin(elapsed * 0.0028 + enemy.x * 0.01);
        enemy.setVelocityY(Math.cos(elapsed * 0.0028 + enemy.x * 0.01) * 72);
        if (elapsed >= (enemy.getData("nextSwoop") || elapsed + 1800)) {
          enemy.setData("nextSwoop", elapsed + 2300);
          enemy.setVelocityY(230);
          enemy.setData("flyBaseY", Phaser.Math.Clamp(baseY + (this.hero.y < 330 ? -45 : 25), 115, 260));
        }
        if (enemy.y > 365) enemy.setVelocityY(-150);
        visualBob = wave * 5;
      }
      if (aiType !== "flyer" && aiType !== "jumper" && aiType !== "runner" && aiType !== "chaser") speed = 55;
      enemy.setVelocityX(facing * speed);
      if (enemy.x < 28) { enemy.setX(28); if (aiType === "chaser") enemy.setData("patrolDirection", 1); }
      if (enemy.x > 932) { enemy.setX(932); if (aiType === "chaser") enemy.setData("patrolDirection", -1); }
      if (enemyVisual) {
        enemyVisual.setScale(facing, 1);
        const parts = enemyVisual.getData("parts");
        const et = (enemy.getData("animTime") || 0) + delta;
        enemy.setData("animTime", et);
        const swing = Math.sin(et * (aiType === "runner" ? 0.026 : 0.018));
        parts.legL.rotation = swing * (aiType === "runner" ? 0.9 : 0.65);
        parts.legR.rotation = -swing * (aiType === "runner" ? 0.9 : 0.65);
        parts.armL.rotation = -swing * 0.5;
        parts.armR.rotation = swing * 0.5;
        enemyVisual.y = enemy.y + Math.abs(swing) * -2 + visualBob;
        if (aiType === "flyer") enemyVisual.angle = Math.sin(et * 0.009) * 9;
        else enemyVisual.angle = 0;
      }
    });
    

        // Projectile effects follow the fire
    this.projectiles.getChildren().forEach(projectile => {
      if (!projectile.active) return;

      const glow = projectile.getData("glow");
      const trail = projectile.getData("trail");

      if (glow && glow.active) {
        glow.setPosition(projectile.x, projectile.y);
      }

      if (trail && trail.active) {
        const direction = Math.sign(projectile.body.velocity.x) || this.facing;
        trail.setPosition(projectile.x - direction * 20, projectile.y);
      }
    });

  } // update() CLOSE

} // ZeroGameScene class CLOSE

export default function App() {
  const gameRef = useRef(null);
  const mobilePointers = useRef(new Map());
  const isNativeAndroid = Capacitor.getPlatform() === "android";

  const getPlayableScene = () => {
    const game = gameRef.current;
    if (!game) return null;
    const scene = game.scene.getScene("ZeroGameScene");
    if (!scene || !scene.sys.isActive() || !scene.gameStarted || scene.gameOver || scene.stageCleared) return null;
    return scene;
  };

  const getTouchTarget = (event) => {
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
    if (distance(132, 448) <= 94) return "stick";

    const fallbackButtons = [
      ["special1", 665, 340, 58],
      ["special2", 775, 340, 58],
      ["special3", 885, 340, 58],
      ["super", 650, 448, 68],
      ["attack", 765, 448, 68],
      ["jump", 885, 448, 76]
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
  };

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
        scene.mobileActionQueue?.clear();
        scene.mobileJumpHeld = false;
        scene.mobileJumpPressedAt = 0;
        scene.attackHeld = false;
      }
    };
    window.addEventListener("blur", resetTouches);
    return () => {
      overlay.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onWindowTouchMove);
      window.removeEventListener("touchend", onWindowTouchEnd);
      window.removeEventListener("touchcancel", onWindowTouchCancel);
      window.removeEventListener("blur", resetTouches);
      resetTouches();
    };
  }, [isNativeAndroid]);

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

    return () => {
      game.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <main className="game-page">
      <section className="game-frame">
        <div id="game-container"></div>
        <div
          id="mobile-controls-overlay"
          className="mobile-controls-overlay"
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
