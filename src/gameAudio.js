
export function getStageThemeSequence(stageNumber) {
  const stage = Math.max(1, Math.min(50, Math.floor(Number(stageNumber) || 1)));
  const worldIndex = Math.floor((stage - 1) / 5);
  const localStage = (stage - 1) % 5;
  const motifs = [
    ["C4", "E4", "G4", "B4", "A4", "G4", "E4", "D4"],
    ["E4", "G4", "B4", "D5", "C5", "B4", "G4", "E4"],
    ["D4", "F#4", "A4", "E5", "D5", "A4", "F#4", "E4"],
    ["A3", "D4", "E4", "A4", "G4", "E4", "D4", "C4"],
    ["G3", "B3", "D4", "G4", "F#4", "D4", "B3", "A3"],
    ["C4", "D#4", "G4", "C5", "A#4", "G4", "D#4", "D4"],
    ["F#3", "A3", "C4", "E4", "D4", "C4", "A3", "G3"],
    ["D4", "G4", "A4", "D5", "C5", "A4", "G4", "E4"],
    ["E3", "G3", "B3", "E4", "D4", "B3", "G3", "F#3"],
    ["C3", "G3", "C4", "D#4", "G4", "D#4", "C4", "G3"],
  ];
  const motif = motifs[worldIndex];
  const shift = localStage * 2;
  const rotated = motif.slice(shift).concat(motif.slice(0, shift));
  if (localStage === 1 || localStage === 3) return rotated.slice().reverse();
  if (localStage === 2) return rotated.map((note, index) => index % 2 ? motif[(index + 3) % motif.length] : note);
  if (localStage === 4) return rotated.map((note, index) => index % 3 === 0 ? motif[(index + 5) % motif.length] : note);
  return rotated;
}

