import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, ArrowLeft, ShieldCheck, TriangleAlert } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SentinelFooter, SentinelHeader } from "@/components/SentinelHeader";
import { Button } from "@/components/ui/button";
import {
  fetchHazardZone,
  getDeviceId,
  getMotionReading,
  type HazardZone,
} from "@/lib/sentinel";

export const Route = createFileRoute("/sentinel/$city")({
  head: ({ params }) => {
    const name = decodeURIComponent(params.city);
    return {
      meta: [
        { title: `Sentinel Mode — live monitoring for ${name}` },
        {
          name: "description",
          content: `Community-sourced motion monitoring and anomaly corroboration for ${name}.`,
        },
        { property: "og:title", content: `Sentinel Mode — live monitoring for ${name}` },
        {
          property: "og:description",
          content: `Community-sourced motion monitoring and anomaly corroboration for ${name}.`,
        },
      ],
    };
  },
  component: SentinelMode,
  errorComponent: ({ error }) => (
    <div role="alert" className="p-6 text-sm text-destructive">
      {error.message}
    </div>
  ),
  notFoundComponent: () => <div className="p-6 text-sm">Location not found.</div>,
});

const DEGREE_BOX = 0.25; // ~25 km region for corroboration

function SentinelMode() {
  const { city } = Route.useParams();
  const decoded = decodeURIComponent(city);
  const { data: zone } = useQuery({
    queryKey: ["hazard-zone", decoded],
    queryFn: () => fetchHazardZone(decoded),
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SentinelHeader subtitle="Live monitoring" />
      <main className="mx-auto w-full max-w-2xl flex-1 space-y-4 px-4 pt-4">
        <div className="flex items-center gap-2">
          <Link
            to="/risk/$city"
            params={{ city: decoded }}
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Risk dashboard
          </Link>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Sentinel Mode — Live Monitoring</h1>
        {zone ? (
          <Monitor zone={zone} />
        ) : (
          <p className="text-sm text-muted-foreground">Loading monitoring region…</p>
        )}
      </main>
      <SentinelFooter />
    </div>
  );
}

function Monitor({ zone }: { zone: HazardZone }) {
  const [consented, setConsented] = useState(false);
  const [reading, setReading] = useState(() => ({ x: 0, y: 0, z: 9.81 }));
  const [history, setHistory] = useState<number[]>(() => Array(60).fill(0));
  const [anomaly, setAnomaly] = useState(false);
  const [nearbyCount, setNearbyCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const agitationRef = useRef(0);

  const refreshCount = useCallback(async () => {
    const since = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count } = await supabase
      .from("anomaly_pings")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since)
      .gte("lat", zone.lat - DEGREE_BOX)
      .lte("lat", zone.lat + DEGREE_BOX)
      .gte("long", zone.long - DEGREE_BOX)
      .lte("long", zone.long + DEGREE_BOX);
    const n = count ?? 0;
    setNearbyCount(n);
    if (n > 0) setAnomaly(true);
  }, [zone.lat, zone.long]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setConsented(window.localStorage.getItem("sentinel_motion_consent") === "1");
    }
  }, []);

  // Mocked sensor loop — replace getMotionReading() with the Device Motion API.
  useEffect(() => {
    if (!consented) return;
    const id = window.setInterval(() => {
      const next = getMotionReading(agitationRef.current);
      agitationRef.current = Math.max(0, agitationRef.current - 0.04);
      setReading(next);
      setHistory((prev) => [...prev.slice(1), next.x + next.y]);
    }, 300);
    return () => window.clearInterval(id);
  }, [consented]);

  useEffect(() => {
    void refreshCount();
    const channel = supabase
      .channel("anomaly-pings")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "anomaly_pings" },
        () => {
          agitationRef.current = 1;
          void refreshCount();
        },
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshCount]);

  const simulate = async () => {
    setSubmitting(true);
    const { error } = await supabase.from("anomaly_pings").insert({
      lat: zone.lat + (Math.random() - 0.5) * 0.02,
      long: zone.long + (Math.random() - 0.5) * 0.02,
      intensity: +(2 + Math.random() * 3).toFixed(2),
      device_id: getDeviceId(),
    });
    setSubmitting(false);
    if (!error) {
      agitationRef.current = 1;
      setAnomaly(true);
      void refreshCount();
    }
  };

  if (!consented) {
    return (
      <section className="surface-card p-5">
        <h2 className="text-base font-semibold">Enable community sensing</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Sentinel Mode uses your device&apos;s motion sensors to detect unusual local activity —
          such as sustained ground shaking or structural vibration. Readings never leave your
          device; only an anonymous anomaly signal with a coarse location is shared with nearby
          users so warnings can be corroborated in seconds.
        </p>
        <Button
          className="mt-4 h-11 w-full"
          onClick={() => {
            window.localStorage.setItem("sentinel_motion_consent", "1");
            setConsented(true);
          }}
        >
          Enable Motion Sensing
        </Button>
      </section>
    );
  }

  return (
    <>
      {anomaly ? (
        <section className="rounded-xl bg-destructive p-5 text-destructive-foreground shadow-[var(--shadow-raised)]">
          <div className="flex items-center gap-2">
            <TriangleAlert className="h-5 w-5 pulse-dot" />
            <p className="text-base font-bold tracking-tight">Unusual activity detected near you</p>
          </div>
          <p className="mt-2 text-sm opacity-95">
            {nearbyCount} nearby {nearbyCount === 1 ? "device has" : "devices have"} reported
            corroborating signals in the last 5 minutes near {zone.city_name}.
          </p>
          <button
            type="button"
            onClick={() => setAnomaly(false)}
            className="mt-3 text-xs font-medium underline underline-offset-4 opacity-90"
          >
            Dismiss alert
          </button>
        </section>
      ) : (
        <section className="flex items-center gap-2 rounded-xl border border-safe/40 bg-safe/10 p-4 text-safe">
          <ShieldCheck className="h-5 w-5" />
          <p className="text-sm font-semibold">Monitoring — No anomalies detected</p>
        </section>
      )}

      <section className="surface-card p-4">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-semibold">Live sensor readings</h2>
          <span className="ml-auto text-xs text-muted-foreground">300 ms sampling</span>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {(["x", "y", "z"] as const).map((axis) => (
            <div key={axis} className="rounded-lg bg-muted p-3 text-center">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {axis}-axis
              </p>
              <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
                {reading[axis].toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <Waveform values={history} alert={anomaly} />
      </section>

      <section className="rounded-xl border border-dashed border-border bg-muted/50 p-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Demonstration utility
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Inserts a test anomaly ping for this region to exercise the alert path.
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-3"
          onClick={simulate}
          disabled={submitting}
        >
          {submitting ? "Sending…" : "Simulate Anomaly"}
        </Button>
      </section>
    </>
  );
}

function Waveform({ values, alert }: { values: number[]; alert: boolean }) {
  const width = 300;
  const height = 70;
  const max = Math.max(1.2, ...values.map((v) => Math.abs(v)));
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height / 2 - (v / max) * (height / 2 - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="mt-3 h-[70px] w-full rounded-lg bg-muted"
      preserveAspectRatio="none"
      aria-label="Motion waveform"
    >
      <line
        x1="0"
        y1={height / 2}
        x2={width}
        y2={height / 2}
        stroke="currentColor"
        className="text-border"
        strokeWidth="1"
      />
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        className={alert ? "text-destructive" : "text-primary"}
      />
    </svg>
  );
}
