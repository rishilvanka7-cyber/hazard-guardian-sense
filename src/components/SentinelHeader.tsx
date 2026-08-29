import { Link } from "@tanstack/react-router";

export function ShieldMark({ className = "h-8 w-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path
        d="M16 2.5 27 6.5v9.2c0 7-4.6 12.1-11 14.3-6.4-2.2-11-7.3-11-14.3V6.5L16 2.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <circle cx="16" cy="16" r="2.2" fill="currentColor" />
      <circle cx="16" cy="16" r="6" fill="none" stroke="currentColor" strokeWidth="1.4" opacity="0.7" />
      <path d="M16 16 22 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.9" />
    </svg>
  );
}

export function SentinelHeader({ subtitle }: { subtitle?: string }) {
  return (
    <header className="sticky top-0 z-30 border-b border-border/70 bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <ShieldMark className="h-7 w-7" />
          <span className="text-lg font-semibold tracking-tight">Sentinel</span>
        </Link>
        {subtitle ? (
          <span className="ml-auto text-right text-xs font-medium uppercase tracking-wider opacity-80">
            {subtitle}
          </span>
        ) : null}
      </div>
    </header>
  );
}

export function SentinelFooter() {
  return (
    <p className="px-4 pb-10 pt-8 text-center text-xs text-muted-foreground">
      Data sourced from NDMA, GSI &amp; CWC hazard datasets
    </p>
  );
}
