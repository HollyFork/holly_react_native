import { CustomIcon } from '@/components/common/CustomIcon';
import { ThemedText } from '@/components/common/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface DashboardCardV2Props {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  onPress?: () => void;
}

export function DashboardCardV2({ icon, title, value, subtitle, onPress }: DashboardCardV2Props) {
  const { colors, styles: themeStyles } = useThemeColor();
  
  return (
    <TouchableOpacity
      style={[
        styles.card,
        themeStyles.card,
        { backgroundColor: colors.card }
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={styles.headerRow}>
        <CustomIcon name={icon as any} size={22} color={colors.primary} style={{ marginRight: 8 }} />
        <ThemedText style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail">{title}</ThemedText>
        <View style={styles.chevronContainer}>
          <CustomIcon name="chevron-right" size={20} color={colors.primary} />
        </View>
      </View>
      <View style={[styles.separator, { backgroundColor: colors.border }]} />
      <View style={styles.valueContainer}>
        <ThemedText
          style={[styles.value, { color: colors.primary }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {value}
        </ThemedText>
        {subtitle && (
          <ThemedText 
            style={[styles.subtitle, { color: colors.textSecondary }]}
          >
            {subtitle}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    marginBottom: 22,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    flexWrap: 'nowrap',
    minHeight: 28,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  chevronContainer: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    marginBottom: 12,
  },
  valueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 38,
    marginTop: 2,
    marginBottom: 2,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 2,
    textAlign: 'center',
    flexShrink: 1,
    width: '100%',
  },
  subtitle: {
    fontSize: 15,
    marginTop: 6,
    textAlign: 'center',
  },
}); 