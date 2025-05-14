import React from 'react';
import { StyleSheet, ScrollView, View, RefreshControl, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { useColorScheme } from '@/hooks/useColorScheme';
import { commandeService } from '@/src/services/entities/commandeService';
import { ligneCommandeService } from '@/src/services/entities/ligneCommandeService';
import { Commande } from '@/src/models/Commande';
import { LigneCommande } from '@/src/models/LigneCommande';
import { HeaderWithSidebars } from '@/components/HeaderWithSidebars';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { Colors } from '@/constants/Colors';
import { CustomIcon } from '@/components/CustomIcon';

export default function CommandeDetailsScreen() {
  const { commandeId } = useLocalSearchParams();
  const [commande, setCommande] = useState<Commande | null>(null);
  const [lignesCommande, setLignesCommande] = useState<LigneCommande[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { selectedRestaurant } = useRestaurants();

  const fetchCommandeDetails = async () => {
    if (!commandeId || isNaN(Number(commandeId))) {
      setError('ID de commande invalide');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    try {
      setError(null);
      const [commandeData, lignesData] = await Promise.all([
        commandeService.getById(Number(commandeId)),
        ligneCommandeService.getByIdCommande(Number(commandeId))
      ]);
      
      console.log('Données commande reçues:', commandeData.data);
      console.log('Lignes commande reçues:', lignesData.data);
      
      if (!commandeData.data) {
        setError('Commande non trouvée');
        setCommande(null);
      } else {
        setCommande(commandeData.data);
      }
      
      if (lignesData.data && Array.isArray(lignesData.data)) {
        setLignesCommande(lignesData.data);
      } else {
        console.warn('Format de données invalide pour les lignes de commande:', lignesData.data);
        setLignesCommande([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des détails de la commande:', error);
      setError('Erreur lors du chargement des détails de la commande');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCommandeDetails();
  }, [commandeId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchCommandeDetails();
  };

  const handleBack = () => {
    router.push('/(tabs)/commandes');
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ThemedText>Chargement...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.centered]}>
        <CustomIcon name="alert-circle" size={48} color={colors.error} style={{ marginBottom: 16 }} />
        <ThemedText style={{ color: colors.error, textAlign: 'center' }}>{error}</ThemedText>
      </View>
    );
  }

  if (!commande) {
    return (
      <View style={[styles.container, styles.centered]}>
        <CustomIcon name="alert-circle" size={48} color={colors.error} style={{ marginBottom: 16 }} />
        <ThemedText style={{ color: colors.error, textAlign: 'center' }}>Commande non trouvée</ThemedText>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <HeaderWithSidebars restaurantName={selectedRestaurant?.nom_restaurant || ''} />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={styles.navBar}>
        <TouchableOpacity 
          onPress={handleBack}
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <CustomIcon name="chevron-right" size={24} color={colors.primary} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={onRefresh}
          style={styles.navButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <CustomIcon name="refresh" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
              <View style={styles.statusContainer}>
                <CustomIcon 
                  name={commande.statut === 'EN_COURS' ? 'clock-time-four' : 
                        commande.statut === 'VALIDEE' ? 'check' : 'alert-circle'} 
                  size={24} 
                  color={commande.statut === 'EN_COURS' ? colors.primary : 
                         commande.statut === 'VALIDEE' ? '#22c55e' : '#ef4444'} 
                />
                <ThemedText style={[styles.status, { 
                  color: commande.statut === 'EN_COURS' ? colors.primary : 
                         commande.statut === 'VALIDEE' ? '#22c55e' : '#ef4444'
                }]}>
                  {commande.statut === 'EN_COURS' && 'En cours'}
                  {commande.statut === 'VALIDEE' && 'Validée'}
                  {commande.statut === 'ANNULEE' && 'Annulée'}
                </ThemedText>
              </View>
              <ThemedText style={styles.date}>
                {new Date(commande.created_at).toLocaleString('fr-FR')}
              </ThemedText>
            </View>

            <View style={styles.details}>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <CustomIcon name="view-dashboard" size={20} color={colors.icon} />
                  <ThemedText style={styles.detailLabel}>Nombre d'articles</ThemedText>
                </View>
                <ThemedText style={styles.detailValue}>{commande.nb_articles}</ThemedText>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailLabelContainer}>
                  <CustomIcon name="currency-eur" size={20} color={colors.icon} />
                  <ThemedText style={styles.detailLabel}>Montant total</ThemedText>
                </View>
                <ThemedText style={[styles.detailValue, { color: colors.primary, fontWeight: '600' }]}>
                  {Number(commande.montant).toFixed(2)} €
                </ThemedText>
              </View>
              {commande.table && (
                <View style={styles.detailRow}>
                  <View style={styles.detailLabelContainer}>
                    <CustomIcon name="silverware-fork-knife" size={20} color={colors.icon} />
                    <ThemedText style={styles.detailLabel}>Table</ThemedText>
                  </View>
                  <ThemedText style={styles.detailValue}>
                    {commande.table.numero}
                  </ThemedText>
                </View>
              )}
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <CustomIcon name="view-dashboard" size={24} color={colors.icon} />
              <ThemedText style={styles.sectionTitle}>Articles commandés</ThemedText>
            </View>
            {lignesCommande && lignesCommande.length > 0 ? (
              lignesCommande.map((ligne) => (
                <View key={ligne.id} style={[styles.ligneCommandeCard, { backgroundColor: colors.background }]}>
                  <View style={styles.ligneCommandeHeader}>
                    <View style={styles.ligneCommandeTitleContainer}>
                      <CustomIcon name="silverware-fork-knife" size={20} color={colors.icon} style={styles.ligneCommandeIcon} />
                      <ThemedText style={styles.ligneCommandeTitle}>
                        {ligne.article?.nom || 'Article inconnu'}
                      </ThemedText>
                    </View>
                    <View style={[styles.quantityBadge, { backgroundColor: colors.primary + '15' }]}>
                      <ThemedText style={[styles.ligneCommandeQuantity, { color: colors.primary }]}>
                        x{ligne.quantite}
                      </ThemedText>
                    </View>
                  </View>
                  <View style={styles.ligneCommandeDetails}>
                    <ThemedText style={styles.ligneCommandePrice}>
                      {Number(ligne.prix_unitaire).toFixed(2)} € × {ligne.quantite} = {(Number(ligne.prix_unitaire) * ligne.quantite).toFixed(2)} €
                    </ThemedText>
                  </View>
                  {ligne.article?.ingredients && ligne.article.ingredients.length > 0 && (
                    <View style={[styles.ingredientsContainer, { borderTopColor: colors.icon + '40' }]}>
                      <View style={styles.ingredientsHeader}>
                        <CustomIcon name="view-dashboard" size={20} color={colors.icon} />
                        <ThemedText style={styles.ingredientsTitle}>Ingrédients</ThemedText>
                      </View>
                      {ligne.article.ingredients.map((ingredient) => (
                        <View key={ingredient.id} style={styles.ingredientItem}>
                          <ThemedText style={styles.ingredientName}>
                            • {ingredient.ingredient.nom}
                          </ThemedText>
                          <ThemedText style={styles.ingredientQuantity}>
                            {Number(ingredient.quantite_necessaire).toFixed(2)} {ingredient.ingredient.unite}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              ))
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
                <CustomIcon name="alert-circle" size={24} color={colors.icon} style={{ marginBottom: 8 }} />
                <ThemedText style={{ color: colors.icon, textAlign: 'center' }}>
                  Aucun article dans cette commande
                </ThemedText>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
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
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
  },
  date: {
    fontSize: 14,
    opacity: 0.7,
  },
  details: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  ligneCommandeCard: {
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ligneCommandeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ligneCommandeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ligneCommandeIcon: {
    marginRight: 8,
  },
  ligneCommandeTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  quantityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ligneCommandeQuantity: {
    fontSize: 14,
    opacity: 0.7,
  },
  ligneCommandeDetails: {
    marginTop: 4,
  },
  ligneCommandePrice: {
    fontSize: 14,
    fontWeight: '600',
  },
  ingredientsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  ingredientsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  ingredientsTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 2,
  },
  ingredientName: {
    fontSize: 13,
    opacity: 0.7,
  },
  ingredientQuantity: {
    fontSize: 13,
    opacity: 0.7,
  },
  emptyState: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 4,
    backgroundColor: 'transparent',
  },
  navButton: {
    padding: 4,
    borderRadius: 8,
  },
}); 