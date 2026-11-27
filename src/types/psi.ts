export type RegionId = 'north' | 'south' | 'east' | 'west' | 'central';

export type PsiBandKey =
  | 'good'
  | 'moderate'
  | 'unhealthy'
  | 'very_unhealthy'
  | 'hazardous';

export type Pm25HourlyBandKey = 'normal' | 'elevated' | 'high' | 'very_high';

export type ScenarioId =
  | 'live'
  | 'baseline'
  | 'mild_haze'
  | 'elevated_haze'
  | 'severe_haze';

export interface PollutantReadings {
  psi24h: number;
  pm25_24h: number;
  pm25_1h: number | null;
  pm25SubIndex: number;
  pm10_24h: number;
  o3SubIndex: number;
  so2SubIndex: number;
  coSubIndex: number;
  no2_1hMax: number;
}

export interface RegionalReading extends PollutantReadings {
  regionId: RegionId;
  regionName: string;
  planningAreas: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  delta1h: number;
}

export interface HourlyDataPoint {
  hourLabel: string;
  timestampIso: string;
  psi24h: Record<RegionId, number>;
  pm25_24h: Record<RegionId, number>;
  pm25_1h: Record<RegionId, number | null>;
}

export interface WindTelemetry {
  directionCompass: string;
  directionDegrees: number;
  speedKmh: number;
  visibilityKm: number;
  monsoonPhase: string;
}

export interface SingaporePsiSnapshot {
  scenarioId: ScenarioId;
  scenarioLabel: string;
  updatedTimestampIso: string;
  updatedDisplayTime: string;
  sourceMode: 'preview' | 'live_api';
  nationalRange: {
    min: number;
    max: number;
    dominantBand: PsiBandKey;
  };
  wind: WindTelemetry | null;
  regions: Record<RegionId, RegionalReading>;
  hourlyHistory: HourlyDataPoint[];
}
