/**
 * Taipei 101 - GPU Particle Fireworks Subsystem
 * High-performance 3-stage New Year Fireworks Display:
 * - Stage 1: 8-tier perimeter bamboo fountains shooting outward at 45 degrees
 * - Stage 2: Multi-color peony & chrysanthemum bursts encircling the tower
 * - Stage 3: Grand Spire Finale (508m apex burst with cascading spark waterfall)
 * Includes dynamic building illumination point lights & Web Audio SFX synchronization.
 */

import * as THREE from 'three';

export class FireworksSystem {
  constructor(scene, audioEngine, cameraController) {
    this.scene = scene;
    this.audioEngine = audioEngine;
    this.cameraController = cameraController;

    this.isActive = false;
    this.countdownTimer = null;
    this.countdownSeconds = 10;
    this.currentStage = 0;
    this.elapsedInShow = 0;

    // Callbacks for UI
    this.onCountdownTick = null;
    this.onShowStart = null;
    this.onShowComplete = null;

    // Dynamic flash lights illuminating the skyscraper glass
    this._initDynamicFlashLights();

    // GPU Particle System
    this.maxParticles = 25000;
    this._initParticleBuffers();
  }

  _initDynamicFlashLights() {
    this.flashLights = [];
    const lightColors = [0xffd700, 0xf43f5e, 0x38bdf8, 0x10b981];
    const lightAltitudes = [180, 260, 360, 480];

    for (let i = 0; i < 4; i++) {
      const pl = new THREE.PointLight(lightColors[i], 0.0, 350, 1.2);
      pl.position.set(
        Math.cos(i * 1.5) * 60,
        lightAltitudes[i],
        Math.sin(i * 1.5) * 60
      );
      this.scene.add(pl);
      this.flashLights.push(pl);
    }
  }

  _initParticleBuffers() {
    const geo = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.maxParticles * 3);
    this.velocities = new Float32Array(this.maxParticles * 3);
    this.colors = new Float32Array(this.maxParticles * 3);
    this.lifespans = new Float32Array(this.maxParticles); // remaining life in seconds
    this.initialLifespans = new Float32Array(this.maxParticles);

    // Initialize all as inactive
    for (let i = 0; i < this.maxParticles; i++) {
      this.lifespans[i] = 0.0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(this.colors, 3));

    this.particleMaterial = new THREE.PointsMaterial({
      size: 3.6,
      vertexColors: true,
      transparent: true,
      opacity: 0.98,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.particleMesh = new THREE.Points(geo, this.particleMaterial);
    this.scene.add(this.particleMesh);
  }

  /**
   * Start fast 3-second countdown then launch fireworks show
   */
  startCountdownSequence() {
    if (this.isActive) return;
    this.isActive = true;
    this.countdownSeconds = 3; // Fast 3-second countdown for immediate gratification
    this.elapsedInShow = 0;
    this.currentStage = 0;

    // Instant warning flare burst from 89F terrace so user sees action right away!
    this._pulseFlashLights(0xffd700, 8.0);
    if (this.audioEngine) this.audioEngine.playFireworkBoom(false);

    if (this.onCountdownTick) {
      this.onCountdownTick(this.countdownSeconds);
    }

    this.countdownTimer = setInterval(() => {
      this.countdownSeconds--;
      if (this.onCountdownTick) {
        this.onCountdownTick(this.countdownSeconds);
      }

      if (this.countdownSeconds <= 0) {
        clearInterval(this.countdownTimer);
        this.countdownTimer = null;
        this._launchShow();
      }
    }, 1000);
  }

  _launchShow() {
    if (this.onShowStart) this.onShowStart();

    // Stage 1: Spiral perimeter launches from the 8 bamboo pagoda tiers
    this._fireTierPerimeters();

    // Stage 2 at +3.0s: Dynamic multi-color peonies encircling the mid-section
    setTimeout(() => {
      if (!this.isActive) return;
      this._fireColorfulPeonies();
    }, 3000);

    // Stage 3 at +6.0s: Grand Spire Finale (Apex burst up to 600m)
    setTimeout(() => {
      if (!this.isActive) return;
      this._fireSpireFinale();
    }, 6000);

    // Show completion at +12.0s
    setTimeout(() => {
      this.isActive = false;
      if (this.onShowComplete) this.onShowComplete();
    }, 12000);
  }

  /**
   * Stage 1: Eight Pagoda Tiers Diagonal Spiral Fountains
   */
  _fireTierPerimeters() {
    if (this.audioEngine) this.audioEngine.playFireworkBoom(false);
    this._pulseFlashLights(0xffd700, 12.0); // Bright flash illuminating glass!

    const tierHeights = [142, 174, 206, 238, 270, 302, 334, 366];
    tierHeights.forEach((tierY, idx) => {
      setTimeout(() => {
        if (!this.isActive) return;
        const cornerOffsets = [
          [-26, 26], [26, 26], [-26, -26], [26, -26],
          [0, 27], [0, -27], [27, 0], [-27, 0]
        ];

        cornerOffsets.forEach(([cx, cz]) => {
          this._spawnBurst({
            origin: new THREE.Vector3(cx, tierY, cz),
            count: 220,
            baseColor: new THREE.Color(idx % 2 === 0 ? 0xf59e0b : 0xf43f5e), // Golden & crimson sparks
            speedMin: 35,
            speedMax: 85,
            lifeSec: 2.4,
            directionBias: new THREE.Vector3(cx * 0.08, 0.85, cz * 0.08).normalize()
          });
        });
      }, idx * 220); // Fast rising spiral cadence
    });
  }

  /**
   * Stage 2: Colorful Peonies and Chrysanthemums
   */
  _fireColorfulPeonies() {
    const burstColors = [0xf43f5e, 0x10b981, 0x38bdf8, 0xa855f7, 0xf59e0b];
    const burstPositions = [
      new THREE.Vector3(-90, 240, 90),
      new THREE.Vector3(90, 280, -90),
      new THREE.Vector3(0, 320, 105),
      new THREE.Vector3(-100, 350, -50),
      new THREE.Vector3(80, 390, 70)
    ];

    burstPositions.forEach((pos, idx) => {
      setTimeout(() => {
        if (!this.isActive) return;
        if (this.audioEngine) this.audioEngine.playFireworkBoom(false);
        this._pulseFlashLights(burstColors[idx], 14.0);

        this._spawnBurst({
          origin: pos,
          count: 700,
          baseColor: new THREE.Color(burstColors[idx]),
          speedMin: 50,
          speedMax: 130,
          lifeSec: 2.8,
          directionBias: null // 360 degree spherical burst
        });
      }, idx * 500);
    });
  }

  /**
   * Stage 3: Grand Spire Apex Finale at 508m
   */
  _fireSpireFinale() {
    if (this.audioEngine) this.audioEngine.playFireworkBoom(true);
    this._pulseFlashLights(0xffffff, 18.0); // Apex flash!

    // Huge golden crown explosion from 508m apex
    this._spawnBurst({
      origin: new THREE.Vector3(0, 508, 0),
      count: 3200,
      baseColor: new THREE.Color(0xfffaed),
      speedMin: 70,
      speedMax: 190,
      lifeSec: 4.0,
      directionBias: new THREE.Vector3(0, 0.45, 0)
    });

    // Cascading spark waterfall from 89F terrace
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      this._spawnBurst({
        origin: new THREE.Vector3(Math.cos(angle) * 22, 388, Math.sin(angle) * 22),
        count: 750,
        baseColor: new THREE.Color(0x38bdf8),
        speedMin: 25,
        speedMax: 80,
        lifeSec: 3.2,
        directionBias: new THREE.Vector3(Math.cos(angle), -0.2, Math.sin(angle))
      });
    }
  }

