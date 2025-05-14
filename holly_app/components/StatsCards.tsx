import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';

export interface StatItem {
  value: number;
  label: string;
}

interface StatsCardsProps {
  stats: StatItem[];
}

export function StatsCards({ stats }: StatsCardsProps) {
  return (
    <View style={styles.container}>
      {stats.map((stat, index) => (
        <View key={index} style={styles.statCard}>
          <ThemedText style={styles.statValue}>{stat.value}</ThemedText>
          <ThemedText style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>
            {stat.label}
          </ThemedText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: 70,
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.8,
    textAlign: 'center',
    width: '100%',
  },
}); 