import { useThemeColor } from '@/hooks/useThemeColor';
import { Stack } from 'expo-router';

export default function AuthLayout() {
  const { colors } = useThemeColor();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    />
  );
} 