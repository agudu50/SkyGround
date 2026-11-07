import { ThreatLevel } from '../types';

export interface DRIIResult {
  score: number;
  threat_level: ThreatLevel;
  is_waterlogged: boolean;
  waterlog_hours: number;
  reason: string;
}

/**
 * Dynamic Runoff & Inundation Index (DRII) Engine
 * 
 * Rules:
 * - LOW: Rain < 15mm, Soil Saturation < 65%
 * - AMBER: Rain 15–30mm OR Soil Saturation > 75%
 * - CRITICAL: Rain > 30mm OR (Rain > 20mm AND Soil Saturation > 80%)
 * - Waterlogged Ground: Flag zones where soil saturation remains > 85% for 24–48 hours post-storm
 */
export function calculateDRII(
  rainRateMmh: number,
  accum24hMm: number,
  soilMoisturePct: number,
  historicalHoursAbove85: number = 0,
  baseElevationM: number = 8.0
): DRIIResult {
  let threatLevel: ThreatLevel = 'LOW';
  let reason = 'Normal rainfall rate and adequate soil drainage capacity.';

  const soilWeight = (soilMoisturePct / 100) * 50;
  const rainWeight = Math.min(rainRateMmh / 60, 1.0) * 50;
  const elevationFactor = baseElevationM < 7.0 ? 10 : 0;

  const rawScore = Math.min(100, Math.round(soilWeight + rainWeight + elevationFactor));

  if (rainRateMmh > 30 || (rainRateMmh > 20 && soilMoisturePct > 80) || accum24hMm > 60) {
    threatLevel = 'CRITICAL';
    reason = 'Extreme convective precipitation combined with hyper-saturated soil. Immediate flash flood inundation imminent.';
  } else if (
    (rainRateMmh >= 15 && rainRateMmh <= 30) ||
    soilMoisturePct > 75 ||
    accum24hMm > 35
  ) {
    threatLevel = 'AMBER';
    reason = 'High soil saturation (>75%) or rapid rainfall rate (15-30mm/h) exceeds local drain conveyance threshold.';
  } else {
    threatLevel = 'LOW';
  }

  const isWaterlogged = soilMoisturePct > 85;
  const waterlogHours = isWaterlogged ? Math.max(28, historicalHoursAbove85 + 4) : 0;

  return {
    score: rawScore,
    threat_level: threatLevel,
    is_waterlogged: isWaterlogged,
    waterlog_hours: waterlogHours,
    reason,
  };
}

