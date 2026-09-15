import { useEffect, useRef, type ReactNode } from 'react';
import { Animated, StyleSheet } from 'react-native';

import { useReduceMotion } from '../../lib/reduceMotion';

export function ScreenEnter({ children }: { children: ReactNode }) {
  const reduce = useReduceMotion();
  const progress = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (reduce) {
      progress.setValue(1);
      return;
    }
    progress.setValue(0);
    Animated.timing(progress, {
      toValue: 1,
      duration: 280,
      useNativeDriver: true,
    }).start();
  }, [progress, reduce]);

  return (
    <Animated.View
      style={[
        styles.fill,
        {
          opacity: progress.interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] }),
          transform: [{ translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
});
