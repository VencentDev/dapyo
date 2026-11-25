'use client';

import 'leaflet/dist/leaflet.css';

import { useEffect, useMemo } from 'react';
import type { LatLngTuple } from 'leaflet';
import { CircleMarker, MapContainer, TileLayer, useMap, useMapEvents } from 'react-leaflet';

import type { HikeLocationCoordinates } from '../lib/hike-location';

export function LocationPickerMap({
  coordinates,
  zoom,
  onZoomChange,
  onMapPick,
}: {
  coordinates: HikeLocationCoordinates;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onMapPick: (coordinates: HikeLocationCoordinates) => void;
}) {
  const center = useMemo<LatLngTuple>(
    () => [coordinates.latitude, coordinates.longitude],
    [coordinates.latitude, coordinates.longitude],
  );

  return (
    <MapContainer
      center={center}
      zoom={14}
      zoomControl={false}
      scrollWheelZoom={false}
      className="h-full min-h-[280px] w-full rounded-lg"
    >
      <TileLayer
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapCenter center={center} />
      <MapZoomController zoom={zoom} onZoomChange={onZoomChange} />
      <MapClickHandler onMapPick={onMapPick} />
      <CircleMarker
        center={center}
        radius={8}
        pathOptions={{
          color: 'var(--dapyo-color-card)',
          fillColor: 'var(--dapyo-color-accent)',
          fillOpacity: 1,
          weight: 4,
        }}
      />
    </MapContainer>
  );
}

function MapZoomController({
  zoom,
  onZoomChange,
}: {
  zoom: number;
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    if (map.getZoom() !== zoom) map.setZoom(zoom);
  }, [map, zoom]);

  useMapEvents({
    zoomend() {
      const nextZoom = Math.round(map.getZoom());
      if (nextZoom !== zoom) onZoomChange(nextZoom);
    },
  });

  return null;
}

function MapCenter({ center }: { center: LatLngTuple }) {
  const map = useMap();

  useEffect(() => {
    map.setView(center, Math.max(map.getZoom(), 14));
  }, [center, map]);

  return null;
}

function MapClickHandler({
  onMapPick,
}: {
  onMapPick: (coordinates: HikeLocationCoordinates) => void;
}) {
  useMapEvents({
    click(event) {
      onMapPick({ latitude: event.latlng.lat, longitude: event.latlng.lng });
    },
  });

  return null;
}
