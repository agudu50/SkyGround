import { LanguageCode, ThreatLevel } from '../types';

const KHAYA_API_KEY = process.env.KHAYA_API_KEY || process.env.EXPO_PUBLIC_KHAYA_API_KEY || '';

const FALLBACK_SCRIPTS: Record<ThreatLevel, Record<LanguageCode, string>> = {
  LOW: {
    en: 'Current rain intensity and soil saturation in your catchment are low. Drainage systems are operating normally.',
    tw: 'Nsuo a ɛretɔ ne asase no mu nsuo dɔɔso kakraabi pɛ. Nsubɔnten no mu kwan da hɔ fefeefe.',
    gaa: 'Nugbɔ nɛ nɛɛ kɛ shikpɔŋ lɔɔ mli nu lɔ fɛɛ yɛ shishiuishiŋ. Falefale gbɛi lɔi ejaŋ fefɛɛfɛ.',
  },
  AMBER: {
    en: 'Attention residents: High soil saturation detected above 75%. Rapid surface runoff likely. Clear gutter openings immediately.',
    tw: 'Kɔkɔbɔ kɛse ma kuromma: Asase no amene nsuo pa ara boro 75%. Mompra nsubɔnten ano ntɛm.',
    gaa: 'Mɛi fɛɛ abɔ he: Shikpɔŋ lɔ emɔ nu kɛyashi jaa kpawo kɛ enumɔ nɔ. Jiemɔ nibii yɛ faaji anaa gbɛi ahe.',
  },
  CRITICAL: {
    en: 'EMERGENCY ALERT: Soil is 100% saturated with torrential rainfall. Severe flash flooding underway. Evacuate immediately.',
    tw: 'AMMAMBƆ KƆKƆBƆ: Asase no amene nsuo abu so koraa! Nsuo reyiri beae a ɛba fam no nyinaa. Tu bra baabi a ɛkorɔn mprempren ara!',
    gaa: 'OSHIKEKEE KƆKƆBƆ: Shikpɔŋ lɔ eyi tɔ kɛ nu! Kaatswa ohe faa kɛtso Odaw gbɛ nɔ. Dze amrɔ nɛɛ kɛte he ko ni kwɔ!',
  },
};

export class KhayaServerService {
  static async translate(text: string, targetLang: LanguageCode, threatLevel: ThreatLevel = 'AMBER') {
    if (targetLang === 'en') {
      return { translatedText: text, targetLang, isFallback: false };
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
          body: JSON.stringify({ in: text, lang: langPair }),
        });

        if (response.ok) {
          const data = await response.json();
          const translated = typeof data === 'string' ? data : data?.translated_text || data?.out;
          if (translated) {
            return { translatedText: translated, targetLang, isFallback: false };
          }
        }
      } catch (e) {
        console.warn('[SkyGround Server Khaya] Translation failed, using fallback:', e);
      }
    }

    return {
      translatedText: FALLBACK_SCRIPTS[threatLevel][targetLang],
      targetLang,
      isFallback: true,
    };
  }

  static async tts(text: string, language: LanguageCode, threatLevel: ThreatLevel = 'AMBER') {
    if (KHAYA_API_KEY) {
      try {
        const response = await fetch('https://tts-api.ghananlp.org/v2/tts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': KHAYA_API_KEY,
          },
          body: JSON.stringify({
            text,
            language: language === 'gaa' ? 'ga' : language,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const audioUrl = data?.audio_url || data?.url;
          if (audioUrl) {
            return { audioUri: audioUrl, durationSeconds: Math.max(8, Math.round(text.length / 15)), isCachedOrFallback: false };
          }
        }
      } catch (e) {
        console.warn('[SkyGround Server Khaya] TTS failed, using fallback:', e);
      }
    }

    return {
      audioUri: `https://actions.google.com/sounds/v1/weather/rain_heavy.ogg`,
      durationSeconds: 12,
      isCachedOrFallback: true,
    };
  }
}

