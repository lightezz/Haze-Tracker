import { useState } from 'react';
import type { HourlyDataPoint, RegionId } from '../types/psi';
import { REGION_LINE_COLORS, REGION_ORDER } from '../utils/psiBands';
import { SINGAPORE_REGION_META } from '../data/mockPsiData';

interface TrendChartProps {
  hourlyHistory: HourlyDataPoint[];
  selectedRegion: RegionId;
  onSelectRegion: (regionId: RegionId) => void;
}

type TrendMetric = 'psi24h' | 'pm25_24h';

export function TrendChart({
  hourlyHistory,
  selectedRegion,
  onSelectRegion,
}: TrendChartProps) {
  const [metric, setMetric] = useState<TrendMetric>('psi24h');
  const [focusSelectedOnly, setFocusSelectedOnly] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 880;
  const height = 280;
  const padLeft = 46;
  const padRight = 20;
  const padTop = 20;
  const padBottom = 34;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const allValues = hourlyHistory.flatMap((pt) =>
    REGION_ORDER.map((r) => pt[metric][r]),
  );
  const maxDataVal = Math.max(...allValues, metric === 'psi24h' ? 60 : 25);
  const yMax =
    metric === 'psi24h'
      ? Math.max(100, Math.ceil((maxDataVal + 20) / 50) * 50)
      : Math.max(40, Math.ceil((maxDataVal + 10) / 20) * 20);

  const getX = (idx: number) =>
    padLeft + (idx / Math.max(1, hourlyHistory.length - 1)) * plotWidth;
  const getY = (val: number) =>
    padTop + plotHeight - (val / yMax) * plotHeight;

  const thresholdLines =
    metric === 'psi24h'
      ? [
          { val: 50, label: '50 Good', color: '#10B981' },
          { val: 100, label: '100 Moderate', color: '#0284C7' },
          { val: 200, label: '200 Unhealthy', color: '#D97706' },
        ].filter((t) => t.val <= yMax)
      : [
          { val: 35, label: '35 Moderate', color: '#0284C7' },
          { val: 75, label: '75 Elevated', color: '#D97706' },
        ].filter((t) => t.val <= yMax);

  const activeIdx = Math.min(
    hoverIndex ?? hourlyHistory.length - 1,
    Math.max(0, hourlyHistory.length - 1),
  );
  const activePoint = hourlyHistory[activeIdx];

  const visibleRegions = focusSelectedOnly ? [selectedRegion] : REGION_ORDER;

  return (
    <section
      id="trends"
      aria-label="24-hour regional PSI and PM2.5 trend"
      className="rounded-xl border border-slate-200 bg-white"
    >
      {/* Chart Header & Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            24-Hour Regional Trend
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Hover across timestamps to inspect hourly progression · Highlighted:{' '}
            <span className="font-semibold text-slate-800">
              {SINGAPORE_REGION_META[selectedRegion].regionName}
            </span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFocusSelectedOnly((prev) => !prev)}
            aria-pressed={focusSelectedOnly}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              focusSelectedOnly
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
          >
            {focusSelectedOnly ? 'Selected Region Only' : 'All 5 Regions'}
          </button>

          <div
            role="group"
            aria-label="Trend chart metric"
            className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
          >
            <button
              type="button"
              onClick={() => setMetric('psi24h')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                metric === 'psi24h'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              24h PSI
            </button>
            <button
              type="button"
              onClick={() => setMetric('pm25_24h')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                metric === 'pm25_24h'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              24h PM2.5
            </button>
          </div>
        </div>
      </div>

      {/* Live Scrubbing Readout Strip */}
      {activePoint && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-5 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-500">Time</span>
            <span className="font-mono font-semibold text-slate-900 tabular-nums">
              {activePoint.hourLabel} SGT
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {REGION_ORDER.map((r) => {
              const isSelected = r === selectedRegion;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => onSelectRegion(r)}
                  className={`flex items-center gap-1.5 cursor-pointer transition-opacity ${
                    focusSelectedOnly && !isSelected ? 'opacity-40' : 'opacity-100'
                  }`}
                >
                  <span
                    className="inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: REGION_LINE_COLORS[r] }}
                  />
                  <span
                    className={`${
                      isSelected ? 'font-semibold text-slate-900' : 'text-slate-600'
                    }`}
                  >
                    {SINGAPORE_REGION_META[r].regionName}
                  </span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {activePoint[metric][r]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* SVG Line Chart */}
      <div className="px-4 py-4 sm:px-5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="24-hour line chart of Singapore regional air quality"
          className="h-auto w-full cursor-crosshair select-none"
          onMouseLeave={() => setHoverIndex(null)}
        >
          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const val = Math.round(yMax * ratio);
            const y = getY(val);
            return (
              <g key={ratio}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="fill-slate-400 font-mono text-[10px] tabular-nums"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* NEA Reference Threshold Lines */}
          {thresholdLines.map((t) => {
            const y = getY(t.val);
            return (
              <g key={t.val}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={width - padRight}
                  y2={y}
                  stroke={t.color}
                  strokeOpacity="0.45"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={width - padRight}
                  y={y - 4}
                  textAnchor="end"
                  fill={t.color}
                  className="font-mono text-[9.5px] font-medium"
                >
                  {t.label}
                </text>
              </g>
            );
          })}

          {/* X-axis timestamps */}
          {hourlyHistory.map((pt, idx) => {
            if (idx % 3 !== 0 && idx !== hourlyHistory.length - 1) return null;
            const x = getX(idx);
            return (
              <text
                key={pt.timestampIso}
                x={x}
                y={height - 10}
                textAnchor="middle"
                className="fill-slate-400 font-mono text-[10px] tabular-nums"
              >
                {pt.hourLabel}
              </text>
            );
          })}

          {/* Vertical Hairline Crosshair */}
          {hourlyHistory.length > 0 && (
            <line
              x1={getX(activeIdx)}
              y1={padTop}
              x2={getX(activeIdx)}
              y2={padTop + plotHeight}
              stroke="#94A3B8"
              strokeWidth="1"
              strokeDasharray="3 3"
            />
          )}

          {/* Region Curves */}
          {visibleRegions.map((regionId) => {
            const isSelected = regionId === selectedRegion;
            const color = REGION_LINE_COLORS[regionId];
            const d = hourlyHistory
              .map((pt, idx) => {
                const cmd = idx === 0 ? 'M' : 'L';
                return `${cmd} ${getX(idx).toFixed(1)},${getY(pt[metric][regionId]).toFixed(1)}`;
              })
              .join(' ');

            return (
              <g key={regionId}>
                <path
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={isSelected ? 2.6 : 1.4}
                  strokeOpacity={isSelected || focusSelectedOnly ? 1 : 0.35}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
                {activePoint && (
                  <circle
                    cx={getX(activeIdx)}
                    cy={getY(activePoint[metric][regionId])}
                    r={isSelected ? 4.5 : 3}
                    fill="#FFFFFF"
                    stroke={color}
                    strokeWidth={isSelected ? 2.4 : 1.5}
                    opacity={isSelected || focusSelectedOnly ? 1 : 0.55}
                  />
                )}
              </g>
            );
          })}

          {/* Hover Scrubbing Hit Zones */}
          {hourlyHistory.map((pt, idx) => {
            const sliceW = plotWidth / Math.max(1, hourlyHistory.length - 1);
            const x = getX(idx) - sliceW / 2;
            return (
              <rect
                key={pt.timestampIso}
                x={Math.max(padLeft, x)}
                y={padTop}
                width={sliceW}
                height={plotHeight}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(idx)}
              />
            );
          })}
        </svg>
      </div>
    </section>
  );
}
