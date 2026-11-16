/**
 * Taipei 101 - Weekday 7-Color Lighting Schedule System
 * Mon: Red, Tue: Orange, Wed: Yellow, Thu: Green, Fri: Blue, Sat: Indigo, Sun: Purple,
 * plus Festive Rainbow mode. Automatically adjusts emissive intensity based on solar elevation.
 */

export class LightingSchedule {
  constructor(building101) {
    this.building = building101;

    this.palette = {
      mon: '#ef4444',
      tue: '#f97316',
      wed: '#eab308',
      thu: '#22c55e',
      fri: '#3b82f6',
      sat: '#6366f1',
      sun: '#a855f7',
      rainbow: 'rainbow'
    };

    // Default to Friday Blue
    this.currentColor = '#3b82f6';
    this.isRainbow = false;
  }

  setColor(colorHex) {
    this.currentColor = colorHex;
    if (this.building) {
      this.building.setEaveLightColor(colorHex);
    }
  }

  update(deltaTime, elapsedTime, currentHour) {
    if (!this.building || !this.building.eaveLightMaterial) return;

    // During daytime (08:00 - 16:30), dim eave lights to save energy and maintain realistic daytime look
    let baseIntensity = 2.8;
    if (currentHour >= 8.0 && currentHour <= 16.5) {
      baseIntensity = 0.6; // subtle
    } else if (currentHour > 16.5 && currentHour < 18.0) {
      // Golden hour fade in
      const t = (currentHour - 16.5) / 1.5;
      baseIntensity = 0.6 + t * 2.2;
    }

    if (!this.building.isRainbowMode) {
      this.building.eaveLightMaterial.emissiveIntensity = baseIntensity;
    }
  }
}
