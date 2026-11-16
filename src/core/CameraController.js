/**
 * Taipei 101 - Camera & Hotspot Navigation Controller
 */

import * as THREE from 'three';
import gsap from 'gsap';

export class CameraController {
  constructor(camera, controls, audioEngine) {
    this.camera = camera;
    this.controls = controls;
    this.audioEngine = audioEngine;

    this.hotspots = {
      overview: {
        pos: new THREE.Vector3(270, 380, 420),
        target: new THREE.Vector3(0, 160, 0),
        duration: 2.2,
        caption: "全景導覽：台北 101 與信義商圈街廓鳥瞰。可拖曳換角度，點其他部位或「+」繼續導覽。"
      },
      spire: {
        pos: new THREE.Vector3(120, 490, 160),
        target: new THREE.Vector3(0, 470, 0),
        duration: 2.2,
        caption: "互動導覽：塔冠與塔尖。包含 89F 觀景台、通訊天線桅杆與 508 公尺頂端避雷針。"
      },
      pagoda: {
        pos: new THREE.Vector3(110, 260, 150),
        target: new THREE.Vector3(0, 240, 0),
        duration: 2.2,
        caption: "互動導覽：竹節斗型塔身。每節 8 層向上外傾 7 度，取吉祥寓意與抗風桁架。"
      },
      podium: {
        pos: new THREE.Vector3(110, 70, 110),
        target: new THREE.Vector3(42, 25, 42),
        duration: 2.0,
        caption: "互動導覽：基座裙樓商場。挑高階梯式購物中心基座，連接周邊立體天橋步道系統。"
      },
      observatory: {
        pos: new THREE.Vector3(0, 415, 120),
        target: new THREE.Vector3(0, 395, 0),
        duration: 2.2,
        caption: "89F 觀景台：海拔 382 公尺的高空 360 度環景視野，俯瞰台北盆地天際線。"
      },
      xiangshan: {
        pos: new THREE.Vector3(480, 400, 720),
        target: new THREE.Vector3(0, 240, 0),
        duration: 2.5,
        caption: "象山遠眺：最具代表性的台北夜景觀景機位，俯瞰整座大樓與都會夜空。"
      },
      damper: {
        pos: new THREE.Vector3(0, 396, 32),
        target: new THREE.Vector3(0, 391, 0),
        duration: 2.0,
        caption: "88F–92F 風阻尼器：世界最大且唯一對外開放參觀的 660 噸鋼球調諧質塊阻尼器 (TMD)。"
      }
    };

    this.currentHotspot = 'overview';
    this.isElevatorMode = false;
    this.elevatorTween = null;
    this.captionCallback = null;
  }

  setCaptionCallback(fn) {
    this.captionCallback = fn;
  }

  flyTo(hotspotName, onComplete) {
    const targetSpot = this.hotspots[hotspotName];
    if (!targetSpot) return;

    this.currentHotspot = hotspotName;
    if (this.captionCallback) {
      this.captionCallback(targetSpot.caption, hotspotName);
    }

    this.controls.enabled = false;
    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.controls.target);

    const tl = gsap.timeline({
      onUpdate: () => {
        this.camera.lookAt(this.controls.target);
        if (this.audioEngine) {
          this.audioEngine.updateCameraAltitude(this.camera.position.y);
        }
      },
      onComplete: () => {
        this.controls.enabled = true;
        if (onComplete) onComplete();
      }
    });

    tl.to(this.camera.position, {
      x: targetSpot.pos.x,
      y: targetSpot.pos.y,
      z: targetSpot.pos.z,
      duration: targetSpot.duration,
      ease: 'power3.inOut'
    }, 0);

    tl.to(this.controls.target, {
      x: targetSpot.target.x,
      y: targetSpot.target.y,
      z: targetSpot.target.z,
      duration: targetSpot.duration,
      ease: 'power3.inOut'
    }, 0);
  }

  startElevatorExperience(onProgress, onFinish) {
    this.isElevatorMode = true;
    this.controls.enabled = false;

    const startY = 15;
    const endY = 388;
    const duration = 12.0;

    this.camera.position.set(10, startY, 10);

    if (this.audioEngine) {
      this.audioEngine.startElevatorWhine(duration);
    }

    const state = { progress: 0, currentY: startY };

    this.elevatorTween = gsap.to(state, {
      progress: 1.0,
      duration: duration,
      ease: 'power2.inOut',
      onUpdate: () => {
        state.currentY = THREE.MathUtils.lerp(startY, endY, state.progress);
        
        const speedFactor = Math.sin(state.progress * Math.PI);
        const jitterX = (Math.random() - 0.5) * 0.15 * speedFactor;
        const jitterY = (Math.random() - 0.5) * 0.15 * speedFactor;

        this.camera.position.set(10 + jitterX, state.currentY + jitterY, 10);
        this.controls.target.set(160, state.currentY - 20, 160);
        this.camera.lookAt(this.controls.target);

        const currentFloor = Math.round(THREE.MathUtils.lerp(1, 89, state.progress));
        const currentSpeed = Math.round(speedFactor * 1010);
        const currentAlt = Math.round(state.currentY);

        if (this.audioEngine) {
          this.audioEngine.updateCameraAltitude(state.currentY);
        }

        if (onProgress) {
          onProgress({
            floor: currentFloor,
            speed: currentSpeed,
            altitude: currentAlt,
            progress: state.progress
          });
        }
      },
      onComplete: () => {
        this.isElevatorMode = false;
        this.flyTo('observatory', () => {
          if (onFinish) onFinish();
        });
      }
    });
  }

  cancelElevator() {
    if (this.elevatorTween) {
      this.elevatorTween.kill();
      this.elevatorTween = null;
      this.isElevatorMode = false;
      this.controls.enabled = true;
    }
  }
}
