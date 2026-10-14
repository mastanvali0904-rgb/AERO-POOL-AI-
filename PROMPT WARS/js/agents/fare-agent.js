/**
 * AGENT 4: [Sustainability & Fare Agent]
 * Responsibility: Dynamic Fare Splitting (₹400–₹600 band) & Carbon/Curb Reduction Ledger.
 * Solves the Comfort-Affordability cliff (₹300 bus vs ₹1,300 cab).
 */

import { stateStore } from '../state.js';
import { CONFIG } from '../config.js';

export class SustainabilityFareAgent {
  constructor() {}

  init() {
    stateStore.subscribe('airport:change', (code) => {
      this.calculateEconomicsAndCarbon(code);
    });
  }

  calculateEconomicsAndCarbon(airportCode) {
    const airport = CONFIG.AIRPORTS[airportCode];
    if (!airport) return;

    const soloFare = airport.soloFareInr;
    const poolFare = airport.aeroPoolFareInr;
    const savingsInr = soloFare - poolFare;
    const savingsPercent = Math.round((savingsInr / soloFare) * 100);

    // Carbon Calculations
    // Average ICE / CNG solo cab produces ~140g CO2 per km.
    // 6-Seater EV MPV produces ~35g CO2e per km from grid mix.
    // Displacing 2 solo cabs over ~35 km saves ~8.4 kg CO2e per trip!
    const stemKm = airport.distanceStemKm;
    const co2SavedKg = ((2 * stemKm * 0.14) - (stemKm * 0.035)).toFixed(1);

    stateStore.addLog(
      'fare',
      `Dynamic Pricing Settled: Passenger Fare set at ₹${poolFare} (Solo Cab: ₹${soloFare}). Rider saves ₹${savingsInr} (${savingsPercent}% discount) in executive MPV comfort.`,
      `P_pool = (Base_stem + Detour_cost) / N_riders = ₹${poolFare} in [₹400, ₹600] band`
    );

    stateStore.addLog(
      'fare',
      `Sustainability Ledger: ${co2SavedKg} kg CO2e emissions avoided. 2 solo cabs displaced from airport expressway and arrival curb lanes.`,
      `Delta_CO2 = 2 * (${stemKm}km * 0.14kg) - (${stemKm}km * 0.035kg) = +${co2SavedKg} kg CO2e saved`
    );

    return { soloFare, poolFare, savingsInr, savingsPercent, co2SavedKg };
  }
}

export const fareAgent = new SustainabilityFareAgent();
