import { Router, Request, Response } from 'express';
import { ACCRA_CATCHMENTS } from '../constants/catchments';
import { calculateDRII } from '../services/drii';
import { TelemetryReading } from '../types';

export const telemetryRouter = Router();

// GET /api/telemetry/:catchmentId: Returns live DRII and telemetry
telemetryRouter.get('/:catchmentId', (req: Request, res: Response) => {
  const { catchmentId } = req.params;
  const catchment = ACCRA_CATCHMENTS.find((c) => c.id === catchmentId) || ACCRA_CATCHMENTS[0];

  const rainRate = catchment.rain_rate_mmh;
  const accum24h = catchment.accum_24h_mm;
  const soilMoisture = catchment.soil_saturation_pct;
  const ndvi = catchment.is_waterlog_prone ? 0.18 : 0.32;

  const drii = calculateDRII(
    rainRate,
    accum24h,
    soilMoisture,
    catchment.is_waterlog_prone ? 32 : 0,
    catchment.base_elevation_m
  );

  const reading: TelemetryReading = {
    catchment_id: catchment.id,
    timestamp: new Date().toISOString(),
    rain_rate_mmh: rainRate,
    rain_accum_24h_mm: accum24h,
    soil_moisture_pct: soilMoisture,
    ndvi,
    threat_level: drii.threat_level,
    drii_score: drii.score,
    is_waterlogged: drii.is_waterlogged,
    waterlog_hours: drii.waterlog_hours,
  };

  res.json({ success: true, data: reading, drii });
});

