/**
 * Taipei 101 - Multi-Band Atmospheric Sky & Solar Lighting System
 * Produces striking, distinct time-of-day aesthetics matching user photos:
 * - 🌅 06:30 清晨 (Morning Golden Mist, Photo 1)
 * - ☀️ 12:00 正午 (Crisp Daylight Azure & Jade-Teal Facade, Photo 3)
 * - 🌇 17:45 夕陽魔幻時刻 (Vibrant Violet-Pink-Coral Twilight & Sunsets, Photo 2)
 * - 🌃 19:15 藍調夜幕 (Deep Blue Hour Cityscape)
 * - 🌌 22:00 璀璨深夜 (Tower Weekday Lights & Window Glows)
 */

import * as THREE from 'three';
import { MathUtils } from '../utils/MathUtils.js';
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class WeatherSystem {
  constructor(scene, audioEngine) {
    this.scene = scene;
    this.audioEngine = audioEngine;

    this.currentHour = 14.0;
    this.currentWeather = 'clear';
    this.targetFogDensity = 0.0003;
    this.roadWetness = 0.0;
    this.currentTheme = 'day';

    this._initSky();
    this._initSunAndAmbientLights();
    this._initFog();
    this._initRainParticles();
  }

  _initSky() {
    const skyGeo = new THREE.SphereGeometry(3400, 32, 24);
    skyGeo.scale(-1, 1, 1);

    // Three-band atmospheric shader for gorgeous sunset gradients (Photo 2)
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: {
        uZenithColor: { value: new THREE.Color(0x0c2540) },
        uMidColor: { value: new THREE.Color(0x38bdf8) },
        uHorizonColor: { value: new THREE.Color(0x93c5fd) },
        uSunDirection: { value: new THREE.Vector3(0, 1, 0) },
        uSunColor: { value: new THREE.Color(0xfffaed) },
        uTimeOfDay: { value: 14.0 }
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPos = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPos.xyz;
          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform vec3 uZenithColor;
        uniform vec3 uMidColor;
        uniform vec3 uHorizonColor;
        uniform vec3 uSunDirection;
        uniform vec3 uSunColor;
        varying vec3 vWorldPosition;

        void main() {
          vec3 dir = normalize(vWorldPosition);
          float y = clamp(dir.y, 0.0, 1.0);

          // Three-band vertical gradient (Horizon -> Mid -> Zenith)
          vec3 sky;
          if (y < 0.35) {
            sky = mix(uHorizonColor, uMidColor, y / 0.35);
          } else {
            sky = mix(uMidColor, uZenithColor, (y - 0.35) / 0.65);
          }

          // Solar disk glare & atmospheric scattering halo
          float sunCos = dot(dir, normalize(uSunDirection));
          float sunGlow = max(0.0, sunCos);
          float sunDisk = smoothstep(0.9982, 0.9996, sunCos);
          sky += uSunColor * (sunDisk * 4.5 + pow(sunGlow, 28.0) * 0.95);

          gl_FragColor = vec4(sky, 1.0);
        }
      `,
      side: THREE.BackSide,
      depthWrite: false
    });

    this.skyMesh = new THREE.Mesh(skyGeo, this.skyMat);
    this.scene.add(this.skyMesh);
  }

  _initSunAndAmbientLights() {
    this.sunLight = new THREE.DirectionalLight(0xffffff, 2.4);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 50;
    this.sunLight.shadow.camera.far = 3200;
    this.sunLight.shadow.bias = -0.0004;

    const d = 500;
    this.sunLight.shadow.camera.left = -d;
    this.sunLight.shadow.camera.right = d;
    this.sunLight.shadow.camera.top = d;
    this.sunLight.shadow.camera.bottom = -d;

    this.scene.add(this.sunLight);
    this.scene.add(this.sunLight.target);

    this.hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x1e293b, 0.5);
    this.scene.add(this.hemiLight);
  }

  _initFog() {
    this.fog = new THREE.FogExp2(0x52635d, 0.00042);
    this.scene.fog = this.fog;
  }

  _initRainParticles() {
    const rainCount = 6500;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(rainCount * 3);
    const velocities = new Float32Array(rainCount);

    for (let i = 0; i < rainCount; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 800;
      positions[i * 3 + 1] = Math.random() * 580;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 800;
      velocities[i] = 160 + Math.random() * 90;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.rainVelocities = velocities;

    const rainMat = new THREE.PointsMaterial({
      color: 0xbae6fd,
      size: 2.8,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    this.rainParticles = new THREE.Points(geometry, rainMat);
    this.scene.add(this.rainParticles);
  }

  /**
   * Set time of day in decimal hours (0.0 to 24.0) with rich lighting shifts
   */
  setTime(hour, buildingRef, cityDistrictRef, rendererRef) {
    this.currentHour = hour;
    const sunData = MathUtils.getSunPosition(hour);

    // 1. Position Directional Sun
    this.sunLight.position.set(sunData.vector.x, sunData.vector.y, sunData.vector.z);
    this.sunLight.target.position.set(0, 180, 0);
    this.sunLight.color.setHex(sunData.colorHex);
    this.sunLight.intensity = sunData.intensity;
    this.hemiLight.intensity = sunData.ambientIntensity;

    // 2. Update Multi-Band Sky Shader Colors based on time slots
    let theme = 'day';
    if (this.skyMat) {
      this.skyMat.uniforms.uSunDirection.value.set(sunData.vector.x, sunData.vector.y, sunData.vector.z).normalize();
      this.skyMat.uniforms.uTimeOfDay.value = hour;

      if (hour >= 5.5 && hour < 8.0) {
        // 🌅 Dawn / Early Morning (Photo 1)
        theme = 'dawn';
        this.skyMat.uniforms.uZenithColor.value.setHex(0x1e3a8a);  // Deep morning azure
        this.skyMat.uniforms.uMidColor.value.setHex(0x38bdf8);     // Light sky cyan
        this.skyMat.uniforms.uHorizonColor.value.setHex(0xfef08a); // Pale golden mist
        this.skyMat.uniforms.uSunColor.value.setHex(0xfde047);
        this.fog.color.setHex(0x60a5fa);
        this.hemiLight.color.setHex(0x93c5fd);
      } else if (hour >= 8.0 && hour < 16.5) {
        // ☀️ Reference App Atmospheric Sky (Photo & Reference Screenshot match!)
        theme = 'day';
        this.skyMat.uniforms.uZenithColor.value.setHex(0x3e4f49);
        this.skyMat.uniforms.uMidColor.value.setHex(0x52635d);
        this.skyMat.uniforms.uHorizonColor.value.setHex(0x6b7e77);
        this.skyMat.uniforms.uSunColor.value.setHex(0xfffaed);
        this.fog.color.setHex(0x52635d);
        this.hemiLight.color.setHex(0x94a39d);
      } else if (hour >= 16.5 && hour < 18.5) {
        // 🌇 Sunset / Magic Hour (EXACTLY matching Photo 2!)
        theme = 'sunset';
        this.skyMat.uniforms.uZenithColor.value.setHex(0x311b5e);  // Deep violet
        this.skyMat.uniforms.uMidColor.value.setHex(0xf472b6);     // Vibrant coral-pink
        this.skyMat.uniforms.uHorizonColor.value.setHex(0xf97316); // Golden peach
        this.skyMat.uniforms.uSunColor.value.setHex(0xfba544);
        this.fog.color.setHex(0xa855f7);
        this.hemiLight.color.setHex(0xf472b6);
      } else if (hour >= 18.5 && hour < 19.8) {
        // 🌃 Twilight / Blue Hour
        theme = 'night';
        this.skyMat.uniforms.uZenithColor.value.setHex(0x0f172a);  // Deep navy
        this.skyMat.uniforms.uMidColor.value.setHex(0x1e1b4b);     // Indigo
        this.skyMat.uniforms.uHorizonColor.value.setHex(0x312e81); // Violet dusk
        this.skyMat.uniforms.uSunColor.value.setHex(0x6366f1);
        this.fog.color.setHex(0x1e1b4b);
        this.hemiLight.color.setHex(0x6366f1);
      } else {
        // 🌌 Deep Midnight
        theme = 'night';
        this.skyMat.uniforms.uZenithColor.value.setHex(0x020617);  // Pitch navy space
        this.skyMat.uniforms.uMidColor.value.setHex(0x0b132b);     // Dark night
        this.skyMat.uniforms.uHorizonColor.value.setHex(0x1c2541); // Soft city horizon glow
        this.skyMat.uniforms.uSunColor.value.setHex(0x38bdf8);
        this.fog.color.setHex(0x050a18);
        this.hemiLight.color.setHex(0x1e293b);
      }
    }

    // Update Environment Map Reflection on Scene if theme changed
    if (theme !== this.currentTheme && rendererRef) {
      this.currentTheme = theme;
      const envTex = TextureGenerator.createEnvironmentMap(rendererRef, theme);
      this.scene.environment = envTex;
    }

    // 3. Update Building Interior Window Night Lighting Factor
    if (buildingRef) {
      let nightFactor = 0.0;
      if (hour >= 18.5 || hour <= 5.5) {
        nightFactor = 1.0;
      } else if (hour > 16.5 && hour < 18.5) {
        nightFactor = (hour - 16.5) / 2.0; // gradual office light up at sunset
      } else if (hour > 5.5 && hour < 6.8) {
        nightFactor = 1.0 - (hour - 5.5) / 1.3;
      }
      buildingRef.setNightFactor(nightFactor);
    }

    // 4. Update City District & Mountain Silhouettes
    if (cityDistrictRef) {
      cityDistrictRef.updateTimeColor(hour, sunData.isDay);
    }
  }

  setWeather(weatherType) {
    this.currentWeather = weatherType;

    if (weatherType === 'clear') {
      this.targetFogDensity = 0.0003;
      this.roadWetness = 0.0;
      if (this.audioEngine) this.audioEngine.setRainActive(false);
    } else if (weatherType === 'fog') {
      this.targetFogDensity = 0.0022;
      this.roadWetness = 0.2;
      if (this.audioEngine) this.audioEngine.setRainActive(false);
    } else if (weatherType === 'rain') {
      this.targetFogDensity = 0.0016;
      this.roadWetness = 1.0;
      if (this.audioEngine) this.audioEngine.setRainActive(true);
    }
  }

  update(deltaTime) {
    if (this.fog) {
      this.fog.density = THREE.MathUtils.lerp(this.fog.density, this.targetFogDensity, deltaTime * 2.5);
    }

    if (this.rainParticles) {
      const isRaining = (this.currentWeather === 'rain');
      const targetOpacity = isRaining ? 0.65 : 0.0;
      this.rainParticles.material.opacity = THREE.MathUtils.lerp(
        this.rainParticles.material.opacity,
        targetOpacity,
        deltaTime * 3.0
      );

      if (this.rainParticles.material.opacity > 0.01) {
        const positions = this.rainParticles.geometry.attributes.position.array;
        const count = positions.length / 3;

        for (let i = 0; i < count; i++) {
          positions[i * 3 + 1] -= this.rainVelocities[i] * deltaTime;
          positions[i * 3 + 0] -= 15 * deltaTime;

          if (positions[i * 3 + 1] <= 0) {
            positions[i * 3 + 1] = 520;
            positions[i * 3 + 0] = (Math.random() - 0.5) * 700;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 700;
          }
        }
        this.rainParticles.geometry.attributes.position.needsUpdate = true;
      }
    }
  }
}
