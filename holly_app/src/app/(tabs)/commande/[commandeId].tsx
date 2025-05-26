// import { Button } from '@/components/common/Button';
import { CustomIcon } from '@/components/common/CustomIcon';
import { HeaderWithSidebars } from '@/components/common/HeaderWithSidebars';
import { ThemedText } from '@/components/common/ThemedText';
import ThemedView from '@/components/common/ThemedView';
import { Colors } from '@/constants/Colors';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { Commande } from '@/models/Commande';
import { LigneCommande } from '@/models/LigneCommande';
import { commandeService } from '@/services/entities/commandeService';
import { ligneCommandeService } from '@/services/entities/ligneCommandeService';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, ScrollView, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

function LigneCommandeItem({ 
  ligne, 
  colors, 
  onDelete,
  commandeStatus
}: { 
  ligne: LigneCommande; 
  colors: any;
  onDelete: (id: number) => void;
  commandeStatus: string;
}) {
  const swipeableRef = useRef<Swipeable>(null);

  const renderRightActions = (
    progressAnimatedValue: Animated.AnimatedInterpolation<string | number>,
    dragAnimatedValue: Animated.AnimatedInterpolation<string | number>,
    swipeable: Swipeable
  ) => {
    if (typeof ligne.id !== 'number' || commandeStatus !== 'EN_COURS') return null;
    
    return (
      <View style={[styles.deleteActionContainer, { width: 90 }]}>
        <TouchableOpacity
          style={[styles.deleteAction, { backgroundColor: colors.error }]}
          onPress={() => onDelete(ligne.id as number)}
        >
          <MaterialCommunityIcons 
            name="delete" 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      rightThreshold={35}
      containerStyle={styles.swipeableContainer}
      enabled={commandeStatus === 'EN_COURS'}
      friction={1.5}
      overshootRight={false}
    >
      <View style={[styles.ligneCommandeCard, { 
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        opacity: commandeStatus !== 'EN_COURS' ? 0.7 : 1,
      }]}>
        <View style={styles.ligneCommandeContent}>
          <View style={styles.ligneCommandeMain}>
            <ThemedText style={[styles.ligneCommandeTitle, { 
              color: colors.text,
              fontSize: 15,
            }]} numberOfLines={1}>
              {ligne.article?.nom || 'Article inconnu'}
            </ThemedText>
            <ThemedText style={[styles.ligneCommandePrice, { 
              color: colors.primary,
              fontSize: 15,
              fontWeight: '600',
            }]}>
              {(Number(ligne.prix_unitaire) * ligne.quantite).toFixed(2)} €
            </ThemedText>
          </View>
          <View style={styles.ligneCommandeSub}>
            <ThemedText style={[styles.ligneCommandeQuantity, { 
              color: colors.textSecondary,
              fontSize: 13,
            }]}>
              Quantité : {ligne.quantite}
            </ThemedText>
            <ThemedText style={[styles.ligneCommandeUnitPrice, { 
              color: colors.textSecondary,
              fontSize: 13,
            }]}>
              {Number(ligne.prix_unitaire).toFixed(2)} € l'unité
            </ThemedText>
          </View>
        </View>
      </View>
    </Swipeable>
  );
}

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

  useFocusEffect(
    useCallback(() => {
      console.log('La page de détail de la commande est devenue active');
      fetchCommandeDetails();
    }, [commandeId])
  );

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

  const handleDeleteLigneCommande = async (ligneId: number) => {
    try {
      await ligneCommandeService.deleteLigneCommande(ligneId);
      // Rafraîchir les données après la suppression
      fetchCommandeDetails();
    } catch (error) {
      console.error('Erreur lors de la suppression de la ligne de commande:', error);
      Alert.alert(
        'Erreur',
        'Une erreur est survenue lors de la suppression de l\'article'
      );
    }
  };

  if (loading || refreshing) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={styles.loadingText}>
          {refreshing ? 'Rafraîchissement des données...' : 'Chargement des détails de la commande...'}
        </ThemedText>
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
          onPress={fetchCommandeDetails}
        >
          <ThemedText style={styles.retryButtonText}>Réessayer</ThemedText>
        </TouchableOpacity>
      </ThemedView>
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
                <LigneCommandeItem
                  key={ligne.id}
                  ligne={ligne}
                  colors={colors}
                  onDelete={handleDeleteLigneCommande}
                  commandeStatus={commande.statut}
                />
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
    backgroundColor: 'transparent',
    marginBottom: 0,
  },
  ligneCommandeContent: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  ligneCommandeMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  ligneCommandeSub: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ligneCommandeTitle: {
    flex: 1,
    marginRight: 12,
  },
  ligneCommandePrice: {
    textAlign: 'right',
  },
  ligneCommandeQuantity: {
    marginRight: 12,
  },
  ligneCommandeUnitPrice: {
    textAlign: 'right',
  },
  deleteActionContainer: {
    width: 90,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteAction: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeableContainer: {
    marginHorizontal: 16,
    marginBottom: 1,
    backgroundColor: 'transparent',
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
}); 