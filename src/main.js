/**
 * Taipei 101 - Main Application Orchestrator & Bootstrapper
 * Integrates all 3D subsystems, UI HUDs, physics loops, and post-processing pipelines.
 */

import * as THREE from 'three';
import { SceneManager } from './core/SceneManager.js';
import { CameraController } from './core/CameraController.js';
import { AudioEngine } from './audio/AudioEngine.js';
import { Building101 } from './models/Building101.js';
import { CityDistrict } from './models/CityDistrict.js';
import { WeatherSystem } from './systems/WeatherSystem.js';
import { FireworksSystem } from './systems/FireworksSystem.js';
import { LightingSchedule } from './systems/LightingSchedule.js';
import { UIManager } from './ui/UIManager.js';

class Taipei101App {
  constructor() {
    this.canvas = document.getElementById('webgl-canvas');
    if (!this.canvas) {
      console.error('WebGL Canvas element not found!');
      return;
    }

    this.clock = new THREE.Clock();

    // 1. Core Scene & Render Pipeline
    this.sceneManager = new SceneManager(this.canvas);

    // 2. Procedural Web Audio Engine
    this.audioEngine = new AudioEngine();

    // 3. Camera & Navigation Controller
    this.cameraController = new CameraController(
      this.sceneManager.camera,
      this.sceneManager.controls,
      this.audioEngine
    );

    // 4. Procedural Skyscraper Architecture
    this.building101 = new Building101();
    this.sceneManager.scene.add(this.building101.group);
    this.sceneManager.addUpdatable(this.building101);

    // 5. Surrounding Xinyi District Urban Blocks & Traffic
    this.cityDistrict = new CityDistrict();
    this.sceneManager.scene.add(this.cityDistrict.group);
    this.sceneManager.addUpdatable(this.cityDistrict);

    // 6. Physical Sky, Solar Radiation & Weather System
    this.weatherSystem = new WeatherSystem(this.sceneManager.scene, this.audioEngine);
    this.sceneManager.addUpdatable(this.weatherSystem);

    // 7. GPU Particle Fireworks System
    this.fireworksSystem = new FireworksSystem(
      this.sceneManager.scene,
      this.audioEngine,
      this.cameraController
    );
    this.sceneManager.addUpdatable(this.fireworksSystem);

    // 8. Weekday 7-Color Lighting System
    this.lightingSchedule = new LightingSchedule(this.building101);

    // 9. Glassmorphic UI & Interactive HUD Manager
    this.uiManager = new UIManager(this);

    // Initialize Default State
    this._initDefaults();

    // Start Master Render Loop
    this._startRenderLoop();
  }

  _initDefaults() {
    // Default: 12:00 Clear, Friday Blue, Overview perspective
    this.weatherSystem.setTime(12.0, this.building101, this.cityDistrict, this.sceneManager.renderer);
    this.lightingSchedule.setColor('#3b82f6');
    this.weatherSystem.setWeather('clear');
    this.cityDistrict.setWetness(0.0);
  }

  _startRenderLoop() {
    const tick = () => {
      requestAnimationFrame(tick);

      const deltaTime = this.clock.getDelta();
      const elapsedTime = this.clock.getElapsedTime();

      // Render Scene & Post-processing
      this.sceneManager.render(deltaTime, elapsedTime);

      // Update 3D Floating Hotspot Pins in screen space
      this.uiManager.updateHotspotPins();

      // Feed Damper 2-DOF oscillation state to UI oscilloscope
      if (this.building101.damper && this.building101.damper.physics) {
        const state = {
          towerOffset: this.building101.damper.physics.x1,
          ballOffset: this.building101.damper.physics.x2
        };
        this.uiManager.updateOscilloscope(state);
      }
    };

    tick();
  }
}

// Bootstrap once DOM content is ready
window.addEventListener('DOMContentLoaded', () => {
  window.app = new Taipei101App();
  console.log('🏛️ Taipei 101 Photorealistic 3D App successfully mounted!');
});
