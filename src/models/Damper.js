/**
 * Taipei 101 - Tuned Mass Damper (TMD) 660-Ton Golden Sphere Subsystem
 */

import * as THREE from 'three';
import { MathUtils } from '../utils/MathUtils.js';

export class Damper {
  constructor() {
    this.group = new THREE.Group();
    this.group.name = "TMD_Damper_System";

    this.physics = MathUtils.createTMDSystem();
    
    this.chamberBaseY = 388.0;
    this.ceilingY = 402.0;
    this.sphereRadius = 2.75;
    this.anchorRadius = 4.2;

    this.sphereMesh = null;
    this.cableLines = [];
    this.cableAnchorsCeiling = [];
    this.pistons = [];

    this._buildDamperChamber();
    this._buildGoldenSphere();
    this._buildSuspensionCables();
    this._buildHydraulicPistons();
    this._buildViewingDeck();
  }

  _buildDamperChamber() {
    const floorGeo = new THREE.CylinderGeometry(14, 14, 0.8, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      metalness: 0.8,
      roughness: 0.4
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = this.chamberBaseY;
    floor.receiveShadow = true;
    this.group.add(floor);

    const ceilingGeo = new THREE.TorusGeometry(this.anchorRadius, 0.3, 16, 32);
    const ceilingMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      metalness: 0.9,
      roughness: 0.3
    });
    const ceilingRing = new THREE.Mesh(ceilingGeo, ceilingMat);
    ceilingRing.rotation.x = Math.PI / 2;
    ceilingRing.position.y = this.ceilingY;
    this.group.add(ceilingRing);
  }

  _buildGoldenSphere() {
    this.sphereGroup = new THREE.Group();
    this.sphereGroup.position.set(0, this.chamberBaseY + 5.5, 0);

    const sphereGeo = new THREE.SphereGeometry(this.sphereRadius, 48, 48);
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: 0xf59e0b,
      emissive: 0x78350f,
      emissiveIntensity: 0.15,
      metalness: 0.96,
      roughness: 0.22,
      clearcoat: 0.5,
      clearcoatRoughness: 0.15,
      reflectivity: 0.9
    });

    this.sphereMesh = new THREE.Mesh(sphereGeo, goldMat);
    this.sphereMesh.castShadow = true;
    this.sphereMesh.receiveShadow = true;
    this.sphereGroup.add(this.sphereMesh);

    const seamMat = new THREE.MeshBasicMaterial({ color: 0xd97706 });
    for (let i = -5; i <= 5; i++) {
      if (i === 0) continue;
      const angle = (i / 6.0) * (Math.PI / 2.5);
      const r = this.sphereRadius * Math.cos(angle) + 0.02;
      const h = this.sphereRadius * Math.sin(angle);
      const ringGeo = new THREE.TorusGeometry(r, 0.03, 8, 36);
      const ring = new THREE.Mesh(ringGeo, seamMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = h;
      this.sphereGroup.add(ring);
    }

    const topCapGeo = new THREE.CylinderGeometry(1.2, 1.4, 0.4, 16);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x92400e, metalness: 0.9, roughness: 0.3 });
    const topCap = new THREE.Mesh(topCapGeo, capMat);
    topCap.position.y = this.sphereRadius - 0.1;
    this.sphereGroup.add(topCap);

    this.group.add(this.sphereGroup);
  }

  _buildSuspensionCables() {
    const cableMat = new THREE.LineBasicMaterial({
      color: 0xe2e8f0,
      linewidth: 2
    });

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const ceilX = Math.cos(angle) * this.anchorRadius;
      const ceilZ = Math.sin(angle) * this.anchorRadius;
      this.cableAnchorsCeiling.push(new THREE.Vector3(ceilX, this.ceilingY, ceilZ));

      const points = [
        new THREE.Vector3(ceilX, this.ceilingY, ceilZ),
        new THREE.Vector3(0, this.chamberBaseY + 5.5 + this.sphereRadius, 0)
      ];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.Line(geo, cableMat);
      this.cableLines.push(line);
      this.group.add(line);
    }
  }

  _buildHydraulicPistons() {
    this.pistonGroup = new THREE.Group();
    const pistonOuterMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.3 });
    const pistonShaftMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.95, roughness: 0.1 });

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2 + (Math.PI / 8);
      const innerR = 1.8;

      const pistonAssembly = new THREE.Group();
      
      const outerGeo = new THREE.CylinderGeometry(0.22, 0.22, 4.0, 12);
      const outerMesh = new THREE.Mesh(outerGeo, pistonOuterMat);
      outerMesh.position.y = 2.0;

      const shaftGeo = new THREE.CylinderGeometry(0.14, 0.14, 3.5, 12);
      const shaftMesh = new THREE.Mesh(shaftGeo, pistonShaftMat);
      shaftMesh.position.y = 4.2;

      pistonAssembly.add(outerMesh);
      pistonAssembly.add(shaftMesh);

      pistonAssembly.position.set(
        Math.cos(angle) * innerR,
        this.chamberBaseY + 0.4,
        Math.sin(angle) * innerR
      );
      pistonAssembly.rotation.z = Math.PI / 2.3;
      pistonAssembly.rotation.y = -angle;

      this.pistons.push(pistonAssembly);
      this.pistonGroup.add(pistonAssembly);
    }
    this.group.add(this.pistonGroup);
  }

  _buildViewingDeck() {
    const walkwayGeo = new THREE.RingGeometry(8.5, 12.5, 32);
    const walkwayMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      metalness: 0.7,
      roughness: 0.5,
      side: THREE.DoubleSide
    });
    const walkway = new THREE.Mesh(walkwayGeo, walkwayMat);
    walkway.rotation.x = Math.PI / 2;
    walkway.position.y = this.chamberBaseY + 1.2;
    this.group.add(walkway);

    const railGeo = new THREE.CylinderGeometry(8.5, 8.5, 1.1, 32, 1, true);
    const railMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
      roughness: 0.1,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const rail = new THREE.Mesh(railGeo, railMat);
    rail.position.y = this.chamberBaseY + 1.75;
    this.group.add(rail);
  }

  setMode(mode) {
    if (this.physics) {
      this.physics.mode = mode;
    }
  }

  setIntensity(level) {
    if (this.physics) {
      this.physics.intensity = Math.max(1, Math.min(10, level));
    }
  }

  update(deltaTime, elapsedTime) {
    if (!this.physics) return;

    const dt = Math.min(deltaTime, 0.05);
    const state = this.physics.step(dt);

    const ballX = state.ballOffset * 0.12;
    const ballZ = Math.sin(elapsedTime * 0.4) * (state.ballOffset * 0.03);

    if (this.sphereGroup) {
      this.sphereGroup.position.x = ballX;
      this.sphereGroup.position.z = ballZ;
      this.sphereGroup.rotation.z = -ballX * 0.08;
    }

    const topAttachmentPoint = new THREE.Vector3(
      ballX,
      this.chamberBaseY + 5.5 + this.sphereRadius,
      ballZ
    );

    for (let i = 0; i < this.cableLines.length; i++) {
      const line = this.cableLines[i];
      const ceilAnchor = this.cableAnchorsCeiling[i];
      const positions = line.geometry.attributes.position.array;

      positions[0] = ceilAnchor.x;
      positions[1] = ceilAnchor.y;
      positions[2] = ceilAnchor.z;

      positions[3] = topAttachmentPoint.x;
      positions[4] = topAttachmentPoint.y;
      positions[5] = topAttachmentPoint.z;

      line.geometry.attributes.position.needsUpdate = true;
    }

    return state;
  }
}
