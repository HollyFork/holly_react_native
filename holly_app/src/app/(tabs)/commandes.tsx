import { CustomIcon } from '@/components/common/CustomIcon';
import { HeaderWithSidebars } from '@/components/common/HeaderWithSidebars';
import StatsCards, { StatItem } from '@/components/common/StatsCards';
import { ThemedText } from '@/components/common/ThemedText';
import ThemedView from '@/components/common/ThemedView';
import { Colors } from '@/constants/Colors';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCommandes } from '@/hooks/useCommandes';
import { Commande } from '@/models/Commande';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

type CommandeFilter = 'all' | 'EN_COURS' | 'VALIDEE' | 'ANNULEE';

function formatDate(date: string) {
  return format(new Date(date), 'dd MMM yyyy HH:mm', { locale: fr });
}

interface CommandeCardProps {
  commande: Commande;
  onPress: () => void;
}

function CommandeCard({ commande, onPress }: CommandeCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  const getStatusColor = () => {
    switch (commande.statut) {
      case 'EN_COURS': return colors.warning;
      case 'VALIDEE': return colors.success;
      case 'ANNULEE': return colors.error;
      default: return colors.primary;
    }
  };

  const getStatusText = () => {
    switch (commande.statut) {
      case 'EN_COURS': return 'En cours';
      case 'VALIDEE': return 'Validée';
      case 'ANNULEE': return 'Annulée';
      default: return commande.statut;
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.titleContainer}>
          <ThemedText style={[styles.title, { color: colors.text }]}>
            Commande #{commande.id}
          </ThemedText>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <ThemedText style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </ThemedText>
          </View>
        </View>
        <CustomIcon name="chevron-right" size={20} color={colors.primary} />
      </View>

      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Date:</ThemedText>
          <ThemedText style={[styles.value, { color: colors.text }]}>{formatDate(commande.created_at)}</ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Montant:</ThemedText>
          <ThemedText style={[styles.value, { color: colors.primary, fontWeight: '600' }]}>
            {Number(commande.montant || 0).toFixed(2)} €
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Articles:</ThemedText>
          <ThemedText style={[styles.value, { color: colors.text }]}>
            {Number(commande.nb_articles || 0)} articles
          </ThemedText>
        </View>
        {commande.table && (
          <View style={styles.infoRow}>
            <ThemedText style={[styles.label, { color: colors.textSecondary }]}>Table:</ThemedText>
            <ThemedText style={[styles.value, { color: colors.text }]}>Table {commande.table.numero}</ThemedText>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function CommandesScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { selectedRestaurant } = useRestaurants();
  const { commandes, loading: isLoading, error, refreshCommandes } = useCommandes(selectedRestaurant?.id_restaurant || null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<CommandeFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshCommandes();
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredCommandes = useMemo(() => {
    return commandes.filter(commande => {
      const matchesSearch = 
        commande.id.toString().includes(searchQuery) ||
        (commande.table && commande.table.numero.toString().includes(searchQuery));
      
      if (!matchesSearch) return false;
      
      if (activeFilter === 'all') return true;
      return commande.statut === activeFilter;
    });
  }, [commandes, searchQuery, activeFilter]);

  const stats = useMemo(() => {
    const total = commandes.length;
    const enCours = commandes.filter((c: Commande) => c.statut === 'EN_COURS').length;
    const validees = commandes.filter((c: Commande) => c.statut === 'VALIDEE').length;
    const annulees = commandes.filter((c: Commande) => c.statut === 'ANNULEE').length;

    const statsItems: StatItem[] = [
      { value: total, label: 'Total' },
      { value: enCours, label: 'En cours' },
      { value: validees, label: 'Validées' },
      { value: annulees, label: 'Annulées' }
    ];

    return statsItems;
  }, [commandes]);

  if (isLoading && !isRefreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <CustomIcon name="alert-circle" size={48} color={colors.error} />
        <ThemedText style={styles.errorText}>
          Une erreur est survenue lors du chargement des commandes
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
      <HeaderWithSidebars restaurantName={selectedRestaurant?.nom_restaurant || ''} />
      
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <CustomIcon name="view-dashboard" size={20} color={colors.text + '80'} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Rechercher une commande..."
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
            style={[styles.filterButton, activeFilter === 'EN_COURS' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('EN_COURS')}
          >
            <ThemedText style={[styles.filterButtonText, activeFilter === 'EN_COURS' && styles.filterButtonTextActive]}>
              En cours
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'VALIDEE' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('VALIDEE')}
          >
            <ThemedText style={[styles.filterButtonText, activeFilter === 'VALIDEE' && styles.filterButtonTextActive]}>
              Validées
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.filterButton, activeFilter === 'ANNULEE' && styles.filterButtonActive]}
            onPress={() => setActiveFilter('ANNULEE')}
          >
            <ThemedText style={[styles.filterButtonText, activeFilter === 'ANNULEE' && styles.filterButtonTextActive]}>
              Annulées
            </ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={filteredCommandes}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <CommandeCard
            commande={item}
            onPress={() => router.navigate(`/(tabs)/commande/${item.id}?from=commandes` as any)}
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
            <CustomIcon name="silverware-fork-knife" size={48} color={colors.text} />
            <ThemedText style={styles.emptyText}>
              Aucune commande trouvée
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
    backgroundColor: '#3b82f6',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(142, 142, 147, 0.12)',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 40,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#000',
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
    marginHorizontal: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  titleContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  cardContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
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