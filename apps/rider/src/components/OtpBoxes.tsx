import { useEffect, useRef } from 'react';
import {
  Animated,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { colors, radii } from '../config/brand';

export function OtpBoxes({
  length,
  value,
  onChange,
  disabled,
  errorTick,
}: {
  length: number;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  errorTick: number;
}) {
  const inputRef = useRef<TextInput>(null);
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (errorTick === 0) return;
    shake.setValue(0);
    Animated.sequence([
      Animated.timing(shake, { toValue: 8, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -8, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: -4, duration: 50, useNativeDriver: true }),
      Animated.timing(shake, { toValue: 0, duration: 50, useNativeDriver: true }),
    ]).start();
  }, [errorTick, shake]);

  const digits = value.replace(/\D/g, '').slice(0, length);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} disabled={disabled}>
      <Animated.View style={[styles.row, { transform: [{ translateX: shake }] }]}>
        {Array.from({ length }, (_, i) => (
          <View key={i} style={[styles.box, digits.length === i && styles.boxActive]}>
            <Text style={styles.digit}>{digits[i] ?? ''}</Text>
          </View>
        ))}
      </Animated.View>
      <TextInput
        ref={inputRef}
        value={digits}
        onChangeText={(text) => onChange(text.replace(/\D/g, '').slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="sms-otp"
        autoFocus
        caretHidden
        maxLength={length}
        editable={!disabled}
        style={styles.hidden}
        accessibilityLabel="Code de vérification"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 16,
  },
  box: {
    flex: 1,
    aspectRatio: 0.78,
    maxHeight: 58,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    backgroundColor: '#FAFAF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boxActive: {
    borderColor: colors.brand,
  },
  digit: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.ink,
  },
  hidden: {
    position: 'absolute',
    opacity: 0,
    height: 1,
    width: 1,
  },
});
