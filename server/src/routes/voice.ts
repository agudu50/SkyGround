import { Router, Request, Response } from 'express';
import { KhayaServerService } from '../services/khaya';
import { LanguageCode, ThreatLevel } from '../types';

export const voiceRouter = Router();

// POST /api/voice/translate: Translate text to Twi (tw) or Ga (gaa)
voiceRouter.post('/translate', async (req: Request, res: Response) => {
  const { text, target_lang, threat_level } = req.body;

  if (!text || !target_lang) {
    return res.status(400).json({ success: false, error: 'text and target_lang are required.' });
  }

  const result = await KhayaServerService.translate(
    text,
    target_lang as LanguageCode,
    (threat_level as ThreatLevel) || 'AMBER'
  );

  res.json({ success: true, data: result });
});

// POST /api/voice/tts: Generate audio bytes / URL via Khaya TTS
voiceRouter.post('/tts', async (req: Request, res: Response) => {
  const { text, language, threat_level } = req.body;

  if (!text || !language) {
    return res.status(400).json({ success: false, error: 'text and language are required.' });
  }

  const result = await KhayaServerService.tts(
    text,
    language as LanguageCode,
    (threat_level as ThreatLevel) || 'AMBER'
  );

  res.json({ success: true, data: result });
});

