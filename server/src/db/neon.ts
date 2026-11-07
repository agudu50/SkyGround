import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import { ACCRA_CATCHMENTS } from '../constants/catchments';
import { Catchment, CommunityIncident, HazardType, TelemetryReading } from '../types';

dotenv.config();

const NEON_CONNECTION_STRING = process.env.NEON_DATABASE_URL || process.env.EXPO_PUBLIC_NEON_DATABASE_URL || '';

export let sqlClient: NeonQueryFunction<false, false> | null = null;

if (NEON_CONNECTION_STRING) {
  try {
    sqlClient = neon(NEON_CONNECTION_STRING);
    console.log('[SkyGround Server] Neon client initialized.');
  } catch (err) {
    console.warn('[SkyGround Server] Neon initialization deferred:', err);
  }
}

export const POSTGIS_INIT_SQL = `
-- 1. Enable PostGIS Extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Catchments Table with Geometry Polygon
CREATE TABLE IF NOT EXISTS catchments (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    district VARCHAR(128) NOT NULL,
    boundary GEOMETRY(Polygon, 4326) NOT NULL,
    base_elevation_m NUMERIC(5, 2) NOT NULL,
    is_waterlog_prone BOOLEAN DEFAULT FALSE,
    drainage_outfall VARCHAR(256),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_catchments_boundary ON catchments USING GIST(boundary);

-- 3. Telemetry Readings Table
CREATE TABLE IF NOT EXISTS telemetry_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    catchment_id VARCHAR(64) REFERENCES catchments(id),
    rain_rate_mmh NUMERIC(6, 2) NOT NULL,
    rain_accum_24h_mm NUMERIC(6, 2) NOT NULL,
    soil_moisture_pct NUMERIC(5, 2) NOT NULL,
    ndvi NUMERIC(4, 3) DEFAULT 0.25,
    threat_level VARCHAR(16) NOT NULL CHECK (threat_level IN ('LOW', 'AMBER', 'CRITICAL')),
    drii_score NUMERIC(5, 2) NOT NULL,
    is_waterlogged BOOLEAN DEFAULT FALSE,
    waterlog_hours NUMERIC(5, 1) DEFAULT 0,
    gemini_summary JSONB,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_telemetry_catchment ON telemetry_readings(catchment_id, recorded_at DESC);

-- 4. Community Incidents Table with PostGIS Geography Point
CREATE TABLE IF NOT EXISTS community_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hazard_type VARCHAR(32) NOT NULL CHECK (hazard_type IN ('HIGH_WATER', 'CHOKED_GUTTER', 'IMPASSABLE_BRIDGE', 'STANDING_WATER')),
    coordinates GEOGRAPHY(Point, 4326) NOT NULL,
    catchment_id VARCHAR(64) REFERENCES catchments(id),
    neighborhood_name VARCHAR(128) NOT NULL,
    verification_status VARCHAR(32) DEFAULT 'UNVERIFIED',
    upvotes INT DEFAULT 1,
    description TEXT,
    reported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_incidents_coords ON community_incidents USING GIST(coordinates);
`;

// In-memory fallback dataset for offline/local development
export let memoryIncidents: CommunityIncident[] = [
  {
    id: 'inc-101',
    hazard_type: 'CHOKED_GUTTER',
    latitude: 5.5592,
    longitude: -0.2081,
    catchment_id: 'odawna-circle',
    neighborhood_name: 'Odawna Market Drain',
    reported_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    verification_status: 'COMMUNITY_VERIFIED',
    upvotes: 14,
    description: 'Main culvert blocked by plastic waste debris, water pooling towards VIP station.',
  },
  {
    id: 'inc-102',
    hazard_type: 'HIGH_WATER',
    latitude: 5.5545,
    longitude: -0.2128,
    catchment_id: 'adabraka-basin',
    neighborhood_name: 'Sahara Park Culvert',
    reported_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    verification_status: 'COMMUNITY_VERIFIED',
    upvotes: 21,
    description: 'Water level reached knee height across the secondary access road.',
  },
  {
    id: 'inc-103',
    hazard_type: 'IMPASSABLE_BRIDGE',
    latitude: 5.5895,
    longitude: -0.2092,
    catchment_id: 'alajo-confluence',
    neighborhood_name: 'Alajo Central Footbridge',
    reported_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    verification_status: 'COMMUNITY_VERIFIED',
    upvotes: 38,
    description: 'Submerged bridge rail under rapid Onyasia stream current.',
  },
  {
    id: 'inc-104',
    hazard_type: 'STANDING_WATER',
    latitude: 5.5255,
    longitude: -0.2818,
    catchment_id: 'glefe-lagoon',
    neighborhood_name: 'Glefe Lagoon Edge',
    reported_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    verification_status: 'UNVERIFIED',
    upvotes: 9,
    description: 'Persistent saline waterlogging trapping compound houses.',
  },
];

export async function initPostgisDb() {
  if (!sqlClient) {
    return { success: true, message: 'Running in local spatial memory mode (NEON_DATABASE_URL not configured).' };
  }

  try {
    await (sqlClient as any)(POSTGIS_INIT_SQL);

    // Seed catchments
    const existing = await sqlClient`SELECT COUNT(*) FROM catchments`;
    if (parseInt(existing[0].count, 10) === 0) {
      for (const c of ACCRA_CATCHMENTS) {
        const wkt = `POLYGON((${c.boundary.coordinates[0].map(([lon, lat]) => `${lon} ${lat}`).join(', ')}))`;
        await sqlClient`
          INSERT INTO catchments (id, name, district, boundary, base_elevation_m, is_waterlog_prone, drainage_outfall)
          VALUES (${c.id}, ${c.name}, ${c.district}, ST_GeomFromText(${wkt}, 4326), ${c.base_elevation_m}, ${c.is_waterlog_prone}, ${c.drainage_outfall})
          ON CONFLICT (id) DO NOTHING;
        `;
      }
    }

    return { success: true, message: 'Neon PostGIS schema initialized and seeded successfully.' };
  } catch (err: any) {
    console.error('[SkyGround Server] PostGIS init error:', err);
    return { success: false, message: err.message || 'PostGIS migration failed' };
  }
}

