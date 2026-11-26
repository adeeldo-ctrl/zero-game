export function clampAudioVolume(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

const NOTE_FREQUENCIES = {
  C3: 130.81, D3: 146.83, "D#3": 155.56, E3: 164.81, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, "F#4": 369.99, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25
};

const SOUND_NOTES = {
  jump: [440, 660], doubleJump: [523, 784, 988], fire: [180, 320, 520],
  powerSwitch: [660, 880, 1046], ballKick: [105, 165, 260, 390], ballRoll: [95, 125, 155], ballImpact: [130, 210, 330, 490], ballEnd: [520, 390, 260],
  special: [260, 390, 580, 780], hit: [170, 120], defeat: [420, 620, 880],
  boss: [110, 165, 220], bossHit: [130, 260], bossPhase: [110, 220, 330, 440, 660],
  kick: [95, 180, 360], step: [92, 138], land: [150, 190], collect: [660, 880, 1046],
  stageClear: [392, 523, 659, 784, 988], gameOver: [330, 247, 196, 147],
  ui: [520, 660], stage: [392, 523, 659], punch: [190, 280], enemyAttack: [125, 190, 265], bossAttack: [82, 123, 186],
  "element-fire": [170, 260, 390, 620], "element-ice": [720, 880, 1040], "element-water": [220, 330, 440, 660],
  "element-wind": [390, 520, 780], "element-lightning": [95, 430, 980, 520], "element-nature": [260, 390, 520],
  "element-earth": [85, 130, 190], "element-light": [660, 880, 1320], "element-shadow": [110, 165, 220],
  "element-plasma": [310, 620, 930, 1240],
  ryoPower1: [310, 520, 740], ryoPower2: [190, 390, 650, 850], ryoPower3: [110, 260, 520, 780],
  ryoAttack: [240, 360],
  kairoPower1: [360, 610, 880], kairoPower2: [170, 330, 550, 740], kairoPower3: [120, 240, 480, 720],
  kairoAttack: [330, 500],
  meiPower1: [500, 740, 990], meiPower2: [280, 560, 830, 1100], meiPower3: [420, 630, 840, 1050],
  meiAttack: [420, 630],
  voltPower1: [120, 240, 480], voltPower2: [100, 210, 420, 630], voltPower3: [80, 160, 320, 640],
  voltAttack: [150, 300]
};

export function createGameAudio() {
  let context = null;
  let musicTimer = null;
  let musicGeneration = 0;
  let musicIndex = 0;
  const pendingTimers = new Set();
  const activeOscillators = new Set();
  const lastSoundAt = new Map();

  const schedule = (callback, delay) => {
    const timer = setTimeout(() => {
      pendingTimers.delete(timer);
      callback();
    }, delay);
    pendingTimers.add(timer);
    return timer;
  };
  let musicEnabled = localStorage.getItem("zero_game_music") !== "off";
  let sfxEnabled = localStorage.getItem("zero_game_sfx") !== "off";
  const storedMusicVolume = Number(localStorage.getItem("zero_game_music_volume"));
  const storedSfxVolume = Number(localStorage.getItem("zero_game_sfx_volume"));
  let musicVolume = Number.isFinite(storedMusicVolume) && localStorage.getItem("zero_game_music_volume") !== null
    ? clampAudioVolume(storedMusicVolume) : 0.7;
  let sfxVolume = Number.isFinite(storedSfxVolume) && localStorage.getItem("zero_game_sfx_volume") !== null
    ? clampAudioVolume(storedSfxVolume) : 0.75;
  const ensureContext = () => {
    if (!context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      context = new AudioContextClass();
    }
    if (context.state === "suspended") context.resume().catch(() => {});
    return context;
  };

  const tone = (frequency, duration = 0.12, type = "triangle", volume = 0.12, destination = null) => {
    if (!context || volume <= 0) return;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    oscillator.connect(gain);
    gain.connect(destination || context.destination);
    activeOscillators.add(oscillator);
    oscillator.onended = () => {
      activeOscillators.delete(oscillator);
      oscillator.disconnect();
      gain.disconnect();
    };
    oscillator.start(now);
    oscillator.stop(now + duration + 0.025);
  };

  const play = (name) => {
    if (!sfxEnabled) return;
    const now = Date.now();
    const minimumGap = name === "step" ? 105 : name === "hit" || name === "bossHit" ? 75 : 45;
    if (now - (lastSoundAt.get(name) || 0) < minimumGap) return;
    lastSoundAt.set(name, now);
    ensureContext();
    const notes = SOUND_NOTES[name] || SOUND_NOTES.ui;
    notes.forEach((frequency, index) => {
      if (context) schedule(() => tone(frequency, 0.09, "square", 0.055 * sfxVolume), index * 48);
    });
  };

  let activeTrack = "world-0";
  const bossThemes = [
    ["C3", "G3", "D4", "G3", "A3", "D4"],
    ["G3", "D4", "A4", "D4", "C4", "G4"],
    ["D3", "A3", "E4", "A3", "G3", "D4"],
    ["A3", "E4", "B4", "E4", "D4", "A4"],
    ["C3", "D#3", "G3", "B3", "C4", "G3"]
  ];
  const scheduleMusic = () => {
    if (!musicEnabled || !context || musicTimer) return;
    const generation = musicGeneration;
    const step = () => {
      musicTimer = null;
      if (generation !== musicGeneration || !musicEnabled || !context) return;
      const bossIndex = Number(activeTrack.split("-")[1]);
      const notes = activeTrack.startsWith("boss-")
        ? bossThemes[bossIndex] || bossThemes[0]
        : ["C4", "E4", "G4", "A4", "G4", "E4", "D4", "G4"];
      const name = notes[musicIndex % notes.length];
      const frequency = NOTE_FREQUENCIES[name] || 130.81;
      tone(frequency, activeTrack.startsWith("boss-") ? 0.32 : 0.22,
        activeTrack.startsWith("boss-") ? "sawtooth" : "triangle",
        (activeTrack.startsWith("boss-") ? 0.033 : 0.025) * musicVolume);
      if (musicIndex % 4 === 0) tone(NOTE_FREQUENCIES.C3, 0.28, "sine", 0.018 * musicVolume);
      musicIndex++;
      musicTimer = schedule(step, activeTrack.startsWith("boss-") ? 330 : 260);
    };
    step();
  };

  const setTrack = (track) => {
    musicGeneration++;
    activeTrack = track;
    musicIndex = 0;
    if (musicTimer) { clearTimeout(musicTimer); pendingTimers.delete(musicTimer); musicTimer = null; }
    if (musicEnabled) scheduleMusic();
  };

  // ---------- Procedural Menu Music ----------
  const menuMelody = ["C4","E4","G4","C5"];
  let menuIndex = 0;
  let menuTimer = null;
  const playMenuMusic = () => {
    if (!musicEnabled || !context) return;
    const step = () => {
      const name = menuMelody[menuIndex % menuMelody.length];
      const freq = NOTE_FREQUENCIES[name];
      tone(freq, 0.3, "triangle", 0.04 * musicVolume);
      menuIndex++;
      menuTimer = schedule(step, 500);
    };
    step();
  };
  const stopMenuMusic = () => {
    if (menuTimer) { clearTimeout(menuTimer); menuTimer = null; }
  };

  // ---------- Procedural Gameplay Loop ----------
  const gameplayMelody = ["G3","C4","E4","G4","B4","C5"];
  let gameplayIndex = 0;
  let gameplayTimer = null;
  const playGameplayLoop = () => {
    if (!musicEnabled || !context) return;
    const step = () => {
      const name = gameplayMelody[gameplayIndex % gameplayMelody.length];
      const freq = NOTE_FREQUENCIES[name] || NOTE_FREQUENCIES["C4"];
      tone(freq, 0.2, "sine", 0.03 * musicVolume);
      gameplayIndex++;
      gameplayTimer = schedule(step, 400);
    };
    step();
  };
  const stopGameplayLoop = () => {
    if (gameplayTimer) { clearTimeout(gameplayTimer); gameplayTimer = null; }
  };

  // ---------- World‑Specific Tracks ----------
  const worldTracks = {
    forest: ["C4","E4","G4","A4"],
    desert: ["D4","F#4","A4","C5"],
    ocean: ["E4","G4","B4","D5"]
  };
  const worldTimers = {};
  const playWorldTrack = (world) => {
    const track = worldTracks[world];
    if (!track) return;
    let idx = 0;
    const step = () => {
      if (!musicEnabled || !context) return;
      const name = track[idx % track.length];
      const freq = NOTE_FREQUENCIES[name] || NOTE_FREQUENCIES["C4"];
      tone(freq, 0.25, "triangle", 0.035 * musicVolume);
      idx++;
      worldTimers[world] = schedule(step, 600);
    };
    step();
  };
  const stopWorldTrack = (world) => {
    if (worldTimers[world]) { clearTimeout(worldTimers[world]); delete worldTimers[world]; }
  };

  const unlock = () => {
    ensureContext();
    scheduleMusic();
  };

  const setMusicEnabled = (enabled) => {
    musicGeneration++;
    musicEnabled = !!enabled;
    localStorage.setItem("zero_game_music", musicEnabled ? "on" : "off");
    if (!musicEnabled && musicTimer) {
      clearTimeout(musicTimer);
      pendingTimers.delete(musicTimer);
      musicTimer = null;
    } else if (musicEnabled) {
      unlock();
    }
    return musicEnabled;
  };

  const setSfxEnabled = (enabled) => {
    sfxEnabled = !!enabled;
    localStorage.setItem("zero_game_sfx", sfxEnabled ? "on" : "off");
    return sfxEnabled;
  };

  const setMusicVolume = (value) => {
    musicVolume = clampAudioVolume(value);
    localStorage.setItem("zero_game_music_volume", String(musicVolume));
    return musicVolume;
  };

  const setSfxVolume = (value) => {
    sfxVolume = clampAudioVolume(value);
    localStorage.setItem("zero_game_sfx_volume", String(sfxVolume));
    return sfxVolume;
  };

  const stop = () => {
    musicGeneration++;
    for (const timer of pendingTimers) clearTimeout(timer);
    pendingTimers.clear();
    musicTimer = null;
    for (const oscillator of activeOscillators) {
      try { oscillator.stop(); } catch { /* It may already have ended. */ }
    }
    activeOscillators.clear();
    if (context?.state === "running") context.suspend().catch(() => {});
  };

  return {
    unlock, play, stop,
    setMusicEnabled, setSfxEnabled, setMusicVolume, setSfxVolume,
    isMusicEnabled: () => musicEnabled,
    isSfxEnabled: () => sfxEnabled,
    getMusicVolume: () => musicVolume,
    getSfxVolume: () => sfxVolume,
    // New procedural audio controls
    playMenuMusic,
    stopMenuMusic,
    playGameplayLoop,
    stopGameplayLoop,
    playWorldTrack,
    stopWorldTrack,
    playWorldTheme: (worldIndex) => setTrack(`world-${Math.max(0, Math.floor(Number(worldIndex) || 0) % 10)}`),
    playBossTheme: (bossIndex) => setTrack(`boss-${Math.max(0, Math.floor(Number(bossIndex) || 0) % 5)}`)
  };
}
