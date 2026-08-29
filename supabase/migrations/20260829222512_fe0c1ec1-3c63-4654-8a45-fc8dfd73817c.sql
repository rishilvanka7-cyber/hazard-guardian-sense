CREATE TABLE public.hazard_zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city_name text NOT NULL,
  lat float8 NOT NULL,
  long float8 NOT NULL,
  radius_meters int4 NOT NULL DEFAULT 2000,
  risk_tier text NOT NULL CHECK (risk_tier IN ('low','medium','high','critical')),
  risk_explanation text NOT NULL,
  safe_zone_name text NOT NULL,
  safe_zone_lat float8 NOT NULL,
  safe_zone_long float8 NOT NULL,
  population int4 NOT NULL,
  safe_zone_capacity int4 NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.hazard_zones TO anon;
GRANT SELECT ON public.hazard_zones TO authenticated;
GRANT ALL ON public.hazard_zones TO service_role;
ALTER TABLE public.hazard_zones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Hazard zones are publicly readable" ON public.hazard_zones FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.anomaly_pings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lat float8 NOT NULL,
  long float8 NOT NULL,
  intensity float8 NOT NULL DEFAULT 0,
  device_id text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.anomaly_pings TO anon;
GRANT SELECT, INSERT ON public.anomaly_pings TO authenticated;
GRANT ALL ON public.anomaly_pings TO service_role;
ALTER TABLE public.anomaly_pings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anomaly pings are publicly readable" ON public.anomaly_pings FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can submit an anomaly ping" ON public.anomaly_pings FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE INDEX anomaly_pings_created_at_idx ON public.anomaly_pings (created_at DESC);

ALTER TABLE public.anomaly_pings REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anomaly_pings;

INSERT INTO public.hazard_zones (city_name, lat, long, radius_meters, risk_tier, risk_explanation, safe_zone_name, safe_zone_lat, safe_zone_long, population, safe_zone_capacity) VALUES
('Guwahati', 26.1445, 91.7362, 3000, 'high', 'This area carries high flood risk due to its proximity to the Brahmaputra flood plain. Historical records show recurring seasonal inundation during the monsoon months of June to September, compounded by hillside runoff and drainage congestion.', 'Guwahati Community Relief Center', 26.1650, 91.7550, 45000, 28000),
('Mumbai', 19.0728, 72.8826, 2500, 'critical', 'Kurla lies in a low-lying basin along the Mithi river with heavily strained storm-water drainage. The area has a documented history of severe monsoon flooding, including the 2005 deluge, and water logging recurs during high tide combined with heavy rainfall.', 'Kurla Municipal Shelter', 19.0890, 72.8890, 82000, 30000),
('Kochi', 9.9312, 76.2673, 2000, 'medium', 'This area has moderate flood exposure from coastal storm surge and backwater overflow across the Vembanad system. Tidal ingress and monsoon rainfall combine to cause localised waterlogging in low-lying wards.', 'Kochi Coastal Relief Point', 9.9480, 76.2820, 38000, 25000);