import { supabase } from "@/integrations/supabase/client";

export type AlertSeverity = "advisory" | "watch" | "warning" | "emergency";
export type HazardType =
  | "flood"
  | "earthquake"
  | "landslide"
  | "heatwave"
  | "cyclone"
  | "thunderstorm";

export interface AlertRecord {
  id: string;
  severity: AlertSeverity;
  hazard_type: HazardType;
  area: string;
  city_name: string;
  headline: string;
  description: string;
  issued_at: string;
  expires_at: string | null;
  source: string;
}

export interface Helpline {
  id: string;
  category: string;
  name: string;
  number: string;
  region: string | null;
  sort_order: number;
}

export interface UserPreferences {
  id: string;
  home_location_id: string | null;
  work_location_id: string | null;
  subscribed_locations: string[];
  preferred_language: string;
  notify_sms: boolean;
  notify_push: boolean;
  notify_email: boolean;
}

/** CAP-style alert feed. Seeded demonstration data today; swap this query for a CAP feed later. */
export async function fetchAlerts(): Promise<AlertRecord[]> {
  const { data, error } = await supabase
    .from("alerts")
    .select("*")
    .order("issued_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AlertRecord[];
}

export async function fetchHelplines(): Promise<Helpline[]> {
  const { data, error } = await supabase
    .from("helplines")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Helpline[];
}

export async function fetchRiskExplanation(
  hazardZoneId: string,
  languageCode: string,
): Promise<string | null> {
  const { data, error } = await supabase
    .from("risk_explanation_translations")
    .select("explanation_text")
    .eq("hazard_zone_id", hazardZoneId)
    .eq("language_code", languageCode)
    .maybeSingle();
  if (error) throw error;
  return data?.explanation_text ?? null;
}

export async function fetchPreferences(userId: string): Promise<UserPreferences | null> {
  const { data, error } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as UserPreferences | null) ?? null;
}

export async function savePreferences(
  userId: string,
  patch: Partial<Omit<UserPreferences, "id">>,
): Promise<UserPreferences> {
  const { data, error } = await supabase
    .from("user_preferences")
    .upsert({ id: userId, ...patch, updated_at: new Date().toISOString() })
    .select("*")
    .single();
  if (error) throw error;
  return data as UserPreferences;
}

export interface WeatherNow {
  temperature: number;
  feelsLike: number;
  humidity: number;
  windKph: number;
  description: string;
  icon: string;
}

export class MissingWeatherKeyError extends Error {}

/** Live current conditions from OpenWeatherMap. */
export async function fetchWeather(lat: number, long: number): Promise<WeatherNow> {
  const key = import.meta.env["VITE_OPENWEATHER_API_KEY"] as string | undefined;
  if (!key) throw new MissingWeatherKeyError("missing key");

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=${key}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`);
  const json = (await res.json()) as {
    main: { temp: number; feels_like: number; humidity: number };
    wind: { speed: number };
    weather: { description: string; icon: string }[];
  };

  return {
    temperature: Math.round(json.main.temp),
    feelsLike: Math.round(json.main.feels_like),
    humidity: json.main.humidity,
    windKph: Math.round(json.wind.speed * 3.6),
    description: json.weather?.[0]?.description ?? "",
    icon: json.weather?.[0]?.icon ?? "01d",
  };
}
