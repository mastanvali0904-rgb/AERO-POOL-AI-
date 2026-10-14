/**
 * AERO-POOL AI: Configuration & Airport Presets
 * Math Constraints:
 * V_total <= 500L (rejects 180L CNG compact sedans)
 * R_cluster <= 4.0 km (maximum radial span for drop-offs)
 * T_detour < 12.0 mins (maximum additional detour SLA)
 * W_batch <= 6.0 mins (maximum batching countdown post baggage-belt exit)
 */

export const CONFIG = {
  VERSION: '2.5.0-PROD',
  MAX_TRUNK_VOLUME_LITERS: 500, // 6-Seater MPV usable boot
  CNG_SEDAN_MAX_LITERS: 180,    // Standard Dzire/Etios with 60L cylinder
  MAX_CLUSTER_RADIUS_KM: 4.0,   // 4 km radial drop-off constraint
  MAX_DETOUR_MINS: 12.0,        // Detour SLA threshold
  BATCHING_WINDOW_SECS: 360,    // 6-Minute post-belt batching window

  LUGGAGE_PRESETS: {
    CABIN: {
      id: 'cabin',
      name: 'Cabin Trolley',
      volumeLiters: 40,
      dimensions: { l: 55, w: 35, h: 23 }, // cm
      weightKg: 8.5
    },
    MEDIUM: {
      id: 'medium',
      name: 'Medium Check-In',
      volumeLiters: 75,
      dimensions: { l: 68, w: 45, h: 28 }, // cm
      weightKg: 18.0
    },
    LARGE: {
      id: 'large',
      name: 'Large Check-In',
      volumeLiters: 115,
      dimensions: { l: 78, w: 52, h: 32 }, // cm
      weightKg: 25.5
    },
    OVERSIZED: {
      id: 'oversized',
      name: 'Oversized Cargo / Extra Large',
      volumeLiters: 140,
      dimensions: { l: 85, w: 56, h: 35 }, // cm
      weightKg: 32.0
    }
  },

  AIRPORTS: {
    BLR: {
      code: 'BLR',
      city: 'Bengaluru',
      name: 'Kempegowda Intl Airport (BLR T2)',
      highwayStem: 'NH 44 / Bellary Rd -> Hebbal Flyover -> Outer Ring Road',
      distanceStemKm: 34.2,
      directTimeMins: 44,
      soloFareInr: 1350,
      aeroPoolFareInr: 480,
      corridorClusterName: 'HSR - Koramangala - Bellandur Tech Arc',
      clusterRadiusKm: 3.4,
      detourMins: 7.8,
      defaultBelt: 'Belt 04 (Domestic Arrivals)',
      riders: [
        {
          id: 'rider-1',
          name: 'Arjun Mehta',
          flight: 'IndiGo 6E-2415 (DEL-BLR)',
          destination: 'Koramangala 4th Block',
          bags: [{ type: 'LARGE', volumeLiters: 115 }, { type: 'CABIN', volumeLiters: 40 }],
          coord: { x: 0.62, y: 0.72 },
          fare: 480
        },
        {
          id: 'rider-2',
          name: 'Sneha Reddy',
          flight: 'Air India AI-508 (BOM-BLR)',
          destination: 'HSR Layout Sector 2',
          bags: [{ type: 'MEDIUM', volumeLiters: 75 }, { type: 'MEDIUM', volumeLiters: 75 }],
          coord: { x: 0.68, y: 0.78 },
          fare: 490
        },
        {
          id: 'rider-3',
          name: 'Vikram Joshi',
          flight: 'Akasa Air QP-1382 (HYD-BLR)',
          destination: 'Bellandur Green Glen Layout',
          bags: [{ type: 'LARGE', volumeLiters: 115 }, { type: 'CABIN', volumeLiters: 40 }],
          coord: { x: 0.74, y: 0.70 },
          fare: 470
        }
      ]
    },

    HYD: {
      code: 'HYD',
      city: 'Hyderabad',
      name: 'Rajiv Gandhi Intl Airport (HYD)',
      highwayStem: 'PVNR Elevated Expressway -> Outer Ring Road',
      distanceStemKm: 30.5,
      directTimeMins: 40,
      soloFareInr: 1200,
      aeroPoolFareInr: 440,
      corridorClusterName: 'Gachibowli - HITEC City Cyber Arc',
      clusterRadiusKm: 3.1,
      detourMins: 6.8,
      defaultBelt: 'Belt 02 (Terminal 1)',
      riders: [
        {
          id: 'rider-1',
          name: 'Pooja Sharma',
          flight: 'IndiGo 6E-6542 (BLR-HYD)',
          destination: 'Gachibowli Financial District',
          bags: [{ type: 'LARGE', volumeLiters: 115 }, { type: 'CABIN', volumeLiters: 40 }],
          coord: { x: 0.58, y: 0.68 },
          fare: 440
        },
        {
          id: 'rider-2',
          name: 'Rahul Varma',
          flight: 'Vistara UK-839 (DEL-HYD)',
          destination: 'HITEC City Phase 2',
          bags: [{ type: 'MEDIUM', volumeLiters: 75 }],
          coord: { x: 0.64, y: 0.64 },
          fare: 430
        },
        {
          id: 'rider-3',
          name: 'Ananya Rao',
          flight: 'Air India AI-541 (BOM-HYD)',
          destination: 'Kondapur Botanical Garden Rd',
          bags: [{ type: 'MEDIUM', volumeLiters: 75 }, { type: 'CABIN', volumeLiters: 40 }],
          coord: { x: 0.69, y: 0.60 },
          fare: 450
        }
      ]
    },

    BOM: {
      code: 'BOM',
      city: 'Mumbai',
      name: 'Chhatrapati Shivaji Maharaj Intl (BOM T2)',
      highwayStem: 'Western Express Highway -> BKC Connector',
      distanceStemKm: 18.4,
      directTimeMins: 45,
      soloFareInr: 1100,
      aeroPoolFareInr: 420,
      corridorClusterName: 'BKC - Lower Parel Corporate Arc',
      clusterRadiusKm: 2.8,
      detourMins: 7.5,
      defaultBelt: 'Belt 06 (Arrivals Pier C)',
      riders: [
        {
          id: 'rider-1',
          name: 'Rohan Deshmukh',
          flight: 'IndiGo 6E-5301 (DEL-BOM)',
          destination: 'Bandra Kurla Complex (BKC G Block)',
          bags: [{ type: 'LARGE', volumeLiters: 115 }, { type: 'CABIN', volumeLiters: 40 }],
          coord: { x: 0.52, y: 0.62 },
          fare: 420
        },
        {
          id: 'rider-2',
          name: 'Kavita Iyer',
          flight: 'Air India AI-671 (BLR-BOM)',
          destination: 'Lower Parel Senapati Bapat Marg',
          bags: [{ type: 'MEDIUM', volumeLiters: 75 }, { type: 'CABIN', volumeLiters: 40 }],
          coord: { x: 0.48, y: 0.76 },
          fare: 440
        },
        {
          id: 'rider-3',
          name: 'Deepak Shah',
          flight: 'SpiceJet SG-441 (CCU-BOM)',
          destination: 'Prabhadevi Century Bazaar',
          bags: [{ type: 'MEDIUM', volumeLiters: 75 }],
          coord: { x: 0.45, y: 0.82 },
          fare: 410
        }
      ]
    },

    DEL: {
      code: 'DEL',
      city: 'Delhi NCR',
      name: 'Indira Gandhi Intl Airport (DEL T3)',
      highwayStem: 'Delhi-Gurgaon Expressway -> NH 48',
      distanceStemKm: 22.8,
      directTimeMins: 42,
      soloFareInr: 1250,
      aeroPoolFareInr: 460,
      corridorClusterName: 'Gurgaon CyberHub - Golf Course Corridor',
      clusterRadiusKm: 3.5,
      detourMins: 7.2,
      defaultBelt: 'Belt 08 (T3 Domestic Gate 4)',
      riders: [
        {
          id: 'rider-1',
          name: 'Siddharth Kapoor',
          flight: 'Vistara UK-812 (BOM-DEL)',
          destination: 'DLF CyberCity CyberHub',
          bags: [{ type: 'LARGE', volumeLiters: 115 }, { type: 'CABIN', volumeLiters: 40 }],
          coord: { x: 0.60, y: 0.75 },
          fare: 460
        },
        {
          id: 'rider-2',
          name: 'Meera Nair',
          flight: 'IndiGo 6E-204 (BLR-DEL)',
          destination: 'Golf Course Road Sector 54',
          bags: [{ type: 'LARGE', volumeLiters: 115 }],
          coord: { x: 0.66, y: 0.82 },
          fare: 470
        },
        {
          id: 'rider-3',
          name: 'Aditya Bansal',
          flight: 'Air India AI-402 (HYD-DEL)',
          destination: 'Sohna Road Subhash Chowk',
          bags: [{ type: 'MEDIUM', volumeLiters: 75 }, { type: 'CABIN', volumeLiters: 40 }],
          coord: { x: 0.54, y: 0.86 },
          fare: 450
        }
      ]
    }
  }
};
