import * as Location from 'expo-location';
import { useCallback, useEffect, useState } from 'react';

import { kinshasaCenter } from '../../config/brand';
import { reverseGeocode, type Place } from '../../lib/geocode';

export type LocationStatus = 'pending' | 'granted' | 'denied' | 'error';

export function useRiderLocation() {
  const [status, setStatus] = useState<LocationStatus>('pending');
  const [place, setPlace] = useState<Place | null>({ ...kinshasaCenter, label: 'Kinshasa' });
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const locate = useCallback(async (requestPermission: boolean) => {
    setBusy(true);
    try {
      const current = await Location.getForegroundPermissionsAsync();
      let granted = current.status === 'granted';
      if (!granted && requestPermission) {
        const asked = await Location.requestForegroundPermissionsAsync();
        granted = asked.status === 'granted';
      }
      if (!granted) {
        setStatus('denied');
        setPlace((prev) => prev ?? { ...kinshasaCenter, label: 'Kinshasa' });
        return null;
      }
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const label = (await reverseGeocode(pos.coords.latitude, pos.coords.longitude)) ?? 'Position actuelle';
      const next: Place = { lat: pos.coords.latitude, lng: pos.coords.longitude, label };
      setPlace(next);
      setAccuracy(pos.coords.accuracy ?? 40);
      setStatus('granted');
      return next;
    } catch {
      setStatus('error');
      setPlace((prev) => prev ?? { ...kinshasaCenter, label: 'Kinshasa' });
      return null;
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    void locate(true);
  }, [locate]);

  return { status, place, accuracy, busy, locate };
}
