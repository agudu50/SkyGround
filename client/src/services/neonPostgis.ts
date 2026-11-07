import { neon, NeonQueryFunction } from '@neondatabase/serverless';
import { ACCRA_CATCHMENTS, findCatchmentByLocation } from '../constants/catchments';
import { Catchment, CommunityIncident, HazardType, TelemetryReading, ThreatLevel } from '../types';

// Neon database connection string can be provided via environment variable:
// EXPO_PUBLIC_NEON_DATABASE_URL="postgres://user:password@ep-sample-123456.us-east-2.aws.neon.tech/neondb?sslmode=require"
const NEON_CONNECTION_STRING = process.env.EXPO_PUBLIC_NEON_DATABASE_URL || '';

let sqlClient: NeonQueryFunction<false, false> | null = null;

if (NEON_CONNECTION_STRING) {
  try {
    sqlClient = neon(NEON_CONNECTION_STRING);
  } catch (err) {
    console.warn('[SkyGround PostGIS] Neon client initialization deferred:', err);
  }
}

/**
 * SQL Schema migration DDL for PostGIS
 */
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

/**
 * Local in-memory store for offline/demo operation
 */
let localIncidents: CommunityIncident[] = [
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

/**
 * Calculates distance between two points in meters (Haversine formula)
 */
function calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000; // Earth radius in meters
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class SpatialBackendService {
  /**
   * Initializes the database schema and seeds initial catchments if needed
   */
  static async initializeDatabase(): Promise<{ success: boolean; message: string }> {
    if (!sqlClient) {
      return {
        success: true,
        message: 'Neon client running in local spatial memory mode (EXPO_PUBLIC_NEON_DATABASE_URL not set).',
      };
    }

    try {
      await (sqlClient as any)(POSTGIS_INIT_SQL);
      
      // Seed catchments if empty
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

      return { success: true, message: 'Neon PostGIS schema initialized successfully.' };
    } catch (err: any) {
      console.warn('[SkyGround PostGIS] Error executing init SQL:', err);
      return { success: false, message: err.message || 'PostGIS initialization error' };
    }
  }

  /**
   * GET /api/catchment/current?lat=...&lon=...
   * Checks if user's GPS is inside a known catchment polygon using ST_Contains
   */
  static async getCurrentCatchment(lat: number, lon: number): Promise<Catchment> {
    if (sqlClient) {
      try {
        const rows = await sqlClient`
          SELECT id, name, district, base_elevation_m, is_waterlog_prone, drainage_outfall
          FROM catchments
          WHERE ST_Contains(boundary, ST_SetSRID(ST_Point(${lon}, ${lat}), 4326))
          LIMIT 1;
        `;
        if (rows.length > 0) {
          const found = ACCRA_CATCHMENTS.find((c) => c.id === rows[0].id);
          if (found) return found;
        }
      } catch (err) {
        console.warn('[SkyGround PostGIS] PostGIS ST_Contains query error, falling back to local geometry:', err);
      }
    }

    // High performance local fallback with ray-casting:
    const matched = findCatchmentByLocation(lat, lon);
    if (matched) return matched;

    // If outside boundary, find nearest Accra catchment
    let nearest = ACCRA_CATCHMENTS[0];
    let minDistance = Infinity;
    for (const c of ACCRA_CATCHMENTS) {
      const dist = calculateDistanceMeters(lat, lon, c.center.latitude, c.center.longitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = c;
      }
    }
    return nearest;
  }

  /**
   * POST /api/incidents
   * Saves a 1-tap geo-tagged incident report
   */
  static async reportIncident(params: {
    hazard_type: HazardType;
    latitude: number;
    longitude: number;
    neighborhood_name: string;
    description?: string;
  }): Promise<CommunityIncident> {
    const catchment = await this.getCurrentCatchment(params.latitude, params.longitude);
    const incident: CommunityIncident = {
      id: `inc-${Date.now().toString(36)}`,
      hazard_type: params.hazard_type,
      latitude: params.latitude,
      longitude: params.longitude,
      catchment_id: catchment.id,
      neighborhood_name: params.neighborhood_name || catchment.name,
      reported_at: new Date().toISOString(),
      verification_status: 'UNVERIFIED',
      upvotes: 1,
      description: params.description || `Immediate 1-tap ${params.hazard_type.replace('_', ' ')} alert.`,
    };

    if (sqlClient) {
      try {
        const pointWkt = `POINT(${params.longitude} ${params.latitude})`;
        const res = await sqlClient`
          INSERT INTO community_incidents 
            (hazard_type, coordinates, catchment_id, neighborhood_name, verification_status, upvotes, description)
          VALUES 
            (${incident.hazard_type}, ST_GeogFromText(${pointWkt}), ${incident.catchment_id}, ${incident.neighborhood_name}, 'UNVERIFIED', 1, ${incident.description})
          RETURNING id;
        `;
        if (res.length > 0) {
          incident.id = res[0].id;
        }
      } catch (err) {
        console.warn('[SkyGround PostGIS] Could not insert to Neon, stored in local cache:', err);
      }
    }

    // Always update local memory cache
    localIncidents.unshift(incident);
    return incident;
  }

  /**
   * GET /api/incidents/nearby?lat=...&lon=...&radius=500
   * Fetches nearby community markers using ST_DWithin
   */
  static async getNearbyIncidents(lat: number, lon: number, radiusMeters: number = 3000): Promise<CommunityIncident[]> {
    if (sqlClient) {
      try {
        const pointWkt = `POINT(${lon} ${lat})`;
        const rows = await sqlClient`
          SELECT 
            id, 
            hazard_type, 
            ST_Y(coordinates::geometry) as latitude, 
            ST_X(coordinates::geometry) as longitude,
            catchment_id,
            neighborhood_name,
            verification_status,
            upvotes,
            description,
            reported_at
          FROM community_incidents
          WHERE ST_DWithin(coordinates, ST_GeogFromText(${pointWkt}), ${radiusMeters})
          ORDER BY reported_at DESC
          LIMIT 50;
        `;
        if (rows.length > 0) {
          return rows.map((r: any) => ({
            id: r.id,
            hazard_type: r.hazard_type as HazardType,
            latitude: parseFloat(r.latitude),
            longitude: parseFloat(r.longitude),
            catchment_id: r.catchment_id,
            neighborhood_name: r.neighborhood_name,
            verification_status: r.verification_status,
            upvotes: parseInt(r.upvotes, 10),
            description: r.description,
            reported_at: r.reported_at,
          }));
        }
      } catch (err) {
        console.warn('[SkyGround PostGIS] ST_DWithin error, falling back to local geometry:', err);
      }
    }

    // Local spatial filter:
    return localIncidents.filter((inc) => {
      const dist = calculateDistanceMeters(lat, lon, inc.latitude, inc.longitude);
      return dist <= radiusMeters;
    });
  }

  /**
   * Upvotes an existing incident to increase its community verification score
   */
  static async upvoteIncident(id: string): Promise<number> {
    const incident = localIncidents.find((i) => i.id === id);
    if (incident) {
      incident.upvotes += 1;
      if (incident.upvotes >= 3 && incident.verification_status === 'UNVERIFIED') {
        incident.verification_status = 'COMMUNITY_VERIFIED';
      }
      return incident.upvotes;
    }
    return 1;
  }
}
