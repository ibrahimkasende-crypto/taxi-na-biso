import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../../config/brand';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'ghost' | 'danger';
};

export function TnbButton({ label, onPress, disabled, loading, variant = 'primary' }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'ghost' && styles.ghost,
        variant === 'danger' && styles.danger,
        pressed && !disabled && styles.pressed,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? colors.brand : colors.white} />
      ) : (
        <View>
          <Text style={[styles.text, variant === 'ghost' && styles.ghostText, variant === 'danger' && styles.dangerText]}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: { backgroundColor: colors.brand },
  ghost: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  danger: { backgroundColor: '#FEE2E2' },
  pressed: { transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.45 },
  text: { color: colors.white, fontWeight: '700', fontSize: 16 },
  ghostText: { color: colors.ink },
  dangerText: { color: colors.danger },
});
