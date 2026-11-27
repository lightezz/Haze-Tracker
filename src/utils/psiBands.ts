import type {
  Pm25HourlyBandKey,
  PollutantReadings,
  PsiBandKey,
  RegionId,
} from '../types/psi';

export interface PsiBandMeta {
  key: PsiBandKey;
  label: string;
  rangeLabel: string;
  textClass: string;
  mutedTextClass: string;
  bgTintClass: string;
  borderClass: string;
  dotHex: string;
  fillHex: string;
  strokeHex: string;
  symbol: string;
  generalAdvisory: string;
  vulnerableAdvisory: string;
}

export const PSI_BANDS: Record<PsiBandKey, PsiBandMeta> = {
  good: {
    key: 'good',
    label: 'Good',
    rangeLabel: '0–50',
    textClass: 'text-emerald-700',
    mutedTextClass: 'text-emerald-600',
    bgTintClass: 'bg-emerald-50/70',
    borderClass: 'border-emerald-200',
    dotHex: '#059669',
    fillHex: '#D1FAE5',
    strokeHex: '#059669',
    symbol: '●',
    generalAdvisory: 'Normal outdoor activities can proceed across all regions.',
    vulnerableAdvisory: 'Normal activities; no special respiratory precautions needed.',
  },
  moderate: {
    key: 'moderate',
    label: 'Moderate',
    rangeLabel: '51–100',
    textClass: 'text-sky-700',
    mutedTextClass: 'text-sky-600',
    bgTintClass: 'bg-sky-50/70',
    borderClass: 'border-sky-200',
    dotHex: '#0284C7',
    fillHex: '#E0F2FE',
    strokeHex: '#0284C7',
    symbol: '●',
    generalAdvisory: 'Normal activities for the general public. Monitor hourly PM2.5 before prolonged sports.',
    vulnerableAdvisory: 'Heart and lung patients should pace strenuous outdoor exertion.',
  },
  unhealthy: {
    key: 'unhealthy',
    label: 'Unhealthy',
    rangeLabel: '101–200',
    textClass: 'text-amber-700',
    mutedTextClass: 'text-amber-600',
    bgTintClass: 'bg-amber-50/80',
    borderClass: 'border-amber-200',
    dotHex: '#D97706',
    fillHex: '#FEF3C7',
    strokeHex: '#D97706',
    symbol: '▲',
    generalAdvisory: 'Reduce prolonged or strenuous outdoor physical exertion.',
    vulnerableAdvisory: 'Elderly, pregnant women, and children should minimise outdoor exertion; keep windows closed.',
  },
  very_unhealthy: {
    key: 'very_unhealthy',
    label: 'Very Unhealthy',
    rangeLabel: '201–300',
    textClass: 'text-orange-700',
    mutedTextClass: 'text-orange-600',
    bgTintClass: 'bg-orange-50/80',
    borderClass: 'border-orange-200',
    dotHex: '#EA580C',
    fillHex: '#FFEDD5',
    strokeHex: '#EA580C',
    symbol: '▲',
    generalAdvisory: 'Avoid prolonged or strenuous outdoor physical exertion. Wear an N95 mask if outdoors for extended periods.',
    vulnerableAdvisory: 'Minimise outdoor exposure and remain indoors with filtered air circulation.',
  },
  hazardous: {
    key: 'hazardous',
    label: 'Hazardous',
    rangeLabel: '> 300',
    textClass: 'text-rose-700',
    mutedTextClass: 'text-rose-600',
    bgTintClass: 'bg-rose-50/80',
    borderClass: 'border-rose-200',
    dotHex: '#DC2626',
    fillHex: '#FEE2E2',
    strokeHex: '#DC2626',
    symbol: '■',
    generalAdvisory: 'Minimise all outdoor activity; keep doors and windows sealed and run air purifiers.',
    vulnerableAdvisory: 'Remain strictly indoors and seek medical guidance promptly if respiratory symptoms appear.',
  },
};

export function getPsiBandKey(psi: number): PsiBandKey {
  if (psi <= 50) return 'good';
  if (psi <= 100) return 'moderate';
  if (psi <= 200) return 'unhealthy';
  if (psi <= 300) return 'very_unhealthy';
  return 'hazardous';
}

export function getPsiBand(psi: number): PsiBandMeta {
  return PSI_BANDS[getPsiBandKey(psi)];
}

export interface Pm25BandMeta {
  key: Pm25HourlyBandKey;
  label: string;
  rangeLabel: string;
  textClass: string;
  dotHex: string;
}

export const PM25_HOURLY_BANDS: Record<Pm25HourlyBandKey, Pm25BandMeta> = {
  normal: {
    key: 'normal',
    label: 'Normal',
    rangeLabel: '0–55 µg/m³',
    textClass: 'text-emerald-700',
    dotHex: '#059669',
  },
  elevated: {
    key: 'elevated',
    label: 'Elevated',
    rangeLabel: '56–150 µg/m³',
    textClass: 'text-amber-700',
    dotHex: '#D97706',
  },
  high: {
    key: 'high',
    label: 'High',
    rangeLabel: '151–250 µg/m³',
    textClass: 'text-orange-700',
    dotHex: '#EA580C',
  },
  very_high: {
    key: 'very_high',
    label: 'Very High',
    rangeLabel: '> 250 µg/m³',
    textClass: 'text-rose-700',
    dotHex: '#DC2626',
  },
};

export function getPm25HourlyBand(pm25: number): Pm25BandMeta {
  if (pm25 <= 55) return PM25_HOURLY_BANDS.normal;
  if (pm25 <= 150) return PM25_HOURLY_BANDS.elevated;
  if (pm25 <= 250) return PM25_HOURLY_BANDS.high;
  return PM25_HOURLY_BANDS.very_high;
}

export function getDominantPollutant(readings: PollutantReadings): string {
  const candidates: Array<{ name: string; score: number }> = [
    { name: 'PM2.5', score: readings.pm25_24h * 1.45 },
    { name: 'PM10', score: readings.pm10_24h * 0.65 },
    { name: 'O₃', score: readings.o3SubIndex },
    { name: 'SO₂', score: readings.so2SubIndex },
    { name: 'CO', score: readings.coSubIndex },
    { name: 'NO₂', score: readings.no2_1hMax * 0.45 },
  ];
  candidates.sort((a, b) => b.score - a.score);
  return candidates[0].name;
}

export const REGION_ORDER: RegionId[] = [
  'central',
  'north',
  'south',
  'east',
  'west',
];

export const REGION_LINE_COLORS: Record<RegionId, string> = {
  central: '#0F172A',
  north: '#0284C7',
  south: '#059669',
  east: '#D97706',
  west: '#7C3AED',
};
