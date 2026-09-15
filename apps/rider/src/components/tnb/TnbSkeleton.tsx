import { StyleSheet, View } from 'react-native';

export function TnbSkeleton({
  height = 16,
  width = '100%',
  radius = 8,
  gap = 8,
}: {
  height?: number;
  width?: number | `${number}%`;
  radius?: number;
  gap?: number;
}) {
  return <View style={[styles.block, { height, width, borderRadius: radius, marginBottom: gap }]} />;
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: '#EDEDED',
    borderRadius: 8,
    marginBottom: 8,
  },
});
