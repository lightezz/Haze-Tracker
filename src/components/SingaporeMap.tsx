import { useState } from 'react';
import type { RegionId, SingaporePsiSnapshot } from '../types/psi';
import { getPm25HourlyBand, getPsiBand, PSI_BANDS } from '../utils/psiBands';

interface SingaporeMapProps {
  snapshot: SingaporePsiSnapshot;
  selectedRegion: RegionId;
  onSelectRegion: (regionId: RegionId) => void;
}

type MapMetricMode = 'psi24h' | 'pm25_1h';

interface RegionGeometry {
  id: RegionId;
  path: string;
  markerX: number;
  markerY: number;
  labelSubtitle: string;
}

const REGION_GEOMETRIES: RegionGeometry[] = [
  {
    id: 'west',
    path: 'M 64,252 L 82,216 L 122,192 L 154,142 L 182,110 L 216,120 L 244,160 L 270,210 L 278,262 L 265,296 L 212,292 L 156,282 L 96,268 Z',
    markerX: 180,
    markerY: 215,
    labelSubtitle: 'Jurong · Tuas',
  },
  {
    id: 'north',
    path: 'M 182,110 L 222,92 L 278,74 L 328,72 L 382,84 L 442,98 L 494,124 L 468,162 L 424,174 L 366,174 L 316,170 L 276,184 L 244,160 L 216,120 Z',
    markerX: 342,
    markerY: 125,
    labelSubtitle: 'Woodlands · Yishun',
  },
  {
    id: 'central',
    path: 'M 244,160 L 276,184 L 316,170 L 366,174 L 424,174 L 468,162 L 478,205 L 472,248 L 440,268 L 382,268 L 326,262 L 278,262 L 270,210 Z',
    markerX: 374,
    markerY: 218,
    labelSubtitle: 'Bishan · Orchard',
  },
  {
    id: 'south',
    path: 'M 265,296 L 278,262 L 326,262 L 382,268 L 440,268 L 472,248 L 494,274 L 456,294 L 418,312 L 368,322 L 318,312 Z',
    markerX: 376,
    markerY: 294,
    labelSubtitle: 'Marina · Queenstown',
  },
  {
    id: 'east',
    path: 'M 468,162 L 494,124 L 548,136 L 604,154 L 664,176 L 678,196 L 642,228 L 584,254 L 522,266 L 494,274 L 472,248 L 478,205 Z',
    markerX: 568,
    markerY: 204,
    labelSubtitle: 'Tampines · Changi',
  },
];

