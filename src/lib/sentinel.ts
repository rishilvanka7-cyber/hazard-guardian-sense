import { supabase } from "@/integrations/supabase/client";

export type RiskTier = "low" | "medium" | "high" | "critical";

export interface HazardZone {
  id: string;
  city_name: string;
  lat: number;
  long: number;
  radius_meters: number;
  risk_tier: RiskTier;
  risk_explanation: string;
  safe_zone_name: string;
  safe_zone_lat: number;
  safe_zone_long: number;
  population: number;
  safe_zone_capacity: number;
}

export const SUPPORTED_CITIES = ["Guwahati", "Mumbai", "Kochi"] as const;

export async function fetchHazardZone(query: string): Promise<HazardZone | null> {
  const term = query.trim();
  if (!term) return null;

  const { data, error } = await supabase
    .from("hazard_zones")
    .select("*")
    .ilike("city_name", `%${term}%`)
    .limit(1);

  if (error) throw error;
  return (data?.[0] as HazardZone | undefined) ?? null;
}

export async function fetchAllHazardZones(): Promise<HazardZone[]> {
  const { data, error } = await supabase.from("hazard_zones").select("*");
  if (error) throw error;
  return (data ?? []) as HazardZone[];
}

/** Great-circle distance in kilometres. */
export function haversineKm(
  aLat: number,
  aLong: number,
  bLat: number,
  bLong: number,
): number {
  const R = 6371;
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLong = toRad(bLong - aLong);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLong / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export const RISK_LABEL: Record<RiskTier, string> = {
  low: "LOW",
  medium: "MEDIUM",
  high: "HIGH",
  critical: "CRITICAL",
};

/** Hex values mirroring the design-system risk tokens, for Leaflet (which needs raw colours). */
export const RISK_HEX: Record<RiskTier, string> = {
  low: "#16a34a",
  medium: "#f59e0b",
  high: "#ea580c",
  critical: "#dc2626",
};

export function riskBadgeClass(tier: RiskTier): string {
  switch (tier) {
    case "low":
      return "bg-risk-low text-risk-low-foreground";
    case "medium":
      return "bg-risk-medium text-risk-medium-foreground";
    case "high":
      return "bg-risk-high text-risk-high-foreground";
    case "critical":
      return "bg-risk-critical text-risk-critical-foreground";
  }
}

/** Mocked accelerometer sample. Swap for the Device Motion API later. */
export function getMotionReading(agitation = 0): { x: number; y: number; z: number } {
  const noise = () => (Math.random() - 0.5) * 2;
  const boost = 1 + agitation * 9;
  return {
    x: +(noise() * 0.35 * boost).toFixed(3),
    y: +(noise() * 0.35 * boost).toFixed(3),
    z: +(9.81 + noise() * 0.3 * boost).toFixed(3),
  };
}

export function getDeviceId(): string {
  if (typeof window === "undefined") return "server";
  const key = "sentinel_device_id";
  let id = window.localStorage.getItem(key);
  if (!id) {
    id = `dev_${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage.setItem(key, id);
  }
  return id;
}