  _spawnBurst(options) {
    const { origin, count, baseColor, speedMin, speedMax, lifeSec, directionBias } = options;

    let spawned = 0;
    for (let i = 0; i < this.maxParticles && spawned < count; i++) {
      if (this.lifespans[i] <= 0.0) {
        // Found inactive slot
        const idx = i * 3;

        // Position
        this.positions[idx + 0] = origin.x;
        this.positions[idx + 1] = origin.y;
        this.positions[idx + 2] = origin.z;

        // Velocity (random spherical direction)
        let dir = new THREE.Vector3(
          Math.random() * 2 - 1,
          Math.random() * 2 - 1,
          Math.random() * 2 - 1
        ).normalize();

        if (directionBias) {
          dir.add(directionBias).normalize();
        }

        const speed = speedMin + Math.random() * (speedMax - speedMin);
        this.velocities[idx + 0] = dir.x * speed;
        this.velocities[idx + 1] = dir.y * speed;
        this.velocities[idx + 2] = dir.z * speed;

        // Color jitter
        const c = baseColor.clone().offsetHSL((Math.random() - 0.5) * 0.08, 0, (Math.random() - 0.5) * 0.1);
        this.colors[idx + 0] = c.r;
        this.colors[idx + 1] = c.g;
        this.colors[idx + 2] = c.b;

        this.lifespans[i] = lifeSec * (0.8 + Math.random() * 0.4);
        this.initialLifespans[i] = this.lifespans[i];

        spawned++;
      }
    }
  }

  _pulseFlashLights(colorHex, intensity) {
    this.flashLights.forEach(l => {
      l.color.setHex(colorHex);
      l.intensity = intensity;
    });
  }

  update(deltaTime) {
    // 1. Decay flash lights smoothly
    this.flashLights.forEach(l => {
      if (l.intensity > 0.01) {
        l.intensity -= deltaTime * 8.0;
        if (l.intensity < 0) l.intensity = 0;
      }
    });

    // 2. Step GPU particle physics
    const pos = this.positions;
    const vel = this.velocities;
    const col = this.colors;
    const life = this.lifespans;
    const initLife = this.initialLifespans;
    const gravity = -18.0; // Gravity downward acceleration
    const drag = 0.985;    // Air resistance

    let activeCount = 0;

    for (let i = 0; i < this.maxParticles; i++) {
      if (life[i] > 0.0) {
        activeCount++;
        life[i] -= deltaTime;

        const idx = i * 3;

        // Update velocity
        vel[idx + 1] += gravity * deltaTime;
        vel[idx + 0] *= drag;
        vel[idx + 1] *= drag;
        vel[idx + 2] *= drag;

        // Update position
        pos[idx + 0] += vel[idx + 0] * deltaTime;
        pos[idx + 1] += vel[idx + 1] * deltaTime;
        pos[idx + 2] += vel[idx + 2] * deltaTime;

        // Sparkle fade: dim color as life ends
        const lifeRatio = life[i] / initLife[i];
        col[idx + 0] *= 0.99;
        col[idx + 1] *= 0.99;
        col[idx + 2] *= 0.99;

        // Terminal condition (hit ground or life expired)
        if (life[i] <= 0.0 || pos[idx + 1] <= 0) {
          life[i] = 0.0;
          pos[idx + 1] = -100; // hide under ground
        }
      }
    }

    if (activeCount > 0) {
      this.particleMesh.geometry.attributes.position.needsUpdate = true;
      this.particleMesh.geometry.attributes.color.needsUpdate = true;
    }
  }
}
