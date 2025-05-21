import { CustomIcon } from '@/components/CustomIcon';
import { HeaderWithSidebars } from '@/components/HeaderWithSidebars';
import { ThemedText } from '@/components/ThemedText';
import ThemedView from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useStocks } from '@/hooks/useStocks';
import { Stock } from '@/src/models';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

type StockFilter = 'all' | 'alert' | 'rupture' | 'normal';

interface StockCardProps {
  stock: Stock;
  onPress?: () => void;
}

function StockCard({ stock, onPress }: StockCardProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  
  // Calcul du pourcentage d'utilisation (en utilisant le seuil d'alerte comme référence)
  const pourcentageUtilisation = Math.round((stock.quantite_en_stock / (stock.seuil_alerte * 2)) * 100);
  
  // Détermination de la couleur en fonction du pourcentage
  const getGradientColors = () => {
    if (pourcentageUtilisation <= 0) return ['#FF4B4B', '#FF4B4B'] as const; // Rouge pour rupture
    if (pourcentageUtilisation <= 50) return ['#FFA500', '#FFA500'] as const; // Orange pour alerte
    return ['#4CAF50', '#4CAF50'] as const; // Vert pour normal
  };

  const statusText = pourcentageUtilisation <= 0 
    ? 'Rupture' 
    : pourcentageUtilisation <= 50 
      ? 'Alerte' 
      : 'Normal';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
    >
      <ThemedView variant="card" style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <ThemedText style={styles.title} numberOfLines={1}>
              {stock.ingredient.nom}
            </ThemedText>
            <View style={styles.statusContainer}>
              <View style={[styles.statusDot, { backgroundColor: getGradientColors()[0] }]} />
              <ThemedText style={styles.statusText}>{statusText}</ThemedText>
            </View>
          </View>
          <CustomIcon name="chevron-right" size={20} color={colors.primary} />
        </View>

        <View style={styles.cardContent}>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Quantité en stock:</ThemedText>
            <ThemedText style={styles.value}>{stock.quantite_en_stock} {stock.ingredient.unite}</ThemedText>
          </View>
          <View style={styles.infoRow}>
            <ThemedText style={styles.label}>Seuil d'alerte:</ThemedText>
            <ThemedText style={styles.value}>{stock.seuil_alerte} {stock.ingredient.unite}</ThemedText>
          </View>
          <View style={styles.progressContainer}>
            <ThemedText style={styles.label}>Utilisation:</ThemedText>
            <View style={styles.progressBarContainer}>
              <LinearGradient
                colors={getGradientColors()}
                style={[
                  styles.progressBar,
                  { width: `${Math.min(Math.max(pourcentageUtilisation, 0), 100)}%` }
                ]}
              />
            </View>
            <ThemedText style={styles.percentageText}>{pourcentageUtilisation}%</ThemedText>
          </View>
        </View>
      </ThemedView>
    </TouchableOpacity>
  );
}

export default function StocksScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<StockFilter>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { selectedRestaurant } = useRestaurants();
  const {
    stocks,
    loading,
    error,
    refreshStocks
  } = useStocks(selectedRestaurant?.id_restaurant || null);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshStocks();
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const filteredStocks = useMemo(() => {
    return stocks.filter(stock => {
      const matchesSearch = stock.ingredient.nom.toLowerCase().includes(searchQuery.toLowerCase());
      const pourcentage = (stock.quantite_en_stock / (stock.seuil_alerte * 2)) * 100;
      
      if (!matchesSearch) return false;
      
      switch (activeFilter) {
        case 'rupture':
          return pourcentage <= 0;
        case 'alert':
          return pourcentage > 0 && pourcentage <= 50;
        case 'normal':
          return pourcentage > 50;
        default:
          return true;
      }
    });
  }, [stocks, searchQuery, activeFilter]);

  const FilterButton = ({ filter, label }: { filter: StockFilter; label: string }) => {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          { backgroundColor: colors.surface },
          activeFilter === filter && styles.filterButtonActive
        ]}
        onPress={() => setActiveFilter(filter)}
      >
        <ThemedText
          style={[
            styles.filterButtonText,
            { color: colors.text + '80' },
            activeFilter === filter && styles.filterButtonTextActive
          ]}
        >
          {label}
        </ThemedText>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.loadingText}>Chargement des stocks...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !selectedRestaurant) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <CustomIcon name="alert-circle" size={40} color={colors.error} />
        <ThemedText style={styles.errorText}>
          {error || "Aucun restaurant sélectionné"}
        </ThemedText>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRefresh}
        >
          <ThemedText style={styles.retryText}>Réessayer</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <HeaderWithSidebars restaurantName={selectedRestaurant.nom_restaurant} />
      
      <View style={styles.headerContainer}>
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.surface }]}>
            <CustomIcon name="view-dashboard" size={20} color={colors.text + '80'} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Rechercher un produit..."
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
          style={[styles.refreshButton, { backgroundColor: colors.surface }]}
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

      <View style={styles.filtersContainer}>
        <FilterButton filter="all" label="Tous" />
        <FilterButton filter="rupture" label="Rupture" />
        <FilterButton filter="alert" label="Alerte" />
        <FilterButton filter="normal" label="Normal" />
      </View>

      <FlatList
        data={filteredStocks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <StockCard
            stock={item}
            onPress={() => {
              // Navigation vers les détails du stock si nécessaire
              // router.push(`/stock/${item.id}`);
            }}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
            <CustomIcon name="silverware-fork-knife" size={40} color={colors.text + '40'} />
            <ThemedText style={styles.emptyText}>
              {searchQuery
                ? "Aucun produit ne correspond à votre recherche"
                : "Aucun stock disponible"}
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonActive: {
    backgroundColor: '#F27E42',
  },
  filterButtonText: {
    fontSize: 14,
  },
  filterButtonTextActive: {
    color: '#FFF',
    fontWeight: '600',
  },
  listContainer: {
    padding: 16,
    paddingTop: 0,
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
    marginBottom: 12,
  },
  titleContainer: {
    flex: 1,
    marginRight: 8,
  },
  title: {
    fontSize: 18,
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
    color: '#666',
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 14,
    color: '#666',
  },
  value: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#F6F5F8',
    borderRadius: 4,
    marginVertical: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  percentageText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F27E42',
  },
  retryText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
  },
}); 