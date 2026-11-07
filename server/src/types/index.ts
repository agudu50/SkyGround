export type ThreatLevel = 'LOW' | 'AMBER' | 'CRITICAL';

export type HazardType = 
  | 'HIGH_WATER' 
  | 'CHOKED_GUTTER' 
  | 'IMPASSABLE_BRIDGE' 
  | 'STANDING_WATER';

export type LanguageCode = 'en' | 'tw' | 'gaa';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CatchmentPolygon {
  type: 'Polygon';
  coordinates: [number, number][][]; // [lon, lat]
}

export interface Catchment {
  id: string;
  name: string;
  district: string;
  boundary: CatchmentPolygon;
  base_elevation_m: number;
  is_waterlog_prone: boolean;
  center: Coordinates;
  current_threat_level: ThreatLevel;
  soil_saturation_pct: number;
  rain_rate_mmh: number;
  accum_24h_mm: number;
  drainage_outfall: string;
}

export interface TelemetryReading {
  id?: string;
  catchment_id: string;
  timestamp: string;
  rain_rate_mmh: number;
  rain_accum_24h_mm: number;
  soil_moisture_pct: number;
  ndvi: number;
  threat_level: ThreatLevel;
  drii_score: number;
  is_waterlogged: boolean;
  waterlog_hours: number;
}

export interface GeminiAdvisory {
  headline: string;
  community_action_en: string;
  evacuation_notice?: string;
  public_works_directives: [string, string, string];
  generated_at: string;
  confidence_pct: number;
}

export interface CommunityIncident {
  id: string;
  hazard_type: HazardType;
  latitude: number;
  longitude: number;
  catchment_id?: string;
  neighborhood_name: string;
  reported_at: string;
  verification_status: 'UNVERIFIED' | 'COMMUNITY_VERIFIED' | 'RESOLVED';
  upvotes: number;
  description?: string;
}

