/**
 * Taipei 101 - Core Scene & Post-Processing Manager
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

export class SceneManager {
  constructor(canvasElement) {
    this.canvas = canvasElement;
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.composer = null;
    this.bloomPass = null;

    this.updatables = [];

    this.fps = 60;
    this.frameCount = 0;
    this.lastFpsUpdate = performance.now();
    this.fpsCallback = null;

    this._initRenderer();
    this._initSceneAndCamera();
    this._initControls();
    this._initPostProcessing();
    this._setupResizeHandler();
  }

  _initRenderer() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance',
      alpha: false,
      stencil: false,
      depth: true
    });

    this.renderer.setSize(this.width, this.height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2.0));
    
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.05;

    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  _initSceneAndCamera() {
    this.scene = new THREE.Scene();
    // Atmospheric sage-gray background matching reference screenshot
    this.scene.background = new THREE.Color(0x52635d);

    this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 1.0, 6000.0);
    // Bird's-eye perspective matching reference screenshot exactly
    this.camera.position.set(270, 380, 420);
  }

  _initControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.target.set(0, 160, 0);

    this.controls.maxPolarAngle = Math.PI / 2 + 0.02;
    this.controls.minDistance = 25.0;
    this.controls.maxDistance = 2500.0;
  }

  _initPostProcessing() {
    this.composer = new EffectComposer(this.renderer);
    
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    const resolution = new THREE.Vector2(this.width, this.height);
    // Tuned for subtle, cinematic atmospheric glow on tower eave lights, aviation beacons, & fireworks
    this.bloomPass = new UnrealBloomPass(
      resolution,
      1.2,   // bloom strength
      0.65,  // bloom radius
      0.38   // bloom threshold (permits eave lights & window LED glows to bloom softly)
    );
    this.composer.addPass(this.bloomPass);
  }

  _setupResizeHandler() {
    window.addEventListener('resize', () => {
      this.width = window.innerWidth;
      this.height = window.innerHeight;

      this.camera.aspect = this.width / this.height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.width, this.height);
      this.composer.setSize(this.width, this.height);
      this.bloomPass.resolution.set(this.width, this.height);
    });
  }

  addUpdatable(obj) {
    this.updatables.push(obj);
  }

  setFpsCallback(fn) {
    this.fpsCallback = fn;
  }

  render(deltaTime, elapsedTime) {
    for (let i = 0; i < this.updatables.length; i++) {
      this.updatables[i].update(deltaTime, elapsedTime);
    }

    if (this.controls.enabled) {
      this.controls.update();
    }

    this.composer.render();

    this.frameCount++;
    const now = performance.now();
    if (now - this.lastFpsUpdate >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastFpsUpdate));
      this.frameCount = 0;
      this.lastFpsUpdate = now;
      if (this.fpsCallback) {
        this.fpsCallback(this.fps);
      }

      if (this.fps < 35 && this.renderer.getPixelRatio() > 1.0) {
        this.renderer.setPixelRatio(1.0);
        this.bloomPass.strength = 0.5;
      }
    }
  }
}
