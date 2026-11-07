import { ThreatLevel, LanguageCode } from '../types';

export interface LocalAudioScript {
  level: ThreatLevel;
  language: LanguageCode;
  languageName: string;
  headline: string;
  script: string;
  // Fallback high-fidelity base64 or audio uri:
  audioUrl?: string;
  durationSeconds: number;
}

export const AUDIO_SCRIPTS: Record<ThreatLevel, Record<LanguageCode, LocalAudioScript>> = {
  LOW: {
    en: {
      level: 'LOW',
      language: 'en',
      languageName: 'English',
      headline: 'Normal Weather Conditions',
      script: 'Current rain intensity and soil saturation in your catchment are low. Drainage systems are operating normally. Stay aware of local afternoon convective cloud developments.',
      durationSeconds: 9,
    },
    tw: {
      level: 'LOW',
      language: 'tw',
      languageName: 'Twi',
      headline: 'Asɛm Biara Nni Hɔ (Asomdwoe)',
      script: 'Nsuo a ɛretɔ ne asase no mu nsuo dɔɔso kakraabi pɛ. Nsubɔnten no mu kwan da hɔ fefeefe. Momma mo ani nna hɔ bio berɛ a ewiem reyɛ kusuu no.',
      durationSeconds: 10,
    },
    gaa: {
      level: 'LOW',
      language: 'gaa',
      languageName: 'Ga',
      headline: 'He Yɛ Fɛfɛɛfɛ',
      script: 'Nugbɔ nɛ nɛɛ kɛ shikpɔŋ lɔɔ mli nu lɔ fɛɛ yɛ shishiuishiŋ. Falefale gbɛi lɔi ejaŋ fefɛɛfɛ. Kaashi ohe bɔɔ kɛji o na atatu hu baa.',
      durationSeconds: 10,
    },
  },
  AMBER: {
    en: {
      level: 'AMBER',
      language: 'en',
      languageName: 'English',
      headline: 'Amber Warning: Rapid Runoff Imminent',
      script: 'Attention residents: High soil saturation detected above 75%. Impending rain is likely to cause rapid surface runoff. Clear gutter openings immediately and move sensitive inventory above floor level.',
      durationSeconds: 12,
    },
    tw: {
      level: 'AMBER',
      language: 'tw',
      languageName: 'Twi',
      headline: 'Kɔkɔbɔ: Nsuo Betumi Ayiri Ntɛm',
      script: 'Kɔkɔbɔ kɛse ma kuromma: Asase no amene nsuo pa ara boro ɔha nkyekyem aduoson anum. Nsuo a ɛreba no betumi ayiri ntɛm. Mompra nsubɔnten ano ntɛm, na momfa mo nneɛma a ɛsom bo nsi beae a ɛkorɔn.',
      durationSeconds: 14,
    },
    gaa: {
      level: 'AMBER',
      language: 'gaa',
      languageName: 'Ga',
      headline: 'Kɔkɔbɔ: Nshɔ Nu Baafa Truka',
      script: 'Mɛi fɛɛ abɔ he: Shikpɔŋ lɔ emɔ nu kɛyashi jaa kpawo kɛ enumɔ nɔ. Nugbɔ nɛ baa lɔ baaha nu afa amrɔ nɔŋŋ. Jiemɔ nibii yɛ faaji anaa gbɛi ahe, ni wo onibii kɛya he ko ni kwɔ.',
      durationSeconds: 13,
    },
  },
  CRITICAL: {
    en: {
      level: 'CRITICAL',
      language: 'en',
      languageName: 'English',
      headline: 'CRITICAL EMERGENCY: Severe Inundation Alert',
      script: 'EMERGENCY ALERT: Soil is 100% saturated and torrential rainfall exceeds 30 millimeters per hour. Severe flash flooding underway in low-lying zones. Do NOT attempt to cross the Odaw drain or submerged bridges. Evacuate immediately to designated high ground.',
      durationSeconds: 16,
    },
    tw: {
      level: 'CRITICAL',
      language: 'tw',
      languageName: 'Twi',
      headline: 'KƆKƆBƆ KƐSE PA ARA: Nsuyiri Reba!',
      script: 'AMMAMBƆ KƆKƆBƆ: Asase no amene nsuo abu so koraa, na nsuo kɛse retɔ boro mmiri aduasa dɔnhwerew biara mu! Nsuo reyiri beae a ɛba fam no nyinaa. Mfa w’ani nhu na wantwa Odaw kwan anaa twene a nsuo akata so! Tu bra baabi a ɛkorɔn mprempren ara!',
      durationSeconds: 18,
    },
    gaa: {
      level: 'CRITICAL',
      language: 'gaa',
      languageName: 'Ga',
      headline: 'OSHIKEKEE KƆKƆBƆ: Nu Efa Babaoo Kpoo!',
      script: 'KƆKƆBƆ KPETEENKPELE: Shikpɔŋ lɔ eyi tɔ kɛ nu, ni nugbɔ agbo nɛ tswaa lɔ baaha shitee nu efa bɔ ni tɔ. Kaatswa ohe faa kɛtso Odaw gbɛ anaa tsɔne gbelemɔ nɔ! Dze amrɔ nɛɛ kɛte he ko ni kwɔ gbagbalaza!',
      durationSeconds: 17,
    },
  },
};

