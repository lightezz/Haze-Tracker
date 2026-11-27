import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { ApiIntegrationModal } from './components/ApiIntegrationModal';
import { Header } from './components/Header';
import { HealthAdvisorySection } from './components/HealthAdvisorySection';
import { NationalSummaryStrip } from './components/NationalSummaryStrip';
import { PollutantMatrixTable } from './components/PollutantMatrixTable';
import { RegionInspector } from './components/RegionInspector';
import { SingaporeMap } from './components/SingaporeMap';
import { TrendChart } from './components/TrendChart';
import { createScenarioSnapshot, SCENARIO_OPTIONS } from './data/mockPsiData';
import { fetchSingaporePsi } from './services/psiService';
import type { RegionId, ScenarioId, SingaporePsiSnapshot } from './types/psi';

export default function App() {
  const [scenarioId, setScenarioId] = useState<ScenarioId>('baseline');
  const [selectedRegion, setSelectedRegion] = useState<RegionId>('central');
  const [snapshot, setSnapshot] = useState<SingaporePsiSnapshot>(() =>
    createScenarioSnapshot('baseline'),
  );
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState(false);

  const loadSnapshot = useCallback(async (targetScenario: ScenarioId) => {
    setIsRefreshing(true);
    try {
      const next = await fetchSingaporePsi(targetScenario);
      setSnapshot(next);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadSnapshot(scenarioId);
  }, [scenarioId, loadSnapshot]);

  const activeRegionReading = snapshot.regions[selectedRegion];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header onOpenApiModal={() => setIsApiModalOpen(true)} />

      <main className="mx-auto max-w-[1440px] space-y-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* Overview Header & Workspace Controls */}
        <section
          id="overview"
          className="flex flex-col justify-between gap-4 border-b border-slate-200 pb-6 lg:flex-row lg:items-end"
        >
          <div className="max-w-2xl">
            <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl [text-wrap:balance]">
              Singapore Regional PSI &amp; Haze Tracker
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500">
              <span className="font-mono tabular-nums text-slate-700">
                Updated {snapshot.updatedDisplayTime}
              </span>
              <span aria-hidden="true">·</span>
              <span>5 NEA Monitoring Regions</span>
              <span aria-hidden="true">·</span>
              <span>{snapshot.wind.monsoonPhase}</span>
              <span aria-hidden="true">·</span>
              <span>Front-End Preview Dataset</span>
            </div>
          </div>

          {/* Scenario Preview Switcher & Manual Refresh */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div
              role="group"
              aria-label="Haze scenario preview"
              className="flex flex-wrap items-center gap-1 rounded-lg bg-slate-200/70 p-1"
            >
              {SCENARIO_OPTIONS.map((option) => {
                const active = scenarioId === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setScenarioId(option.id)}
                    aria-pressed={active}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      active
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => void loadSnapshot(scenarioId)}
              disabled={isRefreshing}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 disabled:opacity-60 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RefreshCw
                aria-hidden="true"
                className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              Refresh
            </button>
          </div>
        </section>

        {/* Full-Width 6-Column Islandwide & Regional KPI Strip */}
        <NationalSummaryStrip
          snapshot={snapshot}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
        />

        {/* Primary Focal Split: Interactive Singapore Map + Selected Region Breakdown */}
        <section
          id="regional-map"
          aria-label="Singapore regional map and pollutant inspector"
          className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12"
        >
          <div className="lg:col-span-7">
            <SingaporeMap
              snapshot={snapshot}
              selectedRegion={selectedRegion}
              onSelectRegion={setSelectedRegion}
            />
          </div>
          <div className="lg:col-span-5 flex">
            <div className="w-full flex flex-col">
              <RegionInspector
                reading={activeRegionReading}
                monsoonPhase={snapshot.wind.monsoonPhase}
                visibilityKm={snapshot.wind.visibilityKm}
              />
            </div>
          </div>
        </section>

        {/* 24-Hour Interactive Multi-Region Trend Chart */}
        <TrendChart
          hourlyHistory={snapshot.hourlyHistory}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
        />

        {/* High-Density Regional Comparison Table */}
        <PollutantMatrixTable
          snapshot={snapshot}
          selectedRegion={selectedRegion}
          onSelectRegion={setSelectedRegion}
        />

        {/* MOH / NEA Health Advisories & Classification Scale */}
        <HealthAdvisorySection snapshot={snapshot} />
      </main>

      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-4 px-4 py-5 text-xs text-slate-500 sm:px-6 lg:px-8">
          <span>SG Haze Watch — Singapore Regional PSI &amp; PM2.5 Monitor</span>
          <div className="flex items-center gap-4">
            <span>Aligned with NEA 24-hr PSI &amp; 1-hr PM2.5 bands</span>
            <button
              type="button"
              onClick={() => setIsApiModalOpen(true)}
              className="font-medium text-slate-700 hover:text-slate-900 underline underline-offset-4 cursor-pointer"
            >
              API Integration Guide
            </button>
          </div>
        </div>
      </footer>

      <ApiIntegrationModal
        open={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
      />
    </div>
  );
}
