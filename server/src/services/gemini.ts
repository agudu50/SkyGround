import { Catchment, GeminiAdvisory, TelemetryReading, ThreatLevel } from '../types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

export class GeminiServerService {
  static async synthesizeAdvisory(
    catchment: Catchment,
    telemetry: TelemetryReading,
    incidentCount: number = 2
  ): Promise<GeminiAdvisory> {
    if (GEMINI_API_KEY) {
      try {
        const prompt = `
You are the Chief Hydrometeorological AI for Greater Accra (SkyGround Platform).
Analyze the following live telemetry for the "${catchment.name}" catchment in "${catchment.district}":
- Elevation: ${catchment.base_elevation_m}m above sea level
- Drainage Outfall: ${catchment.drainage_outfall}
- Rain Rate: ${telemetry.rain_rate_mmh} mm/hour
- 24-Hour Accumulated Rainfall: ${telemetry.rain_accum_24h_mm} mm
- Soil Saturation: ${telemetry.soil_moisture_pct}%
- DRII Threat Level: ${telemetry.threat_level}
- Waterlogged Ground Status: ${telemetry.is_waterlogged ? `YES (${telemetry.waterlog_hours} hours continuous saturation > 85%)` : 'NO'}
- Active Crowdsourced Incidents Reported: ${incidentCount}

Generate a structured JSON alert containing:
1. "headline": Short high-impact status title (max 7 words).
2. "community_action_en": Concise, highly conversational English warning focused on immediate actionable safety steps for residents (max 3 sentences).
3. "evacuation_notice": Clear advice on whether to stay upstairs, avoid specific bridges/canals, or evacuate to designated high ground.
4. "public_works_directives": Exactly 3 highly technical, actionable bullet points for municipal public works engineers and NADMO teams (e.g. desilting excavator deployment, retention basin sluice gates, culvert clearing).
5. "confidence_pct": Hydrological confidence score between 80 and 99.
`;

        const requestBody = {
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'OBJECT',
              properties: {
                headline: { type: 'STRING' },
                community_action_en: { type: 'STRING' },
                evacuation_notice: { type: 'STRING' },
                public_works_directives: {
                  type: 'ARRAY',
                  items: { type: 'STRING' },
                  minItems: 3,
                  maxItems: 3,
                },
                confidence_pct: { type: 'INTEGER' },
              },
              required: ['headline', 'community_action_en', 'public_works_directives', 'confidence_pct'],
            },
          },
        };

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (jsonText) {
            const parsed = JSON.parse(jsonText);
            return {
              headline: parsed.headline,
              community_action_en: parsed.community_action_en,
              evacuation_notice: parsed.evacuation_notice,
              public_works_directives: [
                parsed.public_works_directives[0],
                parsed.public_works_directives[1],
                parsed.public_works_directives[2],
              ],
              generated_at: new Date().toISOString(),
              confidence_pct: parsed.confidence_pct || 95,
            };
          }
        }
      } catch (err) {
        console.warn('[SkyGround Server Gemini] Direct API call error, using domain fallback:', err);
      }
    }

    return this.getFallbackAdvisory(catchment, telemetry.threat_level, telemetry.soil_moisture_pct);
  }

  private static getFallbackAdvisory(catchment: Catchment, threatLevel: ThreatLevel, soilPct: number): GeminiAdvisory {
    if (threatLevel === 'CRITICAL') {
      return {
        headline: 'Critical Inundation: Immediate Evacuation Watch',
        community_action_en: `Rapid flood surge underway in ${catchment.name}. Soil is ${soilPct}% saturated with zero infiltration capacity. Do not attempt to cross submerged drains or roads; move immediately to the nearest concrete multi-story structure or designated assembly point.`,
        evacuation_notice: `Avoid the ${catchment.drainage_outfall} corridor. Proceed towards high ground away from low-elevation culverts.`,
        public_works_directives: [
          `Deploy tracked hydraulic excavators immediately to ${catchment.name} outfall to clear trapped solid waste and plastic debris choke points.`,
          `Activate emergency mobile suction pumps at low-lying depression pockets and coordinate with NADMO for rapid corridor cordoning.`,
          `Notify Ghana Grid Company (GRIDCo) and ECG to execute selective grid isolation for sub-stations located below the 8-meter elevation contour.`,
        ],
        generated_at: new Date().toISOString(),
        confidence_pct: 96,
      };
    }

    if (threatLevel === 'AMBER') {
      return {
        headline: 'Amber Warning: Runoff Surge Imminent',
        community_action_en: `Heavy convective rainfall is overwhelming primary storm channels in ${catchment.name}. Ensure compound drain grates are unchoked and elevate electronics, mattresses, and merchandise at least 1 meter off ground level.`,
        evacuation_notice: 'Stay alert and monitor elderly neighbors. Do not let children play near open street gutters.',
        public_works_directives: [
          `Dispatch municipal desilting rapid crews to clear secondary arterial drains along the ${catchment.name} access roads.`,
          `Inspect culvert inlet screens for vegetation and polystyrene blockages before peak inflow hours.`,
          `Pre-stage emergency sandbags and barrier markers at known street overflow dips along the drainage collector line.`,
        ],
        generated_at: new Date().toISOString(),
        confidence_pct: 91,
      };
    }

    return {
      headline: 'Drainage Operating Within Nominal Tolerance',
      community_action_en: `Current weather conditions in ${catchment.name} are stable. Soil moisture is at ${soilPct}%, allowing normal infiltration. Daily activities can proceed with standard weather awareness.`,
      evacuation_notice: 'No evacuation required. Maintain clear gutters during regular community sanitation.',
      public_works_directives: [
        `Conduct routine debris sweep along primary concrete drains feeding into ${catchment.drainage_outfall}.`,
        `Review telemetry sensor calibration and inspect sediment traps for scheduled weekend desilting.`,
        `Update municipal GIS catchment records with recent community ground-truthed drain inspection reports.`,
      ],
      generated_at: new Date().toISOString(),
      confidence_pct: 88,
    };
  }
}

