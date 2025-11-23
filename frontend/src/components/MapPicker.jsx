// use client
import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function ClickHandler({ onClick }) {
  useMapEvents({
    click(e) {
      if (onClick) {
        onClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });
  return null;
}

function CenterUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && typeof center.lat === "number" && typeof center.lng === "number") {
      map.setView([center.lat, center.lng], 16);
    }
  }, [center, map]);
  return null;
}

function MapPicker({ center, radius, onCenterChange }) {
  const hasWindow = typeof window !== "undefined";
  useEffect(() => {
    // ensure Leaflet styles applied on first render (handled by import above)
  }, []);

  if (!hasWindow) {
    return <div className="map-placeholder">Mapa no disponible en SSR</div>;
  }

  const validCenter =
    center && typeof center.lat === "number" && typeof center.lng === "number"
      ? center
      : { lat: 0, lng: 0 };

  return (
    <MapContainer center={[validCenter.lat, validCenter.lng]} zoom={16} className="map-leaflet">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[validCenter.lat, validCenter.lng]} />
      {Number.isFinite(radius) && radius > 0 ? (
        <Circle center={[validCenter.lat, validCenter.lng]} radius={radius} pathOptions={{ color: "#0ea5e9" }} />
      ) : null}
      <CenterUpdater center={validCenter} />
      <ClickHandler onClick={onCenterChange} />
    </MapContainer>
  );
}

export default MapPicker;
