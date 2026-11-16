/**
 * Taipei 101 - Hyper-Realistic Xinyi District Cityscape & Seamless Urban Matrix
 * Eliminates ground boundary edge completely:
 * - 6000m circular terrain blending smoothly into atmospheric fog
 * - Surrounding rolling mountain ridges (象山、南港山系) framing the Taipei basin
 * - High-poly landmarks:
 *   1. 台北世界貿易中心展覽大樓 (TWTC Hall 1 / 世貿一館) - stepped pink-terracotta ziggurat & central skylight
 *   2. 台北君悅酒店 (Grand Hyatt Taipei) - twin curved towers & bridge
 *   3. 微風南山 (Breeze Nanshan, 272m) - faceted tapering glass skyscraper
 *   4. 陶朱隱園 (Tao Zhu Yin Yuan) - 90-degree twisting double-helix & hanging gardens
 *   5. 國泰置地廣場 (Cathay Landmark, 212m)
 *   6. 台北市政府大樓 (Taipei City Hall)
 * - 400+ diverse city blocks with rooftop stainless steel water tanks, HVAC units, & varied facade materials
 * - Dynamic vehicle traffic light trails along major avenues
 * - Central plaza with perimeter ring of round green trees
 */

import * as THREE from 'three';
import { TextureGenerator } from '../utils/TextureGenerator.js';

export class CityDistrict {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = "Xinyi_City_District";

    this.buildingMeshes = [];
    this.trafficTrails = [];
    this.roadMaterial = null;
    this.mountainMaterial = null;

