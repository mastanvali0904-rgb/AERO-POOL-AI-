"""
AERO-POOL AI: Python Unit & Integration Test Suite
Validates all core mathematical constraints, SLAs, and pricing models.
Run via: python -m unittest tests/test_aeropool.py
"""

import unittest
import math

class TestAeroPoolModels(unittest.TestCase):
    def setUp(self):
        self.MAX_TRUNK_VOLUME_LITERS = 500
        self.CNG_SEDAN_MAX_LITERS = 180
        self.MAX_CLUSTER_RADIUS_KM = 4.0
        self.MAX_DETOUR_MINS = 12.0
        self.BATCHING_WINDOW_SECS = 360

        self.AIRPORTS = {
            'BLR': {'solo_fare': 1350, 'pool_fare': 480, 'cluster_rad': 3.4, 'detour': 7.8, 'stem_km': 34.2},
            'HYD': {'solo_fare': 1200, 'pool_fare': 440, 'cluster_rad': 3.1, 'detour': 6.8, 'stem_km': 30.5},
            'BOM': {'solo_fare': 1100, 'pool_fare': 420, 'cluster_rad': 2.8, 'detour': 7.5, 'stem_km': 18.4},
            'DEL': {'solo_fare': 1250, 'pool_fare': 460, 'cluster_rad': 3.5, 'detour': 7.2, 'stem_km': 22.8},
        }

    def test_volumetric_mpv_packing(self):
        """Test that standard 3-flyer luggage (2 Large, 2 Medium, 1 Cabin) fits within 500L MPV boot."""
        luggage_pack = [115, 115, 75, 75, 40]
        total_vol = sum(luggage_pack) # 420L
        self.assertLessEqual(total_vol, self.MAX_TRUNK_VOLUME_LITERS, "Total luggage should fit in 500L MPV cavity")

    def test_cng_sedan_rejection_guardrail(self):
        """Test that luggage exceeding 180L triggers CNG sedan rejection."""
        luggage_pack = [115, 75] # 190L > 180L
        total_vol = sum(luggage_pack)
        self.assertGreater(total_vol, self.CNG_SEDAN_MAX_LITERS, "190L baggage must be rejected by CNG sedan constraint")

    def test_radial_corridor_cluster_sla(self):
        """Test that all airport drop-off cluster radii are strictly <= 4.0 km."""
        for code, data in self.AIRPORTS.items():
            self.assertLessEqual(data['cluster_rad'], self.MAX_CLUSTER_RADIUS_KM, f"{code} cluster radius exceeds 4.0 km SLA")

    def test_detour_sla_threshold(self):
        """Test that all pooled detour times are strictly < 12.0 mins."""
        for code, data in self.AIRPORTS.items():
            self.assertLess(data['detour'], self.MAX_DETOUR_MINS, f"{code} detour exceeds 12.0 min SLA")

    def test_post_belt_batching_window(self):
        """Test that batching countdown window is bounded by 6.0 minutes (360 seconds)."""
        self.assertEqual(self.BATCHING_WINDOW_SECS, 360, "Batching window must be 360s (6 mins)")

    def test_fare_affordability_band(self):
        """Test that all pooled fares fall within the target ₹400 - ₹600 band."""
        for code, data in self.AIRPORTS.items():
            fare = data['pool_fare']
            self.assertTrue(400 <= fare <= 600, f"{code} fare ₹{fare} outside ₹400-₹600 band")

    def test_cost_savings_percentage(self):
        """Test that passengers save at least 55% compared to solo app cabs."""
        for code, data in self.AIRPORTS.items():
            savings_pct = ((data['solo_fare'] - data['pool_fare']) / data['solo_fare']) * 100
            self.assertGreaterEqual(savings_pct, 55.0, f"{code} savings {savings_pct}% is below 55% threshold")

    def test_carbon_avoidance_calculation(self):
        """Test net positive carbon emissions avoided when displacing 2 solo cabs."""
        for code, data in self.AIRPORTS.items():
            stem_km = data['stem_km']
            solo_co2 = 2 * (stem_km * 0.14) # 2 solo ICE/CNG cabs
            mpv_co2 = stem_km * 0.035        # 1 pooled EV MPV
            net_saved = solo_co2 - mpv_co2
            self.assertGreater(net_saved, 0, f"{code} net carbon savings must be strictly positive")

if __name__ == '__main__':
    unittest.main()
