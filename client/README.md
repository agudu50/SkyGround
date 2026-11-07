# SkyGround 🌊🇬🇭
### Dynamic Weather Intelligence & Localized Flood Defense for Greater Accra

**SkyGround** is a cross-platform mobile application built with **React Native (Expo)**, **PostGIS**, **Google Gemini 2.5 Flash**, and **Khaya AI**. It functions as an everyday sleek weather app while dynamically transforming into a high-contrast early warning and crowdsourced ground-truthing platform before convective storms hit vulnerable urban basins across Greater Accra (Odawna, Adabraka, Alajo, and Glefe).

---

## 🎨 Mobile Design System (Dribbble-Grade Polish)
- **Theme & Surface**: Deep Midnight Slate (`#0B0F17`) with card surfaces at `#151D2A` and `#1D2738`.
- **Contrast Accents**: Electric Cyan (`#06B6D4`), Amber Flood Watch (`#F59E0B`), Crimson Emergency (`#EF4444`), Waterlog Blue (`#3B82F6`), Emerald Verified (`#10B981`).
- **Glassmorphism**: Subtle borders (`rgba(255, 255, 255, 0.08)`), rounded corners (`borderRadius: 24`), and layered elevation.
- **Animations & Micro-interactions**: `react-native-reanimated` for expandable threat banners and live audio waveform pulsing.
- **Accessibility**: Minimum 56dp touch targets, high-contrast badges, single-tap audio playback with haptic feedback (`expo-haptics`).

---

## 🏗️ Architecture & Core Components

```
skyground/
├── src/
│   ├── types/
│   │   ├── index.ts               # Catchment, Telemetry, Incident, GeminiAdvisory types
│   │   └── declarations.d.ts      # TypeScript declarations
│   ├── theme/
│   │   └── colors.ts              # Design tokens, color palette, and UI metrics
│   ├── constants/
│   │   ├── catchments.ts          # Odawna, Adabraka, Alajo, Glefe GeoJSON boundaries
│   │   └── audioMatrix.ts         # Pre-recorded audio matrix & scripts (Twi, Ga, English)
│   ├── services/
│   │   ├── neonPostgis.ts         # Neon Serverless Postgres + PostGIS spatial queries
│   │   ├── telemetry.ts           # Atmospheric + Soil Moisture + DRII Engine
│   │   ├── gemini.ts              # Google AI Studio (Gemini 2.5 Flash) structured JSON
│   │   ├── khayaAi.ts             # Khaya AI (Ghana NLP) translate & TTS with fallback
│   │   └── audioEngine.ts         # expo-av sound player with waveform state & haptics
│   ├── components/
│   │   ├── Header.tsx             # GPS detection, catchment selector, language switch
│   │   ├── HeroWeatherCard.tsx    # Temp, rain timeline & radial Soil Saturation gauge
│   │   ├── DynamicThreatBanner.tsx# Smooth animated alert banner & safety steps
│   │   ├── AudioAlertCard.tsx     # Pulsing waveform, audio player, Twi/Ga/EN chips
│   │   ├── HazardLoggerSheet.tsx  # 4 large tactile 1-tap hazard buttons (56dp min)
│   │   ├── HazardMap.tsx          # Spatial map with polygons, waterlog hatch & pins
│   │   └── MunicipalSummaryModal.tsx # NADMO command mode & Assembly Action Brief
│   └── screens/
│       └── HomeScreen.tsx         # Main interactive application screen
├── assets/
│   └── audio/                     # Bundled audio matrix assets
└── App.tsx                        # Root entry point
```

---

## 🌊 Phase-by-Phase Highlights

### Phase 1: Database & Geospatial Backend (Neon + PostGIS)
- **Schema DDL**:
  - `catchments`: Polygon geometry (`GEOMETRY(Polygon, 4326)`), base elevation, drainage outfall, and waterlog flag.
  - `telemetry_readings`: Rain rate (mm/h), 24h accumulation, soil moisture %, NDVI, DRII score, and threat level.
  - `community_incidents`: Point geography (`GEOGRAPHY(Point, 4326)`), hazard types, neighborhood, and verification status.
- **PostGIS Spatial Queries**:
  - `ST_Contains(boundary, ST_SetSRID(ST_Point(lon, lat), 4326))` for real-time catchment detection.
  - `ST_DWithin(coordinates, ST_GeogFromText(point), radius)` for nearby community incident lookups.
  - Local in-memory ray-casting and caching for offline resilience.

### Phase 2: Telemetry Ingestion & DRII Engine
- **Dynamic Runoff & Inundation Index (DRII)**:
  - `LOW`: Rain < 15mm, Soil Saturation < 65%.
  - `AMBER`: Rain 15–30mm OR Soil Saturation > 75%.
  - `CRITICAL`: Rain > 30mm OR (Rain > 20mm AND Soil Saturation > 80%).
  - **Waterlogged Ground**: Zone flagged when soil saturation remains > 85% for 24–48 hours post-storm.
- **Gemini 2.5 Flash Synthesis**: Calls Google AI Studio via structured JSON schema, generating conversational safety directives for residents and a 3-bullet technical action plan for municipal engineers.

### Phase 3: Voice & Local Language Engine (Khaya AI + expo-av)
- **Local Languages**: Plain English warnings translated into **Twi (`tw`)** and **Ga (`gaa`)** via Khaya AI REST API (`/v2/translate`, `/v2/tts`).
- **Offline Audio Matrix Fallback**: Bundled local scripts and fallback audio matrix when offline or rate-limited.
- **AudioAlertCard**: Features animated waveform bars, play/pause controls, and instant language chips (`[Twi]`, `[Ga]`, `[English]`).

### Phase 4: Mobile UI & Everyday Weather Surface
- **Header**: GPS detection, live connection badge, quick catchment switcher, and Citizen vs. NADMO mode toggle.
- **Hero Weather Card**: Condition icon, hourly rain forecast, and radial circular progress gauge for Soil Saturation %.
- **Dynamic Threat Banner**: Smooth expansion with Reanimated when threat reaches AMBER or CRITICAL.
- **1-Tap Hazard Logger**: 4 tactile buttons with high-contrast icons for Water Rising, Choked Gutter, Impassable Bridge, and Waterlogged Mud.

### Phase 5: Interactive Hazard Map & Municipal View
- **Spatial Map**:
  - Catchment polygons colored by risk level (Green / Amber / Red).
  - Blue translucent hatch overlay for persistent waterlogged areas (>85% saturation).
  - Nearby incident pins with community verification indicators.
- **Municipal Command Mode**:
  - Aggregates choked gutters, active inundations, and desilting priority zones.
  - "Generate Assembly Action Brief" button that compiles and shares emergency action briefs for District Engineers and NADMO.

---

## 🚀 Getting Started

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables** (Optional):
   Copy `.env.example` to `.env` and add your API keys:
   ```bash
   cp .env.example .env
   ```

3. **Start the Development Server**:
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on Target Device**:
   - Press `a` for Android Emulator or Expo Go
   - Press `i` for iOS Simulator
   - Press `w` for Web

