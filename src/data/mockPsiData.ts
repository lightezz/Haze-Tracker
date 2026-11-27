import type {
  HourlyDataPoint,
  RegionalReading,
  RegionId,
  ScenarioId,
  SingaporePsiSnapshot,
} from '../types/psi';
import { getPsiBandKey } from '../utils/psiBands';

interface RegionMeta {
  regionName: string;
  planningAreas: string[];
  coordinates: { lat: number; lng: number };
}

export const SINGAPORE_REGION_META: Record<RegionId, RegionMeta> = {
  north: {
    regionName: 'North',
    planningAreas: ['Woodlands', 'Yishun', 'Sembawang', 'Mandai', 'Seletar'],
    coordinates: { lat: 1.41803, lng: 103.82 },
  },
  south: {
    regionName: 'South',
    planningAreas: ['Bukit Merah', 'Marina South', 'Queenstown', 'Sentosa'],
    coordinates: { lat: 1.29587, lng: 103.82 },
  },
  east: {
    regionName: 'East',
    planningAreas: ['Tampines', 'Pasir Ris', 'Changi', 'Bedok', 'Paya Lebar'],
    coordinates: { lat: 1.35735, lng: 103.94 },
  },
  west: {
    regionName: 'West',
    planningAreas: ['Jurong West', 'Boon Lay', 'Tuas', 'Choa Chu Kang', 'Clementi'],
    coordinates: { lat: 1.35735, lng: 103.7 },
  },
  central: {
    regionName: 'Central',
    planningAreas: ['Bishan', 'Toa Payoh', 'Ang Mo Kio', 'Novena', 'Orchard'],
    coordinates: { lat: 1.35735, lng: 103.82 },
  },
};

function buildHourlyHistory(
  bases: Record<RegionId, number>,
  pm25Bases: Record<RegionId, number>,
  curveOffsets: number[],
  pm25Offsets: number[],
): HourlyDataPoint[] {
  const now = new Date();
  const points: HourlyDataPoint[] = [];

  for (let i = 23; i >= 0; i--) {
    const dt = new Date(now.getTime() - i * 3600 * 1000);
    dt.setMinutes(0, 0, 0);
    const idx = 23 - i;
    const hourNum = dt.getHours();
    const hourLabel = `${hourNum.toString().padStart(2, '0')}:00`;

    const offset = curveOffsets[idx] ?? 0;
    const pmOffset = pm25Offsets[idx] ?? 0;

    points.push({
      hourLabel,
      timestampIso: dt.toISOString(),
      psi24h: {
        north: Math.max(12, Math.round(bases.north + offset * 0.92)),
        south: Math.max(12, Math.round(bases.south + offset * 1.04)),
        east: Math.max(12, Math.round(bases.east + offset * 0.88)),
        west: Math.max(12, Math.round(bases.west + offset * 1.12)),
        central: Math.max(12, Math.round(bases.central + offset)),
      },
      pm25_1h: {
        north: Math.max(4, Math.round(pm25Bases.north + pmOffset * 0.9)),
        south: Math.max(4, Math.round(pm25Bases.south + pmOffset * 1.05)),
        east: Math.max(4, Math.round(pm25Bases.east + pmOffset * 0.85)),
        west: Math.max(4, Math.round(pm25Bases.west + pmOffset * 1.15)),
        central: Math.max(4, Math.round(pm25Bases.central + pmOffset)),
      },
    });
  }
  return points;
}

function makeRegion(
  regionId: RegionId,
  psi24h: number,
  pm25_24h: number,
  pm25_1h: number,
  pm10_24h: number,
  o3SubIndex: number,
  so2SubIndex: number,
  coSubIndex: number,
  no2_1hMax: number,
  delta1h: number,
): RegionalReading {
  const meta = SINGAPORE_REGION_META[regionId];
  return {
    regionId,
    regionName: meta.regionName,
    planningAreas: meta.planningAreas,
    coordinates: meta.coordinates,
    psi24h,
    pm25_24h,
    pm25_1h,
    pm10_24h,
    o3SubIndex,
    so2SubIndex,
    coSubIndex,
    no2_1hMax,
    delta1h,
  };
}

