/**
 * Style MapLibre par défaut — tuiles publiques, sans clé secrète.
 * OSM.org bloque souvent les domaines de production (403) ; CARTO est le repli.
 * Pour une carte premium, définir NEXT_PUBLIC_MAP_STYLE_URL (style JSON public).
 */
export function defaultRasterStyle() {
  return {
    version: 8 as const,
    sources: {
      carto: {
        type: 'raster' as const,
        tiles: [
          'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
          'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
          'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
        ],
        tileSize: 256,
        attribution: '© OpenStreetMap © CARTO',
      },
    },
    layers: [{ id: 'carto', type: 'raster' as const, source: 'carto' }],
  };
}

export function resolveMapStyle(styleUrl?: string) {
  if (styleUrl && styleUrl.length > 0) return styleUrl;
  return defaultRasterStyle();
}
