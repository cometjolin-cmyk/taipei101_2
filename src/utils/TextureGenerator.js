/**
 * Taipei 101 - Procedural Texture & Environment Map Generator
 * Generates:
 * 1. 360-degree Equirectangular HDR-style Sky & City Environment Map for real PBR reflections
 * 2. High-Resolution Taipei 101 Low-E Jade Curtain Wall Glass Texture
 * 3. TWTC (世貿一館) Terracotta & Smoked Glass Facade Texture
 * 4. City Building Window Grid Textures (Modern, Beige Stone, Dark Glass)
 * 5. Seamless Radial Asphalt Ground Texture that naturally fades into the distance
 */

import * as THREE from 'three';

export class TextureGenerator {
  /**
   * Generates a 360-degree Panoramic Sky & City Horizon Environment Map
   * This provides rich PBR Fresnel reflections on the tower's Low-E glass facade!
   */
  static createEnvironmentMap(renderer, timeTheme = 'day') {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // 1. Sky vertical gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);

    if (timeTheme === 'sunset') {
      skyGrad.addColorStop(0, '#2b1055');    // Deep violet zenith (Photo 2)
      skyGrad.addColorStop(0.35, '#c026d3'); // Magenta-rose
      skyGrad.addColorStop(0.48, '#f97316'); // Radiant coral-orange
      skyGrad.addColorStop(0.52, '#fde047'); // Horizon sunset flash
      skyGrad.addColorStop(0.65, '#2e1065'); // Dark mountain ridge
      skyGrad.addColorStop(1, '#090d16');
    } else if (timeTheme === 'night' || timeTheme === 'midnight') {
      skyGrad.addColorStop(0, '#020617');   // Midnight space
      skyGrad.addColorStop(0.46, '#0f172a');
      skyGrad.addColorStop(0.50, '#38bdf8'); // Horizon city neon haze
      skyGrad.addColorStop(0.55, '#1e293b');
      skyGrad.addColorStop(1, '#050811');
    } else if (timeTheme === 'dawn') {
      skyGrad.addColorStop(0, '#1e3a8a');   // Morning blue (Photo 1)
      skyGrad.addColorStop(0.45, '#38bdf8');
      skyGrad.addColorStop(0.50, '#fef08a'); // Pale golden dawn mist
      skyGrad.addColorStop(0.55, '#64748b');
      skyGrad.addColorStop(1, '#0f172a');
    } else {
      // Day (Clear azure & mountain haze, Photo 3)
      skyGrad.addColorStop(0, '#0284c7');   // Vivid daylight blue
      skyGrad.addColorStop(0.42, '#38bdf8');
      skyGrad.addColorStop(0.50, '#bae6fd'); // Atmospheric haze horizon
      skyGrad.addColorStop(0.55, '#475569');
      skyGrad.addColorStop(1, '#1e293b');
    }

    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, 1024, 512);

    // 2. Distant mountain silhouettes in environment reflection
    ctx.fillStyle = timeTheme === 'sunset' ? '#4c1d95' : (timeTheme === 'night' ? '#090d16' : '#334155');
    ctx.beginPath();
    ctx.moveTo(0, 260);
    for (let x = 0; x <= 1024; x += 32) {
      const my = 250 + Math.sin(x * 0.015) * 16 + Math.cos(x * 0.03) * 10;
      ctx.lineTo(x, my);
    }
    ctx.lineTo(1024, 275);
    ctx.lineTo(0, 275);
    ctx.fill();

