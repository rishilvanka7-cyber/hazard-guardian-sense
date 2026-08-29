# Sentinel Alert

Project Brief: Sentinel — Hazard Risk Assessment and Community Early-Warning Platform

Objective: Develop a full-stack web application for submission to Smart India Hackathon 2026 (Problem Statement SIH26191, Ministry of Home Affairs — "Hazard-Based Red Zone Identification, Carrying Capacity Assessment, and Immediate Relocation Needs for Vulnerable Habitations"). The application shall provide residents with location-based hazard risk information and an experimental community-sourced early-warning capability.

Technical Requirements: React with TypeScript, Tailwind CSS for styling, and Supabase for backend services (PostgreSQL database, Authentication, and Realtime subscriptions).

=== DESIGN SPECIFICATIONS ===

The visual design shall reflect the seriousness of a public-safety and government-oriented application, avoiding playful or consumer-startup aesthetics.

- Primary color: deep navy blue (#0b3d91)

- Alert/critical color: red (#dc2626)

- Safe/success color: green (#16a34a)

- Warning color: amber (#f59e0b)

- Typography: clean sans-serif, with generous whitespace

- Layout: card-based components with subtle shadows and 8–12px corner radii

- Mobile-first responsive design is mandatory, as the application will be demonstrated live on a mobile device

- Header shall include a minimal geometric shield or radar-style logo mark

=== SCREEN 1: LANDING / LOCATION SEARCH ===

Requirements:

- Application name "Sentinel" with the tagline: "Know your risk. Sense what's happening now."

- A primary search input field labeled "Enter your address," accompanied by a "Use My Current Location" button that invokes the browser's Geolocation API (please implement this functionality in full, as it is a standard and well-supported API)

- Three pre-configured city selection chips below the search field: "Guwahati," "Mumbai," and "Kochi." Selecting a chip shall populate the search field and submit automatically

- Footer disclosure text (small, muted styling): "Data sourced from NDMA, GSI & CWC hazard datasets"

=== SCREEN 2: RISK DASHBOARD ===

Present the following components in sequence:

1. Header displaying the selected location name with an option to revise the search

2. Primary Risk Indicator (the most visually prominent element on this screen): a color-coded badge denoting risk tier — LOW / MEDIUM / HIGH / CRITICAL — accompanied by a concise, plain-language explanation of the assessed risk (e.g., "This area has moderate flood risk due to proximity to [river name]. Historical records indicate seasonal flooding during monsoon months."). This explanation shall be rendered dynamically from a `risk_explanation` field in the database, not hardcoded per view.

3. Interactive Map Component: implement using Leaflet.js (via react-leaflet), centered on the selected location's coordinates, displaying:

   - A color-coded circular overlay representing the hazard radius (color corresponding to risk tier)

   - A marker indicating the searched location

   - A distinct marker indicating the nearest designated safe zone

   - A connecting line between the two markers with the calculated distance labeled

4. Evacuation Readiness Checklist: a card titled "Evacuation Readiness" containing five checklist items (local component state is sufficient; persistence is not required):

   - Maintain an emergency kit (water, torch, first-aid supplies, essential documents)

   - Identify at least two evacuation routes from the residence

   - Record local disaster management helpline numbers

   - Ascertain the structural risk classification of the residential building

   - Register with the local disaster management authority if situated in a high-risk zone

5. Carrying Capacity Indicator: a horizontal progress bar comparing local population against designated safe-zone capacity, with accompanying text (e.g., "Safe zone capacity: 65% of local population — contingency planning for overflow shelters is advised")

6. A prominent call-to-action button labeled "Enable Sentinel Mode →" directing to Screen 3

=== SCREEN 3: SENTINEL MODE (LIVE MONITORING) ===

Requirements:

1. Header: "Sentinel Mode — Live Monitoring"

2. Onboarding/Consent Card (displayed on first visit): a brief explanation that this feature utilizes the device's motion sensors to detect and anonymously share indicators of unusual local activity with nearby users, accompanied by an "Enable Motion Sensing" call-to-action

3. Live Sensor Reading Panel: a card displaying three continuously updating numeric values (X-axis, Y-axis, Z-axis motion readings) accompanied by a simple waveform or line-chart visualization updating in real time.

   Note: This component should be implemented using a mock data generator (minor randomized fluctuations updating at approximately 300ms intervals), encapsulated within a clearly named function such as `getMotionReading()`. This function will be replaced with an implementation using the Device Motion API separately.

4. Status Indicator: a default calm state displaying "Monitoring — No anomalies detected" in green

5. Anomaly Alert State: upon triggering, this status area shall transition to a red, attention-drawing banner reading "Unusual activity detected near you," with a supporting line indicating the number of corroborating nearby devices (this count shall be dynamically derived from a query against the `anomaly_pings` table, filtered to the relevant geographic region within the preceding five minutes)

6. A discreet "Simulate Anomaly" control, visually distinguished as a testing/demonstration utility rather than a user-facing feature, which inserts a test record into the `anomaly_pings` table and triggers the alert state. This control is required to ensure demonstration reliability, given that live motion-sensor triggers cannot be guaranteed to function consistently during an on-stage presentation.

=== DATABASE SCHEMA (SUPABASE) ===

Table: hazard_zones

- id (uuid, primary key)

- city_name (text)

- lat (float8)

- long (float8)

- radius_meters (int4)

- risk_tier (text; permitted values: 'low', 'medium', 'high', 'critical')

- risk_explanation (text)

- safe_zone_name (text)

- safe_zone_lat (float8)

- safe_zone_long (float8)

- population (int4)

- safe_zone_capacity (int4)

Table: anomaly_pings

- id (uuid, primary key, default gen_random_uuid())

- lat (float8)

- long (float8)

- intensity (float8)

- device_id (text)

- created_at (timestamptz, default now())

Please configure Row Level Security with permissive read/insert policies for both tables, as this is a public demonstration application requiring no authentication. Please enable Supabase Realtime on the `anomaly_pings` table to support live subscription from the frontend.

Seed Data — please insert the following three records into hazard_zones:

1. Guwahati: lat 26.1445, long 91.7362, radius 3000m, risk_tier 'high', explanation referencing Brahmaputra flood-plain proximity, safe zone "Guwahati Community Relief Center," population 45,000, capacity 28,000

2. Mumbai (Kurla): lat 19.0728, long 72.8826, radius 2500m, risk_tier 'critical', explanation referencing low-lying drainage and monsoon flooding history, safe zone "Kurla Municipal Shelter," population 82,000, capacity 30,000

3. Kochi: lat 9.9312, long 76.2673, radius 2000m, risk_tier 'medium', explanation referencing coastal/backwater flood exposure, safe zone "Kochi Coastal Relief Point," population 38,000, capacity 25,000

=== SEARCH FUNCTIONALITY ===

Upon address entry or city-chip selection, please match the input against the `city_name` field in the hazard_zones table (a simple case-insensitive text match is sufficient for demonstration purposes; comprehensive geocoding integration is out of scope for this phase) and populate the Risk Dashboard accordingly.

=== SCOPE EXCLUSIONS ===

The following are explicitly out of scope for this build and will be implemented separately:

- Production-grade Device Motion / accelerometer API integration (retain as mocked function per above)

- Comprehensive address geocoding beyond simple city-name matching against seed data

- User authentication or account management (not required for this public demonstration tool)

Please deliver this as a complete, functioning, deployed application with all three screens fully connected to the live Supabase backend and seed data in place, suitable for immediate iteration and further development.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://hazard-guardian-sense.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8ba5aa6a-90ce-43be-ad64-13d6b0d453dd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
