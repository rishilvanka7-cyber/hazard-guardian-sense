import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ClientOnly } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useState } from "react";
import { ArrowRight, MapPin, Pencil } from "lucide-react";
import { SentinelFooter, SentinelHeader } from "@/components/SentinelHeader";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  fetchHazardZone,
  haversineKm,
  riskBadgeClass,
  RISK_LABEL,
  type HazardZone,
} from "@/lib/sentinel";

const HazardMap = lazy(() => import("@/components/HazardMap"));

export const Route = createFileRoute("/risk/$city")({
  head: ({ params }) => {
    const name = decodeURIComponent(params.city);
    return {
      meta: [
        { title: `${name} hazard risk assessment — Sentinel` },
        {
          name: "description",
          content: `Risk tier, hazard radius, nearest safe zone and carrying capacity for ${name}.`,
        },
        { property: "og:title", content: `${name} hazard risk assessment — Sentinel` },
        {
          property: "og:description",
          content: `Risk tier, hazard radius, nearest safe zone and carrying capacity for ${name}.`,
        },
      ],
    };
  },
  component: RiskDashboard,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-destructive">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-6 text-sm">No hazard data found.</div>,
});

const CHECKLIST = [
  "Maintain an emergency kit (water, torch, first-aid supplies, essential documents)",
  "Identify at least two evacuation routes from the residence",
  "Record local disaster management helpline numbers",
  "Ascertain the structural risk classification of the residential building",
  "Register with the local disaster management authority if situated in a high-risk zone",
];

function RiskDashboard() {
  const { city } = Route.useParams();
  const decoded = decodeURIComponent(city);
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [term, setTerm] = useState(decoded);

  const { data, isPending, error } = useQuery({
    queryKey: ["hazard-zone", decoded],
    queryFn: () => fetchHazardZone(decoded),
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SentinelHeader subtitle="Risk assessment" />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 pt-4">
        <section className="surface-card p-4">
          {editing ? (
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!term.trim()) return;
                setEditing(false);
                navigate({ to: "/risk/$city", params: { city: term.trim() } });
              }}
            >
              <Input value={term} onChange={(e) => setTerm(e.target.value)} className="h-10" />
              <Button type="submit" className="h-10">
                Assess
              </Button>
            </form>
          ) : (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <h1 className="text-lg font-semibold tracking-tight">
                {data?.city_name ?? decoded}
              </h1>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <Pencil className="h-3.5 w-3.5" /> Change location
              </button>
            </div>
          )}
        </section>

        {isPending ? (
          <p className="px-1 text-sm text-muted-foreground">Loading hazard assessment…</p>
        ) : error ? (
          <p className="px-1 text-sm text-destructive">Unable to load hazard data.</p>
        ) : !data ? (
          <section className="surface-card p-5">
            <h2 className="text-base font-semibold">No assessment available</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              No hazard dataset matches &ldquo;{decoded}&rdquo;. Assessed habitations in this
              demonstration build: Guwahati, Mumbai and Kochi.
            </p>
            <Link to="/" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
              ← Back to search
            </Link>
          </section>
        ) : (
          <Dashboard zone={data} />
        )}
      </main>
      <SentinelFooter />
    </div>
  );
}

function Dashboard({ zone }: { zone: HazardZone }) {
  const [checked, setChecked] = useState<boolean[]>(() => CHECKLIST.map(() => false));
  const distanceKm = haversineKm(zone.lat, zone.long, zone.safe_zone_lat, zone.safe_zone_long);
  const coverage = Math.round((zone.safe_zone_capacity / zone.population) * 100);
  const done = checked.filter(Boolean).length;

  return (
    <>
      <section className={`rounded-xl p-5 shadow-[var(--shadow-raised)] ${riskBadgeClass(zone.risk_tier)}`}>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-85">
          Assessed risk tier
        </p>
        <p className="mt-1 text-4xl font-bold tracking-tight">{RISK_LABEL[zone.risk_tier]}</p>
        <p className="mt-3 text-sm leading-relaxed opacity-95">{zone.risk_explanation}</p>
      </section>

      <section className="surface-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Hazard radius &amp; nearest safe zone</h2>
          <span className="text-xs text-muted-foreground">
            {(zone.radius_meters / 1000).toFixed(1)} km radius
          </span>
        </div>
        <ClientOnly fallback={<div className="h-[320px] w-full animate-pulse bg-muted" />}>
          <Suspense fallback={<div className="h-[320px] w-full animate-pulse bg-muted" />}>
            <HazardMap zone={zone} />
          </Suspense>
        </ClientOnly>
        <div className="px-4 py-3 text-sm">
          <span className="font-medium">{zone.safe_zone_name}</span>
          <span className="text-muted-foreground"> — {distanceKm.toFixed(2)} km away</span>
        </div>
      </section>

      <section className="surface-card p-4">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold">Evacuation Readiness</h2>
          <span className="text-xs text-muted-foreground">{done}/5 complete</span>
        </div>
        <ul className="mt-3 space-y-3">
          {CHECKLIST.map((item, i) => (
            <li key={item} className="flex items-start gap-3">
              <Checkbox
                id={`chk-${i}`}
                checked={checked[i]}
                onCheckedChange={(v) =>
                  setChecked((prev) => prev.map((c, idx) => (idx === i ? v === true : c)))
                }
                className="mt-0.5"
              />
              <label
                htmlFor={`chk-${i}`}
                className={`text-sm leading-snug ${checked[i] ? "text-muted-foreground line-through" : "text-foreground"}`}
              >
                {item}
              </label>
            </li>
          ))}
        </ul>
      </section>

      <section className="surface-card p-4">
        <h2 className="text-sm font-semibold">Carrying Capacity</h2>
        <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full ${coverage >= 80 ? "bg-safe" : coverage >= 50 ? "bg-risk-medium" : "bg-risk-critical"}`}
            style={{ width: `${Math.min(coverage, 100)}%` }}
            role="progressbar"
            aria-valuenow={coverage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Safe zone capacity as a share of local population"
          />
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Safe zone capacity: <span className="font-semibold text-foreground">{coverage}%</span> of
          local population ({zone.safe_zone_capacity.toLocaleString("en-IN")} of{" "}
          {zone.population.toLocaleString("en-IN")}) —{" "}
          {coverage >= 80
            ? "capacity is broadly adequate; maintain periodic review."
            : "contingency planning for overflow shelters is advised."}
        </p>
      </section>

      <Link
        to="/sentinel/$city"
        params={{ city: zone.city_name }}
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-[var(--shadow-card)] transition-opacity hover:opacity-90"
      >
        Enable Sentinel Mode <ArrowRight className="h-4 w-4" />
      </Link>
    </>
  );
}
