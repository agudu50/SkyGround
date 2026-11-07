import { Catchment } from '../types';

export const ACCRA_CATCHMENTS: Catchment[] = [
  {
    id: 'odawna-circle',
    name: 'Odawna / Nkrumah Circle',
    district: 'Klottey Korle Municipal',
    base_elevation_m: 6.2,
    is_waterlog_prone: true,
    drainage_outfall: 'Odaw River Main Drain -> Korle Lagoon',
    center: {
      latitude: 5.5583,
      longitude: -0.2078,
    },
    boundary: {
      type: 'Polygon',
      coordinates: [
        [
          [-0.2155, 5.5655],
          [-0.2021, 5.5645],
          [-0.2012, 5.5528],
          [-0.2115, 5.5512],
          [-0.2178, 5.5582],
          [-0.2155, 5.5655],
        ],
      ],
    },
    current_threat_level: 'CRITICAL',
    soil_saturation_pct: 88,
    rain_rate_mmh: 34.5,
    accum_24h_mm: 52.0,
  },
  {
    id: 'adabraka-basin',
    name: 'Adabraka Sahara & Downstream',
    district: 'Klottey Korle Municipal',
    base_elevation_m: 7.8,
    is_waterlog_prone: true,
    drainage_outfall: 'Klottey / Odaw Sub-catchment',
    center: {
      latitude: 5.5539,
      longitude: -0.2132,
    },
    boundary: {
      type: 'Polygon',
      coordinates: [
        [
          [-0.2215, 5.5601],
          [-0.2085, 5.5595],
          [-0.2072, 5.5482],
          [-0.2198, 5.5475],
          [-0.2215, 5.5601],
        ],
      ],
    },
    current_threat_level: 'AMBER',
    soil_saturation_pct: 79,
    rain_rate_mmh: 22.0,
    accum_24h_mm: 38.5,
  },
  {
    id: 'alajo-confluence',
    name: 'Alajo Onyasia Confluence',
    district: 'Ayawaso Central Municipal',
    base_elevation_m: 11.4,
    is_waterlog_prone: false,
    drainage_outfall: 'Onyasia Stream -> Odaw River',
    center: {
      latitude: 5.5898,
      longitude: -0.2096,
    },
    boundary: {
      type: 'Polygon',
      coordinates: [
        [
          [-0.2185, 5.5992],
          [-0.2015, 5.5975],
          [-0.2005, 5.5815],
          [-0.2162, 5.5802],
          [-0.2185, 5.5992],
        ],
      ],
    },
    current_threat_level: 'AMBER',
    soil_saturation_pct: 74,
    rain_rate_mmh: 18.0,
    accum_24h_mm: 27.2,
  },
  {
    id: 'glefe-lagoon',
    name: 'Glefe / Wiaboman Coastal Basin',
    district: 'Ablekuma West Municipal',
    base_elevation_m: 2.8,
    is_waterlog_prone: true,
    drainage_outfall: 'Chemu Lagoon & Gulf of Guinea Intertidal',
    center: {
      latitude: 5.5265,
      longitude: -0.2825,
    },
    boundary: {
      type: 'Polygon',
      coordinates: [
        [
          [-0.2925, 5.5365],
          [-0.2715, 5.5342],
          [-0.2725, 5.5185],
          [-0.2915, 5.5195],
          [-0.2925, 5.5365],
        ],
      ],
    },
    current_threat_level: 'CRITICAL',
    soil_saturation_pct: 92,
    rain_rate_mmh: 28.0,
    accum_24h_mm: 61.4,
  },
];

/**
 * Checks if a point [lon, lat] is inside a polygon using ray casting algorithm
 */
export function isPointInPolygon(point: [number, number], polygon: [number, number][]): boolean {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0];
    const yi = polygon[i][1];
    const xj = polygon[j][0];
    const yj = polygon[j][1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

export function findCatchmentByLocation(lat: number, lon: number): Catchment | null {
  for (const catchment of ACCRA_CATCHMENTS) {
    if (isPointInPolygon([lon, lat], catchment.boundary.coordinates[0])) {
      return catchment;
    }
  }
  return null;
}

