import { CustomIcon } from '@/components/common/CustomIcon';
import { HeaderWithSidebars } from '@/components/common/HeaderWithSidebars';
import { ThemedText } from '@/components/common/ThemedText';
import ThemedView from '@/components/common/ThemedView';
import { Colors } from '@/constants/Colors';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useLignesCommande } from '@/hooks/useLignesCommande';
import { Commande, CreateCommandeDTO } from '@/models/Commande';
import { commandeService } from '@/services/entities/commandeService';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function TableCommandeScreen() {
  const { tableId } = useLocalSearchParams();
  const [commande, setCommande] = useState<Commande | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { selectedRestaurant } = useRestaurants();
  const { lignesCommande, loading: loadingLignes, error: errorLignes, refreshLignesCommande } = useLignesCommande(commande?.id || null);

  const fetchCommande = async () => {
    if (!tableId || isNaN(Number(tableId))) {
      setError('ID de table invalide');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data: commandes } = await commandeService.getByTableId(Number(tableId));
      
      // Filtrer pour ne garder que les commandes en cours
      const commandeEnCours = commandes.find(c => c.statut === 'EN_COURS');
      
      if (commandeEnCours) {
        setCommande(commandeEnCours);
      } else {
        // Créer une nouvelle commande si aucune n'existe
        if (!selectedRestaurant) {
          throw new Error('Restaurant non sélectionné');
        }

        const nouvelleCommande: CreateCommandeDTO = {
          restaurant_id: selectedRestaurant.id_restaurant,
          table_id: Number(tableId),
          created_by_id: 1, // À remplacer par l'ID de l'employé connecté
          statut: 'EN_COURS',
          nb_articles: 0,
          montant: 0
        };

        const { data } = await commandeService.createCommande(nouvelleCommande);
        setCommande(data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement/création de la commande:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommande();
  }, [tableId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchCommande();
    if (commande) {
      refreshLignesCommande();
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (loading && !refreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.loadingText}>Chargement des détails de la table...</ThemedText>
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <CustomIcon name="alert-circle" size={48} color={colors.error} />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={fetchCommande}
        >
          <ThemedText style={styles.retryButtonText}>Réessayer</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <HeaderWithSidebars restaurantName={selectedRestaurant?.nom_restaurant || ''} />
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <CustomIcon name="chevron-right" size={24} color={colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <ThemedText style={styles.title}>
            Commande Table {commande?.table?.numero}
          </ThemedText>
        </View>

        <View style={styles.content}>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Statut:
              </ThemedText>
              <View style={[
                styles.statusBadge,
                { backgroundColor: commande?.statut === 'EN_COURS' ? colors.primary + '20' : colors.success + '20' }
              ]}>
                <ThemedText style={[
                  styles.statusText,
                  { color: commande?.statut === 'EN_COURS' ? colors.primary : colors.success }
                ]}>
                  {commande?.statut === 'EN_COURS' ? 'En cours' : 'Validée'}
                </ThemedText>
              </View>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Montant total:
              </ThemedText>
              <ThemedText style={[styles.value, { color: colors.primary }]}>
                {Number(commande?.montant || 0).toFixed(2)} €
              </ThemedText>
            </View>
            <View style={styles.infoRow}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Articles:
              </ThemedText>
              <ThemedText style={[styles.value, { color: colors.text }]}>
                {commande?.nb_articles || 0} articles
              </ThemedText>
            </View>
          </View>

          {/* Liste des articles de la commande */}
          <View style={styles.articlesSection}>
            <ThemedText style={styles.sectionTitle}>Articles commandés</ThemedText>
            {loadingLignes ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : errorLignes ? (
              <ThemedText style={[styles.errorText, { color: colors.error }]}>
                {errorLignes}
              </ThemedText>
            ) : lignesCommande.length === 0 ? (
              <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                Aucun article dans la commande
              </ThemedText>
            ) : (
              lignesCommande.map((ligne) => (
                <View key={ligne.id} style={styles.articleItem}>
                  <View style={styles.articleInfo}>
                    <ThemedText style={styles.articleName}>
                      {ligne.article?.nom ?? 'Article inconnu'}
                    </ThemedText>
                    <ThemedText style={[styles.articleQuantity, { color: colors.textSecondary }]}>
                      x{ligne.quantite}
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.articlePrice, { color: colors.primary }]}>
                    {(ligne.prix_unitaire * ligne.quantite).toFixed(2)} €
                  </ThemedText>
                </View>
              ))
            )}
          </View>
        </View>
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
  scrollViewContent: {
    flexGrow: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 16,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  articlesSection: {
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  articleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  articleInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  articleName: {
    fontSize: 16,
    flex: 1,
  },
  articleQuantity: {
    fontSize: 14,
    marginLeft: 8,
  },
  articlePrice: {
    fontSize: 16,
    fontWeight: '600',
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
    marginBottom: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#F27E42',
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 20,
  },
}); 