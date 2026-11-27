interface HeaderProps {
  onOpenApiModal: () => void;
}

export function Header({ onOpenApiModal }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-8 px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Zone 1: Single-element brand wordmark */}
        <a
          href="#overview"
          className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
        >
          SG Haze Watch
        </a>

        {/* Zone 2: Clean single-line navigation links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <a
            href="#overview"
            className="whitespace-nowrap shrink-0 py-1 hover:text-slate-900 hover:underline underline-offset-4 decoration-slate-300 transition-colors"
          >
            Overview
          </a>
          <a
            href="#regional-map"
            className="whitespace-nowrap shrink-0 py-1 hover:text-slate-900 hover:underline underline-offset-4 decoration-slate-300 transition-colors"
          >
            Regional Map
          </a>
          <a
            href="#trends"
            className="whitespace-nowrap shrink-0 py-1 hover:text-slate-900 hover:underline underline-offset-4 decoration-slate-300 transition-colors"
          >
            24h Trends
          </a>
          <a
            href="#advisories"
            className="whitespace-nowrap shrink-0 py-1 hover:text-slate-900 hover:underline underline-offset-4 decoration-slate-300 transition-colors"
          >
            Advisories
          </a>
        </nav>

        {/* Zone 3: Single primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenApiModal}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 active:bg-slate-950 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            API Hookup
          </button>
        </div>
      </div>
    </header>
  );
}
