/**
 * Centerpiece #2: Interactive 4 km Radial Cluster & Detour SLA Map
 * Uses HTML5 Canvas for cyber-aviation highway routes and pulsing radar nodes.
 */

import { stateStore } from '../state.js';
import { CONFIG } from '../config.js';

export class ClusterMap {
  constructor(canvasEl) {
    this.canvas = canvasEl;
    this.ctx = canvasEl ? canvasEl.getContext('2d') : null;
    this.animationFrame = null;
    this.particleProgress = 0;
    this.zoomLevel = 1.0;
  }

  init() {
    if (!this.canvas) return;

    this.resizeCanvas();
    window.addEventListener('resize', () => this.resizeCanvas());

    stateStore.subscribe('airport:change', () => {
      this.particleProgress = 0;
      this.updateMetricsBar();
      this.render();
    });

    stateStore.subscribe('scenario:run', () => {
      this.particleProgress = 0;
      this.updateMetricsBar();
      this.render();
    });

    this.startAnimationLoop();
    this.updateMetricsBar();
  }

  resizeCanvas() {
    if (!this.canvas) return;
    const rect = this.canvas.parentElement.getBoundingClientRect();
    this.canvas.width = rect.width;
    this.canvas.height = rect.height || 380;
    this.render();
  }

  startAnimationLoop() {
    const loop = () => {
      this.particleProgress = (this.particleProgress + 0.006) % 1;
      this.render();
      this.animationFrame = requestAnimationFrame(loop);
    };
    this.animationFrame = requestAnimationFrame(loop);
  }

  updateMetricsBar() {
    const airport = CONFIG.AIRPORTS[stateStore.state.currentAirport] || CONFIG.AIRPORTS.BLR;
    const savingsInr = airport.soloFareInr - airport.aeroPoolFareInr;
    const savingsPct = Math.round((savingsInr / airport.soloFareInr) * 100);

    const soloEl = document.getElementById('map-metric-solo');
    const poolEl = document.getElementById('map-metric-pool');
    const detourEl = document.getElementById('map-metric-detour');
    const radiusEl = document.getElementById('map-metric-radius');

    if (soloEl) soloEl.textContent = `₹${airport.soloFareInr}`;
    if (poolEl) poolEl.innerHTML = `₹${airport.aeroPoolFareInr} <span class="text-emerald" style="font-size:11px;">(-${savingsPct}%)</span>`;
    if (detourEl) detourEl.innerHTML = `+${airport.detourMins} min <span class="badge badge-emerald" style="font-size:9px;">SLA OK</span>`;
    if (radiusEl) radiusEl.innerHTML = `${airport.clusterRadiusKm} km <span class="badge badge-cyan" style="font-size:9px;">≤ 4km</span>`;
  }

  render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const airport = CONFIG.AIRPORTS[stateStore.state.currentAirport] || CONFIG.AIRPORTS.BLR;

