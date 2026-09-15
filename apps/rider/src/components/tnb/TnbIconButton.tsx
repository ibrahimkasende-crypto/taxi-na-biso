import { Pressable, StyleSheet, View } from 'react-native';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  onPress: () => void;
  size?: number;
  accessibilityLabel: string;
};

export function TnbIconButton({ children, onPress, size = 48, accessibilityLabel }: Props) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.btn,
        { width: size, height: size, borderRadius: 16 },
        pressed && styles.pressed,
      ]}
    >
      <View>{children}</View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    backgroundColor: 'rgba(255,255,255,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#111827',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  pressed: { transform: [{ scale: 0.96 }] },
});
