import { useEffect, useState } from 'react';
import { Image, type ImageSourcePropType, type ImageStyle, type StyleProp } from 'react-native';

type Props = {
  source: ImageSourcePropType;
  fallback: ImageSourcePropType;
  style?: StyleProp<ImageStyle>;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  accessibilityLabel?: string;
  onLoad?: () => void;
};

export function FallbackImage({ source, fallback, style, resizeMode = 'cover', accessibilityLabel, onLoad }: Props) {
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    setFailed(false);
  }, [source]);
  return (
    <Image
      source={failed ? fallback : source}
      defaultSource={typeof fallback === 'number' ? fallback : typeof source === 'number' ? source : undefined}
      onError={() => setFailed(true)}
      onLoad={onLoad}
      style={style}
      resizeMode={resizeMode}
      accessibilityLabel={accessibilityLabel}
    />
  );
}
