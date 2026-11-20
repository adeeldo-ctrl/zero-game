export function clampAudioVolume(value) {
  return Math.max(0, Math.min(1, Number(value) || 0));
}

const NOTE_FREQUENCIES = {
  C4: 261.63, D4: 293.66, E4: 329.63, G4: 392.0,
  A4: 440.0, C5: 523.25, D5: 587.33, E5: 659.25,
  G3: 196.0, C3: 130.81
};

const SOUND_NOTES = {
  jump: [440, 660], doubleJump: [523, 784, 988], fire: [180, 320, 520],
  special: [260, 390, 580, 780], hit: [170, 120], defeat: [420, 620, 880],
  boss: [110, 165, 220], bossHit: [130, 260], kick: [95, 180, 360],
  ui: [520, 660], stage: [392, 523, 659]
};

export function createGameAudio() {
  let context = null;
  let musicTimer = null;
  let musicIndex = 0;
  const pendingTimers = new Set();
  const activeOscillators = new Set();

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
  const melody = ["C4", "E4", "G4", "E4", "D4", "G4", "A4", "G4", "C4", "E4", "G4", "C5", "A4", "G4", "E4", "D4"];

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
    ensureContext();
    const notes = SOUND_NOTES[name] || SOUND_NOTES.ui;
    notes.forEach((frequency, index) => {
      if (context) schedule(() => tone(frequency, 0.09, "square", 0.055 * sfxVolume), index * 48);
    });
  };

  const scheduleMusic = () => {
    if (!musicEnabled || !context || musicTimer) return;
    const step = () => {
      musicTimer = null;
      if (!musicEnabled || !context) return;
      const name = melody[musicIndex % melody.length];
      const frequency = NOTE_FREQUENCIES[name];
      tone(frequency, 0.22, "triangle", 0.025 * musicVolume);
      if (musicIndex % 4 === 0) tone(NOTE_FREQUENCIES.C3, 0.28, "sine", 0.018 * musicVolume);
      musicIndex++;
      musicTimer = schedule(step, 260);
    };
    step();
  };

  const unlock = () => {
    ensureContext();
    scheduleMusic();
  };

  const setMusicEnabled = (enabled) => {
    musicEnabled = !!enabled;
    localStorage.setItem("zero_game_music", musicEnabled ? "on" : "off");
    if (!musicEnabled && musicTimer) {
      clearTimeout(musicTimer);
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
    unlock, play, stop, setMusicEnabled, setSfxEnabled, setMusicVolume, setSfxVolume,
    isMusicEnabled: () => musicEnabled,
    isSfxEnabled: () => sfxEnabled,
    getMusicVolume: () => musicVolume,
    getSfxVolume: () => sfxVolume
  };
}
