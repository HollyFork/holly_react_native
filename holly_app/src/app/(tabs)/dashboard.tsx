import { CustomIcon } from '@/components/common/CustomIcon';
import { HeaderWithSidebars } from '@/components/common/HeaderWithSidebars';
import { ThemedText } from '@/components/common/ThemedText';
import ThemedView from '@/components/common/ThemedView';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { useCommandes } from '@/hooks/useCommandes';
import { useNotes } from '@/hooks/useNotes';
import { useReservations } from '@/hooks/useReservations';
import { useStocks } from '@/hooks/useStocks';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface DashboardCardV2Props {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  onPress?: () => void;
}

function DashboardCardV2({ icon, title, value, subtitle, onPress }: DashboardCardV2Props) {
  const { colors, styles: themeStyles } = useThemeColor();
  
  return (
    <TouchableOpacity
      style={[
        stylesV2.card,
        themeStyles.card,
        { backgroundColor: colors.card }
      ]}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <View style={stylesV2.headerRow}>
        <CustomIcon name={icon as any} size={22} color={colors.primary} style={{ marginRight: 8 }} />
        <ThemedText style={stylesV2.cardTitle} numberOfLines={1} ellipsizeMode="tail">{title}</ThemedText>
        <View style={stylesV2.chevronContainer}>
          <CustomIcon name="chevron-right" size={20} color={colors.primary} />
        </View>
      </View>
      <View style={[stylesV2.separator, { backgroundColor: colors.border }]} />
      <View style={stylesV2.valueContainer}>
        <ThemedText
          style={[stylesV2.value, { color: colors.primary }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {value}
        </ThemedText>
        {subtitle && (
          <ThemedText 
            style={[stylesV2.subtitle, { color: colors.textSecondary }]}
          >
            {subtitle}
          </ThemedText>
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const { colors, isDark } = useThemeColor();
  const { selectedRestaurant, loading: restaurantsLoading, error: restaurantsError, refreshRestaurants } = useRestaurants();
  const { reservations, loading: reservationsLoading, error: reservationsError, refreshReservations } = useReservations(selectedRestaurant?.id_restaurant || null);
  const { notes, loading: notesLoading, error: notesError, refreshNotes } = useNotes(selectedRestaurant?.id_restaurant || null);
  const { commandes, loading: commandesLoading, error: commandesError, refreshCommandes } = useCommandes(selectedRestaurant?.id_restaurant || null);
  const { stocks, loading: stocksLoading, error: stocksError, refreshStocks } = useStocks(selectedRestaurant?.id_restaurant || null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [allDataReady, setAllDataReady] = useState(false);

  // Vérifier si toutes les données sont prêtes
  useEffect(() => {
    const checkAllDataReady = () => {
      const isLoading = restaurantsLoading || reservationsLoading || notesLoading || commandesLoading || stocksLoading;
      setAllDataReady(!isLoading);
    };

    checkAllDataReady();
  }, [restaurantsLoading, reservationsLoading, notesLoading, commandesLoading, stocksLoading]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    setAllDataReady(false);
    
    try {
      // Utiliser Promise.allSettled pour continuer même si certaines requêtes échouent
      const results = await Promise.allSettled([
        refreshRestaurants(),
        selectedRestaurant ? refreshReservations() : Promise.resolve(),
        selectedRestaurant ? refreshNotes() : Promise.resolve(),
        selectedRestaurant ? refreshCommandes() : Promise.resolve(),
        selectedRestaurant ? refreshStocks() : Promise.resolve()
      ]);
      
      // Vérifier les résultats
      results.forEach((result, index) => {
        if (result.status === 'rejected') {
          console.error(`La requête ${index} a échoué:`, result.reason);
        }
      });
      
      setAllDataReady(true);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Utiliser les données disponibles, même partielles
  const futureReservations = reservations ? reservations.filter(res => {
    const today = new Date().toISOString().split('T')[0];
    return res.date_heure && res.date_heure.split('T')[0] === today;
  }) : [];
  const commandesEnCours = commandes ? commandes.filter(cmd => cmd.statut === 'EN_COURS').length : 0;
  const stocksEnAlerte = stocks ? stocks.filter(stock => stock.quantite_en_stock <= stock.seuil_alerte).length : 0;

  // Afficher le chargement lorsque n'importe quelle donnée est en cours de chargement
  if (!allDataReady && !isRefreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.loadingText}>Chargement des données...</ThemedText>
      </ThemedView>
    );
  }

  // Afficher l'erreur si une erreur survient dans le chargement des restaurants
  if (restaurantsError) {
    return (
      <ThemedView style={styles.errorContainer}>
        <CustomIcon name="alert-circle" size={48} color={colors.error} />
        <ThemedText style={styles.errorText}>
          {restaurantsError || "Erreur lors du chargement des restaurants"}
        </ThemedText>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]} 
          onPress={handleRefresh}
        >
          <ThemedText style={styles.retryButtonText}>Réessayer</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (!selectedRestaurant) {
    return (
      <ThemedView style={styles.errorContainer}>
        <CustomIcon name="alert-circle" size={48} color={colors.error} />
        <ThemedText style={styles.errorText}>
          Aucun restaurant disponible
        </ThemedText>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]} 
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
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={stylesV2.titleContainer}>
          <ThemedText type="title" style={stylesV2.mainTitle}>
            Tableau de bord
          </ThemedText>
          <TouchableOpacity 
            onPress={handleRefresh}
            style={stylesV2.refreshButton}
            disabled={isRefreshing}
          >
            <CustomIcon 
              name="refresh" 
              size={24} 
              color={isRefreshing ? colors.textSecondary : colors.primary} 
            />
          </TouchableOpacity>
        </View>
        <DashboardCardV2
          icon="event"
          title={"Réservations aujourd'hui"}
          value={futureReservations.length.toString()}
          subtitle={futureReservations.length === 1 ? 'réservation' : 'réservations'}
          onPress={() => router.push('/(tabs)/reservations')}
        />
        <DashboardCardV2
          icon="shopping_bag"
          title="Commandes"
          value={commandes.length.toString()}
          subtitle={`Commandes en cours : ${commandesEnCours}`}
          onPress={() => router.push('/(tabs)/commandes')}
        />
        <DashboardCardV2
          icon="fridge-alert-outline"
          title="Stocks"
          value={stocks.length.toString()}
          subtitle={`${stocksEnAlerte} produits en alerte`}
          onPress={() => router.push('/(tabs)/stocks')}
        />
        <DashboardCardV2
          icon="note-text"
          title="Notes"
          value={notes.length.toString()}
          subtitle={notes.length === 1 ? 'note' : 'notes'}
          onPress={() => router.push('/(tabs)/notes')}
        />
        <DashboardCardV2
          icon="schedule"
          title="Heures de pointe"
          value={"12h-14h, 19h-21h"}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
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
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

const stylesV2 = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
    marginTop: 8,
  },
  mainTitle: {
    fontSize: 30,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
  },
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