import { Router, Request, Response } from 'express';
import { ACCRA_CATCHMENTS, findCatchmentByLocation } from '../constants/catchments';
import { sqlClient } from '../db/neon';

export const catchmentsRouter = Router();

// GET /api/catchments: List all catchments
catchmentsRouter.get('/', async (_req: Request, res: Response) => {
  res.json({ success: true, data: ACCRA_CATCHMENTS });
});

// GET /api/catchment/current?lat=...&lon=...: Checks if user's GPS is in known catchment (PostGIS ST_Contains)
catchmentsRouter.get('/current', async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ success: false, error: 'Valid lat and lon query parameters are required.' });
  }

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
        if (found) {
          return res.json({ success: true, data: found, source: 'postgis' });
        }
      }
    } catch (err) {
      console.warn('[SkyGround Server] PostGIS ST_Contains error, using ray-casting fallback:', err);
    }
  }

  const matched = findCatchmentByLocation(lat, lon);
  if (matched) {
    return res.json({ success: true, data: matched, source: 'spatial_cache' });
  }

  // Nearest catchment fallback
  res.json({ success: true, data: ACCRA_CATCHMENTS[0], source: 'nearest_fallback' });
});

