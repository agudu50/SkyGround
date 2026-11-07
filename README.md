# SkyGround 🌊🇬🇭

### Dynamic Weather Intelligence & Localized Flood Defense for Greater Accra

**SkyGround** is a decoupled full-stack platform built with a high-polish **React Native (Expo)** client and a dedicated **Node.js / TypeScript Geospatial Backend Server** powered by **Neon Serverless PostgreSQL (PostGIS)**, **Google AI Studio (Gemini Modles)**, and **Khaya AI (Ghana NLP)**.

Designed for flood-vulnerable urban communities in Greater Accra (_Odawna, Adabraka, Alajo, and Glefe_), SkyGround functions as an everyday weather utility while transforming into a high-contrast early warning and crowdsourced ground-truthing defense network before convective storm surges.

---

## 🗂️ Decoupled Project Structure

The codebase is cleanly structured into two independent directories:

- **`client/`**: The complete cross-platform React Native / Expo mobile application.
- **`server/`**: The dedicated Geospatial Backend API server.

```
SkyGround/
├── client/                        # React Native / Expo Mobile App
│   ├── assets/                    # Icons, splash, and bundled audio matrix
│   ├── src/
│   │   ├── types/                 # Shared domain types & declarations
│   │   ├── theme/                 # Design tokens (Midnight Slate, Electric Cyan, etc.)
│   │   ├── constants/             # GeoJSON catchments & offline audio matrix
│   │   ├── services/
│   │   │   ├── apiClient.ts       # Unified HTTP client (server sync + offline fallback)
│   │   │   ├── audioEngine.ts     # expo-av sound player with waveform state
│   │   │   ├── neonPostgis.ts     # Offline-first PostGIS spatial ray-casting cache
│   │   │   ├── telemetry.ts       # Rain accumulation & DRII calculation
│   │   │   ├── gemini.ts          # Structured hydrological AI reasoning
│   │   │   └── khayaAi.ts         # Khaya AI Twi & Ga voice translation
│   │   ├── components/
│   │   │   ├── Header.tsx         # GPS detection, catchment selector, language chips
│   │   │   ├── HeroWeatherCard.tsx# Dribbble glassmorphic card & SVG Soil Saturation gauge
│   │   │   ├── DynamicThreatBanner.tsx # Animated expandable risk banner
│   │   │   ├── AudioAlertCard.tsx # Pulsing waveform, audio player, Twi/Ga/EN chips
│   │   │   ├── HazardLoggerSheet.tsx   # 4 tactile 1-tap hazard buttons (56dp min)
│   │   │   ├── HazardMap.tsx      # Spatial map with polygons, waterlog hatch & pins
│   │   │   └── MunicipalSummaryModal.tsx # NADMO command mode & Assembly Action Brief
│   │   └── screens/
│   │       └── HomeScreen.tsx     # Main application interface
│   ├── App.tsx                    # Root entry point
│   ├── app.json                   # Expo configuration
│   ├── package.json               # Client dependencies
│   ├── tsconfig.json              # Client TypeScript config
│   └── .env.example               # Client environment variables
│
├── server/                        # Geospatial Backend API Server
│   ├── src/
│   │   ├── db/
│   │   │   └── neon.ts            # Neon Serverless Postgres + PostGIS DDL migrations
│   │   ├── constants/
│   │   │   └── catchments.ts      # Accra catchment coordinates & polygon algorithms
│   │   ├── routes/
│   │   │   ├── catchments.ts      # GET /api/catchment/current (ST_Contains)
│   │   │   ├── incidents.ts       # POST /api/incidents, GET /api/incidents/nearby (ST_DWithin)
│   │   │   ├── telemetry.ts       # GET /api/telemetry/:catchmentId
│   │   │   ├── reasoning.ts       # POST /api/reasoning/advisory (Gemini 2.5 Flash)
│   │   │   └── voice.ts           # POST /api/voice/translate & /tts (Khaya AI)
│   │   ├── services/
│   │   │   ├── drii.ts            # Dynamic Runoff & Inundation Index calculation
│   │   │   ├── gemini.ts          # Google AI Studio Gemini structured output synthesis
│   │   │   └── khaya.ts           # Ghana NLP translation & TTS services
│   │   ├── types/
│   │   │   └── index.ts           # Backend types
│   │   └── index.ts               # Express entrypoint, CORS, routes & health check
│   ├── package.json               # Server dependencies
│   ├── tsconfig.json              # Server TypeScript config
│   └── .env.example               # Server environment variables
│
├── package.json                   # Root monorepo workspace scripts
└── README.md                      # Comprehensive documentation
```

