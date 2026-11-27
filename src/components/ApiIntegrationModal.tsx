import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import {
  checkApiHealth,
  DATA_GOV_SG_PSI_ENDPOINT,
} from '../services/psiService';

interface ApiIntegrationModalProps {
  open: boolean;
  onClose: () => void;
}

interface HealthState {
  loading: boolean;
  ok?: boolean;
  upstreamReachable?: boolean;
  timestamp?: string;
  error?: string;
}

export function ApiIntegrationModal({ open, onClose }: ApiIntegrationModalProps) {
  const [health, setHealth] = useState<HealthState>({ loading: false });

  const runHealthCheck = async () => {
    setHealth({ loading: true });
    try {
      const res = await checkApiHealth();
      setHealth({
        loading: false,
        ok: res.ok,
        upstreamReachable: res.upstreamReachable,
        timestamp: res.timestamp,
      });
    } catch (err) {
      setHealth({
        loading: false,
        ok: false,
        error: err instanceof Error ? err.message : 'Health check failed',
      });
    }
  };

  useEffect(() => {
    if (open) {
      void runHealthCheck();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[1px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 id="api-modal-title" className="font-display text-base font-semibold text-slate-900">
            Serverless API Connection
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-6 py-5 text-sm text-slate-600">
          <p className="leading-relaxed">
            Live readings are fetched server-side through the root{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-900">
              /api
            </code>{' '}
            serverless endpoints, pulling real-time PSI and 24-hour regional history from{' '}
            <span className="font-medium text-slate-900">data.gov.sg</span>.
          </p>

          <div className="space-y-2.5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs">
            <div>
              <span className="font-semibold text-slate-800">Upstream Source:</span>
              <div className="mt-1 font-mono text-slate-700 break-all">
                GET {DATA_GOV_SG_PSI_ENDPOINT}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200/80">
              <span className="font-semibold text-slate-800">Serverless Routes:</span>
              <div className="mt-1 space-y-1 font-mono text-slate-700">
                <div>GET /api/psi &rarr; /api/psi.ts</div>
                <div>GET /api/health &rarr; /api/health.ts</div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-xs">
            <div className="space-y-0.5">
              <div className="font-semibold text-slate-800">Endpoint Health Verification</div>
              {health.loading ? (
                <div className="text-slate-500">Checking /api/health and upstream data.gov.sg...</div>
              ) : health.error ? (
                <div className="text-rose-700">{health.error}</div>
              ) : health.ok ? (
                <div className="text-emerald-700">
                  ● API Healthy · Upstream data.gov.sg{' '}
                  {health.upstreamReachable ? 'Reachable' : 'Unreachable'}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => void runHealthCheck()}
              disabled={health.loading}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60 transition-colors cursor-pointer"
            >
              Verify Health
            </button>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-100 px-6 py-3.5">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
