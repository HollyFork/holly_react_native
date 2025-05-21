import { CustomIcon } from '@/components/CustomIcon';
import { HeaderWithSidebars } from '@/components/HeaderWithSidebars';
import StatsCards, { StatItem } from '@/components/StatsCards';
import { ThemedText } from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useReservations } from '@/hooks/useReservations';
import { Reservation } from '@/src/models';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type ReservationFilter = 'all' | 'today' | 'upcoming' | 'past';

function formatDate(date: string) {
  return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: fr });
}

interface ReservationCardProps {
  reservation: Reservation;
  onPress?: () => void;
}

function ReservationCard({ reservation, onPress }: ReservationCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const getStatusColor = () => {
    const now = new Date();
    const reservationDate = new Date(reservation.date_heure);
    
    if (reservationDate < now) return '#FF4B4B'; // Rouge pour passé
    if (reservationDate.toDateString() === now.toDateString()) return '#4CAF50'; // Vert pour aujourd'hui
    return '#3b82f6'; // Bleu pour à venir
  };

  const getStatusText = () => {
    const now = new Date();
    const reservationDate = new Date(reservation.date_heure);
    
    if (reservationDate < now) return 'Passée';
    if (reservationDate.toDateString() === now.toDateString()) return "Aujourd'hui";
    return 'À venir';
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedView variant="card" style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {reservation.nom_client}
            </ThemedText>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
              <ThemedText style={styles.statusText}>{getStatusText()}</ThemedText>
            </View>
          </View>
          <CustomIcon name="chevron-right" size={20} color={colors.primary} />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Date:</ThemedText>
            <ThemedText style={styles.value}>{formatDate(reservation.date_heure)}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Personnes:</ThemedText>
            <ThemedText style={styles.value}>{reservation.nombre_personnes} personnes</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Téléphone:</ThemedText>
            <ThemedText style={styles.value}>{reservation.telephone}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Salle:</ThemedText>
            <ThemedText style={styles.value}>{reservation.salle.nom_salle}</ThemedText>
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

export default function ReservationsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<ReservationFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { selectedRestaurant } = useRestaurants();
  const {
    reservations,
    loading,
    error,
    refreshReservations,
    getFutureReservations
  } = useReservations(selectedRestaurant?.id_restaurant || null);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshReservations();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredReservations = useMemo(() => {
    const now = new Date();
    return reservations.filter(reservation => {
      const matchesSearch = reservation.nom_client.toLowerCase().includes(searchQuery.toLowerCase());
      const reservationDate = new Date(reservation.date_heure);
      
      if (!matchesSearch) return false;
      
      switch (activeFilter) {
        case 'today':
          return reservationDate.toDateString() === now.toDateString();
        case 'upcoming':
          return reservationDate > now;
        case 'past':
          return reservationDate < now;
        default:
          return true;
      }
    });
  }, [reservations, searchQuery, activeFilter]);

  const stats = useMemo(() => {
    const now = new Date();
    const total = reservations.length;
    const today = reservations.filter(r => 
      new Date(r.date_heure).toDateString() === now.toDateString()
    ).length;
    const upcoming = reservations.filter(r => 
      new Date(r.date_heure) > now
    ).length;
    const past = reservations.filter(r => 
      new Date(r.date_heure) < now
    ).length;

    const statsItems: StatItem[] = [
      { value: total, label: 'Total' },
      { value: today, label: 'Aujourd\'hui' },
      { value: upcoming, label: 'À venir' },
      { value: past, label: 'Passées' }
    ];

    return statsItems;
  }, [reservations]);

  if (loading && !isRefreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.loadingText}>Chargement des réservations...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !selectedRestaurant) {
    return (
      <ThemedView style={styles.errorContainer}>
        <CustomIcon name="alert-circle" size={48} color={colors.error} />
        <ThemedText style={styles.errorText}>
          {error || "Aucun restaurant sélectionné"}
        </ThemedText>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRefresh}
        >
          <ThemedText style={styles.retryButtonText}>Réessayer</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <HeaderWithSidebars restaurantName={selectedRestaurant.nom_restaurant} />
      
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <CustomIcon name="view-dashboard" size={20} color={colors.text + '80'} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Rechercher une réservation..."
              placeholderTextColor={colors.text + '80'}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery('')}
                style={styles.clearButton}
              >
                <CustomIcon name="close" size={20} color={colors.text + '80'} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <TouchableOpacity 
          onPress={handleRefresh}
          style={styles.refreshButton}
          disabled={isRefreshing}
        >
          <CustomIcon 
            name="refresh" 
            size={24} 
            color={isRefreshing ? colors.text + '80' : colors.primary} 
            style={isRefreshing ? { transform: [{ rotate: '360deg' }] } : undefined}
          />
        </TouchableOpacity>
      </View>

      <StatsCards stats={stats} />

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'all' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('all')}
          >
            <ThemedText style={[styles.filterButtonText, activeFilter === 'all' && styles.filterButtonTextActive]}>
              Toutes
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'today' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('today')}
          >
            <ThemedText style={[styles.filterButtonText, activeFilter === 'today' && styles.filterButtonTextActive]}>
              Aujourd'hui
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'upcoming' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('upcoming')}
          >
            <ThemedText style={[styles.filterButtonText, activeFilter === 'upcoming' && styles.filterButtonTextActive]}>
              À venir
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'past' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('past')}
          >
            <ThemedText style={[styles.filterButtonText, activeFilter === 'past' && styles.filterButtonTextActive]}>
              Passées
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredReservations}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ReservationCard
            reservation={item}
            onPress={() => {
              // TODO: Implémenter la navigation vers les détails de la réservation
              // Une fois que la page de détails sera créée
              console.log('Navigation vers les détails de la réservation:', item.id);
            }}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <CustomIcon name="calendar-clock" size={48} color={colors.text + '40'} />
            <ThemedText style={styles.emptyText}>
              {searchQuery
                ? "Aucune réservation ne correspond à votre recherche"
                : "Aucune réservation disponible"}
            </ThemedText>
          </View>
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#F27E42',
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
  },
  filterContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#F27E42',
  },
  filterButtonText: {
    fontSize: 14,
    opacity: 0.8,
  },
  filterButtonTextActive: {
    color: 'white',
    opacity: 1,
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(142, 142, 147, 0.12)',
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    opacity: 0.8,
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    opacity: 0.6,
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    opacity: 0.6,
    textAlign: 'center',
  },
}); 