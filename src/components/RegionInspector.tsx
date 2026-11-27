import type { RegionalReading } from '../types/psi';
import {
  getDominantPollutant,
  getPm25HourlyBand,
  getPsiBand,
} from '../utils/psiBands';

interface RegionInspectorProps {
  reading: RegionalReading;
  monsoonPhase: string;
  visibilityKm: number;
}

interface SubIndexRow {
  label: string;
  value: number;
  unit: string;
  maxScale: number;
  note: string;
}

export function RegionInspector({
  reading,
  monsoonPhase,
  visibilityKm,
}: RegionInspectorProps) {
  const psiBand = getPsiBand(reading.psi24h);
  const pm25Band = getPm25HourlyBand(reading.pm25_1h);
  const dominant = getDominantPollutant(reading);

  const subIndices: SubIndexRow[] = [
    {
      label: 'PM2.5 (1-hr)',
      value: reading.pm25_1h,
      unit: 'µg/m³',
      maxScale: 250,
      note: pm25Band.label,
    },
    {
      label: 'PM2.5 (24-hr)',
      value: reading.pm25_24h,
      unit: 'µg/m³',
      maxScale: 200,
      note: 'Fine particulate',
    },
    {
      label: 'PM10 (24-hr)',
      value: reading.pm10_24h,
      unit: 'µg/m³',
      maxScale: 300,
      note: 'Coarse particulate',
    },
    {
      label: 'Ozone (O₃)',
      value: reading.o3SubIndex,
      unit: 'sub-index',
      maxScale: 200,
      note: '8-hr max',
    },
    {
      label: 'SO₂ (24-hr)',
      value: reading.so2SubIndex,
      unit: 'sub-index',
      maxScale: 150,
      note: 'Sulphur dioxide',
    },
    {
      label: 'CO (8-hr)',
      value: reading.coSubIndex,
      unit: 'sub-index',
      maxScale: 100,
      note: 'Carbon monoxide',
    },
    {
      label: 'NO₂ (1-hr max)',
      value: reading.no2_1hMax,
      unit: 'µg/m³',
      maxScale: 200,
      note: 'Nitrogen dioxide',
    },
  ];

  return (
    <aside
      aria-label={`${reading.regionName} region telemetry breakdown`}
      className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white"
    >
      <div>
        {/* Inspector Header */}
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-base font-semibold text-slate-900">
              {reading.regionName} Station Group
            </h2>
            <span className="font-mono text-xs text-slate-400 tabular-nums">
              {reading.coordinates.lat.toFixed(3)}°N, {reading.coordinates.lng.toFixed(3)}°E
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Covers {reading.planningAreas.join(' · ')}
          </p>
        </div>

        {/* Primary PSI & Dominant Pollutant Summary */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 border-b border-slate-100">
          <div className="px-5 py-4">
            <span className="text-xs font-medium text-slate-500">24-hr PSI</span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                {reading.psi24h}
              </span>
              <span className={`text-xs font-semibold ${psiBand.textClass}`}>
                {psiBand.symbol} {psiBand.label}
              </span>
            </div>
          </div>
          <div className="px-5 py-4">
            <span className="text-xs font-medium text-slate-500">
              Dominant Driver
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-2xl font-bold text-slate-900">
                {dominant}
              </span>
              <span className="text-xs text-slate-500 tabular-nums">
                Vis. {visibilityKm.toFixed(1)} km
              </span>
            </div>
          </div>
        </div>

        {/* Pollutant Sub-Index Breakdown */}
        <div className="px-5 py-4">
          <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
            <span className="font-medium text-slate-700">Pollutant Breakdown</span>
            <span>{monsoonPhase}</span>
          </div>

          <div className="space-y-3">
            {subIndices.map((row) => {
              const pct = Math.min(100, Math.max(4, Math.round((row.value / row.maxScale) * 100)));
              const barColor =
                row.label.startsWith('PM2.5 (1-hr)')
                  ? getPm25HourlyBand(row.value).dotHex
                  : psiBand.dotHex;

              return (
                <div key={row.label} className="space-y-1">
                  <div className="flex items-baseline justify-between text-xs">
                    <div className="flex items-baseline gap-2">
                      <span className="font-medium text-slate-800">{row.label}</span>
                      <span className="text-slate-400">{row.note}</span>
                    </div>
                    <div className="font-mono font-semibold text-slate-900 tabular-nums">
                      {row.value}{' '}
                      <span className="font-normal text-[11px] text-slate-400">
                        {row.unit}
                      </span>
                    </div>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all duration-200"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: barColor,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Concise Advisory Note for Selected Region */}
      <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-3.5 text-xs text-slate-600 rounded-b-xl">
        <span className="font-semibold text-slate-800">Regional guidance: </span>
        {psiBand.generalAdvisory}
      </div>
    </aside>
  );
}