    // Clear Screen with deep cosmic grid background
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, w, h);

    // Draw Cyber Background Grid
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.05)';
    ctx.lineWidth = 1;
    const gridSize = 32;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Node Positions
    const airportNode = { x: w * 0.16, y: h * 0.22 };
    const clusterCenter = { x: w * 0.68, y: h * 0.64 };
    const clusterRadiusPx = Math.min(w, h) * 0.26; // 4.0 km circle

    // Draw Highway Express Stem (Airport -> City Cluster Gateway)
    this.drawHighwayStem(ctx, airportNode, clusterCenter);

    // Draw 4.0 km Radial Drop-off Boundary (Centerpiece Visual)
    this.drawRadialClusterCircle(ctx, clusterCenter, clusterRadiusPx, airport.clusterRadiusKm);

    // Draw Rider Destination Pins inside the Cluster
    this.drawRiderPins(ctx, clusterCenter, airport.riders, w, h);

    // Draw Airport Exit-Gate Origin Node
    this.drawAirportNode(ctx, airportNode, airport.code);
  }

  drawHighwayStem(ctx, start, end) {
    // Smooth bezier curve for express corridor
    const cp1 = { x: start.x + (end.x - start.x) * 0.2, y: start.y + (end.y - start.y) * 0.8 };
    const cp2 = { x: start.x + (end.x - start.x) * 0.7, y: start.y + (end.y - start.y) * 0.3 };

    // Outer Glow Track
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    ctx.strokeStyle = 'rgba(37, 99, 235, 0.25)';
    ctx.lineWidth = 8;
    ctx.stroke();

    // Inner Core Track
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, end.x, end.y);
    ctx.strokeStyle = '#2563eb';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Highway Label
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2 - 10;
    ctx.fillStyle = '#60a5fa';
    ctx.font = '600 10px "Inter", sans-serif';
    ctx.fillText('EXPRESS HIGHWAY STEM (NO DETOUR)', midX - 60, midY);

    // Animated Vehicle Particle along the Stem
    const t = this.particleProgress;
    const px = this.getBezierPoint(start.x, cp1.x, cp2.x, end.x, t);
    const py = this.getBezierPoint(start.y, cp1.y, cp2.y, end.y, t);

    // Pulse Halo around vehicle
    ctx.beginPath();
    ctx.arc(px, py, 9, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
    ctx.fill();

    // Vehicle Core
    ctx.beginPath();
    ctx.arc(px, py, 4.5, 0, Math.PI * 2);
    ctx.fillStyle = '#00e5ff';
    ctx.fill();
  }

  drawRadialClusterCircle(ctx, center, radiusPx, radiusKm) {
    // Translucent glowing fill
    const grad = ctx.createRadialGradient(center.x, center.y, 10, center.x, center.y, radiusPx);
    grad.addColorStop(0, 'rgba(16, 185, 129, 0.12)');
    grad.addColorStop(0.7, 'rgba(0, 229, 255, 0.06)');
    grad.addColorStop(1, 'rgba(16, 185, 129, 0.0)');

    ctx.beginPath();
    ctx.arc(center.x, center.y, radiusPx, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Dashed 4.0 km Perimeter
    ctx.beginPath();
    ctx.arc(center.x, center.y, radiusPx, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // 4.0 km Constraint Badge Text on circle
    ctx.fillStyle = '#10b981';
    ctx.font = '700 10px "JetBrains Mono", monospace';
    ctx.fillText(`⌖ 4.0 KM MAX RADIAL CLUSTER BOUNDARY`, center.x - 100, center.y - radiusPx - 8);
  }

  drawRiderPins(ctx, clusterCenter, riders, w, h) {
    if (!riders || riders.length === 0) return;

    const pinCoords = [];
    const colors = ['#00e5ff', '#10b981', '#f59e0b', '#ec4899'];

    // Map riders into positions relative to cluster center
    const offsets = [
      { dx: -45, dy: -30 },
      { dx: 35, dy: -10 },
      { dx: -10, dy: 45 }
    ];

    riders.forEach((rider, idx) => {
      const off = offsets[idx % offsets.length];
      const pinX = clusterCenter.x + off.dx;
      const pinY = clusterCenter.y + off.dy;
      pinCoords.push({ x: pinX, y: pinY });

      // Draw Detour connecting dashed line between consecutive drop-offs
      if (idx > 0) {
        const prev = pinCoords[idx - 1];
        ctx.beginPath();
        ctx.moveTo(prev.x, prev.y);
        ctx.lineTo(pinX, pinY);
        ctx.strokeStyle = 'rgba(245, 158, 11, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Pin Outer Ring
      ctx.beginPath();
      ctx.arc(pinX, pinY, 12, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = colors[idx % colors.length];
      ctx.lineWidth = 2;
      ctx.fill();
      ctx.stroke();

      // Pin Number
      ctx.fillStyle = '#ffffff';
      ctx.font = '800 10px "Inter", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${idx + 1}`, pinX, pinY + 3.5);

      // Label Rider Name & Drop Location
      ctx.textAlign = 'left';
      ctx.fillStyle = '#f8fafc';
      ctx.font = '600 10px "Inter", sans-serif';
      ctx.fillText(`${rider.name.split(' ')[0]} (Drop ${idx + 1})`, pinX + 16, pinY - 4);
      ctx.fillStyle = '#94a3b8';
      ctx.font = '9px "Inter", sans-serif';
      ctx.fillText(rider.destination.split(' ')[0], pinX + 16, pinY + 8);
    });

    ctx.textAlign = 'left'; // reset
  }

  drawAirportNode(ctx, pos, code) {
    // Pulsing Radar rings
    const pulseRadius = 14 + (this.particleProgress * 12);
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, pulseRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(0, 229, 255, ${1 - this.particleProgress})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Node Circle
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 2.5;
    ctx.fill();
    ctx.stroke();

    // Center Airplane / Gate Symbol
    ctx.fillStyle = '#00e5ff';
    ctx.font = '800 10px "JetBrains Mono", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('✈', pos.x, pos.y + 3.5);

    // Label
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = '800 12px "Inter", sans-serif';
    ctx.fillText(`${code} AIRPORT EXIT GATE`, pos.x + 22, pos.y - 2);
    ctx.fillStyle = '#00e5ff';
    ctx.font = '600 9px "JetBrains Mono", monospace';
    ctx.fillText('POST-BELT EXIT GATE SENSOR [ACTIVE]', pos.x + 22, pos.y + 12);
  }

  getBezierPoint(p0, p1, p2, p3, t) {
    const cX = 3 * (p1 - p0);
    const bX = 3 * (p2 - p1) - cX;
    const aX = p3 - p0 - cX - bX;
    return aX * Math.pow(t, 3) + bX * Math.pow(t, 2) + cX * t + p0;
  }
}
