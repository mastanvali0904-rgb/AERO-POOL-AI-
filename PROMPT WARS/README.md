# AERO-POOL AI: Post-Belt Volumetric Micro-Pooling
> **AI for Better Living & Smarter Communities** | Hack2skill & Google for Developers PromptWars Challenge

---

## 🚀 Executive Summary
**AERO-POOL AI** solves the Indian Metropolitan Airport Last-Mile **"Comfort–Affordability Cliff"** (₹300 inconvenient, crowded bus vs. ₹1,300 solo cab) by delivering a **₹400–₹600 executive shared 6-seater EV MPV ride** for 2–3 verified co-flyers using three core AI innovations:

1. **Post-Belt Exit-Gate Trigger ($W_{\text{batch}} \le 6\text{ Min}$)**: Eliminates pre-booking vs. baggage-belt desynchronization by assembling cohorts only after flyers physically clear the baggage carousel.
2. **3D Volumetric Trunk Packing ($V_{\text{total}} \le 500\text{L}$)**: Eliminates the 180L CNG compact sedan boot collision trap through Computer Vision luggage volume estimation, guaranteeing adequate boot cavity in executive 6-seater EV MPVs.
3. **4 km Radial Corridor Clustering ($T_{\text{detour}} < 12\text{ Min SLA}$)**: Eliminates unbounded zig-zag detour fatigue by strictly bounding drop-offs within a 4 km radial envelope along the arterial expressway stem.

---

## 📐 Mathematical Models & Constraints

| Metric | Mathematical Formulation | Operational SLA | Impact |
| :--- | :--- | :--- | :--- |
| **Volumetric Trunk Limit** | $V_{\text{total}} = \sum_{i=1}^N V_i \le 500\text{ Liters}$ | $V \le 500\text{L}$ | Rejects 180L CNG Sedans; prevents passenger-lap luggage hazards |
| **Radial Corridor Cluster** | $R_{\text{cluster}} = \max_{i,j} D(P_i, P_j) \le 4.0\text{ km}$ | $\le 4.0\text{ km}$ | Prevents zig-zag detours across distant city sectors |
| **Detour SLA Threshold** | $\Delta T = T_{\text{pool}} - T_{\text{direct}} < 12.0\text{ mins}$ | $< 12.0\text{ mins}$ | Preserves airline flyer executive time and comfort |
| **Post-Belt Batch Window** | $W_{\text{batch}} \le 6.0\text{ mins}$ ($360\text{ seconds}$) | $\le 6\text{ mins}$ | Prevents curb waiting; syncs co-flyers exiting carousel gates |
| **Carbon Avoidance** | $\Delta \text{CO}_2 = 2 \cdot (D_{\text{stem}} \cdot 0.14) - (D_{\text{stem}} \cdot 0.035)$ | $\sim 8.4\text{ kg CO}_2\text{e}$ | Eliminates 2 solo ICE/CNG return trips per 3-flyer pool |

---

## 🏆 Competitor Benchmark Matrix

| Feature / Metric | Solo App Cab (Uber / Ola) | Airport Bus (BMTC / Vayu Vajra) | Inter-City Shuttle (QuickRide) | **AERO-POOL AI** |
| :--- | :--- | :--- | :--- | :--- |
| **Average Fare (35 km)** | ₹1,200 – ₹1,500 | ₹250 – ₹350 | ₹700 – ₹900 | **₹420 – ₹520 (64% Saved)** |
| **Baggage Guarantee** | 180L (Fails with 2 check-ins) | Open rack (theft risk) | Limited rear boot | **500L Guaranteed 3D CV** |
| **Detour Duration** | 0 mins (Direct) | +45 to +75 mins | +25 to +40 mins | **< 12 mins SLA** |
| **Vehicle Class** | CNG Sedan / Hatchback | Heavy Diesel Bus | Van / Force Traveller | **6-Seater Executive EV MPV** |
| **Batching Trigger** | Solo instant dispatch | 30–60 min timetable | Pre-booked flight schedule | **Post-Belt 6-Min Window** |
| **Fleet Carbon** | 4.9 kg CO₂e / flyer | 1.2 kg CO₂e / flyer | 2.8 kg CO₂e / flyer | **0.8 kg CO₂e (EV Fleet)** |

---

## 🛠️ Key Interactive Modules

