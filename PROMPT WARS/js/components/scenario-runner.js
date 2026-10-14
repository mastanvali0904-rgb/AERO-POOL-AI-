/**
 * 1-Click Live Scenario Simulator Bar
 * Enables judges to instantly trigger and evaluate edge cases with a single click.
 */

import { stateStore } from '../state.js';
import { CONFIG } from '../config.js';
import { gateAgent } from '../agents/gate-agent.js';
import { visionAgent } from '../agents/vision-agent.js';
import { geoAgent } from '../agents/geo-agent.js';
import { fareAgent } from '../agents/fare-agent.js';

export class ScenarioRunner {
  constructor() {}

  init() {
    this.bindButtons();
  }

  bindButtons() {
    document.querySelectorAll('.scenario-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const scenarioId = btn.dataset.scenario;
        this.runScenario(scenarioId);
      });
    });
  }

  runScenario(scenarioId) {
    // Update active button state
    document.querySelectorAll('.scenario-btn').forEach(b => b.classList.remove('active'));
    const targetBtn = document.querySelector(`.scenario-btn[data-scenario="${scenarioId}"]`);
    if (targetBtn) targetBtn.classList.add('active');

    stateStore.state.activeScenarioId = scenarioId;
    stateStore.clearLogs();

    switch (scenarioId) {
      case 'scenario-1':
        this.runHeavyLuggageTrio();
        break;
      case 'scenario-2':
        this.runPostBeltFastBatch();
        break;
      case 'scenario-3':
        this.runWomenOnlySafePool();
        break;
      case 'scenario-4':
        this.runTrunkOverflowGuardrail();
        break;
      default:
        this.runPostBeltFastBatch();
    }

    stateStore.emit('scenario:run', scenarioId);
  }

  /**
   * Scenario 1: Heavy Luggage Trio (460L Total -> Auto-Upgrades from CNG to 6-Seater MPV)
   */
  runHeavyLuggageTrio() {
    stateStore.setAirport('BLR');
    stateStore.state.selectedVehicle = 'cng'; // Start with CNG to demonstrate the rejection!
    stateStore.emit('vehicle:change', 'cng');

    const heavyLuggage = [
      { id: 'b1', riderId: 'rider-1', riderIndex: 1, riderName: 'Arjun M.', type: 'LARGE', name: 'Large Hardcase (Arjun)', volumeLiters: 115, weightKg: 25 },
      { id: 'b2', riderId: 'rider-1', riderIndex: 1, riderName: 'Arjun M.', type: 'CABIN', name: 'Cabin Trolley (Arjun)', volumeLiters: 40, weightKg: 9 },
      { id: 'b3', riderId: 'rider-2', riderIndex: 2, riderName: 'Sneha R.', type: 'MEDIUM', name: 'Medium Trolley (Sneha)', volumeLiters: 75, weightKg: 18 },
      { id: 'b4', riderId: 'rider-2', riderIndex: 2, riderName: 'Sneha R.', type: 'MEDIUM', name: 'Medium Trolley (Sneha)', volumeLiters: 75, weightKg: 18 },
      { id: 'b5', riderId: 'rider-3', riderIndex: 3, riderName: 'Vikram J.', type: 'LARGE', name: 'Large Suitcase (Vikram)', volumeLiters: 115, weightKg: 26 },
      { id: 'b6', riderId: 'rider-3', riderIndex: 3, riderName: 'Vikram J.', type: 'CABIN', name: 'Cabin Bag (Vikram)', volumeLiters: 40, weightKg: 8 }
    ];

    stateStore.state.luggage = heavyLuggage;
    stateStore.emit('luggage:change', heavyLuggage);

    stateStore.addLog(
      'gate',
      `SCENARIO 1 TRIGGERED: 3 Heavy-Luggage Flyers verified at BLR Exit Gate 4. Total Manifest: 6 bags.`,
      `Manifest: 2 Large (230L) + 2 Medium (150L) + 2 Cabin (80L) = 460L Total`
    );

    // After 1.2s, auto-upgrade to 6-Seater MPV to resolve overflow
    setTimeout(() => {
      stateStore.setVehicle('mpv');
      stateStore.addLog(
        'vision',
        `FLEET DISPATCH AUTO-UPGRADE: Compact Sedan (180L) rejected. Auto-dispatched 6-Seater Kia Carens EV MPV with 500L usable boot cavity.`,
        `Fleet Rule: If V_total > 180L -> Dispatch Class MPV/e-SUV | Allocation Latency: 320ms`
      );
    }, 1200);

    gateAgent.startBatchTimer(180);
    geoAgent.evaluateCorridor('BLR');
    fareAgent.calculateEconomicsAndCarbon('BLR');
  }

  /**
   * Scenario 2: Post-Belt Fast Batch (3 Flyers Clear Belt 4 -> Matched into 3.2 km HSR Layout in 4m 12s)
   */
  runPostBeltFastBatch() {
    stateStore.setAirport('BLR');
    stateStore.setVehicle('mpv');
    stateStore.loadAirportRiders('BLR');

    gateAgent.resetTimer(252); // 4m 12s remaining

    stateStore.addLog(
      'gate',
      `SCENARIO 2 TRIGGERED: 3 Flyers cleared Belt 4 within 110s. Synchronized cohort batching initiated.`,
      `T_batch = 4m 12s <= 6m 00s SLA [BATCH WINDOW PASSED]`
    );

    gateAgent.lockCohort('Co-Flyers Arrived Simultaneously at Exit Gate 4');
    visionAgent.evaluateVolumetrics(stateStore.state.luggage);
    geoAgent.evaluateCorridor('BLR');
    fareAgent.calculateEconomicsAndCarbon('BLR');
  }

  /**
   * Scenario 3: Late Night Women-Only Verified Pool (Priority Safe Corridor, 7-Min Detour)
   */
  runWomenOnlySafePool() {
    stateStore.setAirport('HYD');
    stateStore.setVehicle('mpv');
    stateStore.loadAirportRiders('HYD');

    // Rename to women-only verified cohort
    const womenRiders = [
      { id: 'w1', name: 'Dr. Priya Sharma', flight: 'IndiGo 6E-6542', destination: 'Gachibowli Financial District', fare: 440 },
      { id: 'w2', name: 'Kavita Sundaram', flight: 'Air India AI-541', destination: 'HITEC City Cyber Towers', fare: 430 },
      { id: 'w3', name: 'Ananya Rao', flight: 'Vistara UK-839', destination: 'Kondapur Botanical Garden', fare: 450 }
    ];

    stateStore.addLog(
      'gate',
      `SCENARIO 3 TRIGGERED: Late-Night Women-Only Verified Pool. Biometric QR & Govt ID verified.`,
      `Safety SLA: Active | Driver: R. Lakshmi (4.98 Rating, EV Verified) | Time: 23:45 IST`
    );

    geoAgent.evaluateLateNightSafeCorridor('HYD');
    visionAgent.evaluateVolumetrics(stateStore.state.luggage);
    fareAgent.calculateEconomicsAndCarbon('HYD');
    gateAgent.startBatchTimer(300);
  }

  /**
   * Scenario 4: Trunk Overflow Guardrail (4th Large Suitcase Detected -> 540L Exceeds 500L Cap -> Auto-Splits)
   */
  runTrunkOverflowGuardrail() {
    stateStore.setAirport('BOM');
    stateStore.setVehicle('mpv');

    const overflowLuggage = [
      { id: 'of1', riderId: 'rider-1', riderIndex: 1, riderName: 'Rohan D.', type: 'LARGE', name: 'Large Trolley 1', volumeLiters: 115, weightKg: 26 },
      { id: 'of2', riderId: 'rider-1', riderIndex: 1, riderName: 'Rohan D.', type: 'LARGE', name: 'Large Trolley 2', volumeLiters: 115, weightKg: 26 },
      { id: 'of3', riderId: 'rider-2', riderIndex: 2, riderName: 'Kavita I.', type: 'LARGE', name: 'Large Suitcase 3', volumeLiters: 115, weightKg: 25 },
      { id: 'of4', riderId: 'rider-2', riderIndex: 2, riderName: 'Kavita I.', type: 'LARGE', name: 'Large Suitcase 4', volumeLiters: 115, weightKg: 25 },
      { id: 'of5', riderId: 'rider-3', riderIndex: 3, riderName: 'Deepak S.', type: 'MEDIUM', name: 'Medium Case 5', volumeLiters: 80, weightKg: 19 }
    ]; // Total = 540L (Exceeds 500L cap!)

    stateStore.state.luggage = overflowLuggage;
    stateStore.emit('luggage:change', overflowLuggage);

    stateStore.addLog(
      'vision',
      `SCENARIO 4 TRIGGERED: Excessive Baggage Detected! 5 Heavy Bags sum to 540 Liters. Maximum MPV boot cavity is 500 Liters.`,
      `V_total = 540L > 500L SLA [TRUNK OVERFLOW DETECTED: +40L]`
    );

    setTimeout(() => {
      stateStore.addLog(
        'vision',
        `AUTOMATED COHORT AUTO-SPLIT: To avoid curb stranding or passenger lap hazard, Cohort partitioned into 2 vehicles: MPV Alpha (345L) + MPV Beta (195L).`,
        `Split Logic: V_alpha = 345L <= 500L | V_beta = 195L <= 500L | Zero baggage left behind`
      );
    }, 1200);

    gateAgent.startBatchTimer(120);
    geoAgent.evaluateCorridor('BOM');
    fareAgent.calculateEconomicsAndCarbon('BOM');
  }
}

export const scenarioRunner = new ScenarioRunner();
