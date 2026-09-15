import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import {
  Animated,
  PanResponder,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '../../config/brand';

type Snap = 'collapsed' | 'mid' | 'expanded';

type Props = {
  snap: Snap;
  onSnapChange?: (snap: Snap) => void;
  children: ReactNode;
  footer?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

const HEIGHTS: Record<Snap, number> = {
  collapsed: 0.28,
  mid: 0.48,
  expanded: 0.78,
};

export function TnbBottomSheet({ snap, onSnapChange, children, footer, style }: Props) {
  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const tab = 64 + insets.bottom;
  const usable = height - tab;
  const translate = useRef(new Animated.Value(usable * (1 - HEIGHTS[snap]))).current;

  const yFor = useMemo(
    () => ({
      collapsed: usable * (1 - HEIGHTS.collapsed),
      mid: usable * (1 - HEIGHTS.mid),
      expanded: usable * (1 - HEIGHTS.expanded),
    }),
    [usable],
  );

  useEffect(() => {
    Animated.spring(translate, {
      toValue: yFor[snap],
      useNativeDriver: true,
      friction: 9,
      tension: 68,
    }).start();
  }, [snap, translate, yFor]);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 8,
        onPanResponderRelease: (_e, g) => {
          if (!onSnapChange) return;
          if (g.dy < -40) {
            onSnapChange(snap === 'collapsed' ? 'mid' : 'expanded');
          } else if (g.dy > 40) {
            onSnapChange(snap === 'expanded' ? 'mid' : 'collapsed');
          }
        },
      }),
    [onSnapChange, snap],
  );

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[styles.wrap, { transform: [{ translateY: translate }] }, style]}
    >
      <View style={[styles.sheet, { height: usable * HEIGHTS.expanded + 24 }]}>
        <View {...responder.panHandlers} style={styles.handleZone}>
          <View style={styles.handle} />
        </View>
        <View style={styles.body}>{children}</View>
        {footer ? <View style={styles.footer}>{footer}</View> : null}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  sheet: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 18,
    shadowColor: '#111827',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  handleZone: { alignItems: 'center', paddingTop: 10, paddingBottom: 8 },
  handle: { width: 42, height: 4, borderRadius: 2, backgroundColor: '#D1D5DB' },
  body: { flex: 1 },
  footer: { paddingBottom: 8, paddingTop: 8 },
});
