import { useMemo, useState } from 'react';
import { ArrowUpDown, Download, Search } from 'lucide-react';
import type { RegionalReading, RegionId, SingaporePsiSnapshot } from '../types/psi';
import { getDominantPollutant, getPsiBand, REGION_ORDER } from '../utils/psiBands';

interface PollutantMatrixTableProps {
  snapshot: SingaporePsiSnapshot;
  selectedRegion: RegionId;
  onSelectRegion: (regionId: RegionId) => void;
}

type SortKey =
  | 'regionName'
  | 'psi24h'
  | 'pm25_1h'
  | 'pm25_24h'
  | 'pm10_24h'
  | 'o3SubIndex'
  | 'no2_1hMax';

export function PollutantMatrixTable({
  snapshot,
  selectedRegion,
  onSelectRegion,
}: PollutantMatrixTableProps) {
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('psi24h');
  const [sortDesc, setSortDesc] = useState(true);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list: RegionalReading[] = REGION_ORDER.map((id) => snapshot.regions[id]);

    const filtered = q
      ? list.filter(
          (r) =>
            r.regionName.toLowerCase().includes(q) ||
            r.planningAreas.some((area) => area.toLowerCase().includes(q)),
        )
      : list;

    return [...filtered].sort((a, b) => {
      if (sortKey === 'regionName') {
        return sortDesc
          ? b.regionName.localeCompare(a.regionName)
          : a.regionName.localeCompare(b.regionName);
      }
      return sortDesc ? b[sortKey] - a[sortKey] : a[sortKey] - b[sortKey];
    });
  }, [snapshot, query, sortKey, sortDesc]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDesc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortDesc(key !== 'regionName');
    }
  };

  const handleExportCsv = () => {
    const headers = [
      'Region',
      'Planning Areas',
      '24h PSI',
      'NEA Band',
      '1h PM2.5 (ug/m3)',
      '24h PM2.5 (ug/m3)',
      '24h PM10 (ug/m3)',
      'O3 Sub-Index',
      'SO2 Sub-Index',
      'CO Sub-Index',
      'NO2 1h Max (ug/m3)',
      'Timestamp',
    ];
    const lines = rows.map((r) => [
      r.regionName,
      `"${r.planningAreas.join(', ')}"`,
      r.psi24h,
      getPsiBand(r.psi24h).label,
      r.pm25_1h,
      r.pm25_24h,
      r.pm10_24h,
      r.o3SubIndex,
      r.so2SubIndex,
      r.coSubIndex,
      r.no2_1hMax,
      snapshot.updatedTimestampIso,
    ]);
    const csv = [headers.join(','), ...lines.map((l) => l.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `singapore-psi-${snapshot.scenarioId}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section
      aria-label="Regional pollutant comparison matrix"
      className="rounded-xl border border-slate-200 bg-white"
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            Regional Sub-Index Matrix
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Filter by region or town name (e.g. Tampines, Jurong, Woodlands)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter region or town..."
              aria-label="Filter region or planning area"
              className="w-56 rounded-lg border border-slate-200 bg-slate-50/60 py-1.5 pl-8 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download aria-hidden="true" className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">
                <button
                  type="button"
                  onClick={() => handleSort('regionName')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  Region
                  <ArrowUpDown aria-hidden="true" className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3">Planning Areas</th>
              <th className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('psi24h')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  24h PSI
                  <ArrowUpDown aria-hidden="true" className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3">Band</th>
              <th className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('pm25_1h')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  1h PM2.5
                  <ArrowUpDown aria-hidden="true" className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('pm25_24h')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  24h PM2.5
                  <ArrowUpDown aria-hidden="true" className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('pm10_24h')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  PM10
                  <ArrowUpDown aria-hidden="true" className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('o3SubIndex')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  O₃
                  <ArrowUpDown aria-hidden="true" className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => handleSort('no2_1hMax')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  NO₂
                  <ArrowUpDown aria-hidden="true" className="h-3 w-3" />
                </button>
              </th>
              <th className="px-5 py-3 text-right">Driver</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-5 py-10 text-center text-slate-500">
                  No Singapore region or planning area matches &ldquo;{query}&rdquo;.{' '}
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    className="font-medium text-slate-900 underline underline-offset-4 cursor-pointer"
                  >
                    Clear filter
                  </button>
                </td>
              </tr>
            ) : (
              rows.map((r) => {
                const band = getPsiBand(r.psi24h);
                const isSelected = r.regionId === selectedRegion;
                return (
                  <tr
                    key={r.regionId}
                    onClick={() => onSelectRegion(r.regionId)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/70'
                    }`}
                  >
                    <td className="px-5 py-3 font-display font-semibold text-slate-900 whitespace-nowrap">
                      {r.regionName}
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {r.planningAreas.join(', ')}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                      {r.psi24h}
                    </td>
                    <td className={`px-4 py-3 font-medium whitespace-nowrap ${band.textClass}`}>
                      {band.symbol} {band.label}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-800 tabular-nums">
                      {r.pm25_1h} <span className="text-slate-400">µg/m³</span>
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums">
                      {r.pm25_24h}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums">
                      {r.pm10_24h}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums">
                      {r.o3SubIndex}
                    </td>
                    <td className="px-4 py-3 text-right font-mono text-slate-700 tabular-nums">
                      {r.no2_1hMax}
                    </td>
                    <td className="px-5 py-3 text-right font-mono font-medium text-slate-700">
                      {getDominantPollutant(r)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
