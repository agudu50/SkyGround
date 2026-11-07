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
  gemini_summary?: GeminiAdvisory;
}

export interface GeminiAdvisory {
  headline: string;
  community_action_en: string;
  community_action_tw?: string;
  community_action_gaa?: string;
  evacuation_notice?: string;
  public_works_directives: [string, string, string]; // 3-bullet action directive
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

export interface WeatherCondition {
  temp_c: number;
  feels_like_c: number;
  condition: 'Sunny' | 'Partly Cloudy' | 'Cloudy' | 'Showers' | 'Convective Thunderstorm' | 'Heavy Monsoon';
  condition_code: string;
  humidity_pct: number;
  wind_kph: number;
  hourly_rain: { hour: string; rain_mm: number; pop_pct: number }[];
}

export interface MunicipalBrief {
  generated_at: string;
  district_name: string;
  priority_level: 'NORMAL' | 'HIGH_ALERT' | 'DISASTER_IMMINENT';
  high_risk_catchments: string[];
  choked_gutter_count: number;
  high_water_reports: number;
  impassable_access_points: string[];
  desilting_priority_zones: {
    zone_name: string;
    catchment: string;
    criticality: 'IMMEDIATE' | 'NEXT_6_HOURS' | 'POST_STORM';
    notes: string;
  }[];
  engineering_action_plan: [string, string, string];
  nadmo_evacuation_routes: string[];
}