export const SCENARIO_OPTIONS: Array<{ id: ScenarioId; label: string }> = [
  { id: 'baseline', label: 'Clear Baseline' },
  { id: 'mild_haze', label: 'Moderate Plume' },
  { id: 'elevated_haze', label: 'Unhealthy Episode' },
  { id: 'severe_haze', label: 'Severe Haze' },
];

export function createScenarioSnapshot(scenarioId: ScenarioId): SingaporePsiSnapshot {
  const now = new Date();
  now.setMinutes(0, 0, 0);
  const formattedTime = now.toLocaleTimeString('en-SG', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  const formattedDate = now.toLocaleDateString('en-SG', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (scenarioId === 'mild_haze') {
    const regions: Record<RegionId, RegionalReading> = {
      west: makeRegion('west', 86, 29, 38, 49, 44, 12, 8, 28, 4),
      south: makeRegion('south', 81, 26, 33, 45, 42, 11, 7, 25, 3),
      central: makeRegion('central', 78, 25, 31, 43, 40, 10, 7, 26, 2),
      north: makeRegion('north', 74, 23, 28, 41, 38, 9, 6, 22, 1),
      east: makeRegion('east', 69, 21, 24, 38, 39, 9, 6, 21, -1),
    };
    const curve = [-14, -13, -12, -11, -10, -8, -7, -6, -5, -4, -3, -2, -2, -1, 0, 1, 2, 3, 2, 1, 0, 1, 2, 0];
    const pmCurve = [-10, -9, -8, -7, -5, -4, -2, 0, 2, 3, 5, 6, 5, 4, 3, 4, 6, 8, 7, 5, 3, 2, 1, 0];
    const values = Object.values(regions).map((r) => r.psi24h);
    return {
      scenarioId,
      scenarioLabel: 'Moderate Transboundary Plume',
      updatedTimestampIso: now.toISOString(),
      updatedDisplayTime: `${formattedDate}, ${formattedTime} SGT`,
      sourceMode: 'preview',
      nationalRange: {
        min: Math.min(...values),
        max: Math.max(...values),
        dominantBand: getPsiBandKey(Math.max(...values)),
      },
      wind: {
        directionCompass: 'SW',
        directionDegrees: 225,
        speedKmh: 16,
        visibilityKm: 7.5,
        monsoonPhase: 'Southwest Monsoon Drift',
      },
      regions,
      hourlyHistory: buildHourlyHistory(
        { west: 86, south: 81, central: 78, north: 74, east: 69 },
        { west: 38, south: 33, central: 31, north: 28, east: 24 },
        curve,
        pmCurve,
      ),
    };
  }

  if (scenarioId === 'elevated_haze') {
    const regions: Record<RegionId, RegionalReading> = {
      west: makeRegion('west', 142, 68, 94, 108, 52, 16, 12, 34, 9),
      south: makeRegion('south', 131, 61, 86, 98, 49, 15, 11, 31, 7),
      central: makeRegion('central', 124, 57, 79, 92, 47, 14, 11, 30, 6),
      north: makeRegion('north', 116, 52, 71, 86, 45, 13, 10, 27, 4),
      east: makeRegion('east', 108, 47, 62, 79, 44, 12, 9, 25, 3),
    };
    const curve = [-28, -26, -24, -22, -20, -18, -15, -12, -10, -8, -5, -3, -1, 1, 3, 5, 7, 8, 6, 4, 3, 2, 1, 0];
    const pmCurve = [-24, -22, -19, -16, -14, -10, -6, -2, 3, 8, 12, 15, 14, 11, 9, 12, 16, 18, 14, 10, 7, 5, 3, 0];
    const values = Object.values(regions).map((r) => r.psi24h);
    return {
      scenarioId,
      scenarioLabel: 'Unhealthy Haze Episode',
      updatedTimestampIso: now.toISOString(),
      updatedDisplayTime: `${formattedDate}, ${formattedTime} SGT`,
      sourceMode: 'preview',
      nationalRange: {
        min: Math.min(...values),
        max: Math.max(...values),
        dominantBand: getPsiBandKey(Math.max(...values)),
      },
      wind: {
        directionCompass: 'SSW',
        directionDegrees: 205,
        speedKmh: 19,
        visibilityKm: 3.8,
        monsoonPhase: 'Dry Inter-Monsoon Advection',
      },
      regions,
      hourlyHistory: buildHourlyHistory(
        { west: 142, south: 131, central: 124, north: 116, east: 108 },
        { west: 94, south: 86, central: 79, north: 71, east: 62 },
        curve,
        pmCurve,
      ),
    };
  }

  if (scenarioId === 'severe_haze') {
    const regions: Record<RegionId, RegionalReading> = {
      west: makeRegion('west', 238, 146, 198, 184, 61, 22, 18, 42, 14),
      south: makeRegion('south', 221, 134, 179, 168, 58, 20, 17, 39, 11),
      central: makeRegion('central', 209, 126, 164, 159, 56, 19, 16, 37, 9),
      north: makeRegion('north', 194, 114, 148, 146, 53, 18, 15, 34, 7),
      east: makeRegion('east', 182, 104, 132, 138, 51, 17, 14, 32, 5),
    };
    const curve = [-45, -42, -39, -35, -31, -26, -22, -18, -14, -10, -7, -4, -2, 0, 3, 6, 9, 12, 10, 8, 5, 3, 1, 0];
    const pmCurve = [-48, -42, -36, -30, -24, -18, -10, -4, 4, 12, 18, 24, 22, 16, 14, 18, 26, 30, 22, 16, 10, 6, 3, 0];
    const values = Object.values(regions).map((r) => r.psi24h);
    return {
      scenarioId,
      scenarioLabel: 'Severe Haze Alert',
      updatedTimestampIso: now.toISOString(),
      updatedDisplayTime: `${formattedDate}, ${formattedTime} SGT`,
      sourceMode: 'preview',
      nationalRange: {
        min: Math.min(...values),
        max: Math.max(...values),
        dominantBand: getPsiBandKey(Math.max(...values)),
      },
      wind: {
        directionCompass: 'WSW',
        directionDegrees: 245,
        speedKmh: 22,
        visibilityKm: 1.6,
        monsoonPhase: 'Dense Sumatra Smoke Plume',
      },
      regions,
      hourlyHistory: buildHourlyHistory(
        { west: 238, south: 221, central: 209, north: 194, east: 182 },
        { west: 198, south: 179, central: 164, north: 148, east: 132 },
        curve,
        pmCurve,
      ),
    };
  }

  // Default: Clear Baseline
  const regions: Record<RegionId, RegionalReading> = {
    central: makeRegion('central', 44, 12, 14, 24, 34, 7, 5, 19, -1),
    north: makeRegion('north', 42, 11, 13, 22, 32, 6, 5, 17, 0),
    south: makeRegion('south', 47, 13, 16, 26, 36, 8, 6, 20, 1),
    east: makeRegion('east', 39, 10, 11, 21, 31, 6, 4, 15, -2),
    west: makeRegion('west', 51, 15, 18, 29, 37, 9, 6, 22, 2),
  };
  const curve = [-4, -4, -3, -3, -2, -2, -1, 0, 1, 2, 3, 3, 2, 2, 1, 1, 0, 1, 1, 0, -1, -1, 0, 0];
  const pmCurve = [-3, -3, -2, -2, -1, 0, 1, 2, 3, 4, 3, 2, 2, 1, 1, 2, 3, 2, 1, 0, -1, -1, 0, 0];
  const values = Object.values(regions).map((r) => r.psi24h);
  return {
    scenarioId: 'baseline',
    scenarioLabel: 'Clear Baseline',
    updatedTimestampIso: now.toISOString(),
    updatedDisplayTime: `${formattedDate}, ${formattedTime} SGT`,
    sourceMode: 'preview',
    nationalRange: {
      min: Math.min(...values),
      max: Math.max(...values),
      dominantBand: getPsiBandKey(Math.max(...values)),
    },
    wind: {
      directionCompass: 'SSE',
      directionDegrees: 158,
      speedKmh: 12,
      visibilityKm: 18.0,
      monsoonPhase: 'Light Maritime Breeze',
    },
    regions,
    hourlyHistory: buildHourlyHistory(
      { central: 44, north: 42, south: 47, east: 39, west: 51 },
      { central: 14, north: 13, south: 16, east: 11, west: 18 },
      curve,
      pmCurve,
    ),
  };
}
