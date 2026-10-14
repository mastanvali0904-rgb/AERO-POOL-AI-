/**
 * Centerpiece #1: Interactive 3D/SVG Volumetric Trunk Visualizer
 * Renders isometric 3D boot cavities for:
 * 1) 180L CNG Compact Sedan (with prominent 60L gas cylinder & red overflow hazard)
 * 2) 500L 6-Seater MPV (clean modular flatbed with color-coded stacked luggage blocks)
 */

import { stateStore } from '../state.js';
import { CONFIG } from '../config.js';

export class TrunkVisualizer {
  constructor(containerEl) {
    this.container = containerEl;
    this.mode = 'mpv'; // 'mpv' | 'cng'
  }

  init() {
    stateStore.subscribe('luggage:change', () => this.render());
    stateStore.subscribe('vehicle:change', (veh) => {
      this.mode = veh;
      this.render();
    });
    this.render();
  }

  setMode(mode) {
    this.mode = mode;
    stateStore.setVehicle(mode);
    this.render();
  }

  render() {
    if (!this.container) return;

    const luggage = stateStore.state.luggage;
    const totalVol = luggage.reduce((sum, b) => sum + b.volumeLiters, 0);
    const maxCapacity = this.mode === 'cng' ? CONFIG.CNG_SEDAN_MAX_LITERS : CONFIG.MAX_TRUNK_VOLUME_LITERS;
    const isOverflow = totalVol > maxCapacity;
    const utilizationPct = Math.min(Math.round((totalVol / maxCapacity) * 100), 160);

    // Update parent card overflow state
    const cavityCard = this.container.closest('.trunk-cavity-container');
    if (cavityCard) {
      if (isOverflow) {
        cavityCard.classList.add('status-overflow');
      } else {
        cavityCard.classList.remove('status-overflow');
      }
    }

    // Update Banner Text
    const banner = document.getElementById('trunk-overflow-badge');
    if (banner) {
      if (isOverflow) {
        banner.style.display = 'inline-flex';
        banner.innerHTML = `<span class="pulse-dot rose"></span> OVERFLOW: +${totalVol - maxCapacity}L EXCEEDED!`;
      } else {
        banner.style.display = 'none';
      }
    }

    // Render SVG Cavity
    this.container.innerHTML = this.mode === 'cng' 
      ? this.generateCngSvg(luggage, totalVol, isOverflow)
      : this.generateMpvSvg(luggage, totalVol, isOverflow);

    // Update Telemetry Gauge
    this.updateGauge(totalVol, maxCapacity, isOverflow);
  }

  updateGauge(totalVol, maxCapacity, isOverflow) {
    const fillEl = document.getElementById('gauge-vol-fill');
    const textEl = document.getElementById('gauge-vol-text');
    const capEl = document.getElementById('gauge-cap-text');

    if (textEl) {
      textEl.textContent = `${totalVol} L`;
      textEl.className = isOverflow ? 'text-rose font-mono' : 'text-cyan font-mono';
    }
    if (capEl) {
      capEl.textContent = `${maxCapacity} L Capacity`;
    }
    if (fillEl) {
      const pct = Math.min((totalVol / CONFIG.MAX_TRUNK_VOLUME_LITERS) * 100, 100);
      fillEl.style.width = `${pct}%`;
      if (isOverflow) {
        fillEl.classList.add('fill-overflow');
      } else {
        fillEl.classList.remove('fill-overflow');
      }
    }
  }