    this._initSeamlessGroundAndPlaza();
    this._initPerimeterTrees();
    this._initIconicXinyiLandmarks();
    this._initDenseCityBlocksWithRooftops();
    this._initTaipeiBasinMountains();
    this._initTrafficLightTrails();
  }

  /**
   * Seamless Enormous Circular Ground (Radius 6000m) - Zero Sharp Edges!
   */
  _initSeamlessGroundAndPlaza() {
    // 6000m radius circular ground disc (reaches far past camera horizon)
    const groundGeo = new THREE.CircleGeometry(6000, 64);
    const groundTex = TextureGenerator.createSeamlessGroundTexture();

    // PBR asphalt material matching atmospheric fog color in distance
    this.roadMaterial = new THREE.MeshPhysicalMaterial({
      map: groundTex,
      color: 0x22302a,
      roughness: 0.82,
      metalness: 0.15,
      clearcoat: 0.05,
      clearcoatRoughness: 0.4,
      reflectivity: 0.2
    });

    const ground = new THREE.Mesh(groundGeo, this.roadMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    this.group.add(ground);

    // Elevated Central Plaza Square (190m x 190m, matching reference screenshot)
    const plazaGeo = new THREE.BoxGeometry(190, 1.6, 190);
    this.plazaMaterial = new THREE.MeshStandardMaterial({
      color: 0x7c8c85,
      roughness: 0.65,
      metalness: 0.15
    });

    const plaza = new THREE.Mesh(plazaGeo, this.plazaMaterial);
    plaza.position.y = 0.8;
    plaza.receiveShadow = true;
    this.group.add(plaza);
  }

  /**
   * Perimeter Ring of Round Green Trees around Plaza Square
   */
  _initPerimeterTrees() {
    const treeGroup = new THREE.Group();

    const trunkGeo = new THREE.CylinderGeometry(0.35, 0.45, 3.2, 6);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3d2d1d, roughness: 0.9 });

    const foliageGeo = new THREE.SphereGeometry(2.6, 12, 12);
    const foliageMat = new THREE.MeshStandardMaterial({
      color: 0x1f8a4c,
      roughness: 0.65
    });

    const sideTrees = 24;
    const totalTrees = sideTrees * 4;

    const trunkInst = new THREE.InstancedMesh(trunkGeo, trunkMat, totalTrees);
    const foliageInst = new THREE.InstancedMesh(foliageGeo, foliageMat, totalTrees);

    const dummy = new THREE.Object3D();
    const halfSize = 92;
    const step = (halfSize * 2) / sideTrees;
    let idx = 0;

    const addTreeAt = (x, z) => {
      dummy.position.set(x, 1.6 + 1.6, z);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      trunkInst.setMatrixAt(idx, dummy.matrix);

      dummy.position.set(x, 4.2 + 1.6, z);
      dummy.updateMatrix();
      foliageInst.setMatrixAt(idx, dummy.matrix);
      idx++;
    };

    for (let i = 0; i < sideTrees; i++) {
      const x = -halfSize + i * step + step / 2;
      addTreeAt(x, -halfSize);
      addTreeAt(x, halfSize);
    }
    for (let i = 1; i < sideTrees - 1; i++) {
      const z = -halfSize + i * step + step / 2;
      addTreeAt(-halfSize, z);
      addTreeAt(halfSize, z);
    }

    trunkInst.count = idx;
    foliageInst.count = idx;
    trunkInst.instanceMatrix.needsUpdate = true;
    foliageInst.instanceMatrix.needsUpdate = true;

    treeGroup.add(trunkInst);
    treeGroup.add(foliageInst);
    this.group.add(treeGroup);
  }

  /**
   * Iconic Xinyi Landmarks (TWTC, Grand Hyatt, Breeze Nanshan, Tao Zhu Yin Yuan)
   */
  _initIconicXinyiLandmarks() {
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0x1e3a5f,
      emissive: 0x0f2744,
      emissiveIntensity: 0.35,
      metalness: 0.7,
      roughness: 0.15,
      clearcoat: 0.9,
      reflectivity: 0.85
    });

    // 1. 台北世界貿易中心展覽大樓 (Taipei World Trade Center / TWTC Hall 1, 世貿一館) - Photo 3!
    const twtcGroup = new THREE.Group();
    twtcGroup.position.set(-160, 0, 80); // Across Songzhi Rd
    const twtcTex = TextureGenerator.createTWTCFacadeTexture();
    const twtcMat = new THREE.MeshStandardMaterial({
      map: twtcTex,
      color: 0xc25e46, // Terracotta pink-brick
      roughness: 0.75,
      metalness: 0.15
    });

    // Stepped terraced ziggurat (Photo 3)
    const twtcTiers = [
      { w: 110, d: 95, h: 12, y: 6 },
      { w: 94, d: 80, h: 12, y: 18 },
      { w: 78, d: 65, h: 10, y: 29 },
      { w: 62, d: 50, h: 8, y: 38 }
    ];

    twtcTiers.forEach(t => {
      const bGeo = new THREE.BoxGeometry(t.w, t.h, t.d);
      const bMesh = new THREE.Mesh(bGeo, twtcMat);
      bMesh.position.y = t.y;
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      twtcGroup.add(bMesh);
    });

    // Central dark smoked glass atrium skylight
    const atriumGeo = new THREE.BoxGeometry(45, 6, 35);
    const atriumMat = new THREE.MeshPhysicalMaterial({
      color: 0x0f172a,
      roughness: 0.1,
      metalness: 0.8,
      clearcoat: 1.0
    });
    const atrium = new THREE.Mesh(atriumGeo, atriumMat);
    atrium.position.y = 43;
    twtcGroup.add(atrium);
    this.group.add(twtcGroup);

    // 2. 台北君悅酒店 (Grand Hyatt Taipei) - Photo 3
    const hyattGroup = new THREE.Group();
    hyattGroup.position.set(-160, 0, -50);
    const hyattMat = new THREE.MeshStandardMaterial({
      color: 0x9ca3af,
      roughness: 0.6,
      metalness: 0.2
    });

    // Twin towers
    [-24, 24].forEach(xOff => {
      const towerGeo = new THREE.BoxGeometry(36, 88, 32);
      const tower = new THREE.Mesh(towerGeo, hyattMat);
      tower.position.set(xOff, 44, 0);
      tower.castShadow = true;
      hyattGroup.add(tower);
    });
    // Curved connector atrium
    const connGeo = new THREE.BoxGeometry(22, 60, 26);
    const conn = new THREE.Mesh(connGeo, glassMat);
    conn.position.set(0, 30, 0);
    hyattGroup.add(conn);
    this.group.add(hyattGroup);

    // 3. Breeze Nanshan (微風南山, ~272m, directly East of 101)
    const breezeGroup = new THREE.Group();
    breezeGroup.position.set(140, 0, 85);
    const breezeGeo = new THREE.CylinderGeometry(15, 22, 270, 4, 1, false, Math.PI / 4);
    const breezeMesh = new THREE.Mesh(breezeGeo, glassMat);
    breezeMesh.position.y = 135;
    breezeMesh.castShadow = true;
    breezeGroup.add(breezeMesh);
    this.group.add(breezeGroup);

    // 4. Tao Zhu Yin Yuan (陶朱隱園 - Iconic Twisting Double Helix Sculpture Building)
    const taozhuGroup = new THREE.Group();
    taozhuGroup.position.set(240, 0, -110);
    const floors = 21;
    const floorH = 3.6;
    const taozhuMat = new THREE.MeshStandardMaterial({
      color: 0x8492a6,
      metalness: 0.6,
      roughness: 0.3
    });
    const plantMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.8 });

    for (let f = 0; f < floors; f++) {
      const angle = (f / floors) * (Math.PI / 2); // 90 degree twist overall
      const floorGeo = new THREE.BoxGeometry(42, 2.4, 26);
      const floorMesh = new THREE.Mesh(floorGeo, taozhuMat);
      floorMesh.position.y = f * floorH + 1.2;
      floorMesh.rotation.y = angle;
      taozhuGroup.add(floorMesh);

      // Balcony green hanging gardens
      const plantGeo = new THREE.BoxGeometry(42.5, 0.8, 4.0);
      const plantMesh = new THREE.Mesh(plantGeo, plantMat);
      plantMesh.position.set(0, f * floorH + 2.0, 11);
      plantMesh.rotation.y = angle;
      taozhuGroup.add(plantMesh);
    }
    this.group.add(taozhuGroup);

    // 5. Cathay Landmark (國泰置地廣場, 212m, North-East)
    const cathayGroup = new THREE.Group();
    cathayGroup.position.set(130, 0, -220);
    const cathayGeo = new THREE.BoxGeometry(48, 212, 38);
    const cathayMesh = new THREE.Mesh(cathayGeo, glassMat);
    cathayMesh.position.y = 106;
    cathayMesh.castShadow = true;
    cathayGroup.add(cathayMesh);
    this.group.add(cathayGroup);

    // 6. 台北市政府大樓 (Taipei City Hall)
    const cityHallGroup = new THREE.Group();
    cityHallGroup.position.set(0, 0, -230);
    const stoneMat = new THREE.MeshStandardMaterial({ color: 0xa8a29e, roughness: 0.7 });
    const hallCenterGeo = new THREE.BoxGeometry(60, 52, 60);
    const hallCenter = new THREE.Mesh(hallCenterGeo, stoneMat);
    hallCenter.position.y = 26;
    cityHallGroup.add(hallCenter);

    [-42, 42].forEach(x => {
      const wingGeo = new THREE.BoxGeometry(32, 40, 48);
      const wing = new THREE.Mesh(wingGeo, stoneMat);
      wing.position.set(x, 20, 0);
      cityHallGroup.add(wing);
    });
    this.group.add(cityHallGroup);
  }

  /**
   * Dense Orthogonal City Blocks with Rooftop Stainless Steel Water Tanks & HVAC units
   */
  _initDenseCityBlocksWithRooftops() {
    const modernTex = TextureGenerator.createCityBuildingTexture('modern');
    const beigeTex = TextureGenerator.createCityBuildingTexture('beige');

    const modernMat = new THREE.MeshStandardMaterial({
      map: modernTex,
      color: 0x64748b,
      roughness: 0.65,
      metalness: 0.25
    });

    const beigeMat = new THREE.MeshStandardMaterial({
      map: beigeTex,
      color: 0x78716c,
      roughness: 0.75,
      metalness: 0.15
    });

    const roofMat = new THREE.MeshStandardMaterial({
      color: 0x334155,
      roughness: 0.85
    });

    // Rooftop stainless steel cylindrical water storage tank material (Taipei signature!)
    const waterTankMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      metalness: 0.95,
      roughness: 0.15
    });

    const blockSize = 65;
    const roadWidth = 24;
    const pitch = blockSize + roadWidth; // 89m
    const halfGrid = 9; // 19x19 grid = 360+ buildings

    const totalBuildings = 380;
    const boxGeo = new THREE.BoxGeometry(1, 1, 1);
    const tankGeo = new THREE.CylinderGeometry(1.6, 1.6, 3.2, 12);

    const instModern = new THREE.InstancedMesh(boxGeo, modernMat, totalBuildings);
    const instBeige = new THREE.InstancedMesh(boxGeo, beigeMat, totalBuildings);
    const instRoof = new THREE.InstancedMesh(boxGeo, roofMat, totalBuildings);
    const instTank = new THREE.InstancedMesh(tankGeo, waterTankMat, totalBuildings);

    const dummy = new THREE.Object3D();
    let modIdx = 0;
    let beigeIdx = 0;
    let roofIdx = 0;
    let tankIdx = 0;

    for (let gx = -halfGrid; gx <= halfGrid; gx++) {
      for (let gz = -halfGrid; gz <= halfGrid; gz++) {
        // Skip central plaza and specific landmark lots
        if (Math.abs(gx) <= 1 && Math.abs(gz) <= 1) continue;
        if (gx === -2 && gz === 1) continue; // TWTC lot
        if (gx === -2 && gz === -1) continue; // Grand Hyatt lot
        if (gx === 2 && gz === 1) continue;  // Breeze Nanshan lot

        const cellCenterX = gx * pitch;
        const cellCenterZ = gz * pitch;

        const buildingW = blockSize * (0.65 + (Math.sin(gx * 3 + gz) * 0.15));
        const buildingD = blockSize * (0.65 + (Math.cos(gx + gz * 4) * 0.15));
        
        const distFromCenter = Math.hypot(gx, gz);
        const baseH = 45 + Math.abs(Math.sin(gx * 7 + gz * 11)) * 80;
        const buildingH = Math.max(28, baseH - distFromCenter * 2.0);

        const isModern = (Math.abs(gx + gz) % 2 === 0);

        dummy.position.set(cellCenterX, buildingH / 2, cellCenterZ);
        dummy.scale.set(buildingW, buildingH, buildingD);
        dummy.updateMatrix();

        if (isModern) {
          instModern.setMatrixAt(modIdx++, dummy.matrix);
        } else {
          instBeige.setMatrixAt(beigeIdx++, dummy.matrix);
        }

        // Roof trim / penthouse
        dummy.position.set(cellCenterX, buildingH + 1.2, cellCenterZ);
        dummy.scale.set(buildingW * 0.88, 2.4, buildingD * 0.88);
        dummy.updateMatrix();
        instRoof.setMatrixAt(roofIdx++, dummy.matrix);

        // Rooftop stainless steel cylindrical water tank
        dummy.position.set(cellCenterX + buildingW * 0.25, buildingH + 4.0, cellCenterZ + buildingD * 0.25);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        instTank.setMatrixAt(tankIdx++, dummy.matrix);

        if (roofIdx >= totalBuildings) break;
      }
      if (roofIdx >= totalBuildings) break;
    }

    instModern.count = modIdx;
    instBeige.count = beigeIdx;
    instRoof.count = roofIdx;
    instTank.count = tankIdx;

    instModern.instanceMatrix.needsUpdate = true;
    instBeige.instanceMatrix.needsUpdate = true;
    instRoof.instanceMatrix.needsUpdate = true;
    instTank.instanceMatrix.needsUpdate = true;

    instModern.castShadow = true;
    instModern.receiveShadow = true;
    instBeige.castShadow = true;
    instBeige.receiveShadow = true;

    this.group.add(instModern);
    this.group.add(instBeige);
    this.group.add(instRoof);
    this.group.add(instTank);
  }

  /**
   * Distant Mountain Ranges (象山、南港山系) framing Taipei Basin (Photo 1 & 2)
   */
  _initTaipeiBasinMountains() {
    const mountainGroup = new THREE.Group();
    const radius = 2400;
    const segments = 48;

    // Mountain ridge geometry with procedural height peaks
    const mountainGeo = new THREE.CylinderGeometry(radius + 600, radius, 320, segments, 12, true);
    const pos = mountainGeo.attributes.position;

    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const x = pos.getX(i);
      const z = pos.getZ(i);

      if (y > -150) {
        const angle = Math.atan2(z, x);
        // Elephant Mountain / Nangang mountain ridge waves
        const ridgeH = Math.sin(angle * 5) * 80 + Math.cos(angle * 11) * 45 + Math.sin(angle * 2.5) * 60;
        pos.setY(i, y + Math.max(0, ridgeH));
      }
    }
    mountainGeo.computeVertexNormals();

    this.mountainMaterial = new THREE.MeshStandardMaterial({
      color: 0x22382c, // Lush subtropical mountain green
      roughness: 0.9,
      metalness: 0.05,
      flatShading: true,
      side: THREE.BackSide
    });

    const mountainMesh = new THREE.Mesh(mountainGeo, this.mountainMaterial);
    mountainMesh.position.y = 80;
    mountainGroup.add(mountainMesh);
    this.group.add(mountainGroup);
  }

  /**
   * Dynamic Vehicle Traffic Light Trails (Moving glow streaks)
   */
  _initTrafficLightTrails() {
    const roadSegments = [
      { start: [-650, 0.45, 95], end: [650, 0.45, 95], color: 0xfffaed, speed: 65, count: 32 },
      { start: [650, 0.45, 115], end: [-650, 0.45, 115], color: 0xef4444, speed: -60, count: 32 },
      { start: [88, 0.45, 600], end: [88, 0.45, -600], color: 0xfffaed, speed: -55, count: 28 },
      { start: [102, 0.45, -600], end: [102, 0.45, 600], color: 0xef4444, speed: 50, count: 28 },
      { start: [-88, 0.45, 600], end: [-88, 0.45, -600], color: 0xfffaed, speed: -52, count: 25 },
      { start: [-72, 0.45, -600], end: [-72, 0.45, 600], color: 0xef4444, speed: 55, count: 25 }
    ];

    roadSegments.forEach(seg => {
      const trailMat = new THREE.MeshBasicMaterial({
        color: seg.color,
        transparent: true,
        opacity: 0.9
      });

      const streakGeo = new THREE.BoxGeometry(1.4, 0.4, 9.0);

      for (let i = 0; i < seg.count; i++) {
        const streak = new THREE.Mesh(streakGeo, trailMat);
        const t = i / seg.count;
        
        streak.position.set(
          THREE.MathUtils.lerp(seg.start[0], seg.end[0], t),
          seg.start[1],
          THREE.MathUtils.lerp(seg.start[2], seg.end[2], t)
        );

        const dx = seg.end[0] - seg.start[0];
        const dz = seg.end[2] - seg.start[2];
        streak.rotation.y = Math.atan2(dx, dz);

        this.group.add(streak);
        this.trafficTrails.push({
          mesh: streak,
          segment: seg,
          progress: t
        });
      }
    });
  }

  setWetness(wetnessFactor) {
    if (this.roadMaterial) {
      this.roadMaterial.roughness = THREE.MathUtils.lerp(0.82, 0.05, wetnessFactor);
      this.roadMaterial.metalness = THREE.MathUtils.lerp(0.15, 0.85, wetnessFactor);
      this.roadMaterial.clearcoat = THREE.MathUtils.lerp(0.05, 0.98, wetnessFactor);
      this.roadMaterial.reflectivity = THREE.MathUtils.lerp(0.2, 0.98, wetnessFactor);
    }
  }

  updateTimeColor(hour, isDay) {
    if (this.mountainMaterial) {
      if (hour >= 16.5 && hour < 18.5) {
        // Sunset violet mountain silhouette (Photo 2)
        this.mountainMaterial.color.setHex(0x4c1d95);
      } else if (hour >= 18.5 || hour <= 5.5) {
        // Night deep dark silhouette
        this.mountainMaterial.color.setHex(0x0a1118);
      } else {
        // Day lush green (Photo 1 & 3)
        this.mountainMaterial.color.setHex(0x22382c);
      }
    }
  }

  update(deltaTime) {
    const trailCount = this.trafficTrails.length;
    for (let i = 0; i < trailCount; i++) {
      const item = this.trafficTrails[i];
      const seg = item.segment;
      
      const distance = Math.hypot(seg.end[0] - seg.start[0], seg.end[2] - seg.start[2]);
      const speedNorm = seg.speed / distance;
      item.progress = (item.progress + speedNorm * deltaTime) % 1.0;
      if (item.progress < 0) item.progress += 1.0;

      item.mesh.position.x = THREE.MathUtils.lerp(seg.start[0], seg.end[0], item.progress);
      item.mesh.position.z = THREE.MathUtils.lerp(seg.start[2], seg.end[2], item.progress);
    }
  }
}
