// import { Button } from '@/components/common/Button';
import { CustomIcon } from '@/components/common/CustomIcon';
import { HeaderWithSidebars } from '@/components/common/HeaderWithSidebars';
import { ThemedText } from '@/components/common/ThemedText';
import { Colors } from '@/constants/Colors';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { Commande } from '@/models/Commande';
import { LigneCommande } from '@/models/LigneCommande';
import { commandeService } from '@/services/entities/commandeService';
import { ligneCommandeService } from '@/services/entities/ligneCommandeService';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';

export default function CommandeDetailsScreen() {
  const { commandeId, from } = useLocalSearchParams();
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
      console.log('Statut de la commande:', commandeData.data?.statut);
      
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
    if (from === 'tables') {
      router.push('/(tabs)/salles');
    } else if (from === 'commandes') {
      router.push('/(tabs)/commandes');
    } else {
      router.push('/');
    }
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <HeaderWithSidebars restaurantName={selectedRestaurant?.nom_restaurant || ''} />
      <Stack.Screen
        options={{
          headerShown: false,
        }}
      />
      
      <View style={[styles.navBar, { backgroundColor: colors.surface }]}>
        <TouchableOpacity 
          onPress={handleBack}
          style={[styles.navButton, { backgroundColor: colors.background }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <CustomIcon name="chevron-right" size={24} color={colors.primary} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>

        {commande && commande.statut === 'EN_COURS' && (
          <TouchableOpacity
            style={[styles.addButton, { 
              backgroundColor: colors.primary,
              borderWidth: 1,
              borderColor: colors.primary + '40',
              elevation: 2,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
            }]}
            onPress={() => router.push(`/commande/${commandeId}/ajouter-article`)}
            activeOpacity={0.7}
          >
            <CustomIcon name="plus" size={20} color={colors.surface} />
            <ThemedText style={[styles.addButtonText, { 
              color: colors.surface,
              fontSize: 15,
              fontWeight: '700',
            }]}>
              Ajouter un article
            </ThemedText>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity 
          onPress={onRefresh}
          style={[styles.navButton, { backgroundColor: colors.background }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <CustomIcon 
            name="refresh" 
            size={24} 
            color={colors.primary} 
            style={refreshing ? { transform: [{ rotate: '360deg' }] } : undefined}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.content}>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <View style={styles.statusContainer}>
                <CustomIcon 
                  name={commande.statut === 'EN_COURS' ? 'clock-time-four' : 
                        commande.statut === 'VALIDEE' ? 'check' : 'alert-circle'} 
                  size={24} 
                  color={commande.statut === 'EN_COURS' ? colors.warning : 
                         commande.statut === 'VALIDEE' ? colors.success : colors.error} 
                />
                <ThemedText style={[styles.status, { 
                  color: commande.statut === 'EN_COURS' ? colors.warning : 
                         commande.statut === 'VALIDEE' ? colors.success : colors.error
                }]}>
                  {commande.statut === 'EN_COURS' && 'En cours'}
                  {commande.statut === 'VALIDEE' && 'Validée'}
                  {commande.statut === 'ANNULEE' && 'Annulée'}
                </ThemedText>
              </View>
              <ThemedText style={[styles.date, { color: colors.textSecondary }]}>
                {new Date(commande.created_at).toLocaleString('fr-FR')}
              </ThemedText>
            </View>

            <View style={styles.details}>
              <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                <View style={styles.detailLabelContainer}>
                  <CustomIcon name="view-dashboard" size={20} color={colors.icon} />
                  <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>Nombre d'articles</ThemedText>
                </View>
                <View style={[styles.infoContainer, { backgroundColor: colors.primary + '15' }]}>
                  <ThemedText style={[styles.detailValue, { 
                    color: colors.primary, 
                    fontWeight: '700',
                    fontSize: 16,
                  }]}>
                    {commande.nb_articles}
                  </ThemedText>
                </View>
              </View>
              {commande.table && (
                <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                  <View style={styles.detailLabelContainer}>
                    <CustomIcon name="silverware-fork-knife" size={20} color={colors.icon} />
                    <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>Table</ThemedText>
                  </View>
                  <View style={[styles.infoContainer, { backgroundColor: colors.primary + '15' }]}>
                    <ThemedText style={[styles.detailValue, { 
                      color: colors.primary, 
                      fontWeight: '700',
                      fontSize: 16,
                    }]}>
                      {commande.table.numero}
                    </ThemedText>
                  </View>
                </View>
              )}
              <View style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                <View style={styles.detailLabelContainer}>
                  <CustomIcon name="currency-eur" size={20} color={colors.icon} />
                  <ThemedText style={[styles.detailLabel, { color: colors.textSecondary }]}>Montant total</ThemedText>
                </View>
                <View style={[styles.infoContainer, { backgroundColor: colors.primary + '15' }]}>
                  <ThemedText style={[styles.detailValue, { 
                    color: colors.primary, 
                    fontWeight: '700',
                    fontSize: 18,
                  }]}>
                    {Number(commande.montant).toFixed(2)} €
                  </ThemedText>
                </View>
              </View>
            </View>
          </View>

          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <View style={[styles.sectionHeader, { borderBottomColor: colors.border }]}>
              <CustomIcon name="view-dashboard" size={24} color={colors.icon} />
              <ThemedText style={[styles.sectionTitle, { color: colors.text }]}>Articles commandés</ThemedText>
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
              <View style={[styles.emptyState, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <CustomIcon name="alert-circle" size={32} color={colors.icon} style={{ marginBottom: 12 }} />
                <ThemedText style={{ 
                  color: colors.textSecondary, 
                  textAlign: 'center',
                  fontSize: 15,
                  paddingHorizontal: 16,
                  lineHeight: 22
                }}>
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
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  date: {
    fontSize: 14,
  },
  details: {
    padding: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
  },
  section: {
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    minHeight: 120,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(142, 142, 147, 0.12)',
    gap: 12,
    minHeight: 64,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    minWidth: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    gap: 8,
    minHeight: 44,
    marginHorizontal: 4,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '700',
    textAlign: 'center',
  },
}); 