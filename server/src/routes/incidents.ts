import { Router, Request, Response } from 'express';
import { sqlClient, memoryIncidents } from '../db/neon';
import { ACCRA_CATCHMENTS, findCatchmentByLocation } from '../constants/catchments';
import { CommunityIncident, HazardType } from '../types';

export const incidentsRouter = Router();

// POST /api/incidents: Saves a 1-tap geo-tagged incident report
incidentsRouter.post('/', async (req: Request, res: Response) => {
  const { hazard_type, latitude, longitude, neighborhood_name, description } = req.body;

  if (!hazard_type || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ success: false, error: 'hazard_type, latitude, and longitude are required.' });
  }

  const catchment = findCatchmentByLocation(latitude, longitude) || ACCRA_CATCHMENTS[0];
  const incident: CommunityIncident = {
    id: `inc-${Date.now().toString(36)}`,
    hazard_type: hazard_type as HazardType,
    latitude,
    longitude,
    catchment_id: catchment.id,
    neighborhood_name: neighborhood_name || catchment.name,
    reported_at: new Date().toISOString(),
    verification_status: 'UNVERIFIED',
    upvotes: 1,
    description: description || `1-Tap ${hazard_type.replace('_', ' ')} community report.`,
  };

  if (sqlClient) {
    try {
      const pointWkt = `POINT(${longitude} ${latitude})`;
      const result = await sqlClient`
        INSERT INTO community_incidents 
          (hazard_type, coordinates, catchment_id, neighborhood_name, verification_status, upvotes, description)
        VALUES 
          (${incident.hazard_type}, ST_GeogFromText(${pointWkt}), ${incident.catchment_id}, ${incident.neighborhood_name}, 'UNVERIFIED', 1, ${incident.description})
        RETURNING id;
      `;
      if (result.length > 0) {
        incident.id = result[0].id;
      }
    } catch (err) {
      console.warn('[SkyGround Server] Neon insert error, saved to memory cache:', err);
    }
  }

  memoryIncidents.unshift(incident);
  res.status(201).json({ success: true, data: incident });
});

// GET /api/incidents/nearby?lat=...&lon=...&radius=500: Fetches nearby markers using PostGIS ST_DWithin
incidentsRouter.get('/nearby', async (req: Request, res: Response) => {
  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);
  const radius = parseFloat((req.query.radius as string) || '5000');

  if (isNaN(lat) || isNaN(lon)) {
    return res.status(400).json({ success: false, error: 'Valid lat and lon are required.' });
  }

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
        WHERE ST_DWithin(coordinates, ST_GeogFromText(${pointWkt}), ${radius})
        ORDER BY reported_at DESC
        LIMIT 50;
      `;
      if (rows.length > 0) {
        const incidents: CommunityIncident[] = rows.map((r: any) => ({
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
        return res.json({ success: true, data: incidents, source: 'postgis' });
      }
    } catch (err) {
      console.warn('[SkyGround Server] ST_DWithin query error, using memory fallback:', err);
    }
  }

  res.json({ success: true, data: memoryIncidents, source: 'memory_cache' });
});

// POST /api/incidents/:id/upvote: Increments verification count
incidentsRouter.post('/:id/upvote', async (req: Request, res: Response) => {
  const { id } = req.params;
  const incident = memoryIncidents.find((i) => i.id === id);
  if (incident) {
    incident.upvotes += 1;
    if (incident.upvotes >= 3) {
      incident.verification_status = 'COMMUNITY_VERIFIED';
    }
    return res.json({ success: true, upvotes: incident.upvotes, verification_status: incident.verification_status });
  }

  res.status(404).json({ success: false, error: 'Incident not found' });
});

