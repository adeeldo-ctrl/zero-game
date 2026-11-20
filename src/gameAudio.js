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
  let musicEnabled = localStorage.getItem("zero_game_music") !== "off";
  let sfxEnabled = localStorage.getItem("zero_game_sfx") !== "off";
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
    if (!context) return;
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
    oscillator.start(now);
    oscillator.stop(now + duration + 0.025);
  };

  const play = (name) => {
    if (!sfxEnabled) return;
    ensureContext();
    const notes = SOUND_NOTES[name] || SOUND_NOTES.ui;
    notes.forEach((frequency, index) => {
      if (context) setTimeout(() => tone(frequency, 0.09, "square", 0.055), index * 48);
    });
  };

  const scheduleMusic = () => {
    if (!musicEnabled || !context || musicTimer) return;
    const step = () => {
      musicTimer = null;
      if (!musicEnabled || !context) return;
      const name = melody[musicIndex % melody.length];
      const frequency = NOTE_FREQUENCIES[name];
      tone(frequency, 0.22, "triangle", 0.025);
      if (musicIndex % 4 === 0) tone(NOTE_FREQUENCIES.C3, 0.28, "sine", 0.018);
      musicIndex++;
      musicTimer = setTimeout(step, 260);
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

  const stop = () => {
    if (musicTimer) clearTimeout(musicTimer);
    musicTimer = null;
  };

  return {
    unlock, play, stop, setMusicEnabled, setSfxEnabled,
    isMusicEnabled: () => musicEnabled,
    isSfxEnabled: () => sfxEnabled
  };
}
