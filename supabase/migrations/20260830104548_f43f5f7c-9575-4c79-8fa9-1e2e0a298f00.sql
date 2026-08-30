
CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  home_location_id uuid REFERENCES public.hazard_zones(id) ON DELETE SET NULL,
  work_location_id uuid REFERENCES public.hazard_zones(id) ON DELETE SET NULL,
  subscribed_locations uuid[] NOT NULL DEFAULT '{}',
  preferred_language text NOT NULL DEFAULT 'en',
  notify_sms boolean NOT NULL DEFAULT false,
  notify_push boolean NOT NULL DEFAULT false,
  notify_email boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_preferences TO authenticated;
GRANT ALL ON public.user_preferences TO service_role;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own preferences" ON public.user_preferences
  FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE TABLE public.alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  severity text NOT NULL CHECK (severity IN ('advisory','watch','warning','emergency')),
  hazard_type text NOT NULL CHECK (hazard_type IN ('flood','earthquake','landslide','heatwave','cyclone','thunderstorm')),
  area text NOT NULL,
  city_name text NOT NULL,
  headline text NOT NULL,
  description text NOT NULL,
  issued_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  source text NOT NULL DEFAULT 'NDMA (demonstration data)',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.alerts TO anon, authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Alerts are publicly readable" ON public.alerts FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.risk_explanation_translations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hazard_zone_id uuid NOT NULL REFERENCES public.hazard_zones(id) ON DELETE CASCADE,
  language_code text NOT NULL,
  explanation_text text NOT NULL,
  UNIQUE (hazard_zone_id, language_code)
);
GRANT SELECT ON public.risk_explanation_translations TO anon, authenticated;
GRANT ALL ON public.risk_explanation_translations TO service_role;
ALTER TABLE public.risk_explanation_translations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Translations are publicly readable" ON public.risk_explanation_translations FOR SELECT TO anon, authenticated USING (true);

CREATE TABLE public.helplines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  name text NOT NULL,
  number text NOT NULL,
  region text,
  sort_order int NOT NULL DEFAULT 0
);
GRANT SELECT ON public.helplines TO anon, authenticated;
GRANT ALL ON public.helplines TO service_role;
ALTER TABLE public.helplines ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Helplines are publicly readable" ON public.helplines FOR SELECT TO anon, authenticated USING (true);

INSERT INTO public.alerts (severity, hazard_type, area, city_name, headline, description, issued_at, expires_at) VALUES
('warning','flood','Brahmaputra north bank, Kamrup (Metro)','Guwahati','Flood warning for low-lying wards along the Brahmaputra','River level at Pandu is above the warning mark and rising. Residents of low-lying wards should move valuables to higher floors and prepare to relocate to designated relief centres.', now() - interval '2 hours', now() + interval '22 hours'),
('advisory','landslide','Hillside settlements, Guwahati','Guwahati','Landslide advisory for hillside settlements','Continuous rainfall has saturated slopes in the Kharghuli and Noonmati hill areas. Avoid parking or sleeping close to cut slopes and report fresh cracks to the district authority.', now() - interval '9 hours', now() + interval '2 days'),
('emergency','flood','Kurla and Mithi river basin','Mumbai','Emergency: severe waterlogging in the Mithi river basin','Extremely heavy rainfall coinciding with high tide has caused rapid waterlogging. Avoid all non-essential travel and do not enter flooded underpasses or subways.', now() - interval '40 minutes', now() + interval '10 hours'),
('watch','thunderstorm','Mumbai Suburban district','Mumbai','Thunderstorm and squall watch','Intense convective activity is expected over the next 12 hours with gusts up to 60 km/h. Secure loose structures, hoardings and rooftop installations.', now() - interval '5 hours', now() + interval '12 hours'),
('watch','cyclone','Kerala coast, Ernakulam district','Kochi','Cyclone watch for the Ernakulam coastline','A deep depression over the Arabian Sea may intensify. Fishermen are advised not to venture into the sea and coastal hamlets should keep evacuation kits ready.', now() - interval '14 hours', now() + interval '3 days'),
('advisory','heatwave','Ernakulam and adjoining districts','Kochi','Heat and humidity advisory','Day temperatures are 3-4 degrees above normal with high humidity. Avoid outdoor exertion between 11:00 and 15:00 and keep hydrated.', now() - interval '1 day', now() + interval '2 days');

INSERT INTO public.helplines (category, name, number, region, sort_order) VALUES
('emergency','Police','100',NULL,1),
('emergency','Fire Services','101',NULL,2),
('emergency','Ambulance','108',NULL,3),
('emergency','Unified Emergency Number','112',NULL,4),
('emergency','Women''s Helpline','1091',NULL,5),
('emergency','Child Helpline','1098',NULL,6),
('national','NDMA National Emergency Response Centre','011-1078',NULL,10),
('national','NDMA Control Room','011-26701728',NULL,11),
('national','National Disaster Helpline','1078',NULL,12),
('state','Assam State Disaster Management Authority','1079','Assam',20),
('state','ASDMA State Emergency Operations Centre','0361-2237219','Assam',21),
('state','Maharashtra State Disaster Management Control Room','022-22027990','Maharashtra',22),
('state','Maharashtra Disaster Helpline','1077','Maharashtra',23),
('state','Kerala State Emergency Operations Centre','1070','Kerala',24),
('state','Kerala SDMA Control Room','0471-2364424','Kerala',25);
