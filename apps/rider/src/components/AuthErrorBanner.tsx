import { StyleSheet, Text, View } from 'react-native';

export function AuthErrorBanner({ message }: { message: string }) {
  return (
    <View style={styles.wrap} accessibilityRole="alert">
      <View style={styles.icon}>
        <Text style={styles.iconText}>i</Text>
      </View>
      <Text style={styles.text} maxFontSizeMultiplier={1.2}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 14,
  },
  icon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    color: '#991B1B',
    fontWeight: '800',
    fontSize: 13,
  },
  text: {
    flexShrink: 1,
    color: '#991B1B',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
});