export function clampAudioVolume(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

const NOTE_FREQUENCIES = {
  C3: 130.81, D3: 146.83, "D#3": 155.56, E3: 164.81, "F#3": 185.0, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, "D#4": 311.13, E4: 329.63, "F#4": 369.99, G4: 392.0, A4: 440.0, "A#4": 466.16, B4: 493.88,
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
  let masterOutput = null;
  let masterCompressor = null;
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
    if (!masterOutput && context.createGain) {
      masterOutput = context.createGain();
      masterOutput.gain.setValueAtTime(0.82, context.currentTime);
      if (context.createDynamicsCompressor) {
        masterCompressor = context.createDynamicsCompressor();
        masterCompressor.threshold.setValueAtTime(-18, context.currentTime);
        masterCompressor.knee.setValueAtTime(16, context.currentTime);
        masterCompressor.ratio.setValueAtTime(3, context.currentTime);
        masterCompressor.attack.setValueAtTime(0.008, context.currentTime);
        masterCompressor.release.setValueAtTime(0.18, context.currentTime);
        masterOutput.connect(masterCompressor);
        masterCompressor.connect(context.destination);
      } else {
        masterOutput.connect(context.destination);
      }
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
    gain.connect(destination || masterOutput || context.destination);
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
    ensureContext();
    if (musicEnabled) scheduleMusic();
    if (!sfxEnabled) return;
    const now = Date.now();
    const minimumGap = name === "step" ? 120 : name === "ballRoll" ? 190 : name === "hit" || name === "bossHit" || name === "ballImpact" ? 78 : 42;
    if (now - (lastSoundAt.get(name) || 0) < minimumGap) return;
    lastSoundAt.set(name, now);
    // The first sound after returning from the background is a user gesture:
    // resume the suspended context and restart the active music track once.
    ensureContext();
    scheduleMusic();
    const notes = SOUND_NOTES[name] || SOUND_NOTES.ui;
    const element = name.startsWith("element-") ? name.slice(8) : "";
    const wave = element === "fire" ? "sawtooth"
      : element === "ice" || element === "light" ? "sine"
      : element === "lightning" ? "square"
      : element === "water" || element === "wind" ? "triangle"
      : element === "earth" ? "sawtooth"
      : element === "shadow" ? "sine"
      : element === "plasma" ? "triangle" : "square";
    const duration = element === "earth" || name === "ballImpact" ? 0.16 : element === "fire" || element === "lightning" ? 0.13 : 0.105;
    const volume = (name === "ballImpact" || name === "defeat" || name === "bossPhase" ? 0.075 : 0.052) * sfxVolume;
    notes.forEach((frequency, index) => {
      if (context) schedule(() => {
        tone(frequency, duration, wave, volume, null);
        if (index === 0 && (name === "ballImpact" || name === "defeat" || name === "bossAttack" || name === "kick")) {
          tone(Math.max(48, frequency * 0.48), 0.19, "sine", volume * 0.7, null);
        }
      }, index * (element === "lightning" ? 27 : 42));
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
  const worldThemes = [
    ["C4", "E4", "G4", "B4", "A4", "G4", "E4", "D4"],
    ["E4", "G4", "B4", "D5", "C5", "B4", "G4", "E4"],
    ["D4", "F#4", "A4", "E5", "D5", "A4", "F#4", "E4"],
    ["A3", "D4", "E4", "A4", "G4", "E4", "D4", "C4"],
    ["G3", "B3", "D4", "G4", "F#4", "D4", "B3", "A3"],
    ["C4", "D#4", "G4", "C5", "A#4", "G4", "D#4", "D4"],
    ["F#3", "A3", "C4", "E4", "D4", "C4", "A3", "G3"],
    ["D4", "G4", "A4", "D5", "C5", "A4", "G4", "E4"],
    ["E3", "G3", "B3", "E4", "D4", "B3", "G3", "F#3"],
    ["C3", "G3", "C4", "D#4", "G4", "D#4", "C4", "G3"],
  ];
  const menuTheme = ["C4", "G4", "E4", "A4", "G4", "E4", "D4", "G4"];
  const victoryTheme = ["C4", "E4", "G4", "C5", "B4", "C5", "E5", "C5"];
  const defeatTheme = ["E4", "D4", "C4", "G3", "E3", "D3", "C3", "C3"];
  const scheduleMusic = () => {
    if (!musicEnabled || !context || musicTimer) return;
    const generation = musicGeneration;
    const step = () => {
      musicTimer = null;
      if (generation !== musicGeneration || !musicEnabled || !context) return;
      const bossTrack = activeTrack.startsWith("boss-");
      const stageTrack = activeTrack.startsWith("stage-");
      const trackIndex = Number(activeTrack.split("-")[1]) || 0;
      const worldIndex = trackIndex;
      const notes = bossTrack ? bossThemes[worldIndex] || bossThemes[0]
        : stageTrack ? getStageThemeSequence(trackIndex)
          : activeTrack === "menu" ? menuTheme
            : activeTrack === "victory" ? victoryTheme
              : activeTrack === "defeat" ? defeatTheme
                : worldThemes[worldIndex % worldThemes.length];
      const name = notes[musicIndex % notes.length];
      const frequency = NOTE_FREQUENCIES[name] || 130.81;
      const beat = musicIndex % 4;
      const lowRoot = NOTE_FREQUENCIES[notes[0]] || NOTE_FREQUENCIES.C3;
      const wave = bossTrack ? "sawtooth" : activeTrack === "defeat" ? "sine"
        : activeTrack === "menu" || activeTrack === "victory" ? "triangle" : "sine";
      const leadVolume = bossTrack ? 0.04 : activeTrack === "victory" ? 0.044 : activeTrack === "defeat" ? 0.026 : 0.032;
      tone(frequency, bossTrack ? 0.29 : 0.24, wave, leadVolume * musicVolume);
      if (beat === 0 || beat === 2) {
        tone(frequency * (bossTrack ? 1.5 : 1.25), bossTrack ? 0.18 : 0.16,
          bossTrack ? "square" : "triangle", 0.014 * musicVolume);
        tone(frequency * (bossTrack ? 2 : 1.5), 0.24, "sine", 0.009 * musicVolume);
      }
      if (beat === 0) {
        tone(lowRoot / 2, 0.34, "sine", 0.024 * musicVolume);
        tone(58, 0.12, "sine", 0.016 * musicVolume);
      }
      if (beat === 2) {
        tone(lowRoot * 0.75, 0.24, "sine", 0.016 * musicVolume);
        tone(76, 0.09, "sine", 0.011 * musicVolume);
      }
      if (beat === 1 || beat === 3) tone(1480, 0.035, "square", 0.0035 * musicVolume);
      musicIndex++;
      musicTimer = schedule(step, bossTrack ? 300 : activeTrack === "menu" ? 320 : stageTrack ? 238 + (trackIndex % 4) * 7 : 255);
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
    playMenuTheme: () => setTrack("menu"),
    playVictoryTheme: () => setTrack("victory"),
    playDefeatTheme: () => setTrack("defeat"),
    playWorldTheme: (worldIndex) => setTrack(`world-${Math.max(0, Math.floor(Number(worldIndex) || 0) % 10)}`),
    playStageTheme: (stageNumber) => setTrack(`stage-${Math.max(1, Math.min(50, Math.floor(Number(stageNumber) || 1)))}`),
    playBossTheme: (bossIndex) => setTrack(`boss-${Math.max(0, Math.floor(Number(bossIndex) || 0) % 5)}`)
  };
}
