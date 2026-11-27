import { X } from 'lucide-react';
import {
  DATA_GOV_SG_PM25_ENDPOINT,
  DATA_GOV_SG_PSI_ENDPOINT,
} from '../services/psiService';

interface ApiIntegrationModalProps {
  open: boolean;
  onClose: () => void;
}

export function ApiIntegrationModal({ open, onClose }: ApiIntegrationModalProps) {
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
            API Integration Readiness
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
            This front-end uses a modular data adapter in{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-900">
              src/services/psiService.ts
            </code>{' '}
            that maps directly onto Singapore&apos;s official NEA / data.gov.sg v2 real-time endpoints.
          </p>

          <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs">
            <div>
              <span className="font-semibold text-slate-800">24-hr PSI &amp; Sub-Indices:</span>
              <div className="mt-1 font-mono text-slate-700 break-all">
                GET {DATA_GOV_SG_PSI_ENDPOINT}
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200/80">
              <span className="font-semibold text-slate-800">1-hr PM2.5 Concentrations:</span>
              <div className="mt-1 font-mono text-slate-700 break-all">
                GET {DATA_GOV_SG_PM25_ENDPOINT}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">Mapping Contract</p>
            <p className="leading-relaxed">
              Update <code className="font-mono text-slate-800">fetchSingaporePsi()</code> to
              transform <code className="font-mono text-slate-800">data.items[0].readings</code>{' '}
              across <code className="font-mono text-slate-800">north</code>,{' '}
              <code className="font-mono text-slate-800">south</code>,{' '}
              <code className="font-mono text-slate-800">east</code>,{' '}
              <code className="font-mono text-slate-800">west</code>, and{' '}
              <code className="font-mono text-slate-800">central</code> into the{' '}
              <code className="font-mono text-slate-800">SingaporePsiSnapshot</code> shape.
            </p>
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