    // 3. City skyline light dots along the horizon line
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 400; i++) {
      const hx = Math.random() * 1024;
      const hy = 248 + Math.random() * 22;
      const size = Math.random() * 2.5 + 1;
      ctx.globalAlpha = Math.random() * 0.8 + 0.2;
      ctx.fillRect(hx, hy, size, size);
    }
    ctx.globalAlpha = 1.0;

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    return texture;
  }

  /**
   * High-Resolution Taipei 101 Curtain Wall Texture
   * Crisp Low-E jade-teal glass with white aluminum mullions & double-glazed panels
   */
  static create101FacadeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Rich Low-E jade-teal base (Matching Photo 1 & 3)
    ctx.fillStyle = '#114b3d';
    ctx.fillRect(0, 0, 1024, 1024);

    const floors = 8;
    const floorH = 1024 / floors;
    const bays = 14;
    const bayW = 1024 / bays;

    for (let f = 0; f < floors; f++) {
      const y = f * floorH;

      // Darker spandrel band between floors
      ctx.fillStyle = '#0a2e25';
      ctx.fillRect(0, y, 1024, floorH * 0.2);

      // Silver-white aluminum horizontal trim
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.moveTo(0, y + floorH * 0.2);
      ctx.lineTo(1024, y + floorH * 0.2);
      ctx.stroke();

      // Vision glass pane
      const glassY = y + floorH * 0.2;
      const glassH = floorH * 0.8;

      for (let b = 0; b < bays; b++) {
        const x = b * bayW;

        // Rich subtle gradient on each vision glass pane
        const grad = ctx.createLinearGradient(x, glassY, x + bayW, glassY + glassH);
        grad.addColorStop(0, '#1a5c4c');
        grad.addColorStop(0.4, '#134e40');
        grad.addColorStop(1, '#0e3a30');
        ctx.fillStyle = grad;
        ctx.fillRect(x + 1.5, glassY + 1.5, bayW - 3, glassH - 3);

        // Crisp white/silver vertical mullion
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 1.6;
        ctx.strokeRect(x, glassY, bayW, glassH);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    return texture;
  }

  /**
   * TWTC (世貿一館) Facade Texture
   * Iconic terracotta pink-brick stepped facade with smoked glass strip windows
   */
  static createTWTCFacadeTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Iconic pink/terracotta brick tone (Photo 3)
    ctx.fillStyle = '#b4533c';
    ctx.fillRect(0, 0, 512, 512);

    const rows = 12;
    const rowH = 512 / rows;

    for (let r = 0; r < rows; r++) {
      const y = r * rowH;

      // Dark smoked glass continuous ribbon window
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(0, y + 4, 512, rowH * 0.45);

      // Brick joint lines
      ctx.strokeStyle = '#993d28';
      ctx.lineWidth = 1.5;
      for (let x = 0; x < 512; x += 32) {
        ctx.beginPath();
        ctx.moveTo(x + (r % 2) * 16, y + rowH * 0.45);
        ctx.lineTo(x + (r % 2) * 16, y + rowH);
        ctx.stroke();
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(4, 2);
    return texture;
  }

  /**
   * Seamless Radial Ground Texture with asphalt markings & crossings
   */
  static createSeamlessGroundTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Asphalt dark base
    ctx.fillStyle = '#1e2925';
    ctx.fillRect(0, 0, 1024, 1024);

    // Fine texture grain
    for (let i = 0; i < 8000; i++) {
      const gx = Math.random() * 1024;
      const gy = Math.random() * 1024;
      ctx.fillStyle = (Math.random() > 0.5) ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.04)';
      ctx.fillRect(gx, gy, 2, 2);
    }

    // Yellow center double divider line
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(510, 0); ctx.lineTo(510, 1024);
    ctx.moveTo(514, 0); ctx.lineTo(514, 1024);
    ctx.stroke();

    // White dashed lane markings
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([24, 24]);
    ctx.beginPath();
    ctx.moveTo(256, 0); ctx.lineTo(256, 1024);
    ctx.moveTo(768, 0); ctx.lineTo(768, 1024);
    ctx.stroke();
    ctx.setLineDash([]);

    // Zebra pedestrian crossing
    for (let y = 120; y < 220; y += 14) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillRect(160, y, 704, 7);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(16, 16);
    return texture;
  }

  /**
   * City Commercial Office Facade Texture with Window Grid
   */
  static createCityBuildingTexture(theme = 'modern') {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const baseColor = theme === 'beige' ? '#5a4f43' : (theme === 'dark' ? '#0f172a' : (theme === 'terracotta' ? '#6b3020' : '#1e293b'));
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, 512, 512);

    const rows = 16;
    const cols = 12;
    const cellW = 512 / cols;
    const cellH = 512 / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const x = c * cellW + cellW * 0.15;
        const y = r * cellH + cellH * 0.2;
        const w = cellW * 0.7;
        const h = cellH * 0.6;

        ctx.fillStyle = (Math.random() > 0.35) ? '#162e4a' : '#0d1d30';
        ctx.fillRect(x, y, w, h);

        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);
      }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 4);
    return texture;
  }
}
