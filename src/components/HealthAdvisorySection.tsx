import type { SingaporePsiSnapshot } from '../types/psi';
import { getPsiBand, PSI_BANDS } from '../utils/psiBands';

interface HealthAdvisorySectionProps {
  snapshot: SingaporePsiSnapshot;
}

export function HealthAdvisorySection({ snapshot }: HealthAdvisorySectionProps) {
  const activeBand = getPsiBand(snapshot.nationalRange.max);

  return (
    <section
      id="advisories"
      aria-label="NEA Health Advisories and PSI Band Reference"
      className="grid grid-cols-1 gap-6 lg:grid-cols-12"
    >
      {/* Active Health Advisory Card */}
      <div className="lg:col-span-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-base font-semibold text-slate-900">
            MOH / NEA Health Advisory
          </h2>
          <span className={`text-xs font-semibold ${activeBand.textClass}`}>
            {activeBand.symbol} {activeBand.label} ({activeBand.rangeLabel})
          </span>
        </div>

        <p className="mt-2 text-xs text-slate-500">
          Guidance based on peak islandwide 24-hour PSI reading of{' '}
          <span className="font-mono font-semibold text-slate-900 tabular-nums">
            {snapshot.nationalRange.max}
          </span>
          .
        </p>

        <div className="mt-5 divide-y divide-slate-100 border-t border-slate-100">
          <div className="py-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              General Public
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-800">
              {activeBand.generalAdvisory}
            </p>
          </div>
          <div className="pt-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Vulnerable Groups (Elderly, Pregnant, Children, Heart/Lung)
            </h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-800">
              {activeBand.vulnerableAdvisory}
            </p>
          </div>
        </div>
      </div>

      {/* NEA 5-Band Reference Scale */}
      <div className="lg:col-span-7 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="font-display text-base font-semibold text-slate-900">
            Singapore NEA PSI Classification Scale
          </h2>
          <span className="text-xs text-slate-500">24-hour Pollutant Standards Index</span>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                <th className="py-2.5 pr-4">PSI Range</th>
                <th className="py-2.5 px-3">Descriptor</th>
                <th className="py-2.5 pl-3">Recommended Activity Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(
                ['good', 'moderate', 'unhealthy', 'very_unhealthy', 'hazardous'] as const
              ).map((key) => {
                const band = PSI_BANDS[key];
                const isCurrent = band.key === activeBand.key;
                return (
                  <tr
                    key={key}
                    className={isCurrent ? 'bg-slate-50 font-medium' : ''}
                  >
                    <td className="py-3 pr-4 font-mono font-semibold text-slate-900 whitespace-nowrap tabular-nums">
                      {band.rangeLabel}
                    </td>
                    <td className={`py-3 px-3 whitespace-nowrap font-semibold ${band.textClass}`}>
                      {band.symbol} {band.label}
                    </td>
                    <td className="py-3 pl-3 text-slate-600 leading-relaxed">
                      {band.generalAdvisory}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
