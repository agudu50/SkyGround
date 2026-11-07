import { Catchment, CommunityIncident, GeminiAdvisory, HazardType, LanguageCode, TelemetryReading, ThreatLevel } from '../types';
import { SpatialBackendService } from './neonPostgis';
import { TelemetryService } from './telemetry';
import { GeminiReasoningService } from './gemini';
import { KhayaAiService } from './khayaAi';

const SERVER_URL = process.env.EXPO_PUBLIC_SERVER_URL || 'http://localhost:4000';

export class ApiClient {
  private static isServerAvailable: boolean | null = null;

  static async checkServerHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${SERVER_URL}/health`, { method: 'GET' });
      const ok = res.ok;
      this.isServerAvailable = ok;
      return ok;
    } catch {
      this.isServerAvailable = false;
      return false;
    }
  }

  static async getCurrentCatchment(lat: number, lon: number): Promise<Catchment> {
    try {
      const res = await fetch(`${SERVER_URL}/api/catchment/current?lat=${lat}&lon=${lon}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {
      // Fallback to client spatial engine
    }
    return SpatialBackendService.getCurrentCatchment(lat, lon);
  }

  static async getNearbyIncidents(lat: number, lon: number, radius: number = 5000): Promise<CommunityIncident[]> {
    try {
      const res = await fetch(`${SERVER_URL}/api/incidents/nearby?lat=${lat}&lon=${lon}&radius=${radius}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return SpatialBackendService.getNearbyIncidents(lat, lon, radius);
  }

  static async reportIncident(params: {
    hazard_type: HazardType;
    latitude: number;
    longitude: number;
    neighborhood_name: string;
    description?: string;
  }): Promise<CommunityIncident> {
    try {
      const res = await fetch(`${SERVER_URL}/api/incidents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return SpatialBackendService.reportIncident(params);
  }

  static async upvoteIncident(id: string): Promise<number> {
    try {
      const res = await fetch(`${SERVER_URL}/api/incidents/${id}/upvote`, { method: 'POST' });
      if (res.ok) {
        const json = await res.json();
        if (json.upvotes !== undefined) return json.upvotes;
      }
    } catch (e) {}
    return SpatialBackendService.upvoteIncident(id);
  }

  static async getTelemetry(catchment: Catchment): Promise<TelemetryReading> {
    try {
      const res = await fetch(`${SERVER_URL}/api/telemetry/${catchment.id}`);
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return TelemetryService.getCatchmentTelemetry(catchment);
  }

  static async getAdvisory(catchment: Catchment, telemetry: TelemetryReading, incidentCount: number): Promise<GeminiAdvisory> {
    try {
      const res = await fetch(`${SERVER_URL}/api/reasoning/advisory`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ catchment_id: catchment.id, incident_count: incidentCount }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return GeminiReasoningService.synthesizeAdvisory(catchment, telemetry, incidentCount);
  }

  static async translate(text: string, targetLang: LanguageCode, threatLevel: ThreatLevel) {
    try {
      const res = await fetch(`${SERVER_URL}/api/voice/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target_lang: targetLang, threat_level: threatLevel }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return KhayaAiService.translateText(text, targetLang, threatLevel);
  }

  static async getTTS(text: string, language: LanguageCode, threatLevel: ThreatLevel) {
    try {
      const res = await fetch(`${SERVER_URL}/api/voice/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language, threat_level: threatLevel }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) return json.data;
      }
    } catch (e) {}
    return KhayaAiService.getAudioForAlert(text, language, threatLevel);
  }
}

