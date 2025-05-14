import React, { useState, useMemo } from 'react';
import { View, FlatList, RefreshControl, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useReservations } from '@/hooks/useReservations';
import { Colors } from '@/constants/Colors';
import { CustomIcon } from '@/components/CustomIcon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Reservation } from '@/hooks/useReservations';
import { HeaderWithSidebars } from '@/components/HeaderWithSidebars';
import { useRestaurants } from '@/contexts/RestaurantContext';

const FILTERS = [
  { key: 'TOUTES', label: 'Toutes' },
  { key: 'AUJOURDHUI', label: "Aujourd'hui" },
  { key: 'A_VENIR', label: 'À venir' },
  { key: 'PASSEES', label: 'Passées' },
];

function filterReservations(reservations: Reservation[], filter: string): Reservation[] {
  const now = new Date();
  switch (filter) {
    case 'AUJOURDHUI':
      return reservations.filter((r: Reservation) => {
        const d = new Date(r.date_heure);
        return d.toDateString() === now.toDateString();
      });
    case 'A_VENIR':
      return reservations.filter((r: Reservation) => new Date(r.date_heure) > now);
    case 'PASSEES':
      return reservations.filter((r: Reservation) => new Date(r.date_heure) < now);
    default:
      return reservations;
  }
}

export default function ReservationsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { selectedRestaurant } = useRestaurants();
  const { reservations, loading, refreshReservations } = useReservations(selectedRestaurant?.id_restaurant || null);
  const [filter, setFilter] = useState('TOUTES');

  const filtered = useMemo(() => filterReservations(reservations, filter), [reservations, filter]);

  // Statistiques
  const total = reservations.length;
  const today = filterReservations(reservations, 'AUJOURDHUI').length;
  const upcoming = filterReservations(reservations, 'A_VENIR').length;

  const getFilterStyle = (filterKey: string) => {
    switch (filterKey) {
      case 'AUJOURDHUI':
        return { backgroundColor: '#fff7e6', borderColor: colors.primary };
      case 'A_VENIR':
        return { backgroundColor: '#e6f0ff', borderColor: '#3b82f6' };
      case 'PASSEES':
        return { backgroundColor: '#f5f5f5', borderColor: '#888' };
      default:
        return { backgroundColor: '#eee', borderColor: '#ccc' };
    }
  };

  const getFilterTextStyle = (filterKey: string) => {
    switch (filterKey) {
      case 'AUJOURDHUI':
        return { color: colors.primary };
      case 'A_VENIR':
        return { color: '#3b82f6' };
      case 'PASSEES':
        return { color: '#666' };
      default:
        return { color: colors.text };
    }
  };

  const getReservationCardStyle = (date: string) => {
    const reservationDate = new Date(date);
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (reservationDate.toDateString() === now.toDateString()) {
      return { backgroundColor: '#fff7e6', borderLeftColor: colors.primary };
    } else if (reservationDate > now) {
      return { backgroundColor: '#e6f0ff', borderLeftColor: '#3b82f6' };
    } else {
      return { backgroundColor: '#f5f5f5', borderLeftColor: '#888' };
    }
  };

  if (!selectedRestaurant) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={{ color: colors.text }}>Aucun restaurant sélectionné</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderWithSidebars restaurantName={selectedRestaurant.nom_restaurant} />
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScrollContent}
        >
          {FILTERS.map(tab => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setFilter(tab.key)}
              style={[
                styles.tab,
                getFilterStyle(tab.key),
                filter === tab.key && { borderWidth: 2 }
              ]}
            >
              <Text style={[
                styles.tabText,
                getFilterTextStyle(tab.key),
                filter === tab.key && { fontWeight: 'bold' }
              ]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <TouchableOpacity onPress={refreshReservations} style={styles.refreshBtn}>
          <CustomIcon name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      {/* Statistiques */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: '#f0f1f2' }]}> 
          <Text style={styles.statValue}>{total}</Text>
          <Text style={[styles.statLabel, { fontWeight: '800' }]}>Total</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#fff7e6' }]}> 
          <Text style={[styles.statValue, { color: colors.primary }]}>{today}</Text>
          <Text style={[styles.statLabel, { color: colors.primary }]}>Aujourd'hui</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: '#e6f0ff' }]}> 
          <Text style={[styles.statValue, { color: '#3b82f6' }]}>{upcoming}</Text>
          <Text style={[styles.statLabel, { color: '#3b82f6' }]}>À venir</Text>
        </View>
      </View>
      {/* Liste des réservations */}
      <FlatList
        data={filtered}
        keyExtractor={item => String(item.id)}
        contentContainerStyle={{ padding: 10, paddingBottom: 30 }}
        refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshReservations} />}
        renderItem={({ item }: { item: Reservation }) => (
          <View style={[
            styles.reservationCard,
            getReservationCardStyle(item.date_heure)
          ]}>
            <CustomIcon name="event" size={32} color={colors.icon} style={{ marginRight: 12 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.reservationName}>{item.nom_client}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                <CustomIcon name="schedule" size={16} color={colors.icon} />
                <Text style={styles.reservationDate}>{new Date(item.date_heure).toLocaleDateString()} {new Date(item.date_heure).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                <CustomIcon name="people" size={16} color={colors.icon} style={{ marginLeft: 10 }} />
                <Text style={styles.reservationPeople}>{item.nombre_personnes} pers.</Text>
              </View>
            </View>
            <CustomIcon name="chevron-right" size={24} color={colors.icon} />
          </View>
        )}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: colors.icon, marginTop: 40 }}>Aucune réservation</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  tabsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    gap: 8,
  },
  tabsScrollContent: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 8,
  },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 1,
  },
  tabText: {
    fontSize: 14,
  },
  refreshBtn: {
    marginLeft: 'auto',
    padding: 6,
    borderRadius: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 12,
    marginBottom: 12,
    gap: 8,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
    borderRadius: 12,
    padding: 6,
    marginHorizontal: 1,
    gap: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 1,
    elevation: 1,
  },
  statLabel: {
    fontSize: 11,
    color: '#888',
    fontWeight: '600',
  },
  statValue: {
    fontWeight: '700',
    fontSize: 16,
  },
  reservationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    marginVertical: 6,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    borderLeftWidth: 4,
  },
  reservationName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222',
  },
  reservationDate: {
    color: '#888',
    fontSize: 13,
    marginLeft: 4,
  },
  reservationPeople: {
    color: '#888',
    fontSize: 13,
    marginLeft: 4,
  },
}); 