  generateMpvSvg(luggage, totalVol, isOverflow) {
    // Isometric Coordinates & Luggage Packing Arrangement for 500L MPV
    // Floor area: W=500, H=240 in SVG space
    let svgLuggageBlocks = '';
    
    // Luggage placement positions (isometric grid slots)
    const slots = [
      { x: 140, y: 150, z: 0 },
      { x: 230, y: 150, z: 0 },
      { x: 320, y: 150, z: 0 },
      { x: 185, y: 110, z: 0 },
      { x: 275, y: 110, z: 0 },
      { x: 230, y: 70, z: 1 } // Second layer
    ];

    luggage.forEach((bag, idx) => {
      const slot = slots[idx % slots.length];
      const riderColor = this.getRiderColor(bag.riderIndex || (idx % 3) + 1);
      const isExtra = idx >= 5 || totalVol > 500;
      const blockColor = isExtra ? '#ec4899' : riderColor;
      
      const width = bag.type === 'LARGE' ? 70 : (bag.type === 'MEDIUM' ? 60 : 50);
      const height = bag.type === 'LARGE' ? 65 : (bag.type === 'MEDIUM' ? 55 : 45);
      const depth = 28;

      svgLuggageBlocks += this.createIsometricBox(
        slot.x, 
        slot.y - (slot.z * 40), 
        width, 
        height, 
        depth, 
        blockColor, 
        bag.name, 
        `${bag.volumeLiters}L`
      );
    });

    return `
      <svg viewBox="0 0 520 260" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <!-- Grid & Cavity Gradients -->
          <linearGradient id="mpvFloorGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#0c162e" />
            <stop offset="100%" stop-color="#060b18" />
          </linearGradient>
          <linearGradient id="mpvWallGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#142244" />
            <stop offset="100%" stop-color="#091024" />
          </linearGradient>
          <filter id="neonGlowMpv" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- 3D Boot Cavity Back Wall -->
        <polygon points="60,40 460,40 460,130 60,130" fill="url(#mpvWallGrad)" stroke="rgba(56, 189, 248, 0.25)" stroke-width="1.5" />
        
        <!-- Left Side Flank -->
        <polygon points="10,100 60,40 60,130 10,210" fill="#081022" stroke="rgba(56, 189, 248, 0.2)" stroke-width="1" />
        
        <!-- Right Side Flank -->
        <polygon points="460,40 510,100 510,210 460,130" fill="#0a142c" stroke="rgba(56, 189, 248, 0.2)" stroke-width="1" />

        <!-- Flat Bed Floor (Isometric Grid 500L) -->
        <polygon points="60,130 460,130 510,210 10,210" fill="url(#mpvFloorGrad)" stroke="rgba(0, 229, 255, 0.4)" stroke-width="2" />
        
        <!-- Isometric Laser Grid Lines -->
        <line x1="160" y1="130" x2="135" y2="210" stroke="rgba(0, 229, 255, 0.15)" stroke-dasharray="4,4" />
        <line x1="260" y1="130" x2="260" y2="210" stroke="rgba(0, 229, 255, 0.15)" stroke-dasharray="4,4" />
        <line x1="360" y1="130" x2="385" y2="210" stroke="rgba(0, 229, 255, 0.15)" stroke-dasharray="4,4" />
        <line x1="35" y1="170" x2="485" y2="170" stroke="rgba(0, 229, 255, 0.15)" stroke-dasharray="4,4" />

        <!-- Dimension Indicator -->
        <text x="260" y="235" text-anchor="middle" fill="#00e5ff" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">
          [ 500L VOLUMETRIC MPV CAVITY - DUAL-ROW EXPANDABLE FLOOR ]
        </text>

        <!-- Dynamic Isometric Luggage Blocks -->
        ${svgLuggageBlocks}
      </svg>
    `;
  }

