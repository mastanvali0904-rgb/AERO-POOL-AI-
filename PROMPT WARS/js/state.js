/**
 * AERO-POOL AI: Reactive State Store & Central Event Bus
 */

import { CONFIG } from './config.js';

class StateStore {
  constructor() {
    this.listeners = new Map();
    this.state = {
      currentView: 'kiosk', // 'kiosk' | 'command'
      currentAirport: 'BLR',
      selectedVehicle: 'mpv', // 'mpv' (500L) | 'cng' (180L)
      
      // Batch Countdown
      batchTimerSecs: 252, // 4m 12s default
      batchTimerTotal: CONFIG.BATCHING_WINDOW_SECS, // 360s
      isBatchRunning: true,

      // Luggage Manifest
      luggage: [],

      // Active Scenario ID
      activeScenarioId: 'scenario-2',

      // Gemini AI Configuration
      geminiApiKey: localStorage.getItem('aeropool_gemini_key') || '',
      geminiModel: 'gemini-2.5-flash',
      isAiLive: false,

      // Operations KPIs
      metrics: {
        passengersToday: 428,
        avgBatchTime: '4m 12s',
        avgDetour: '7.4m',
        cngSedanRejections: 64,
        co2PreventedKg: 1840,
        curbCongestionReduction: '48%'
      },

      // Agent Streaming Logs
      logs: []
    };

    // Load initial luggage from BLR airport preset
    this.loadAirportRiders(this.state.currentAirport);
  }

  getState() {
    return this.state;
  }

  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);
    return () => {
      const arr = this.listeners.get(event).filter(cb => cb !== callback);
      this.listeners.set(event, arr);
    };
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => cb(data, this.state));
    }
    if (this.listeners.has('*')) {
      this.listeners.get('*').forEach(cb => cb(event, data, this.state));
    }
  }

  setView(viewName) {
    this.state.currentView = viewName;
    this.emit('view:change', viewName);
  }

  setAirport(airportCode) {
    if (!CONFIG.AIRPORTS[airportCode]) return;
    this.state.currentAirport = airportCode;
    this.loadAirportRiders(airportCode);
    this.emit('airport:change', airportCode);
  }

  loadAirportRiders(airportCode) {
    const airport = CONFIG.AIRPORTS[airportCode];
    if (!airport) return;

    const newLuggage = [];
    let bagCounter = 1;

    airport.riders.forEach((rider, rIdx) => {
      rider.bags.forEach(b => {
        const preset = CONFIG.LUGGAGE_PRESETS[b.type] || CONFIG.LUGGAGE_PRESETS.MEDIUM;
        newLuggage.push({
          id: `bag-${bagCounter++}`,
          riderId: rider.id,
          riderIndex: rIdx + 1,
          riderName: rider.name,
          type: b.type,
          name: `${preset.name} (${rider.name.split(' ')[0]})`,
          volumeLiters: b.volumeLiters || preset.volumeLiters,
          dimensions: preset.dimensions,
          weightKg: preset.weightKg
        });
      });
    });

    this.state.luggage = newLuggage;
    this.emit('luggage:change', this.state.luggage);
  }

  addLuggage(bag) {
    this.state.luggage.push(bag);
    this.emit('luggage:change', this.state.luggage);
    this.checkVolumetricConstraints();
  }

  removeLuggage(bagId) {
    this.state.luggage = this.state.luggage.filter(b => b.id !== bagId);
    this.emit('luggage:change', this.state.luggage);
    this.checkVolumetricConstraints();
  }

  clearLuggage() {
    this.state.luggage = [];
    this.emit('luggage:change', this.state.luggage);
    this.checkVolumetricConstraints();
  }

  getTotalVolume() {
    return this.state.luggage.reduce((sum, b) => sum + b.volumeLiters, 0);
  }

  checkVolumetricConstraints() {
    const totalVol = this.getTotalVolume();
    const isOverflow = totalVol > CONFIG.MAX_TRUNK_VOLUME_LITERS;
    const exceedsCng = totalVol > CONFIG.CNG_SEDAN_MAX_LITERS;

    this.emit('volumetric:check', {
      totalVolume: totalVol,
      maxVolume: CONFIG.MAX_TRUNK_VOLUME_LITERS,
      cngVolume: CONFIG.CNG_SEDAN_MAX_LITERS,
      isOverflow,
      exceedsCng
    });

    return { totalVol, isOverflow, exceedsCng };
  }

  setVehicle(vehicleType) {
    this.state.selectedVehicle = vehicleType;
    this.emit('vehicle:change', vehicleType);
  }

  addLog(agent, text, math = null) {
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      agent, // 'gate' | 'vision' | 'geo' | 'fare'
      text,
      math,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour12: false })
    };
    this.state.logs.push(entry);
    this.emit('log:entry', entry);
  }

  clearLogs() {
    this.state.logs = [];
    this.emit('log:clear');
  }

  setGeminiKey(key) {
    this.state.geminiApiKey = key.trim();
    if (this.state.geminiApiKey) {
      localStorage.setItem('aeropool_gemini_key', this.state.geminiApiKey);
      this.state.isAiLive = true;
    } else {
      localStorage.removeItem('aeropool_gemini_key');
      this.state.isAiLive = false;
    }
    this.emit('ai:status', this.state.isAiLive);
  }
}

export const stateStore = new StateStore();
