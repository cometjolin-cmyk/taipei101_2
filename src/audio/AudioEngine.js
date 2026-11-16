/**
 * Taipei 101 - Web Audio API Procedural Sound Synthesizer
 */

export class AudioEngine {
  constructor() {
    this.ctx = null;
    this.isMuted = true;
    this.initialized = false;
    this.masterGain = null;
    this.windGain = null;
    this.windFilter = null;
    this.windNoiseSource = null;
    this.rainGain = null;
    this.rainNoiseSource = null;
  }

  init() {
    if (this.initialized) return;

    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0.0 : 0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this._initWindGenerator();
      this._initRainGenerator();

      this.initialized = true;
    } catch (e) {
      console.warn('Web Audio API not supported:', e);
    }
  }

  toggleMute() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      const targetGain = this.isMuted ? 0.0 : 0.8;
      this.masterGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
    }
    return !this.isMuted;
  }

  _initWindGenerator() {
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      output[i] = (b0 + b1 + b2) * 0.15;
    }

    this.windNoiseSource = this.ctx.createBufferSource();
    this.windNoiseSource.buffer = noiseBuffer;
    this.windNoiseSource.loop = true;

    this.windFilter = this.ctx.createBiquadFilter();
    this.windFilter.type = 'bandpass';
    this.windFilter.frequency.setValueAtTime(450, this.ctx.currentTime);
    this.windFilter.Q.setValueAtTime(2.5, this.ctx.currentTime);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.08, this.ctx.currentTime);

    this.windNoiseSource.connect(this.windFilter);
    this.windFilter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    this.windNoiseSource.start(0);
  }

  updateCameraAltitude(altitudeY) {
    if (!this.windGain || !this.windFilter || !this.ctx) return;
    const ratio = Math.min(Math.max((altitudeY - 20) / 500, 0), 1);
    const targetFreq = 300 + ratio * 600;
    const targetGain = 0.02 + ratio * 0.25;

    this.windFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    this.windGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.1);
  }

  _initRainGenerator() {
    if (!this.ctx) return;

    const bufferSize = this.ctx.sampleRate * 2;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.1;
    }

    this.rainNoiseSource = this.ctx.createBufferSource();
    this.rainNoiseSource.buffer = noiseBuffer;
    this.rainNoiseSource.loop = true;

    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.setValueAtTime(1200, this.ctx.currentTime);

    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0.0, this.ctx.currentTime);

    this.rainNoiseSource.connect(rainFilter);
    rainFilter.connect(this.rainGain);
    this.rainGain.connect(this.masterGain);

    this.rainNoiseSource.start(0);
  }

  setRainActive(active) {
    if (!this.rainGain || !this.ctx) return;
    this.rainGain.gain.setTargetAtTime(active ? 0.15 : 0.0, this.ctx.currentTime, 0.5);
  }

  startElevatorWhine(durationSec = 10) {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, now);
    osc.frequency.exponentialRampToValueAtTime(750, now + durationSec * 0.7);
    osc.frequency.exponentialRampToValueAtTime(80, now + durationSec);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, now);

    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.12, now + 1.0);
    gain.gain.setValueAtTime(0.12, now + durationSec - 1.5);
    gain.gain.linearRampToValueAtTime(0.0, now + durationSec);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + durationSec + 0.1);
  }

  playFireworkBoom(isFinale = false) {
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;

    const boomOsc = this.ctx.createOscillator();
    const boomGain = this.ctx.createGain();
    boomOsc.type = 'sine';
    boomOsc.frequency.setValueAtTime(isFinale ? 220 : 160, now);
    boomOsc.frequency.exponentialRampToValueAtTime(28, now + 0.6);

    boomGain.gain.setValueAtTime(isFinale ? 0.6 : 0.35, now);
    boomGain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

    boomOsc.connect(boomGain);
    boomGain.connect(this.masterGain);
    boomOsc.start(now);
    boomOsc.stop(now + 0.85);

    const noiseBuffer = this.ctx.createBuffer(1, this.ctx.sampleRate * 0.4, this.ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.08));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = noiseBuffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(1800, now);
    noiseFilter.Q.setValueAtTime(3.0, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(isFinale ? 0.3 : 0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(now);
  }
}
