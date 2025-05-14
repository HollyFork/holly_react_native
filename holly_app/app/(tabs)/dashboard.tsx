import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { HeaderWithSidebars } from '@/components/HeaderWithSidebars';
import { CustomIcon } from '@/components/CustomIcon';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { useReservations } from '@/hooks/useReservations';
import { useNotes } from '@/hooks/useNotes';
import { useCommandes } from '@/hooks/useCommandes';
import { useStocks } from '@/hooks/useStocks';
import { router } from 'expo-router';

interface DashboardCardV2Props {
  icon: string;
  title: string;
  value: string | number;
  subtitle?: string;
  onPress?: () => void;
}

function DashboardCardV2({ icon, title, value, subtitle, onPress }: DashboardCardV2Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  return (
    <TouchableOpacity
      style={stylesV2.card}
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
      <View style={stylesV2.separator} />
      <View style={stylesV2.valueContainer}>
        <ThemedText
          style={stylesV2.value}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.5}
        >
          {value}
        </ThemedText>
        {subtitle && <ThemedText style={stylesV2.subtitle}>{subtitle}</ThemedText>}
      </View>
    </TouchableOpacity>
  );
}

export default function DashboardScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const { 
    selectedRestaurant,
    loading: restaurantsLoading,
    error: restaurantsError,
    refreshRestaurants
  } = useRestaurants();

  const {
    loading: reservationsLoading,
    error: reservationsError,
    getFutureReservations,
    refreshReservations
  } = useReservations(selectedRestaurant?.id_restaurant || null);

  const {
    notes,
    loading: notesLoading,
    error: notesError,
    refreshNotes
  } = useNotes(selectedRestaurant?.id_restaurant || null);

  const {
    commandes,
    loading: commandesLoading,
    error: commandesError,
    refreshCommandes
  } = useCommandes(selectedRestaurant?.id_restaurant || null);

  const {
    stocks,
    loading: stocksLoading,
    error: stocksError,
    refreshStocks
  } = useStocks(selectedRestaurant?.id_restaurant || null);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshRestaurants(),
        refreshReservations(),
        refreshNotes(),
        refreshCommandes(),
        refreshStocks()
      ]);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  if (restaurantsLoading || reservationsLoading || notesLoading || commandesLoading || stocksLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.loadingText}>Chargement des données...</ThemedText>
      </ThemedView>
    );
  }

  if (restaurantsError || reservationsError || notesError || commandesError || stocksError || !selectedRestaurant) {
    return (
      <ThemedView style={[styles.container, styles.centered]}>
        <CustomIcon name="alert-circle" size={40} color={colors.error} />
        <ThemedText style={styles.errorText}>
          {restaurantsError || reservationsError || notesError || commandesError || stocksError || "Aucun restaurant disponible"}
        </ThemedText>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => {
            refreshRestaurants();
            refreshReservations();
            refreshNotes();
            refreshCommandes();
            refreshStocks();
          }}
        >
          <ThemedText style={styles.retryText}>Réessayer</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const futureReservations = getFutureReservations();
  const commandesEnCours = commandes.filter(cmd => cmd.statut === 'EN_COURS').length;
  const stocksEnAlerte = stocks.filter(stock => stock.quantite_en_stock <= stock.seuil_alerte).length;

  return (
    <ThemedView style={styles.container}>
      <HeaderWithSidebars restaurantName={selectedRestaurant.nom_restaurant} />
      
      {/* Contenu principal */}
      <ScrollView 
        style={stylesV2.content}
        contentContainerStyle={stylesV2.contentContainer}
        showsVerticalScrollIndicator={false}
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
              color={isRefreshing ? colors.text + '80' : colors.primary} 
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
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  dashboardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  card: {
    width: '48%',
    height: 96,
    marginBottom: 16,
    padding: 14,
    paddingTop: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(242, 126, 66, 0.1)',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
  },
  cardIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 2,
    alignSelf: 'center',
  },
  cardContent: {
    flex: 1,
    marginLeft: 8,
    flexDirection: 'column',
    justifyContent: 'center',
    paddingRight: 5,
    height: '100%',
    paddingTop: 10,
  },
  cardTitle: {
    fontSize: 12,
    color: '#888',
    fontWeight: '400',
    marginBottom: 4,
    marginTop: 0,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
    lineHeight: 26,
  },
  cardValueUnit: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 2,
    lineHeight: 22,
  },
  cardSubtitle: {
    fontSize: 11,
    opacity: 0.6,
    lineHeight: 14,
  },
  cardArrow: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

const stylesV2 = StyleSheet.create({
  content: {
    flex: 1,
    backgroundColor: '#F6F5F8',
  },
  contentContainer: {
    padding: 18,
    paddingBottom: 32,
  },
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
    color: '#111',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
  },
  card: {
    backgroundColor: '#fff',
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
    color: '#222',
    flex: 1,
  },
  chevronContainer: {
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: '#ECECEC',
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
    color: '#F27E42',
    marginBottom: 2,
    textAlign: 'center',
    flexShrink: 1,
    width: '100%',
  },
  subtitle: {
    fontSize: 15,
    color: '#A0A0A0',
    marginTop: 6,
    textAlign: 'center',
  },
}); 