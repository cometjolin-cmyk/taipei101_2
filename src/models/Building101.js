/**
 * Taipei 101 - Exact Architectural Replica Matching Reference Application & Real Photos
 * - Stepped multi-tiered shopping mall podium with curved barrel-vaulted skylight roof & roof hotspot deck
 * - 1F-26F Inverted truncated pyramid base with four 12m ancient coin medallions (乾坤古銅錢)
 * - 8 Iconic Pagoda Bamboo Tiers with 7-degree outward flare & corner Ruyi (如意) ornaments
 * - Stepped Crown & Spire reaching 508m with blinking red aviation lights
 * - Ultra-crisp PBR Low-E jade-green curtain wall with clearcoat & 3D Parallax interior window mapping
 * - Weekday 7-color eave lighting
 * - Internal 660t TMD Damper System with 88F-92F X-Ray mode
 */

import * as THREE from 'three';
import { Damper } from './Damper.js';
import { InteriorMappingShader } from '../shaders/InteriorMappingShader.js';
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class Building101 {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = "Taipei101_Skyscraper";

    this.eaveLightMeshes = [];
    this.beaconMeshes = [];
    this.beaconLights = [];
    this.windowMaterials = [];
    this.xrayMaterials = [];
    this.isXrayActive = false;
    this.isRainbowMode = false;

    this._initMaterials();
    this._buildReferenceSteppedPodium();
    this._buildTransitionBase();
    this._buildPagodaTiers();
    this._buildCrownAndSpire();

    // 660-ton TMD Damper Subsystem inside 88F-92F
    this.damper = new Damper();
    this.group.add(this.damper.group);
  }

  _initMaterials() {
    // High-Resolution Procedural Curtain Wall Texture
    const facadeTex = TextureGenerator.create101FacadeTexture();

    // 1. Jade-Green Low-E Glass (Matching Photo 1 & 3)
    this.glassMaterial = new THREE.MeshPhysicalMaterial({
      map: facadeTex,
      color: 0x185a4b,
      emissive: 0x07241d,
      emissiveIntensity: 0.22,
      metalness: 0.38,
      roughness: 0.12,
      clearcoat: 0.98,
      clearcoatRoughness: 0.06,
      reflectivity: 0.95
    });

    InteriorMappingShader.apply(this.glassMaterial);
    this.windowMaterials.push(this.glassMaterial);

    // 2. 88F-92F X-Ray Damper Chamber Facade Material
    this.xrayGlassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.25,
      metalness: 0.2,
      roughness: 0.1,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide
    });
    this.xrayMaterials.push(this.xrayGlassMaterial);

    // 3. Dark Architectural Steel Framing (Matching reference screenshot)
    this.steelMaterial = new THREE.MeshStandardMaterial({
      color: 0x1f2924,
      metalness: 0.85,
      roughness: 0.35
    });

    // 4. White / Silver Aluminum Trim (Corner mega-columns)
    this.trimMaterial = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.8,
      roughness: 0.2
    });

    // 5. Weekday 7-Color Glow Eave Light Strip Material (High Emissive for Bloom)
    this.eaveLightMaterial = new THREE.MeshStandardMaterial({
      color: 0x3b82f6,
      emissive: 0x3b82f6,
      emissiveIntensity: 3.5,
      roughness: 0.2
    });

    // 6. Gold Ancient Coin & Ruyi Ornament Material
    this.goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      emissive: 0x92400e,
      emissiveIntensity: 0.2,
      metalness: 0.92,
      roughness: 0.25
    });

    // 7. Red Aviation Warning Beacon (High Intensity for Bloom)
    this.beaconMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0033
    });
  }

  /**
   * Stepped Multi-Tiered Podium Block with Curved Barrel Skylight (Photo 3 & Screenshot)
   */
  _buildReferenceSteppedPodium() {
    const podiumGroup = new THREE.Group();
    podiumGroup.position.set(42, 0, 42);

    // 3-tiered stepped ziggurat podium matching screenshot & aerial photo
    const tiers = [
      { w: 84, d: 84, h: 10, y: 5 },
      { w: 70, d: 70, h: 10, y: 15 },
      { w: 56, d: 56, h: 9, y: 24.5 }
    ];

    tiers.forEach(t => {
      // Glass body
      const bGeo = new THREE.BoxGeometry(t.w, t.h, t.d);
      const bMesh = new THREE.Mesh(bGeo, this.glassMaterial);
      bMesh.position.y = t.y;
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      podiumGroup.add(bMesh);

      // Dark steel perimeter roof edge
      const edgeGeo = new THREE.BoxGeometry(t.w + 1.8, 1.2, t.d + 1.8);
      const edgeMesh = new THREE.Mesh(edgeGeo, this.steelMaterial);
      edgeMesh.position.y = t.y + t.h / 2;
      podiumGroup.add(edgeMesh);
    });

    // Curved Barrel-Vaulted Glass Atrium Skylight (Distinctive feature in Photo 3!)
    const skylightGeo = new THREE.CylinderGeometry(14, 14, 38, 24, 1, false, 0, Math.PI);
    const skylightMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      metalness: 0.1,
      roughness: 0.1,
      transparent: true,
      opacity: 0.7,
      clearcoat: 1.0
    });
    const skylight = new THREE.Mesh(skylightGeo, skylightMat);
    skylight.rotation.z = Math.PI / 2;
    skylight.position.set(-6, 29.5, 0);
    podiumGroup.add(skylight);

    // Podium flat roof deck (Where the bottom Hotspot '+' sits at Y = 29.5)
    const roofDeckGeo = new THREE.BoxGeometry(50, 0.5, 50);
    const roofDeck = new THREE.Mesh(roofDeckGeo, this.steelMaterial);
    roofDeck.position.y = 29.2;
    podiumGroup.add(roofDeck);

    this.group.add(podiumGroup);
  }

  /**
   * 1F - 25F Inverted Truncated Pyramid Base Core with Ancient Coin Medallions (Photo 1)
   */
  _buildTransitionBase() {
    const transGroup = new THREE.Group();
    const height = 100;
    transGroup.position.y = height / 2;

    const coreGeo = new THREE.CylinderGeometry(
      22.0 * Math.SQRT2, // top radius (width ~44m)
      32.0 * Math.SQRT2, // bottom radius (width ~64m)
      height,
      4,
      1,
      false,
      Math.PI / 4
    );
    const coreMesh = new THREE.Mesh(coreGeo, this.glassMaterial);
    coreMesh.castShadow = true;
    coreMesh.receiveShadow = true;
    transGroup.add(coreMesh);

    // Corner mega-column covers (Silver/white vertical pinstripes)
    const colOffsets = [[-23, -23], [23, -23], [-23, 23], [23, 23]];
    colOffsets.forEach(([cx, cz]) => {
      const colGeo = new THREE.BoxGeometry(3.2, height, 3.2);
      const col = new THREE.Mesh(colGeo, this.trimMaterial);
      col.position.set(cx, 0, cz);
      transGroup.add(col);
    });

    // 12m Ancient Chinese Coin Medallions (乾坤古錢) at 26F on all 4 faces (Photo 1 & 2)
    const coinOuterRadius = 6.2;
    const coinInnerRadius = 2.4;
    const coinThickness = 0.8;
    const coinY = height / 2 - 8.0; // Near 26F junction

    const coinFaces = [
      { pos: [0, coinY, 23.2], rotY: 0 },
      { pos: [0, coinY, -23.2], rotY: Math.PI },
      { pos: [23.2, coinY, 0], rotY: Math.PI / 2 },
      { pos: [-23.2, coinY, 0], rotY: -Math.PI / 2 }
    ];

    coinFaces.forEach(f => {
      const coinGroup = new THREE.Group();
      coinGroup.position.set(f.pos[0], f.pos[1], f.pos[2]);
      coinGroup.rotation.y = f.rotY;

      // Outer gold disc
      const outerRingGeo = new THREE.CylinderGeometry(coinOuterRadius, coinOuterRadius, coinThickness, 32);
      outerRingGeo.rotateX(Math.PI / 2);
      const outerRing = new THREE.Mesh(outerRingGeo, this.goldMaterial);
      coinGroup.add(outerRing);

      // Inner square cutout rim (ancient Chinese round coin with square hole)
      const centerHoleGeo = new THREE.BoxGeometry(coinInnerRadius * 1.5, coinInnerRadius * 1.5, coinThickness + 0.2);
      const centerHole = new THREE.Mesh(centerHoleGeo, this.steelMaterial);
      coinGroup.add(centerHole);

      transGroup.add(coinGroup);
    });

    this.group.add(transGroup);
  }

  /**
   * 26F - 89F The 8 Iconic Pagoda Bamboo Tiers with 7-degree outward flare & Ruyi ornaments
   */
  _buildPagodaTiers() {
    const tierHeight = 32.0;
    const startY = 100.0;
    const bottomRadius = 21.5 * Math.SQRT2; // width ~43m
    const topRadius = 24.5 * Math.SQRT2;    // width ~49m (7 degrees outward flare)

    for (let i = 0; i < 8; i++) {
      const tierGroup = new THREE.Group();
      const centerY = startY + i * tierHeight + tierHeight / 2;
      tierGroup.position.y = centerY;

      const isDamperTier = (i === 7);
      const tierMat = isDamperTier ? this.xrayGlassMaterial : this.glassMaterial;

      // 1. Inverted truncated pyramid for each tier
      const tierGeo = new THREE.CylinderGeometry(
        topRadius,
        bottomRadius,
        tierHeight - 1.4,
        4,
        1,
        false,
        Math.PI / 4
      );
      const tierMesh = new THREE.Mesh(tierGeo, tierMat);
      tierMesh.castShadow = true;
      tierMesh.receiveShadow = true;
      tierGroup.add(tierMesh);

      // 2. Overhanging Eaves Shelf at top of tier (Prominent in screenshot!)
      const eaveTopY = tierHeight / 2 - 0.7;
      const eaveGeo = new THREE.BoxGeometry(51.5, 1.4, 51.5);
      const eave = new THREE.Mesh(eaveGeo, this.steelMaterial);
      eave.position.y = eaveTopY;
      tierGroup.add(eave);

      // 3. Weekday 7-Color Glow Light Strips on all 4 eave edges
      const lightStripGeo = new THREE.BoxGeometry(49.2, 0.6, 0.6);
      const lightZ1 = new THREE.Mesh(lightStripGeo, this.eaveLightMaterial);
      lightZ1.position.set(0, eaveTopY + 0.2, 25.8);
      tierGroup.add(lightZ1);

      const lightZ2 = new THREE.Mesh(lightStripGeo, this.eaveLightMaterial);
      lightZ2.position.set(0, eaveTopY + 0.2, -25.8);
      tierGroup.add(lightZ2);

      const lightX1 = new THREE.Mesh(lightStripGeo, this.eaveLightMaterial);
      lightX1.rotation.y = Math.PI / 2;
      lightX1.position.set(25.8, eaveTopY + 0.2, 0);
      tierGroup.add(lightX1);

      const lightX2 = new THREE.Mesh(lightStripGeo, this.eaveLightMaterial);
      lightX2.rotation.y = Math.PI / 2;
      lightX2.position.set(-25.8, eaveTopY + 0.2, 0);
      tierGroup.add(lightX2);

      this.eaveLightMeshes.push(lightZ1, lightZ2, lightX1, lightX2);

      // 4. Corner Ruyi Brackets (Golden traditional cloud motif)
      const ruyiOffsets = [
        [-25.8, -25.8], [25.8, -25.8], [-25.8, 25.8], [25.8, 25.8]
      ];
      ruyiOffsets.forEach(([rx, rz]) => {
        const ruyiGeo = new THREE.BoxGeometry(2.6, 2.2, 2.6);
        const ruyi = new THREE.Mesh(ruyiGeo, this.goldMaterial);
        ruyi.position.set(rx, eaveTopY - 1.2, rz);
        tierGroup.add(ruyi);
      });

      this.group.add(tierGroup);
    }
  }

  /**
   * Crown, Observatory & Spire reaching 508m with flashing aviation warning lights
   */
  _buildCrownAndSpire() {
    const crownGroup = new THREE.Group();

    // 89F/91F Observatory Deck (Y ~360m to 380m)
    const obsGeo = new THREE.BoxGeometry(38.0, 16.0, 38.0);
    const obsMesh = new THREE.Mesh(obsGeo, this.glassMaterial);
    obsMesh.position.y = 368.0;
    crownGroup.add(obsMesh);

    // Multi-tiered stepped crown (92F to 101F)
    const crownTiers = [
      { w: 32, h: 14, y: 383 },
      { w: 25, h: 14, y: 397 },
      { w: 18, h: 14, y: 411 },
      { w: 12, h: 12, y: 424 }
    ];

    crownTiers.forEach(ct => {
      const cGeo = new THREE.BoxGeometry(ct.w, ct.h, ct.w);
      const cMesh = new THREE.Mesh(cGeo, this.steelMaterial);
      cMesh.position.y = ct.y;
      crownGroup.add(cMesh);

      // Stepped eave ledge
      const lGeo = new THREE.BoxGeometry(ct.w + 2.0, 1.0, ct.w + 2.0);
      const lMesh = new THREE.Mesh(lGeo, this.steelMaterial);
      lMesh.position.y = ct.y + ct.h / 2;
      crownGroup.add(lMesh);
    });

    // Octagonal communication mast (Y: 430 to 480m)
    const mastGeo = new THREE.CylinderGeometry(1.8, 3.2, 50.0, 8);
    const mast = new THREE.Mesh(mastGeo, this.steelMaterial);
    mast.position.y = 455.0;
    crownGroup.add(mast);

    // Stainless steel pinnacle lightning rod (Y: 480 to 508m)
    const needleGeo = new THREE.CylinderGeometry(0.2, 1.4, 28.0, 8);
    const needle = new THREE.Mesh(needleGeo, this.trimMaterial);
    needle.position.y = 494.0;
    crownGroup.add(needle);

    // Apex aviation warning beacon at 508m
    const apexBeaconGeo = new THREE.SphereGeometry(0.8, 12, 12);
    const apexBeacon = new THREE.Mesh(apexBeaconGeo, this.beaconMaterial);
    apexBeacon.position.y = 508.0;
    crownGroup.add(apexBeacon);
    this.beaconMeshes.push(apexBeacon);

    const apexLight = new THREE.PointLight(0xff0033, 5.0, 120, 1.5);
    apexLight.position.y = 508.0;
    crownGroup.add(apexLight);
    this.beaconLights.push(apexLight);

    // Mid-tower beacons at 390m
    const midBeaconGeo = new THREE.SphereGeometry(0.5, 12, 12);
    [[-13, 390, 0], [13, 390, 0], [0, 390, -13], [0, 390, 13]].forEach(([bx, by, bz]) => {
      const bMesh = new THREE.Mesh(midBeaconGeo, this.beaconMaterial);
      bMesh.position.set(bx, by, bz);
      crownGroup.add(bMesh);
      this.beaconMeshes.push(bMesh);
    });

    this.group.add(crownGroup);
  }

  setXrayMode(enabled) {
    this.isXrayActive = enabled;
    this.xrayMaterials.forEach(mat => {
      mat.opacity = enabled ? 0.18 : 1.0;
      mat.transparent = enabled;
      mat.wireframe = enabled;
      mat.needsUpdate = true;
    });
  }

  setEaveLightColor(colorHex) {
    if (colorHex === 'rainbow') {
      this.isRainbowMode = true;
    } else {
      this.isRainbowMode = false;
      const c = new THREE.Color(colorHex);
      this.eaveLightMaterial.color.copy(c);
      this.eaveLightMaterial.emissive.copy(c);
      this.eaveLightMaterial.emissiveIntensity = 3.5;
    }
  }

  setNightFactor(factor) {
    if (this.glassMaterial && this.glassMaterial.userData.nightFactor) {
      this.glassMaterial.userData.nightFactor.value = factor;
    }
  }

  update(deltaTime, elapsedTime) {
    // 1. Red Aviation Beacons Blinking (ICAO Strobe rhythm: 0.8s on, 0.4s off)
    const blink = (elapsedTime % 1.2) < 0.75;
    const intensity = blink ? 1.0 : 0.05;
    this.beaconMeshes.forEach(m => {
      m.material.opacity = intensity;
    });
    this.beaconLights.forEach(l => {
      l.intensity = blink ? 5.0 : 0.0;
    });

    // 2. Festive Rainbow Mode
    if (this.isRainbowMode) {
      const hue = (elapsedTime * 0.15) % 1.0;
      const c = new THREE.Color().setHSL(hue, 0.95, 0.55);
      this.eaveLightMaterial.color.copy(c);
      this.eaveLightMaterial.emissive.copy(c);
    }

    // 3. Update interior mapping time uniform
    if (this.glassMaterial && this.glassMaterial.userData.time) {
      this.glassMaterial.userData.time.value = elapsedTime;
    }

    // 4. Update internal Damper physics
    if (this.damper) {
      this.damper.update(deltaTime, elapsedTime);
    }
  }
}