  generateCngSvg(luggage, totalVol, isOverflow) {
    // 180L CNG Compact Sedan (Dzire / Etios)
    // Depicts a massive 60L cylindrical CNG gas tank occupying 65% of the trunk floor!
    let svgLuggageBlocks = '';
    
    // Only 2 small spots available in front of the tank
    const slots = [
      { x: 160, y: 170 },
      { x: 260, y: 170 },
      { x: 210, y: 130 } // Tries to balance on tank -> spill!
    ];

    luggage.forEach((bag, idx) => {
      const slot = slots[Math.min(idx, slots.length - 1)];
      const riderColor = this.getRiderColor(bag.riderIndex || (idx % 3) + 1);
      const isSpill = idx >= 2 || totalVol > 180;
      const blockColor = isSpill ? '#f43f5e' : riderColor;
      
      const width = bag.type === 'LARGE' ? 70 : 55;
      const height = bag.type === 'LARGE' ? 65 : 50;

      svgLuggageBlocks += this.createIsometricBox(
        slot.x + (idx > 2 ? (idx - 2) * 45 : 0), 
        slot.y - (idx > 2 ? 30 : 0), 
        width, 
        height, 
        24, 
        blockColor, 
        bag.name, 
        `${bag.volumeLiters}L`
      );
    });

    return `
      <svg viewBox="0 0 520 260" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cngCylinderGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#94a3b8" />
            <stop offset="35%" stop-color="#475569" />
            <stop offset="70%" stop-color="#1e293b" />
            <stop offset="100%" stop-color="#0f172a" />
          </linearGradient>
          <linearGradient id="cngHazardGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#f43f5e" />
            <stop offset="50%" stop-color="#fb7185" />
            <stop offset="100%" stop-color="#f43f5e" />
          </linearGradient>
        </defs>

        <!-- Shallow Sedan Trunk Wall -->
        <polygon points="60,60 460,60 460,140 60,140" fill="#0d111d" stroke="rgba(244, 63, 94, 0.3)" stroke-width="1.5" />
        <polygon points="60,140 460,140 500,210 20,210" fill="#080c16" stroke="rgba(244, 63, 94, 0.4)" stroke-width="2" />

        <!-- MASSIVE 60L CNG GAS CYLINDER (Occupies 65% of Volume) -->
        <g id="cng-tank-group">
          <!-- Cylinder Body -->
          <rect x="90" y="80" width="340" height="60" rx="20" fill="url(#cngCylinderGrad)" stroke="#64748b" stroke-width="2" />
          <!-- Metallic Securing Bands -->
          <rect x="140" y="78" width="12" height="64" fill="#334155" stroke="#94a3b8" stroke-width="1" />
          <rect x="370" y="78" width="12" height="64" fill="#334155" stroke="#94a3b8" stroke-width="1" />
          <!-- High-Pressure Valve & Gauge -->
          <circle cx="435" cy="110" r="10" fill="#cbd5e1" stroke="#0f172a" stroke-width="2" />
          <circle cx="435" cy="110" r="4" fill="#ef4444" />
          <!-- Tank Caution Label -->
          <rect x="210" y="98" width="100" height="24" fill="#facc15" rx="3" />
          <text x="260" y="114" text-anchor="middle" fill="#000000" font-size="10" font-family="'JetBrains Mono', monospace" font-weight="900">
            CNG 60L TANK (200 BAR)
          </text>
        </g>

        <!-- Remaining Usable Floor Marker (Only 180L) -->
        <rect x="100" y="160" width="320" height="40" fill="rgba(244, 63, 94, 0.1)" stroke="rgba(244, 63, 94, 0.5)" stroke-dasharray="4,4" />
        <text x="260" y="185" text-anchor="middle" fill="#f43f5e" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="700">
          MAX 180L USABLE SPACE REMAINING
        </text>

        <!-- Luggage Blocks Trying to Fit -->
        ${svgLuggageBlocks}

        <!-- Overflow Lid Collision Line -->
        ${isOverflow ? `
          <g>
            <line x1="20" y1="50" x2="500" y2="50" stroke="#f43f5e" stroke-width="3" stroke-dasharray="6,4" />
            <rect x="160" y="28" width="200" height="20" fill="#f43f5e" rx="4" />
            <text x="260" y="42" text-anchor="middle" fill="#ffffff" font-size="10" font-weight="800" font-family="sans-serif">
              ⚠️ TRUNK LID COLLISION HAZARD
            </text>
          </g>
        ` : ''}
      </svg>
    `;
  }

  createIsometricBox(x, y, w, h, d, color, title, volText) {
    // Generates an isometric 3D box (top face, front face, right face)
    const topPoints = `${x},${y} ${x + w/2},${y - d/2} ${x + w},${y} ${x + w/2},${y + d/2}`;
    const frontPoints = `${x},${y} ${x + w/2},${y + d/2} ${x + w/2},${y + d/2 + h} ${x},${y + h}`;
    const rightPoints = `${x + w/2},${y + d/2} ${x + w},${y} ${x + w},${y + h} ${x + w/2},${y + d/2 + h}`;

    return `
      <g class="luggage-block-3d" style="cursor: pointer;" transform="translate(0, 0)">
        <title>${title} (${volText})</title>
        <!-- Top Face -->
        <polygon points="${topPoints}" fill="${color}" opacity="0.9" stroke="rgba(255,255,255,0.4)" stroke-width="1" />
        <!-- Front Face -->
        <polygon points="${frontPoints}" fill="${color}" opacity="0.7" stroke="rgba(0,0,0,0.3)" stroke-width="1" />
        <!-- Right Face -->
        <polygon points="${rightPoints}" fill="${color}" opacity="0.55" stroke="rgba(0,0,0,0.4)" stroke-width="1" />
        <!-- Luggage Handle / Detail -->
        <line x1="${x + w/2 - 10}" y1="${y}" x2="${x + w/2 + 10}" y2="${y}" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" />
        <!-- Label -->
        <text x="${x + w/4}" y="${y + h/2 + 8}" fill="#ffffff" font-size="9" font-family="'JetBrains Mono', monospace" font-weight="700">
          ${volText}
        </text>
      </g>
    `;
  }

  getRiderColor(riderIndex) {
    switch (riderIndex) {
      case 1: return '#00e5ff'; // Cyan
      case 2: return '#10b981'; // Emerald
      case 3: return '#f59e0b'; // Amber
      default: return '#ec4899'; // Magenta / Overflow
    }
  }
}
