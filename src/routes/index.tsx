import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { LocateFixed, Search } from "lucide-react";
import { ShieldMark, SentinelFooter } from "@/components/SentinelHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { fetchAllHazardZones, haversineKm, SUPPORTED_CITIES } from "@/lib/sentinel";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sentinel — Hazard Risk & Community Early Warning" },
      {
        name: "description",
        content:
          "Check hazard risk tiers, safe zones and evacuation readiness for your habitation, and monitor live community anomaly signals.",
      },
      { property: "og:title", content: "Sentinel — Know your risk. Sense what's happening now." },
      {
        property: "og:description",
        content:
          "Location-based hazard red-zone identification, carrying capacity assessment and community early warning.",
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  const navigate = useNavigate();
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const go = (city: string) => {
    if (!city.trim()) return;
    navigate({ to: "/risk/$city", params: { city: city.trim() } });
  };

  const useMyLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("Geolocation is not supported on this device.");
      return;
    }
    setLocating(true);
    setStatus("Acquiring location…");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const zones = await fetchAllHazardZones();
          let nearest = zones[0];
          let best = Number.POSITIVE_INFINITY;
          for (const z of zones) {
            const d = haversineKm(pos.coords.latitude, pos.coords.longitude, z.lat, z.long);
            if (d < best) {
              best = d;
              nearest = z;
            }
          }
          if (!nearest) {
            setStatus("No hazard zone data available.");
            setLocating(false);
            return;
          }
          setStatus(`Nearest assessed habitation: ${nearest.city_name} (${best.toFixed(0)} km)`);
          setValue(nearest.city_name);
          go(nearest.city_name);
        } catch {
          setStatus("Could not load hazard data. Please try again.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setStatus(
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. Enter an address instead."
            : "Unable to determine your location.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 },
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="mx-auto w-full max-w-xl flex-1 px-5 pt-14">
        <div className="flex items-center gap-3 text-primary">
          <ShieldMark className="h-11 w-11" />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Sentinel</h1>
            <p className="text-sm text-muted-foreground">
              Know your risk. Sense what&apos;s happening now.
            </p>
          </div>
        </div>

        <div className="mt-8 surface-card p-5">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              go(value);
            }}
          >
            <label htmlFor="address" className="text-sm font-medium text-foreground">
              Enter your address
            </label>
            <div className="mt-2 flex gap-2">
              <Input
                id="address"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="e.g. Kurla, Mumbai"
                autoComplete="street-address"
                className="h-11"
              />
              <Button type="submit" size="lg" className="h-11 px-4" aria-label="Assess risk">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          <Button
            type="button"
            variant="outline"
            className="mt-3 h-11 w-full"
            onClick={useMyLocation}
            disabled={locating}
          >
            <LocateFixed className="mr-2 h-4 w-4" />
            {locating ? "Locating…" : "Use My Current Location"}
          </Button>

          {status ? <p className="mt-3 text-xs text-muted-foreground">{status}</p> : null}

          <div className="mt-5">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Assessed habitations
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SUPPORTED_CITIES.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setValue(city);
                    go(city);
                  }}
                  className="rounded-lg border border-border bg-secondary px-3.5 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-accent"
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
          Sentinel assesses hazard-based red zones, safe-zone carrying capacity and immediate
          relocation needs for vulnerable habitations.
        </p>
      </main>
      <SentinelFooter />
    </div>
  );
}
