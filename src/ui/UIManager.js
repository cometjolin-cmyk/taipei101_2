/**
 * Taipei 101 - Glassmorphic UI & 3D Interactive Hotspot Manager
 * Aligned with reference application layout:
 * - 3D screen-projected glowing '+' hotspot badges (Spire, Pagoda, Podium)
 * - Reference caption bar with [展開 / 收合] toggle button
 * - Expandable control dock (Time of day, Weather, Weekday lights, Elevator, Damper, Fireworks)
 * - Real-time 2D Damper oscilloscope
 */

import * as THREE from 'three';
import { MathUtils } from '../utils/MathUtils.js';

export class UIManager {
  constructor(app) {
    this.app = app;

    this.dom = {
      btnAudioToggle: document.getElementById('btn-audio-toggle'),
      audioIcon: document.getElementById('audio-icon'),
      audioLabel: document.getElementById('audio-label'),
      fpsDisplay: document.getElementById('fps-display'),
      btnResetView: document.getElementById('btn-reset-view'),

      captionText: document.getElementById('caption-text'),
      btnExpandToggle: document.getElementById('btn-expand-toggle'),
      controlDockWrap: document.getElementById('control-dock-wrap'),

      timeSlider: document.getElementById('time-slider'),
      timeReadout: document.getElementById('time-readout'),
      timePresetBtns: document.querySelectorAll('[data-time]'),

      weatherGroup: document.getElementById('weather-group'),
      weatherBtns: document.querySelectorAll('[data-weather]'),

      weekdayLights: document.getElementById('weekday-lights'),
      weekdayBtns: document.querySelectorAll('.color-dot-btn'),

      btnElevator: document.getElementById('btn-elevator'),
      btnDamper: document.getElementById('btn-damper'),
      btnFireworks: document.getElementById('btn-fireworks'),

      elevatorHud: document.getElementById('elevator-hud'),
      elevFloor: document.getElementById('elev-floor'),
      elevSpeed: document.getElementById('elev-speed'),
      elevAlt: document.getElementById('elev-alt'),
      elevProgressBar: document.getElementById('elev-progress-bar'),

      damperHud: document.getElementById('damper-hud'),
      btnDamperClose: document.getElementById('btn-damper-close'),
      damperCanvas: document.getElementById('damper-canvas'),
      btnDamperWind: document.getElementById('btn-damper-wind'),
      btnDamperQuake: document.getElementById('btn-damper-quake'),
      damperSlider: document.getElementById('damper-intensity-slider'),
      damperIntensityVal: document.getElementById('damper-intensity-val'),

      countdownOverlay: document.getElementById('countdown-overlay'),
      countdownNumber: document.getElementById('countdown-number')
    };

    // 3D Hotspot Pin Coordinates (Exact match to reference screenshot)
    this.hotspotPins = [
      { id: 'pin-spire', pos: new THREE.Vector3(0, 480, 0), target: 'spire' },
      { id: 'pin-pagoda', pos: new THREE.Vector3(0, 240, 26), target: 'pagoda' },
      { id: 'pin-podium', pos: new THREE.Vector3(42, 34, 42), target: 'podium' }
    ];

    // Oscilloscope context
    this.oscCtx = this.dom.damperCanvas ? this.dom.damperCanvas.getContext('2d') : null;
    this.waveHistory = [];
    this.maxHistory = 140;

    this._bindEvents();
    this._initSceneCallbacks();
  }

