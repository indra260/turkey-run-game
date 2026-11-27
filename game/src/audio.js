// Gobble Dash — all sound, synthesized live with WebAudio.
// One job: every beep, gobble and jingle. No audio files, no network.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.musicTimer = null;
    this.musicStep = 0;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  tone(freq, dur, type, vol, when = 0, slideTo = 0) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + when;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
    gain.gain.setValueAtTime(vol, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    osc.connect(gain).connect(this.ctx.destination);
    osc.start(t0);
    osc.stop(t0 + dur + 0.02);
  }

  // The turkey's signature: two quick descending gobbles.
  gobble() {
    this.tone(320, 0.09, 'square', 0.12, 0, 180);
    this.tone(260, 0.11, 'square', 0.12, 0.1, 140);
  }

  jump() { this.tone(280, 0.16, 'sine', 0.14, 0, 560); }
  slide() { this.tone(500, 0.12, 'sawtooth', 0.05, 0, 220); }
  corn() { this.tone(880, 0.08, 'sine', 0.14); this.tone(1320, 0.12, 'sine', 0.12, 0.07); }
  hit() { this.tone(160, 0.25, 'sawtooth', 0.18, 0, 60); this.tone(90, 0.3, 'square', 0.12, 0.02, 45); }
  hide() { this.tone(520, 0.1, 'triangle', 0.1); this.tone(660, 0.14, 'triangle', 0.1, 0.09); }
  caught() {
    [440, 349, 293, 220].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.14, i * 0.2));
  }
  escaped() {
    [523, 659, 784, 1047, 1319].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.13, i * 0.11));
  }
  click() { this.tone(700, 0.05, 'sine', 0.1); }

  // Cheerful banjo-ish loop: a I–V–vi–IV walk in C, plucked triangles.
  startMusic() {
    this.ensure();
    if (!this.ctx || this.musicTimer) return;
    const bass = [131, 98, 110, 98];
    const melody = [523, 659, 784, 659, 587, 659, 523, 440, 523, 587, 659, 784, 880, 784, 659, 587];
    this.musicTimer = setInterval(() => {
      if (this.muted || !this.ctx) return;
      const bar = Math.floor(this.musicStep / 4) % 4;
      if (this.musicStep % 4 === 0) this.tone(bass[bar], 0.5, 'triangle', 0.07);
      this.tone(melody[this.musicStep % melody.length], 0.22, 'triangle', 0.05);
      this.musicStep += 1;
    }, 190);
  }

  stopMusic() {
    if (this.musicTimer) { clearInterval(this.musicTimer); this.musicTimer = null; }
  }
}