---

## 📡 Server REST Endpoints

| Method | Endpoint                                            | Description                                                                                     |
| ------ | --------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| `GET`  | `/health`                                           | Service health status and timestamp                                                             |
| `POST` | `/api/init-db`                                      | Executes PostGIS DDL (`CREATE EXTENSION IF NOT EXISTS postgis`) and seeds catchments            |
| `GET`  | `/api/catchments`                                   | Lists all monitored Greater Accra catchments                                                    |
| `GET`  | `/api/catchment/current?lat=...&lon=...`            | Detects current catchment via PostGIS `ST_Contains`                                             |
| `POST` | `/api/incidents`                                    | Inserts a 1-tap geo-tagged incident (`HIGH_WATER`, `CHOKED_GUTTER`, etc.) via `ST_GeogFromText` |
| `GET`  | `/api/incidents/nearby?lat=...&lon=...&radius=5000` | Queries nearby community reports using PostGIS `ST_DWithin`                                     |
| `POST` | `/api/incidents/:id/upvote`                         | Increments hazard verification score                                                            |
| `GET`  | `/api/telemetry/:catchmentId`                       | Ingests rain accumulation, soil moisture, and calculates DRII                                   |
| `POST` | `/api/reasoning/advisory`                           | Calls Google AI Studio (Gemini 2.5 Flash) for structured community & engineering directives     |
| `POST` | `/api/voice/translate`                              | Translates advisories into Twi (`tw`) and Ga (`gaa`) via Khaya AI                               |
| `POST` | `/api/voice/tts`                                    | Generates speech audio bytes/URL via Khaya TTS                                                  |

---

## 🎨 Mobile UI/UX Highlights (`client/`)

- **Dribbble Polish:** Deep Midnight Slate (`#0B0F17`) with card surfaces (`#151D2A`), high-contrast badges, and rounded corners (`borderRadius: 24`).
- **Radial Circular Soil Gauge:** High-impact SVG gauge visualizing live soil saturation % and waterlogged status.
- **Dynamic Runoff & Inundation Index (DRII):**
  - `LOW`: Rain < 15mm, Soil Saturation < 65%.
  - `AMBER`: Rain 15–30mm OR Soil Saturation > 75%.
  - `CRITICAL`: Rain > 30mm OR (Rain > 20mm AND Soil Saturation > 80%).
  - **Waterlogged Ground**: Flags zones with soil moisture > 85% for 24–48 hours post-storm.
- **Voice Engine:** Khaya AI + offline audio matrix with animated pulsing waveform bars and language chips (`[Twi]`, `[Ga]`, `[English]`).
- **Tactile 1-Tap Hazard Logger:** 4 tactile buttons with haptics (`expo-haptics`) for instant field ground-truthing.
- **Interactive Spatial Map:** Displays catchment risk polygons, translucent blue waterlog hatch layer, and community incident pins.
- **Municipal Command Mode:** Provides District Engineers and NADMO with 3-bullet technical desilting priorities and an **Assembly Action Brief** generator.

---

## 🚀 Quick Start Guide

### 1. Run the Backend Server

```bash
# From workspace root
npm run server

# Or directly from server/
cd server
npm run dev
```

The server will start at `http://localhost:4000` with automatic PostGIS schema initialization.

### 2. Run the Mobile Client (Expo)

```bash
# From workspace root
npm run client

# Or directly from client/
cd client
npx expo start
```

- Press **`a`** for Android Emulator / Expo Go.
- Press **`i`** for iOS Simulator.
- Press **`w`** for Web Browser.

### 3. Verify TypeScript across Monorepo

```bash
npm run typecheck
```

Checks both `client` and `server` TypeScript configs, passing with 0 errors.
