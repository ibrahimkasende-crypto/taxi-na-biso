import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Image,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';

import { colors } from '../../../config/brand';
import { TnbButton } from '../../../components/tnb/TnbButton';
import type { Place } from '../../../lib/geocode';
import type { DemoNearbyCar } from '../demoNearbyDrivers';
import { DriverCarMarker } from './DriverCarMarker';
import { UserLocationMarker } from './UserLocationMarker';
import { demoRouteLine, type LatLng } from '../geo';
import {
  clampZoom,
  DEFAULT_CAMERA,
  fitCamera,
  initialTileProvider,
  nextTileProvider,
  panCamera,
  project,
  tileUrl,
  visibleTiles,
  type Camera,
  type TileProviderId,
} from './mapMath';

const MAPTILER_KEY = process.env.EXPO_PUBLIC_MAPTILER_KEY?.trim();

type Props = {
  pickup: Place | null;
  dropoff: Place | null;
  user: Place | null;
  accuracy?: number | null;
  cars: DemoNearbyCar[];
  showRoute?: boolean;
  followUser?: boolean;
  pickMode?: boolean;
  cameraRequest?: Camera | null;
  onCameraIdle?: (center: LatLng) => void;
  onCarPress?: (car: DemoNearbyCar) => void;
};

export const RideMap = memo(function RideMapInner({
  pickup,
  dropoff,
  user,
  accuracy: _accuracy,
  cars,
  showRoute,
  followUser,
  pickMode,
  cameraRequest,
  onCameraIdle,
  onCarPress,
}: Props) {
  const { width, height } = useWindowDimensions();
  const [camera, setCamera] = useState<Camera>(DEFAULT_CAMERA);
  const [provider, setProvider] = useState<TileProviderId>(() => initialTileProvider(MAPTILER_KEY));
  const [tilesReady, setTilesReady] = useState(false);
  const [tileFailed, setTileFailed] = useState(false);
  const errors = useRef(0);
  const tilesReadyRef = useRef(false);
  const cameraRef = useRef(camera);
  const panLast = useRef({ x: 0, y: 0 });
  cameraRef.current = camera;

  useEffect(() => {
    if (!followUser || !user) return;
    const from = cameraRef.current;
    const frames = 12;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      const t = i / frames;
      setCamera({
        lat: from.lat + (user.lat - from.lat) * t,
        lng: from.lng + (user.lng - from.lng) * t,
        zoom: from.zoom,
      });
      if (i >= frames) clearInterval(id);
    }, 16);
    return () => clearInterval(id);
  }, [followUser, user]);

  useEffect(() => {
    if (!cameraRequest) return;
    setCamera(cameraRequest);
  }, [cameraRequest]);

  useEffect(() => {
    if (!pickup || !dropoff || pickMode) return;
    setCamera(fitCamera(pickup, dropoff, width, height * 0.62));
  }, [pickup, dropoff, pickMode, width, height]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) + Math.abs(g.dy) > 4,
        onPanResponderGrant: () => {
          panLast.current = { x: 0, y: 0 };
        },
        onPanResponderMove: (_e, g) => {
          const dx = g.dx - panLast.current.x;
          const dy = g.dy - panLast.current.y;
          panLast.current = { x: g.dx, y: g.dy };
          setCamera((prev) => panCamera(prev, dx, dy));
        },
        onPanResponderRelease: () => {
          const current = cameraRef.current;
          onCameraIdle?.({ lat: current.lat, lng: current.lng });
        },
      }),
    [onCameraIdle],
  );

  const tiles = useMemo(() => visibleTiles(camera, width, height), [camera, width, height]);

  useEffect(() => {
    errors.current = 0;
    tilesReadyRef.current = false;
    setTilesReady(false);
    setTileFailed(false);
    const timeout = setTimeout(() => {
      if (!tilesReadyRef.current) setTileFailed(true);
    }, 12000);
    return () => clearTimeout(timeout);
  }, [provider]);

  const onTileError = useCallback(() => {
    errors.current += 1;
    if (errors.current < 6) return;
    const next = nextTileProvider(provider);
    if (next) {
      errors.current = 0;
      setProvider(next);
      return;
    }
    setTileFailed(true);
  }, [provider]);

  const route = useMemo(() => {
    if (!showRoute || !pickup || !dropoff) return [];
    return demoRouteLine(pickup, dropoff).map((p, i) => ({ ...project(p, camera, width, height), i }));
  }, [showRoute, pickup, dropoff, camera, width, height]);

  if (tileFailed && !tilesReady) {
    return (
      <View style={[styles.fallback, { width, height }]}>
        <View style={styles.river} />
        <Text style={styles.fallbackTitle}>Impossible de charger la carte</Text>
        <Text style={styles.fallbackSub}>Kinshasa reste disponible. Vérifiez la connexion puis réessayez.</Text>
        <View style={styles.retry}>
          <TnbButton
            label="Réessayer"
            onPress={() => {
              errors.current = 0;
              setTileFailed(false);
              setTilesReady(false);
              setProvider(initialTileProvider(MAPTILER_KEY));
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.fill} {...responder.panHandlers}>
      {tiles.map((tile) => (
        <Image
          key={`${provider}-${tile.z}-${tile.x}-${tile.y}`}
          source={{ uri: tileUrl(tile.z, tile.x, tile.y, provider, MAPTILER_KEY) }}
          onError={onTileError}
          onLoad={() => {
            tilesReadyRef.current = true;
            setTilesReady(true);
            setTileFailed(false);
          }}
          style={[styles.tile, { left: tile.left, top: tile.top }]}
        />
      ))}
      {!tilesReady ? (
        <View pointerEvents="none" style={styles.loading}>
          <Text style={styles.loadingText}>Chargement de Kinshasa…</Text>
        </View>
      ) : null}

      {route.map((dot) => (
        <View key={`r-${dot.i}`} style={[styles.routeDot, { left: dot.x - 3, top: dot.y - 3 }]} />
      ))}

      {cars.map((car) => {
        const p = project(car, camera, width, height);
        return (
          <View key={car.id} style={[styles.carWrap, { left: p.x - 17, top: p.y - 10 }]}>
            <DriverCarMarker heading={car.heading} onPress={() => onCarPress?.(car)} />
          </View>
        );
      })}

      {user ? (
        <View style={[styles.userWrap, { left: project(user, camera, width, height).x - 22, top: project(user, camera, width, height).y - 22 }]}>
          <UserLocationMarker />
        </View>
      ) : null}
      {pickup ? <Pin point={pickup} camera={camera} width={width} height={height} kind="pickup" /> : null}
      {dropoff ? <Pin point={dropoff} camera={camera} width={width} height={height} kind="dropoff" /> : null}

      {pickMode ? (
        <View pointerEvents="none" style={styles.centerPinWrap}>
          <View style={styles.centerPin} />
        </View>
      ) : null}

      <View pointerEvents="none" style={styles.watermark}>
        <Text style={styles.city}>Kinshasa</Text>
        <Text style={styles.attrib}>
          {provider === 'maptiler' ? 'MapTiler' : provider === 'carto' ? 'CARTO' : 'Esri'}
        </Text>
      </View>
      <View style={styles.zoomCol} pointerEvents="box-none">
        <Pressable
          accessibilityLabel="Zoom avant"
          onPress={() => setCamera((prev) => ({ ...prev, zoom: clampZoom(prev.zoom + 1) }))}
          style={styles.zoomBtn}
        >
          <Text style={styles.zoomTxt}>+</Text>
        </Pressable>
        <Pressable
          accessibilityLabel="Zoom arrière"
          onPress={() => setCamera((prev) => ({ ...prev, zoom: clampZoom(prev.zoom - 1) }))}
          style={styles.zoomBtn}
        >
          <Text style={styles.zoomTxt}>−</Text>
        </Pressable>
      </View>
    </View>
  );
});