export function SingaporeMap({
  snapshot,
  selectedRegion,
  onSelectRegion,
}: SingaporeMapProps) {
  const [metricMode, setMetricMode] = useState<MapMetricMode>('psi24h');
  const [hoveredRegion, setHoveredRegion] = useState<RegionId | null>(null);

  const activeRegion = hoveredRegion ?? selectedRegion;
  const activeReading = snapshot.regions[activeRegion];

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 bg-white">
      {/* Map Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-900">
            Regional Air Quality Map
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Select a region to inspect NEA sub-indices and 24-hour curve
          </p>
        </div>

        {/* Metric Layer Toggle */}
        <div
          role="group"
          aria-label="Map metric layer"
          className="flex items-center gap-1 rounded-lg bg-slate-100 p-1"
        >
          <button
            type="button"
            onClick={() => setMetricMode('psi24h')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              metricMode === 'psi24h'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            24h PSI
          </button>
          <button
            type="button"
            onClick={() => setMetricMode('pm25_1h')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              metricMode === 'pm25_1h'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            1h PM2.5
          </button>
        </div>
      </div>

      {/* Interactive SVG Map Stage */}
      <div className="relative bg-slate-50/70 px-3 pt-4 pb-3 sm:px-5">
        <svg
          viewBox="0 0 740 410"
          role="img"
          aria-label="Interactive regional PSI map of Singapore"
          className="h-auto w-full select-none"
        >
          <defs>
            <pattern
              id="sg-grid"
              width="40"
              height="40"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 40 0 L 0 0 0 40"
                fill="none"
                stroke="#E2E8F0"
                strokeWidth="0.7"
              />
            </pattern>
            <marker
              id="wind-arrow"
              viewBox="0 0 10 10"
              refX="6"
              refY="5"
              markerWidth="5"
              markerHeight="5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#64748B" />
            </marker>
          </defs>

          {/* Subtle coordinate grid */}
          <rect width="740" height="410" fill="url(#sg-grid)" rx="8" />

          {/* Latitude / Longitude reference ticks */}
          <text x="14" y="92" className="fill-slate-400 font-mono text-[10px]">
            1.40°N
          </text>
          <text x="14" y="218" className="fill-slate-400 font-mono text-[10px]">
            1.35°N
          </text>
          <text x="14" y="344" className="fill-slate-400 font-mono text-[10px]">
            1.28°N
          </text>
          <text x="176" y="396" className="fill-slate-400 font-mono text-[10px]">
            103.70°E
          </text>
          <text x="366" y="396" className="fill-slate-400 font-mono text-[10px]">
            103.82°E
          </text>
          <text x="556" y="396" className="fill-slate-400 font-mono text-[10px]">
            103.94°E
          </text>

          {/* Sea Labels */}
          <text
            x="338"
            y="46"
            textAnchor="middle"
            className="fill-slate-400 font-sans text-[11px] tracking-widest uppercase"
          >
            Johor Strait
          </text>
          <text
            x="456"
            y="372"
            textAnchor="middle"
            className="fill-slate-400 font-sans text-[11px] tracking-widest uppercase"
          >
            Singapore Strait
          </text>

          {/* Offshore Islands: Pulau Ubin, Pulau Tekong, Jurong Island, Sentosa */}
          <g fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1">
            {/* Pulau Ubin */}
            <path d="M 526,112 L 566,102 L 602,110 L 598,124 L 552,126 L 528,122 Z" />
            {/* Pulau Tekong */}
            <path d="M 624,114 L 664,96 L 696,114 L 692,146 L 656,154 L 628,136 Z" />
            {/* Jurong Island */}
            <path d="M 122,314 L 188,308 L 238,324 L 222,354 L 166,356 L 128,336 Z" />
            {/* Sentosa */}
            <path d="M 332,340 L 384,344 L 394,358 L 352,362 L 326,352 Z" />
          </g>

          <text x="564" y="96" textAnchor="middle" className="fill-slate-400 text-[9px]">
            Pulau Ubin
          </text>
          <text x="662" y="166" textAnchor="middle" className="fill-slate-400 text-[9px]">
            Tekong
          </text>
          <text x="178" y="370" textAnchor="middle" className="fill-slate-400 text-[9px]">
            Jurong Island
          </text>
          <text x="360" y="375" textAnchor="middle" className="fill-slate-400 text-[9px]">
            Sentosa
          </text>

          {/* 5 Interactive Singapore Regions */}
          {REGION_GEOMETRIES.map((geo) => {
            const reading = snapshot.regions[geo.id];
            const psiBand = getPsiBand(reading.psi24h);
            const pm25Band = getPm25HourlyBand(reading.pm25_1h);
            const isSelected = selectedRegion === geo.id;
            const isHovered = hoveredRegion === geo.id;

            const fillHex = psiBand.fillHex;
            const strokeColor = isSelected
              ? '#0F172A'
              : isHovered
                ? '#334155'
                : '#94A3B8';

            return (
              <g
                key={geo.id}
                role="button"
                tabIndex={0}
                aria-label={`${reading.regionName} region: 24h PSI ${reading.psi24h} (${psiBand.label}), 1h PM2.5 ${reading.pm25_1h} µg/m³`}
                onClick={() => onSelectRegion(geo.id)}
                onMouseEnter={() => setHoveredRegion(geo.id)}
                onMouseLeave={() => setHoveredRegion(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectRegion(geo.id);
                  }
                }}
                className="cursor-pointer focus:outline-none"
              >
                <path
                  d={geo.path}
                  fill={fillHex}
                  fillOpacity={isSelected ? 0.92 : isHovered ? 0.78 : 0.62}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 2.2 : 1.1}
                  strokeLinejoin="round"
                  className="transition-all duration-150"
                />

                {/* Region Telemetry Marker */}
                <g transform={`translate(${geo.markerX}, ${geo.markerY})`}>
                  <rect
                    x="-46"
                    y="-27"
                    width="92"
                    height="52"
                    rx="8"
                    fill="#FFFFFF"
                    fillOpacity={isSelected ? 1 : 0.94}
                    stroke={isSelected ? '#0F172A' : '#CBD5E1'}
                    strokeWidth={isSelected ? 1.8 : 1}
                  />
                  <text
                    x="0"
                    y="-10"
                    textAnchor="middle"
                    className="fill-slate-600 font-display text-[10px] font-semibold uppercase tracking-wider"
                  >
                    {reading.regionName}
                  </text>
                  <text
                    x="0"
                    y="10"
                    textAnchor="middle"
                    fill={metricMode === 'psi24h' ? psiBand.dotHex : pm25Band.dotHex}
                    className="font-mono text-[17px] font-bold tabular-nums"
                  >
                    {metricMode === 'psi24h' ? reading.psi24h : reading.pm25_1h}
                  </text>
                  <text
                    x="0"
                    y="21"
                    textAnchor="middle"
                    className="fill-slate-400 font-sans text-[8.5px]"
                  >
                    {metricMode === 'psi24h' ? psiBand.label : 'µg/m³'}
                  </text>
                </g>
              </g>
            );
          })}

          {/* Prevailing Wind Vector Compass (Top Left of Map Canvas) */}
          <g transform="translate(56, 56)">
            <circle
              cx="0"
              cy="0"
              r="24"
              fill="#FFFFFF"
              fillOpacity="0.92"
              stroke="#CBD5E1"
              strokeWidth="1"
            />
            <text
              x="0"
              y="-15"
              textAnchor="middle"
              className="fill-slate-400 font-mono text-[7px] font-semibold"
            >
              N
            </text>
            <g transform={`rotate(${snapshot.wind.directionDegrees})`}>
              <line
                x1="0"
                y1="10"
                x2="0"
                y2="-10"
                stroke="#334155"
                strokeWidth="1.6"
                markerEnd="url(#wind-arrow)"
              />
            </g>
            <text
              x="0"
              y="36"
              textAnchor="middle"
              className="fill-slate-600 font-mono text-[9px] font-medium"
            >
              {snapshot.wind.directionCompass} {snapshot.wind.speedKmh}km/h
            </text>
          </g>
        </svg>

        {/* Bottom Map Caption & Band Legend */}
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-3 text-xs text-slate-600">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-900">
              {activeReading.regionName} Region
            </span>
            <span aria-hidden="true">·</span>
            <span>{activeReading.planningAreas.slice(0, 3).join(', ')}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-500 tabular-nums">
              Visibility {snapshot.wind.visibilityKm.toFixed(1)} km
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3.5 text-[11px] text-slate-600">
            {(['good', 'moderate', 'unhealthy', 'very_unhealthy', 'hazardous'] as const).map(
              (key) => {
                const b = PSI_BANDS[key];
                return (
                  <div key={key} className="flex items-center gap-1.5">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-xs border border-black/10"
                      style={{ backgroundColor: b.dotHex }}
                    />
                    <span>{b.label}</span>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
