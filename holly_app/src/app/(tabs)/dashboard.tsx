import { CustomIcon } from '@/components/common/CustomIcon';
import { HeaderWithSidebars } from '@/components/common/HeaderWithSidebars';
import { ThemedText } from '@/components/common/ThemedText';
import ThemedView from '@/components/common/ThemedView';
import { DashboardCardV2 } from '@/components/dashboard/DashboardCardV2';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { useArticles } from '@/hooks/useArticles';
import { useCommandes } from '@/hooks/useCommandes';
import { useNotes } from '@/hooks/useNotes';
import { useReservations } from '@/hooks/useReservations';
import { useStocks } from '@/hooks/useStocks';
import { useThemeColor } from '@/hooks/useThemeColor';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function DashboardScreen() {
  const { colors } = useThemeColor();
  const { selectedRestaurant } = useRestaurants();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Hooks pour les données
  const { reservations, loading: loadingReservations, refreshReservations } = useReservations(selectedRestaurant?.id_restaurant || null);
  const { commandes, loading: loadingCommandes, refreshCommandes } = useCommandes(selectedRestaurant?.id_restaurant || null);
  const { stocks, loading: loadingStocks, refreshStocks } = useStocks(selectedRestaurant?.id_restaurant || null);
  const { notes, loading: loadingNotes, refreshNotes } = useNotes(selectedRestaurant?.id_restaurant || null);
  const { articles, loading: loadingArticles, refresh: refreshArticles } = useArticles(selectedRestaurant?.id_restaurant || null);

  // Calculs pour les statistiques
  const futureReservations = reservations.filter(r => new Date(r.date_heure) >= new Date());
  const commandesEnCours = commandes.filter(c => c.statut === 'EN_COURS').length;
  const stocksEnAlerte = stocks.filter(s => s.quantite_en_stock <= s.seuil_alerte).length;
  const articlesDisponibles = articles.filter(a => a.disponible).length;

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refreshReservations(),
        refreshCommandes(),
        refreshStocks(),
        refreshNotes(),
        refreshArticles()
      ]);
    } catch (error) {
      console.error('Erreur lors du rafraîchissement des données:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, [refreshReservations, refreshCommandes, refreshStocks, refreshNotes, refreshArticles]);

  useEffect(() => {
    handleRefresh();
  }, [selectedRestaurant]);

  return (
    <ThemedView style={styles.container}>
      <HeaderWithSidebars restaurantName={selectedRestaurant?.nom_restaurant || ''} />
      
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
          icon="silverware-fork-knife"
          title="Articles"
          value={articles.length.toString()}
          subtitle={`${articlesDisponibles} articles disponibles`}
          onPress={() => router.push('/(tabs)/articles' as any)}
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
  },
});

const stylesV2 = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: '700',
  },
  refreshButton: {
    padding: 8,
  },
}); 