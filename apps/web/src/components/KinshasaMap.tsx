'use client';

import { useEffect, useRef, useState } from 'react';
import type { Map as MapLibreMap, Marker as MapLibreMarker } from 'maplibre-gl';

import { examplePlaces, kinshasaCenter } from '@/config/brand';
import { resolveMapStyle } from '@/lib/map-style';

export interface MapPoint {
  lat: number;
  lng: number;
}

interface MarkerHandle {
  pickup?: MapLibreMarker;
  dropoff?: MapLibreMarker;
  driver?: MapLibreMarker;
}

export function KinshasaMap({
  pickup,
  dropoff,
  driver,
  interactive = false,
  onPickupChange,
  onDropoffChange,
}: {
  pickup?: MapPoint | null;
  dropoff?: MapPoint | null;
  driver?: MapPoint | null;
  interactive?: boolean;
  onPickupChange?: (point: MapPoint) => void;
  onDropoffChange?: (point: MapPoint) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MarkerHandle>({});
  const pickupRef = useRef(pickup);
  const dropoffRef = useRef(dropoff);
  useEffect(() => {
    pickupRef.current = pickup;
    dropoffRef.current = dropoff;
  }, [pickup, dropoff]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;

    void (async () => {
      const maplibre = await import('maplibre-gl');
      await import('maplibre-gl/dist/maplibre-gl.css');
      if (cancelled || !ref.current) return;

      const styleUrl = process.env.NEXT_PUBLIC_MAP_STYLE_URL;
      const style = resolveMapStyle(styleUrl);

      const instance = new maplibre.Map({
        container: ref.current,
        style,
        center: [kinshasaCenter.lng, kinshasaCenter.lat],
        zoom: 11,
      });
      mapRef.current = instance;

      instance.on('load', () => {
        setLoaded(true);
        if (!interactive && !pickupRef.current && !dropoffRef.current) {
          examplePlaces.forEach((p, i) => {
            new maplibre.Marker({ color: i === 0 ? '#F04A18' : '#111827' })
              .setLngLat([p.lng, p.lat])
              .setPopup(new maplibre.Popup().setText(p.label))
              .addTo(instance);
          });
        }
      });

      if (interactive) {
        instance.on('click', (e) => {
          const point = { lat: e.lngLat.lat, lng: e.lngLat.lng };
          if (!pickupRef.current) onPickupChange?.(point);
          else if (!dropoffRef.current) onDropoffChange?.(point);
        });
      }
    })();

    return () => {
      cancelled = true;
      setLoaded(false);
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // Carte créée une fois ; les marqueurs sont synchronisés ailleurs.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !loaded) return;

    void (async () => {
      const maplibre = await import('maplibre-gl');

      const syncMarker = (
        key: keyof MarkerHandle,
        point: MapPoint | null | undefined,
        color: string,
        onDrag?: (p: MapPoint) => void,
      ) => {
        const existing = markersRef.current[key];
        if (!point) {
          existing?.remove();
          markersRef.current[key] = undefined;
          return;
        }
        if (!existing) {
          const marker = new maplibre.Marker({ color, draggable: Boolean(onDrag) })
            .setLngLat([point.lng, point.lat])
            .addTo(map);
          if (onDrag) {
            marker.on('dragend', () => {
              const ll = marker.getLngLat();
              onDrag({ lat: ll.lat, lng: ll.lng });
            });
          }
          markersRef.current[key] = marker;
        } else {
          existing.setLngLat([point.lng, point.lat]);
        }
      };

      syncMarker('pickup', pickup, '#111827', interactive ? onPickupChange : undefined);
      syncMarker('dropoff', dropoff, '#F04A18', interactive ? onDropoffChange : undefined);
      syncMarker('driver', driver, '#16A34A');

      const points = [pickup, dropoff, driver].filter(Boolean) as MapPoint[];
      if (points.length >= 2) {
        const bounds = new maplibre.LngLatBounds();
        points.forEach((p) => bounds.extend([p.lng, p.lat]));
        map.fitBounds(bounds, { padding: 48, maxZoom: 13 });
      } else if (points.length === 1 && points[0]) {
        map.easeTo({ center: [points[0].lng, points[0].lat], zoom: 13 });
      }
    })();
  }, [pickup, dropoff, driver, interactive, onPickupChange, onDropoffChange, loaded]);

  return (
    <div className="space-y-2">
      <div ref={ref} className="h-64 w-full overflow-hidden rounded-2xl bg-white shadow-card sm:h-80" />
      {interactive ? (
        <p className="text-xs text-muted">
          Touchez la carte pour le départ, puis la destination. Déplacez les marqueurs si besoin.
        </p>
      ) : null}
    </div>
  );
}
