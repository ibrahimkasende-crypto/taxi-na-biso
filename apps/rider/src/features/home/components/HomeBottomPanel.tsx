import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { PromotionalBanner } from './PromotionalBanner';
import { SavedPlaceCard } from './SavedPlaceCard';

type Props = {
  homeLabel: string;
  workLabel: string;
  onHome: () => void;
  onWork: () => void;
  onAirport: () => void;
  children?: ReactNode;
};

export function HomeBottomPanel({ homeLabel, workLabel, onHome, onWork, onAirport, children }: Props) {
  const { height } = useWindowDimensions();
  const rise = useRef(new Animated.Value(40)).current;
  useEffect(() => {
    Animated.spring(rise, { toValue: 0, useNativeDriver: true, friction: 9, tension: 64 }).start();
  }, [rise]);

  return (
    <Animated.View style={[styles.panel, { maxHeight: height * 0.48, transform: [{ translateY: rise }] }]}>
      <View style={styles.handle} />
      {children ?? (
        <>
          <Text style={styles.title}>Votre prochaine course</Text>
          <PromotionalBanner />
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cards}
            style={styles.cardRow}
          >
            <SavedPlaceCard kind="home" title="Maison" subtitle={homeLabel} onPress={onHome} />
            <SavedPlaceCard kind="work" title="Travail" subtitle={workLabel} onPress={onWork} />
            <SavedPlaceCard kind="airport" title="Aéroport de N’djili" subtitle="N’djili" onPress={onAirport} />
          </ScrollView>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    shadowColor: '#111827',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D1D5DB',
    marginBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 12 },
  cardRow: { marginTop: 14 },
  cards: { paddingRight: 8, paddingBottom: 4 },
});
