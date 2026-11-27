import type { RegionId, SingaporePsiSnapshot } from '../types/psi';
import { getPm25HourlyBand, getPsiBand, REGION_ORDER } from '../utils/psiBands';

interface NationalSummaryStripProps {
  snapshot: SingaporePsiSnapshot;
  selectedRegion: RegionId;
  onSelectRegion: (regionId: RegionId) => void;
}

export function NationalSummaryStrip({
  snapshot,
  selectedRegion,
  onSelectRegion,
}: NationalSummaryStripProps) {
  const nationalBand = getPsiBand(snapshot.nationalRange.max);

  return (
    <section
      aria-label="National and regional PSI summary"
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-6"
    >
      {/* Islandwide Summary Cell */}
      <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Islandwide PSI
          </span>
          <span className={`text-xs font-semibold ${nationalBand.textClass}`}>
            {nationalBand.symbol} {nationalBand.label}
          </span>
        </div>
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="font-mono text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
            {snapshot.nationalRange.min === snapshot.nationalRange.max
              ? snapshot.nationalRange.max
              : `${snapshot.nationalRange.min}–${snapshot.nationalRange.max}`}
          </span>
          <span className="font-mono text-xs text-slate-400">24h</span>
        </div>
        <div className="mt-2.5 flex items-center gap-2 text-xs text-slate-500">
          {snapshot.wind ? (
            <>
              <span>Wind {snapshot.wind.directionCompass}</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{snapshot.wind.speedKmh} km/h</span>
            </>
          ) : (
            <>
              <span>data.gov.sg</span>
              <span aria-hidden="true">·</span>
              <span>5 Regions</span>
            </>
          )}
        </div>
      </div>

      {/* 5 Interactive Regional Cards */}
      {REGION_ORDER.map((regionId) => {
        const reading = snapshot.regions[regionId];
        const band = getPsiBand(reading.psi24h);
        const pm25Display = reading.pm25_1h ?? reading.pm25_24h;
        const pm25Label = reading.pm25_1h !== null ? '1h PM2.5' : '24h PM2.5';
        const pm25Band = getPm25HourlyBand(pm25Display);
        const isSelected = selectedRegion === regionId;
        const deltaPrefix = reading.delta1h > 0 ? '+' : '';

        return (
          <button
            key={regionId}
            type="button"
            onClick={() => onSelectRegion(regionId)}
            aria-pressed={isSelected}
            className={`group flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${
              isSelected
                ? 'border-slate-900 bg-white ring-1 ring-slate-900'
                : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
            }`}
          >
            <div className="flex w-full items-baseline justify-between gap-2">
              <span className="font-display text-sm font-semibold text-slate-900">
                {reading.regionName}
              </span>
              <span className={`text-xs font-semibold ${band.textClass}`}>
                {band.symbol} {band.label}
              </span>
            </div>

            <div className="mt-3 flex items-baseline justify-between gap-2">
              <div className="flex items-baseline gap-1.5">
                <span className="font-mono text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                  {reading.psi24h}
                </span>
                <span className="font-mono text-xs text-slate-400">PSI</span>
              </div>
              <span
                className={`font-mono text-xs tabular-nums ${
                  reading.delta1h > 0
                    ? 'text-amber-700'
                    : reading.delta1h < 0
                      ? 'text-emerald-700'
                      : 'text-slate-400'
                }`}
              >
                {deltaPrefix}
                {reading.delta1h} / 1h
              </span>
            </div>

            <div className="mt-2.5 flex w-full items-center justify-between text-xs text-slate-500">
              <span>{pm25Label}</span>
              <span className={`font-mono font-medium tabular-nums ${pm25Band.textClass}`}>
                {pm25Display} µg/m³
              </span>
            </div>
          </button>
        );
      })}
    </section>
  );
}
