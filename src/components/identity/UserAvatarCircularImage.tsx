import { Image } from 'expo-image';
import { memo, useEffect, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

interface UserAvatarCircularImageProps {
  uri: string;
  size: number;
  recyclingKey?: string | number;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
  fallback: ReactNode;
}

function UserAvatarCircularImageComponent({
  uri,
  size,
  recyclingKey,
  accessibilityLabel,
  style,
  fallback,
}: UserAvatarCircularImageProps) {
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setFailed(false);
  }, [uri, recyclingKey]);

  if (failed) {
    return (
      <View
        style={[styles.frame, { width: size, height: size, borderRadius: size / 2 }, style]}
        accessibilityLabel={accessibilityLabel}>
        {fallback}
      </View>
    );
  }

  return (
    <View
      style={[styles.frame, { width: size, height: size, borderRadius: size / 2 }, style]}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="image">
      <Image
        source={{ uri }}
        recyclingKey={recyclingKey != null ? String(recyclingKey) : undefined}
        style={{ width: size, height: size }}
        contentFit="cover"
        contentPosition="center"
        onError={() => setFailed(true)}
      />
    </View>
  );
}

export const UserAvatarCircularImage = memo(UserAvatarCircularImageComponent);

const styles = StyleSheet.create({
  frame: {
    overflow: 'hidden',
    backgroundColor: 'rgba(8, 8, 24, 0.35)',
  },
});
