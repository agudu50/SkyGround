import { Router, Request, Response } from 'express';
import { ACCRA_CATCHMENTS } from '../constants/catchments';
import { GeminiServerService } from '../services/gemini';
import { calculateDRII } from '../services/drii';

export const reasoningRouter = Router();

// POST /api/reasoning/advisory: Google AI Studio Gemini structured synthesis
reasoningRouter.post('/advisory', async (req: Request, res: Response) => {
  const { catchment_id, incident_count } = req.body;
  const catchment = ACCRA_CATCHMENTS.find((c) => c.id === catchment_id) || ACCRA_CATCHMENTS[0];

  const drii = calculateDRII(
    catchment.rain_rate_mmh,
    catchment.accum_24h_mm,
    catchment.soil_saturation_pct,
    catchment.is_waterlog_prone ? 32 : 0,
    catchment.base_elevation_m
  );

  const telemetry = {
    catchment_id: catchment.id,
    timestamp: new Date().toISOString(),
    rain_rate_mmh: catchment.rain_rate_mmh,
    rain_accum_24h_mm: catchment.accum_24h_mm,
    soil_moisture_pct: catchment.soil_saturation_pct,
    ndvi: 0.25,
    threat_level: drii.threat_level,
    drii_score: drii.score,
    is_waterlogged: drii.is_waterlogged,
    waterlog_hours: drii.waterlog_hours,
  };

  const advisory = await GeminiServerService.synthesizeAdvisory(catchment, telemetry, incident_count || 3);
  res.json({ success: true, data: advisory });
});