### 1. Dual-Mode View Switcher & Airport Presets
- **Passenger Exit-Gate Kiosk & Mobile App View**: Flight ticket badge (IndiGo 6E-2415), radial 6-minute batch countdown timer, verified co-flyers list, assigned EV MPV card, pickup bay (Bay 4A / Pillar 12), and gate QR pass.
- **Airport AI Dispatch & Volumetric Command View**: Live KPI dashboard (428 flyers pooled, 4m 12s avg batch, 7.4m avg detour, 64 CNG sedans rejected, 1,840 kg CO₂ saved, -48% curb congestion) and active cohort dispatch table.
- **1-Click Airport Presets**:
  - `BLR` (Bengaluru Kempegowda Intl)
  - `HYD` (Hyderabad Rajiv Gandhi Intl)
  - `BOM` (Mumbai Chhatrapati Shivaji Maharaj Intl)
  - `DEL` (Delhi Indira Gandhi Intl T3)

### 2. 1-Click Live Scenario Simulator Bar
- `🧳 Heavy Luggage Trio`: 460L luggage trio triggers CNG sedan rejection warning and auto-upgrades to 6-seater EV MPV.
- `⚡ Post-Belt Fast Batch`: 3 flyers clear Belt 4 in under 2 minutes; matched into a 3.2 km HSR Layout cluster in 4m 12s.
- `🛡️ Late Night Women-Only Verified Pool`: Priority safe corridor routing via CCTV-monitored expressways with verified female drivers.
- `🚫 Trunk Overflow Guardrail`: 540L baggage exceeds 500L cap; system auto-splits into two optimized vehicle dispatches.

### 3. Interactive 3D/SVG Volumetric Trunk Visualizer (Centerpiece #1)
- Side-by-side comparison of **180L CNG Compact Sedan** (with 60L gas tank and red lid collision hazard) vs. **500L 6-Seater MPV** (with isometric color-coded luggage blocks).
- Interactive controls: `+ Cabin Trolley (40L)`, `+ Medium Check-In (75L)`, `+ Large Check-In (115L)`, and `📷 AI Camera Trolley Scan`.

### 4. 4 km Radial Cluster & Detour SLA Map (Centerpiece #2)
- Real-time HTML5 Canvas map rendering highway express stem, 4.0 km radial drop-off boundary, rider destination pins, and detour lines.
- Floating metric badges comparing Solo Cab (₹1,350) vs. Aero-Pool (₹480 | 64% saved) and Detour Time (+7.8m | <12m SLA).

### 5. Visible Multi-Agent Reasoning Log
- Streaming live output from 4 specialized agents:
  - `[Post-Belt Gate Agent]`: Turnstile QR scan sync and 6-minute window management.
  - `[Vision Volumetric Agent]`: 3D bounding-box volume calculations ($V_{\text{total}} \le 500\text{L}$) and CNG sedan rejection.
  - `[Geospatial Cluster Agent]`: Solves 4 km radial envelope and <12 min detour SLA.
  - `[Sustainability & Fare Agent]`: Splits ₹400–₹600 fare band and logs carbon/curb impact.

### 6. Zero-Crash Hybrid AI (Gemini 2.5 Flash + Deterministic Fallback)
- Connect Google Gemini API (`gemini-2.5-flash`) via the API Key settings modal for live luggage Computer Vision estimation.
- 100% backed by a deterministic simulation engine so every feature runs flawlessly out-of-the-box for judges with zero configuration required.

---

## ⚙️ Running Locally

Because the project is built with standard HTML5, CSS3, and ES6 modules without heavy binary assets, it starts instantly:

### Option A: Python Built-In Server (Recommended)
```bash
python -m http.server 3000
```
Open [http://localhost:3000](http://localhost:3000) in any browser.

### Option B: Direct Browser Launch
Double click `index.html` or open directly in Chrome/Edge/Firefox.

---

## 📜 Strict Competition Compliance
- **Repo Size Under 1 MB**: Zero heavy `.png`, `.jpg`, `.mp4` binaries; uses pure vector SVG, CSS 3D transforms, HTML5 Canvas, and mathematical geometry.
- **Single Branch (`main`)**: All development maintained strictly on the default `main` branch.
- **Zero-Crash Hybrid AI**: Instant deterministic simulation fallback ensures 100% judge testability without requiring external API keys.
