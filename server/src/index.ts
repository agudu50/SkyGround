import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initPostgisDb } from './db/neon';
import { catchmentsRouter } from './routes/catchments';
import { incidentsRouter } from './routes/incidents';
import { telemetryRouter } from './routes/telemetry';
import { reasoningRouter } from './routes/reasoning';
import { voiceRouter } from './routes/voice';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Request logger
app.use((req, _res, next) => {
  console.log(`[SkyGround API] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'SkyGround Geospatial Server',
    region: 'Greater Accra, Ghana',
    timestamp: new Date().toISOString(),
  });
});

// PostGIS Schema initialization endpoint
app.post('/api/init-db', async (_req: Request, res: Response) => {
  const result = await initPostgisDb();
  res.json(result);
});

// Mount Routes
app.use('/api/catchments', catchmentsRouter);
app.use('/api/catchment', catchmentsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api/reasoning', reasoningRouter);
app.use('/api/voice', voiceRouter);

// Start server
app.listen(PORT, async () => {
  console.log(` SkyGround Server running at http://localhost:${PORT}`);
  console.log(` Endpoints active:`);
  console.log(`   - GET  /health`);
  console.log(`   - POST /api/init-db`);
  console.log(`   - GET  /api/catchment/current?lat=...&lon=...`);
  console.log(`   - POST /api/incidents`);
  console.log(`   - GET  /api/incidents/nearby?lat=...&lon=...&radius=500`);
  console.log(`   - GET  /api/telemetry/:catchmentId`);
  console.log(`   - POST /api/reasoning/advisory`);
  console.log(`   - POST /api/voice/translate & /tts`);

  // Auto-initialize PostGIS
  await initPostgisDb();
});

export default app;

