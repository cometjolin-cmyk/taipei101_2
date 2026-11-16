/**
 * Taipei 101 - Math & Physics Utility Module
 * Enhanced with astronomical solar coordinates and realistic chromatic lighting curves
 */

export class MathUtils {
  static getSunPosition(hour) {
    // Hour progress: 0 to 24h
    // Dawn is around 06:00, Noon is 12:00, Sunset is ~18:00
    const normalizedTime = (hour - 6.0) / 12.0;
    const solarAngle = normalizedTime * Math.PI;

    let elevation = Math.sin(solarAngle) * 1.30; // peak ~74 degrees at noon
    let azimuth = (hour / 24.0) * Math.PI * 2.0 + Math.PI * 0.75;

    let intensity = 0.0;
    let colorHex = 0xffffff;
    let ambientIntensity = 0.15;

    if (hour >= 5.5 && hour < 8.0) {
      // 🌅 Early Morning (Photo 1)
      const t = (hour - 5.5) / 2.5;
      elevation = Math.max(0.12, Math.sin(solarAngle) * 0.6);
      intensity = 0.6 + t * 1.4;
      colorHex = 0xfde047; // Warm morning golden sunlight
      ambientIntensity = 0.35;
    } else if (hour >= 8.0 && hour < 16.5) {
      // ☀️ Crisp Midday (Photo 3)
      intensity = 2.6;
      colorHex = 0xfffaed; // Bright natural sun
      ambientIntensity = 0.55;
    } else if (hour >= 16.5 && hour < 18.5) {
      // 🌇 Sunset / Magic Hour (Photo 2)
      const t = (hour - 16.5) / 2.0;
      elevation = Math.max(0.08, 0.45 * (1.0 - t));
      intensity = 2.3 * (1.0 - t * 0.35);
      colorHex = 0xf97316; // Warm golden peach-orange
      ambientIntensity = 0.42;
    } else if (hour >= 18.5 && hour < 19.8) {
      // 🌃 Twilight / Blue Hour
      const t = (hour - 18.5) / 1.3;
      elevation = -0.15 - t * 0.2;
      intensity = 0.45 * (1.0 - t);
      colorHex = 0x6366f1; // Indigo twilight
      ambientIntensity = 0.25;
    } else {
      // 🌌 Deep Midnight
      elevation = -0.6;
      intensity = 0.10;
      colorHex = 0x38bdf8; // Soft cool moonlight
      ambientIntensity = 0.15;
    }

    // Distance vector calculation (R = 1200m)
    const r = 1200;
    const x = r * Math.cos(elevation) * Math.sin(azimuth);
    const y = Math.max(r * Math.sin(elevation), -250);
    const z = r * Math.cos(elevation) * Math.cos(azimuth);

    return {
      vector: { x, y, z },
      elevation,
      azimuth,
      intensity,
      colorHex,
      ambientIntensity,
      isDay: hour >= 6.0 && hour <= 18.5
    };
  }

  static createTMDSystem(params = {}) {
    return {
      m1: 100.0,
      m2: 6.6,
      k1: 40.0,
      k2: 2.8,
      c1: 0.8,
      c2: 1.5,
      x1: 0.0, v1: 0.0,
      x2: 0.0, v2: 0.0,
      mode: 'wind',
      intensity: 4,
      time: 0,

      step(dt) {
        this.time += dt;
        let F = 0;
        const scale = this.intensity * 8.0;

        if (this.mode === 'wind') {
          const omega_wind = 0.95;
          F = scale * Math.sin(this.time * omega_wind) + 
              scale * 0.3 * Math.sin(this.time * omega_wind * 2.1);
        } else {
          const omega_eq1 = 3.2;
          const omega_eq2 = 5.8;
          F = scale * 1.5 * (Math.sin(this.time * omega_eq1) + 0.6 * Math.cos(this.time * omega_eq2));
        }

        const dx = this.x2 - this.x1;
        const dv = this.v2 - this.v1;

        const a1 = (F - (this.c1 * this.v1) + (this.c2 * dv) - (this.k1 * this.x1) + (this.k2 * dx)) / this.m1;
        const a2 = (- (this.c2 * dv) - (this.k2 * dx)) / this.m2;

        this.v1 += a1 * dt;
        this.x1 += this.v1 * dt;
        this.v2 += a2 * dt;
        this.x2 += this.v2 * dt;

        return {
          towerOffset: this.x1,
          ballOffset: this.x2,
          relativeDisplacement: this.x2 - this.x1
        };
      }
    };
  }

  static formatTime(decimalHour) {
    const hours = Math.floor(decimalHour);
    const minutes = Math.floor((decimalHour - hours) * 60);
    const hh = hours.toString().padStart(2, '0');
    const mm = minutes.toString().padStart(2, '0');
    return `${hh}:${mm}`;
  }
}
