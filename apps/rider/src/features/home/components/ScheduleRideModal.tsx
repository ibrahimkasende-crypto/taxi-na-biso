import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../../config/brand';
import { TnbButton } from '../../../components/tnb/TnbButton';

const DAYS = ['Aujourd’hui', 'Demain'] as const;
const HOURS = ['07:00', '09:00', '12:00', '16:00', '18:30'] as const;

type Props = {
  visible: boolean;
  onClose: () => void;
  onConfirm: (when: string) => void;
};

export function ScheduleRideModal({ visible, onClose, onConfirm }: Props) {
  const [day, setDay] = useState<(typeof DAYS)[number]>('Demain');
  const [hour, setHour] = useState<(typeof HOURS)[number]>('09:00');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <Text style={styles.title}>Planifier une course</Text>
          <Text style={styles.label}>Jour</Text>
          <View style={styles.row}>
            {DAYS.map((item) => (
              <Pressable key={item} onPress={() => setDay(item)} style={[styles.chip, day === item && styles.chipOn]}>
                <Text style={[styles.chipText, day === item && styles.chipTextOn]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>Heure</Text>
          <View style={styles.row}>
            {HOURS.map((item) => (
              <Pressable key={item} onPress={() => setHour(item)} style={[styles.chip, hour === item && styles.chipOn]}>
                <Text style={[styles.chipText, hour === item && styles.chipTextOn]}>{item}</Text>
              </Pressable>
            ))}
          </View>
          <TnbButton label={`Continuer · ${day} ${hour}`} onPress={() => onConfirm(`${day} ${hour}`)} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(17,24,39,0.35)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 28,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.ink, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '700', color: colors.textMuted, marginBottom: 8, marginTop: 8 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
  },
  chipOn: { backgroundColor: '#FFF1EB' },
  chipText: { color: colors.ink, fontWeight: '600' },
  chipTextOn: { color: colors.brand },
});
