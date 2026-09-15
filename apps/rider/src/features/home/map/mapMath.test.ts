import assert from 'node:assert/strict';
import { test } from 'node:test';

import { initialTileProvider, nextTileProvider, tileUrl } from './mapMath';

test('sans clé MapTiler, les tuiles Esri sont utilisées', () => {
  assert.equal(initialTileProvider(undefined), 'esri');
  assert.equal(initialTileProvider(''), 'esri');
  const url = tileUrl(13, 4444, 4150, 'esri');
  assert.equal(
    url,
    'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/13/4150/4444',
  );
});

test('MapTiler puis Esri puis CARTO', () => {
  assert.equal(initialTileProvider('abc'), 'maptiler');
  assert.equal(nextTileProvider('maptiler'), 'esri');
  assert.equal(nextTileProvider('esri'), 'carto');
  assert.equal(nextTileProvider('carto'), null);
  assert.match(tileUrl(13, 1, 2, 'carto'), /basemaps\.cartocdn\.com/);
});
