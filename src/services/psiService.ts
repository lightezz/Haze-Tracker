import { createScenarioSnapshot, SINGAPORE_REGION_META } from '../data/mockPsiData';
import type {
  HourlyDataPoint,
  RegionalReading,
  RegionId,
  ScenarioId,
  SingaporePsiSnapshot,
} from '../types/psi';
import { getPsiBandKey, REGION_ORDER } from '../utils/psiBands';

export const DATA_GOV_SG_PSI_ENDPOINT =
  'https://api-open.data.gov.sg/v2/real-time/api/psi';

interface ApiRegionMetadata {
  name: RegionId;
  labelLocation: {
    latitude: number;
    longitude: number;
  };
}

interface ApiPsiItem {
  date: string;
  updatedTimestamp: string;
  timestamp: string;
  readings: {
    psi_twenty_four_hourly: Record<string, number>;
    no2_one_hour_max: Record<string, number>;
    pm10_twenty_four_hourly: Record<string, number>;
    pm25_twenty_four_hourly: Record<string, number>;
    pm25_sub_index?: Record<string, number>;
    o3_sub_index: Record<string, number>;
    so2_sub_index: Record<string, number>;
    co_sub_index: Record<string, number>;
  };
}

interface ServerlessPsiPayload {
  ok: boolean;
  source?: string;
  fetchedAt?: string;
  regionMetadata?: ApiRegionMetadata[];
  latest?: ApiPsiItem | null;
  history?: ApiPsiItem[];
  error?: string;
}

function formatSgtDisplayTime(isoString: string): string {
  const dt = new Date(isoString);
  const datePart = dt.toLocaleDateString('en-SG', {
    timeZone: 'Asia/Singapore',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const timePart = dt.toLocaleTimeString('en-SG', {
    timeZone: 'Asia/Singapore',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return `${datePart}, ${timePart} SGT`;
}

function formatSgtHourLabel(isoString: string): string {
  return new Date(isoString).toLocaleTimeString('en-SG', {
    timeZone: 'Asia/Singapore',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function mapApiPayloadToSnapshot(payload: ServerlessPsiPayload): SingaporePsiSnapshot {
  const latest = payload.latest;
  if (!latest) {
    throw new Error('No latest PSI readings returned by /api/psi');
  }

  const history = payload.history && payload.history.length > 0 ? payload.history : [latest];
  const prevItem = history.length >= 2 ? history[history.length - 2] : undefined;

  const coordMap = new Map<RegionId, { lat: number; lng: number }>();
  for (const meta of payload.regionMetadata ?? []) {
    coordMap.set(meta.name, {
      lat: meta.labelLocation.latitude,
      lng: meta.labelLocation.longitude,
    });
  }

  const regions = {} as Record<RegionId, RegionalReading>;
  for (const regionId of REGION_ORDER) {
    const fallbackMeta = SINGAPORE_REGION_META[regionId];
    const currentPsi = latest.readings.psi_twenty_four_hourly[regionId] ?? 0;
    const prevPsi = prevItem?.readings.psi_twenty_four_hourly[regionId] ?? currentPsi;

    regions[regionId] = {
      regionId,
      regionName: fallbackMeta.regionName,
      planningAreas: fallbackMeta.planningAreas,
      coordinates: coordMap.get(regionId) ?? fallbackMeta.coordinates,
      psi24h: currentPsi,
      pm25_24h: latest.readings.pm25_twenty_four_hourly[regionId] ?? 0,
      pm25_1h: null,
      pm25SubIndex: latest.readings.pm25_sub_index?.[regionId] ?? currentPsi,
      pm10_24h: latest.readings.pm10_twenty_four_hourly[regionId] ?? 0,
      o3SubIndex: latest.readings.o3_sub_index[regionId] ?? 0,
      so2SubIndex: latest.readings.so2_sub_index[regionId] ?? 0,
      coSubIndex: latest.readings.co_sub_index[regionId] ?? 0,
      no2_1hMax: latest.readings.no2_one_hour_max[regionId] ?? 0,
      delta1h: currentPsi - prevPsi,
    };
  }

  const psiValues = REGION_ORDER.map((r) => regions[r].psi24h);
  const minPsi = Math.min(...psiValues);
  const maxPsi = Math.max(...psiValues);

  const hourlyHistory: HourlyDataPoint[] = history.map((item) => ({
    hourLabel: formatSgtHourLabel(item.timestamp),
    timestampIso: item.timestamp,
    psi24h: {
      north: item.readings.psi_twenty_four_hourly.north ?? 0,
      south: item.readings.psi_twenty_four_hourly.south ?? 0,
      east: item.readings.psi_twenty_four_hourly.east ?? 0,
      west: item.readings.psi_twenty_four_hourly.west ?? 0,
      central: item.readings.psi_twenty_four_hourly.central ?? 0,
    },
    pm25_24h: {
      north: item.readings.pm25_twenty_four_hourly.north ?? 0,
      south: item.readings.pm25_twenty_four_hourly.south ?? 0,
      east: item.readings.pm25_twenty_four_hourly.east ?? 0,
      west: item.readings.pm25_twenty_four_hourly.west ?? 0,
      central: item.readings.pm25_twenty_four_hourly.central ?? 0,
    },
    pm25_1h: {
      north: null,
      south: null,
      east: null,
      west: null,
      central: null,
    },
  }));

  const timestampIso = latest.updatedTimestamp || latest.timestamp;

  return {
    scenarioId: 'live',
    scenarioLabel: 'Live NEA / data.gov.sg Feed',
    updatedTimestampIso: timestampIso,
    updatedDisplayTime: formatSgtDisplayTime(timestampIso),
    sourceMode: 'live_api',
    nationalRange: {
      min: minPsi,
      max: maxPsi,
      dominantBand: getPsiBandKey(maxPsi),
    },
    wind: null,
    regions,
    hourlyHistory,
  };
}

export async function fetchSingaporePsi(
  scenarioId: ScenarioId = 'live',
): Promise<SingaporePsiSnapshot> {
  if (scenarioId !== 'live') {
    await new Promise((resolve) => setTimeout(resolve, 120));
    return createScenarioSnapshot(scenarioId);
  }

  const response = await fetch('/api/psi', {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`API request failed (${response.status})`);
  }

  const payload = (await response.json()) as ServerlessPsiPayload;
  if (!payload.ok) {
    throw new Error(payload.error || 'Failed to parse live PSI payload');
  }

  return mapApiPayloadToSnapshot(payload);
}

export async function checkApiHealth(): Promise<{
  ok: boolean;
  status: string;
  upstreamReachable?: boolean;
  timestamp: string;
}> {
  const response = await fetch('/api/health?check=upstream', {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Health check failed (${response.status})`);
  }
  return response.json();
}
