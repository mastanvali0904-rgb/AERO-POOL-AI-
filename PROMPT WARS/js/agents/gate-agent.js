/**
 * AGENT 1: [Post-Belt Gate Agent]
 * Responsibility: Eliminates pre-booking vs baggage-belt desynchronization.
 * Triggers 6-minute batching countdown post baggage-claim clearance.
 */

import { stateStore } from '../state.js';
import { CONFIG } from '../config.js';

export class PostBeltGateAgent {
  constructor() {
    this.timerInterval = null;
  }

  init() {
    stateStore.subscribe('airport:change', (code) => {
      this.onAirportChanged(code);
    });
    this.startBatchTimer();
  }

  startBatchTimer(initialSecs = 252) {
    if (this.timerInterval) clearInterval(this.timerInterval);
    stateStore.state.batchTimerSecs = initialSecs;
    stateStore.state.isBatchRunning = true;

    this.timerInterval = setInterval(() => {
      if (!stateStore.state.isBatchRunning) return;

      if (stateStore.state.batchTimerSecs > 0) {
        stateStore.state.batchTimerSecs--;
        stateStore.emit('timer:tick', {
          remainingSecs: stateStore.state.batchTimerSecs,
          totalSecs: CONFIG.BATCHING_WINDOW_SECS
        });
      } else {
        // Window expired -> auto-lock cohort
        this.lockCohort('Window Max (6m) reached -> Priority dispatch initiated.');
      }
    }, 1000);
  }

  resetTimer(secs = 360) {
    this.startBatchTimer(secs);
    stateStore.addLog(
      'gate',
      `New batch window initiated. 6-Minute synchronization timer active.`,
      `W_batch = 360s | Belt Tag Scanner: ONLINE`
    );
  }

  lockCohort(reason = 'Optimal 3-Flyer Cohort Assembled') {
    stateStore.state.isBatchRunning = false;
    stateStore.addLog(
      'gate',
      `COHORT LOCKED: ${reason}`,
      `Batch Duration: ${Math.floor((CONFIG.BATCHING_WINDOW_SECS - stateStore.state.batchTimerSecs) / 60)}m ${(CONFIG.BATCHING_WINDOW_SECS - stateStore.state.batchTimerSecs) % 60}s <= 6m 00s SLA`
    );
    stateStore.emit('cohort:locked', { reason });
  }

  onAirportChanged(airportCode) {
    const airport = CONFIG.AIRPORTS[airportCode];
    stateStore.addLog(
      'gate',
      `Switched hub to ${airport.name}. Baggage sensor synced to ${airport.defaultBelt}.`,
      `Pickup Bay: Bay 4A (Pillar 12) | Terminal Gate Sensor active`
    );
    this.startBatchTimer(252);
  }

  simulateBeltScan(riderName, flightNo, bagCount) {
    stateStore.addLog(
      'gate',
      `Belt Scan Detected: ${riderName} [Flight ${flightNo}] cleared exit turnstile with ${bagCount} registered bag(s).`,
      `Sync latency: 140ms | Post-Belt Verification: PASSED`
    );
  }
}

export const gateAgent = new PostBeltGateAgent();