  _bindEvents() {
    // 1. Audio Mute Toggle
    if (this.dom.btnAudioToggle) {
      this.dom.btnAudioToggle.addEventListener('click', () => {
        const unmuted = this.app.audioEngine.toggleMute();
        this.dom.audioIcon.textContent = unmuted ? '🔊' : '🔇';
        this.dom.audioLabel.textContent = unmuted ? '音效: 開' : '音效: 關';
        this.dom.btnAudioToggle.classList.toggle('active', unmuted);
      });
    }

    // 2. Reset View to exact reference bird's-eye perspective
    if (this.dom.btnResetView) {
      this.dom.btnResetView.addEventListener('click', () => {
        this.app.cameraController.flyTo('overview');
        this.closeDamperMode();
      });
    }

    // 3. Expand / Collapse Button (Reference Screenshot Match!)
    if (this.dom.btnExpandToggle && this.dom.controlDockWrap) {
      this.dom.btnExpandToggle.addEventListener('click', () => {
        const isExpanded = this.dom.controlDockWrap.classList.toggle('expanded');
        this.dom.btnExpandToggle.textContent = isExpanded ? '收合' : '展開';
      });
    }

    // 4. Clickable 3D Hotspot '+' Pins
    this.hotspotPins.forEach(pin => {
      const el = document.getElementById(pin.id);
      if (el) {
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          this.closeDamperMode();
          this.app.cameraController.flyTo(pin.target);
        });
      }
    });

    // 5. Time Slider & Presets
    if (this.dom.timeSlider) {
      this.dom.timeSlider.addEventListener('input', (e) => {
        const hour = parseFloat(e.target.value);
        this._updateTime(hour);
      });
    }

    this.dom.timePresetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const hour = parseFloat(btn.dataset.time);
        if (this.dom.timeSlider) this.dom.timeSlider.value = hour;
        this.dom.timePresetBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this._updateTime(hour);
      });
    });

    // 6. Weather Buttons
    this.dom.weatherBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.weatherBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const weather = btn.dataset.weather;
        this.app.weatherSystem.setWeather(weather);
        this.app.cityDistrict.setWetness(this.app.weatherSystem.roadWetness);
      });
    });

    // 7. Weekday 7-Color Light Buttons
    this.dom.weekdayBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.dom.weekdayBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const color = btn.dataset.color;
        this.app.lightingSchedule.setColor(color);
      });
    });

    // 8. Elevator Experience Action
    if (this.dom.btnElevator) {
      this.dom.btnElevator.addEventListener('click', () => {
        this.closeDamperMode();
        this.dom.elevatorHud.classList.add('active');
        this.dom.btnElevator.classList.add('active');

        this.app.cameraController.startElevatorExperience(
          (data) => {
            this.dom.elevFloor.innerHTML = `${data.floor}<span class="cell-val-unit">F</span>`;
            this.dom.elevSpeed.innerHTML = `${data.speed}<span class="cell-val-unit">m/min</span>`;
            this.dom.elevAlt.innerHTML = `${data.altitude}<span class="cell-val-unit">m</span>`;
            this.dom.elevProgressBar.style.width = `${data.progress * 100}%`;
          },
          () => {
            this.dom.elevatorHud.classList.remove('active');
            this.dom.btnElevator.classList.remove('active');
          }
        );
      });
    }

    // 9. Damper X-Ray Mode Action
    if (this.dom.btnDamper) {
      this.dom.btnDamper.addEventListener('click', () => {
        this.toggleDamperMode();
      });
    }

    if (this.dom.btnDamperClose) {
      this.dom.btnDamperClose.addEventListener('click', () => {
        this.closeDamperMode();
        this.app.cameraController.flyTo('overview');
      });
    }

    if (this.dom.btnDamperWind) {
      this.dom.btnDamperWind.addEventListener('click', () => {
        this.dom.btnDamperWind.classList.add('active');
        this.dom.btnDamperQuake.classList.remove('active');
        this.app.building101.damper.setMode('wind');
      });
    }

    if (this.dom.btnDamperQuake) {
      this.dom.btnDamperQuake.addEventListener('click', () => {
        this.dom.btnDamperQuake.classList.add('active');
        this.dom.btnDamperWind.classList.remove('active');
        this.app.building101.damper.setMode('earthquake');
      });
    }

    if (this.dom.damperSlider) {
      this.dom.damperSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        this.dom.damperIntensityVal.textContent = `等級 ${val}`;
        this.app.building101.damper.setIntensity(val);
      });
    }

    // 10. Fireworks Show Action
    if (this.dom.btnFireworks) {
      this.dom.btnFireworks.addEventListener('click', () => {
        this.closeDamperMode();
        this.dom.btnFireworks.classList.add('active');
        this.dom.countdownOverlay.classList.add('active');

        this.app.cameraController.flyTo('overview');
        this.app.fireworksSystem.startCountdownSequence();
      });
    }
  }

  _initSceneCallbacks() {
    this.app.sceneManager.setFpsCallback((fps) => {
      if (this.dom.fpsDisplay) {
        this.dom.fpsDisplay.textContent = `${fps} FPS`;
      }
    });

    this.app.cameraController.setCaptionCallback((captionText) => {
      if (this.dom.captionText) {
        this.dom.captionText.style.opacity = '0';
        setTimeout(() => {
          this.dom.captionText.textContent = captionText;
          this.dom.captionText.style.opacity = '1';
        }, 150);
      }
    });

    this.app.fireworksSystem.onCountdownTick = (secs) => {
      if (this.dom.countdownNumber) {
        this.dom.countdownNumber.textContent = secs > 0 ? secs : "HAPPY NEW YEAR!";
      }
    };

    this.app.fireworksSystem.onShowStart = () => {
      setTimeout(() => {
        this.dom.countdownOverlay.classList.remove('active');
      }, 1500);
    };

    this.app.fireworksSystem.onShowComplete = () => {
      this.dom.btnFireworks.classList.remove('active');
    };
  }

  _updateTime(hour) {
    if (this.dom.timeReadout) {
      this.dom.timeReadout.textContent = MathUtils.formatTime(hour);
    }
    this.app.weatherSystem.setTime(hour, this.app.building101, this.app.cityDistrict, this.app.sceneManager.renderer);
    this.app.lightingSchedule.update(0, 0, hour);
  }

  toggleDamperMode() {
    const isCurrentlyActive = this.dom.damperHud.classList.contains('active');
    if (isCurrentlyActive) {
      this.closeDamperMode();
    } else {
      this.openDamperMode();
    }
  }

  openDamperMode() {
    this.dom.damperHud.classList.add('active');
    this.dom.btnDamper.classList.add('active');
    this.app.building101.setXrayMode(true);
    this.app.cameraController.flyTo('damper');
  }

  closeDamperMode() {
    this.dom.damperHud.classList.remove('active');
    this.dom.btnDamper.classList.remove('active');
    this.app.building101.setXrayMode(false);
  }

  /**
   * Project 3D Hotspot Coordinates onto 2D Screen Space on every frame
   */
  updateHotspotPins() {
    const camera = this.app.sceneManager.camera;
    const w = window.innerWidth;
    const h = window.innerHeight;

    this.hotspotPins.forEach(p => {
      const el = document.getElementById(p.id);
      if (!el) return;

      const v = p.pos.clone().project(camera);

      // Check if behind camera
      if (v.z > 1.0) {
        el.style.display = 'none';
        return;
      }

      const screenX = (v.x * 0.5 + 0.5) * w;
      const screenY = (-(v.y * 0.5) + 0.5) * h;

      el.style.left = `${screenX}px`;
      el.style.top = `${screenY}px`;
      el.style.display = 'flex';
    });
  }

  updateOscilloscope(physicsState) {
    if (!this.oscCtx || !this.dom.damperHud.classList.contains('active') || !physicsState) return;

    const ctx = this.oscCtx;
    const w = this.dom.damperCanvas.width;
    const h = this.dom.damperCanvas.height;
    const midY = h / 2;

    this.waveHistory.push({
      tower: physicsState.towerOffset,
      ball: physicsState.ballOffset
    });

    if (this.waveHistory.length > this.maxHistory) {
      this.waveHistory.shift();
    }

    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, midY);
    ctx.lineTo(w, midY);
    ctx.stroke();

    const scale = 2.2;
    const stepX = w / this.maxHistory;

    // 1. Tower Displacement (Cyan #38bdf8)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < this.waveHistory.length; i++) {
      const x = i * stepX;
      const y = midY - this.waveHistory[i].tower * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // 2. Damper Ball Counter-Phase Displacement (Amber #f59e0b)
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i < this.waveHistory.length; i++) {
      const x = i * stepX;
      const y = midY - this.waveHistory[i].ball * scale;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
}
