import { kinshasaCenter } from '../../../config/brand';
import type { LatLng } from '../geo';

export const TILE_SIZE = 256;
export const MIN_ZOOM = 12;
export const MAX_ZOOM = 16;

export type Camera = {
  lat: number;
  lng: number;
  zoom: number;
};

export const DEFAULT_CAMERA: Camera = {
  lat: kinshasaCenter.lat,
  lng: kinshasaCenter.lng,
  zoom: 13,
};

export function clampZoom(zoom: number): number {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom));
}

export function lonToX(lng: number, zoom: number): number {
  return ((lng + 180) / 360) * 2 ** zoom * TILE_SIZE;
}

export function latToY(lat: number, zoom: number): number {
  const rad = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * 2 ** zoom * TILE_SIZE;
}

export function xToLon(x: number, zoom: number): number {
  return (x / (TILE_SIZE * 2 ** zoom)) * 360 - 180;
}

export function yToLat(y: number, zoom: number): number {
  const n = Math.PI - (2 * Math.PI * y) / (TILE_SIZE * 2 ** zoom);
  return (180 / Math.PI) * Math.atan(Math.sinh(n));
}

export function project(point: LatLng, camera: Camera, width: number, height: number): { x: number; y: number } {
  const cx = lonToX(camera.lng, camera.zoom);
  const cy = latToY(camera.lat, camera.zoom);
  return {
    x: lonToX(point.lng, camera.zoom) - cx + width / 2,
    y: latToY(point.lat, camera.zoom) - cy + height / 2,
  };
}

export function unproject(x: number, y: number, camera: Camera, width: number, height: number): LatLng {
  const cx = lonToX(camera.lng, camera.zoom);
  const cy = latToY(camera.lat, camera.zoom);
  return {
    lng: xToLon(cx + (x - width / 2), camera.zoom),
    lat: yToLat(cy + (y - height / 2), camera.zoom),
  };
}

export function panCamera(camera: Camera, dx: number, dy: number): Camera {
  const cx = lonToX(camera.lng, camera.zoom) - dx;
  const cy = latToY(camera.lat, camera.zoom) - dy;
  return {
    lat: yToLat(cy, camera.zoom),
    lng: xToLon(cx, camera.zoom),
    zoom: camera.zoom,
  };
}

export function fitCamera(a: LatLng, b: LatLng, width: number, height: number): Camera {
  const pad = 80;
  let zoom = MAX_ZOOM;
  while (zoom > MIN_ZOOM) {
    const dx = Math.abs(lonToX(a.lng, zoom) - lonToX(b.lng, zoom));
    const dy = Math.abs(latToY(a.lat, zoom) - latToY(b.lat, zoom));
    if (dx < width - pad * 2 && dy < height - pad * 2) break;
    zoom -= 1;
  }
  return {
    lat: (a.lat + b.lat) / 2,
    lng: (a.lng + b.lng) / 2,
    zoom,
  };
}

export type TileProviderId = 'maptiler' | 'esri' | 'carto';

export function tileUrl(z: number, x: number, y: number, provider: TileProviderId, key?: string): string {
  if (provider === 'maptiler' && key) {
    return `https://api.maptiler.com/maps/streets-v2/${z}/${x}/${y}.png?key=${key}`;
  }
  if (provider === 'carto') {
    return `https://basemaps.cartocdn.com/rastertiles/voyager/${z}/${x}/${y}.png`;
  }
  return `https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/${z}/${y}/${x}`;
}

export function initialTileProvider(key?: string): TileProviderId {
  return key ? 'maptiler' : 'esri';
}

export function nextTileProvider(current: TileProviderId): TileProviderId | null {
  if (current === 'maptiler') return 'esri';
  if (current === 'esri') return 'carto';
  return null;
}

export function visibleTiles(camera: Camera, width: number, height: number): { z: number; x: number; y: number; left: number; top: number }[] {
  const z = Math.round(camera.zoom);
  const max = 2 ** z;
  const cx = lonToX(camera.lng, z);
  const cy = latToY(camera.lat, z);
  const minX = Math.floor((cx - width / 2) / TILE_SIZE) - 1;
  const maxX = Math.floor((cx + width / 2) / TILE_SIZE) + 1;
  const minY = Math.floor((cy - height / 2) / TILE_SIZE) - 1;
  const maxY = Math.floor((cy + height / 2) / TILE_SIZE) + 1;
  const tiles: { z: number; x: number; y: number; left: number; top: number }[] = [];
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      if (y < 0 || y >= max) continue;
      const wrappedX = ((x % max) + max) % max;
      tiles.push({
        z,
        x: wrappedX,
        y,
        left: x * TILE_SIZE - cx + width / 2,
        top: y * TILE_SIZE - cy + height / 2,
      });
    }
  }
  return tiles;
}