export const RiderMap = RideMap;

function Pin({
  point,
  camera,
  width,
  height,
  kind,
}: {
  point: Place;
  camera: Camera;
  width: number;
  height: number;
  kind: 'pickup' | 'dropoff';
}) {
  const p = project(point, camera, width, height);
  return (
    <View pointerEvents="none" style={[styles.pinWrap, { left: p.x - 8, top: p.y - 20 }]}>
      <View style={[styles.pin, kind === 'dropoff' ? styles.pinDrop : styles.pinPick]} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { ...StyleSheet.absoluteFill, backgroundColor: '#E8EEE6' },
  tile: { position: 'absolute', width: 256, height: 256 },
  fallback: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#E7EDE4',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 28,
  },
  river: {
    position: 'absolute',
    left: '8%',
    right: '18%',
    top: '38%',
    height: 28,
    borderRadius: 20,
    backgroundColor: '#C5D6CF',
    transform: [{ rotate: '-12deg' }],
  },
  fallbackTitle: { fontSize: 18, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  fallbackSub: { marginTop: 8, fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  retry: { marginTop: 18, alignSelf: 'stretch' },
  routeDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.brand,
  },
  carWrap: { position: 'absolute' },
  userWrap: { position: 'absolute' },
  pinWrap: { position: 'absolute' },
  pin: { width: 16, height: 16, borderRadius: 8, borderWidth: 3, borderColor: colors.white },
  pinPick: { backgroundColor: '#111827' },
  pinDrop: { backgroundColor: colors.brand },
  centerPinWrap: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 48,
  },
  centerPin: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.brand,
    borderWidth: 4,
    borderColor: colors.white,
  },
  watermark: { position: 'absolute', left: 16, bottom: 220 },
  city: { color: 'rgba(17,24,39,0.35)', fontWeight: '800', fontSize: 12 },
  attrib: { color: 'rgba(17,24,39,0.28)', fontWeight: '600', fontSize: 10, marginTop: 2 },
  loading: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,238,230,0.55)',
  },
  loadingText: { fontWeight: '800', color: colors.ink },
  zoomCol: { position: 'absolute', right: 16, bottom: 280, gap: 8 },
  zoomBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#111827',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  zoomTxt: { fontSize: 22, fontWeight: '800', color: colors.ink, lineHeight: 24 },
});
