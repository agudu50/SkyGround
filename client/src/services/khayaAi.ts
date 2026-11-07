import { AUDIO_SCRIPTS } from '../constants/audioMatrix';
import { LanguageCode, ThreatLevel } from '../types';

const KHAYA_API_KEY = process.env.EXPO_PUBLIC_KHAYA_API_KEY || '';

export interface TranslationResult {
  translatedText: string;
  sourceLang: string;
  targetLang: string;
  isFallback: boolean;
}

export interface TTSResult {
  audioUri: string;
  durationSeconds: number;
  isCachedOrFallback: boolean;
}

export class KhayaAiService {
  /**
   * Translates English advisory text to Twi ('tw') or Ga ('gaa')
   * using Khaya AI (Ghana NLP) with offline audio matrix fallback.
   */
  static async translateText(
    text: string,
    targetLang: LanguageCode,
    threatLevel: ThreatLevel = 'AMBER'
  ): Promise<TranslationResult> {
    if (targetLang === 'en') {
      return { translatedText: text, sourceLang: 'en', targetLang: 'en', isFallback: false };
    }

    if (KHAYA_API_KEY) {
      try {
        const langPair = targetLang === 'tw' ? 'en-tw' : 'en-gaa';
        const response = await fetch('https://translation-api.ghananlp.org/v2/translate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': KHAYA_API_KEY,
          },
          body: JSON.stringify({
            in: text,
            lang: langPair,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Khaya returns translated text string or object
          const translated = typeof data === 'string' ? data : data?.translated_text || data?.out;
          if (translated) {
            return {
              translatedText: translated,
              sourceLang: 'en',
              targetLang,
              isFallback: false,
            };
          }
        }
      } catch (err) {
        console.warn('[SkyGround Khaya AI] Translate API unavailable, switching to local offline matrix:', err);
      }
    }

    // High fidelity offline fallback from localized Accra linguistic corpus:
    const fallbackScript = AUDIO_SCRIPTS[threatLevel][targetLang];
    return {
      translatedText: fallbackScript.script,
      sourceLang: 'en',
      targetLang,
      isFallback: true,
    };
  }

  /**
   * Synthesizes audio using Khaya TTS or retrieves offline bundled audio URL
   */
  static async getAudioForAlert(
    text: string,
    language: LanguageCode,
    threatLevel: ThreatLevel
  ): Promise<TTSResult> {
    if (KHAYA_API_KEY) {
      try {
        const response = await fetch('https://tts-api.ghananlp.org/v2/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': KHAYA_API_KEY,
          },
          body: JSON.stringify({
            text: text,
            language: language === 'gaa' ? 'ga' : language,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const audioUrl = data?.audio_url || data?.url;
          if (audioUrl) {
            return {
              audioUri: audioUrl,
              durationSeconds: Math.max(8, Math.round(text.length / 15)),
              isCachedOrFallback: false,
            };
          }
        }
      } catch (err) {
        console.warn('[SkyGround Khaya AI] TTS API unavailable, using offline bundled audio matrix:', err);
      }
    }

    // Offline Audio Matrix Fallback:
    const fallback = AUDIO_SCRIPTS[threatLevel][language];
    // Return standard audio URI or bundled asset path
    return {
      audioUri: fallback.audioUrl || `https://actions.google.com/sounds/v1/weather/rain_heavy.ogg`, // clean sound reference
      durationSeconds: fallback.durationSeconds,
      isCachedOrFallback: true,
    };
  }
}

