import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Circle, MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { RISK_HEX, haversineKm, type HazardZone } from "@/lib/sentinel";

function pinIcon(color: string, glyph: string) {
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;background:${color};color:#fff;font:600 12px/1 system-ui,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.35);border:2px solid #fff">${glyph}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

export default function HazardMap({ zone }: { zone: HazardZone }) {
  const hazardColor = RISK_HEX[zone.risk_tier];
  const distanceKm = haversineKm(zone.lat, zone.long, zone.safe_zone_lat, zone.safe_zone_long);
  const midpoint: [number, number] = [
    (zone.lat + zone.safe_zone_lat) / 2,
    (zone.long + zone.safe_zone_long) / 2,
  ];

  return (
    <MapContainer
      center={[zone.lat, zone.long]}
      zoom={12}
      scrollWheelZoom={false}
      style={{ height: "320px", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Circle
        center={[zone.lat, zone.long]}
        radius={zone.radius_meters}
        pathOptions={{ color: hazardColor, fillColor: hazardColor, fillOpacity: 0.18, weight: 2 }}
      />
      <Polyline
        positions={[
          [zone.lat, zone.long],
          [zone.safe_zone_lat, zone.safe_zone_long],
        ]}
        pathOptions={{ color: "#0b3d91", weight: 2, dashArray: "6 6" }}
      />
      <Marker position={[zone.lat, zone.long]} icon={pinIcon(hazardColor, "!")}>
        <Popup>{zone.city_name} — searched location</Popup>
      </Marker>
      <Marker
        position={[zone.safe_zone_lat, zone.safe_zone_long]}
        icon={pinIcon("#16a34a", "S")}
      >
        <Popup>{zone.safe_zone_name} — nearest safe zone</Popup>
      </Marker>
      <Marker
        position={midpoint}
        icon={L.divIcon({
          className: "",
          html: `<div style="white-space:nowrap;transform:translate(-50%,-50%);background:#0b3d91;color:#fff;padding:3px 8px;border-radius:999px;font:600 11px/1.2 system-ui,sans-serif;box-shadow:0 2px 6px rgba(0,0,0,.3)">${distanceKm.toFixed(2)} km to safe zone</div>`,
          iconSize: [0, 0],
        })}
      />
    </MapContainer>
  );
}
