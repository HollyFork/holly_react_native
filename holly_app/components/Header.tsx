import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { ThemedText } from './ThemedText';
import { CustomIcon } from './CustomIcon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface HeaderProps {
  restaurantName: string;
  onSidebarToggle: () => void;
  onMenuToggle: () => void;
}

export function Header({ restaurantName, onSidebarToggle, onMenuToggle }: HeaderProps) {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View 
      style={[
        styles.container, 
        { 
          backgroundColor: colors.background,
          paddingTop: insets.top || 40
        }
      ]}
    >
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onSidebarToggle}
        activeOpacity={0.7}
      >
        <CustomIcon name="apartment" color={colors.primary} size={24} />
      </TouchableOpacity>
      
      <ThemedText type="subtitle" style={styles.title}>
        {restaurantName}
      </ThemedText>
      
      <TouchableOpacity
        style={styles.iconButton}
        onPress={onMenuToggle}
        activeOpacity={0.7}
      >
        <CustomIcon name="menu" color={colors.primary} size={24} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 