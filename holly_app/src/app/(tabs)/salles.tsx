import { CustomIcon } from '@/components/common/CustomIcon';
import { HeaderWithSidebars } from '@/components/common/HeaderWithSidebars';
import { ThemedText } from '@/components/common/ThemedText';
import ThemedView from '@/components/common/ThemedView';
import { Colors } from '@/constants/Colors';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSalles } from '@/hooks/useSalles';
import { useTables } from '@/hooks/useTable';
import { CreateCommandeDTO } from '@/models/Commande';
import { Salle } from '@/models/Salle';
import { Table } from '@/models/Table';
import { commandeService } from '@/services/entities/commandeService';
import { router, useFocusEffect } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent, PinchGestureHandler, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// SalleDetails component remains unchanged from your provided code
function SalleDetails({ salle, isDropdown = false }: { salle: Salle; isDropdown?: boolean }) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  return (
    <View style={styles.salleDetailsContainer}>
      <View style={styles.salleDetailsInfo}>
        <View style={styles.salleDetailsRow}>
          <View style={styles.salleDetailsItem}>
            <CustomIcon name="account-group" size={16} color={colors.textSecondary} />
            <ThemedText style={[styles.salleDetailsText, { color: colors.textSecondary }]}>
              {salle.capacite} pers.
            </ThemedText>
          </View>
          <View style={styles.salleDetailsItem}>
            <CustomIcon name="view-dashboard" size={16} color={colors.textSecondary} />
            <ThemedText style={[styles.salleDetailsText, { color: colors.textSecondary }]}>
              Étage {salle.etage}
            </ThemedText>
          </View>
        </View>
      </View>
      {!isDropdown && <GridView salleId={salle.id} />}
    </View>
  );
}

interface GestureContext extends Record<string, unknown> {
  startX: number;
  startY: number;
}

// Constants for GridView
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const GRID_LOGICAL_CELL_UNITS = 100; // The logical size of one dimension of the grid (e.g., 0-100)
const CELLS_PER_ROW = 10; // Visual grid cells
const GRID_MIN_VISUAL_DIMENSION = 800; // Augmenté pour une meilleure visibilité
const GRID_PADDING = 16; // Padding constant pour la grille

// Helper worklet to calculate the actual dimensions of the grid content
const calculateGridContentDimensions = (vW: number, vH: number, minDim: number) => {
  'worklet';
  if (vW === 0 || vH === 0) {
    return { width: minDim, height: minDim };
  }
  
  // Calcul plus précis des dimensions
  const availableWidth = vW - (2 * GRID_PADDING);
  const availableHeight = vH - (2 * GRID_PADDING);
  const sizeBasedOnViewport = Math.min(availableWidth, availableHeight);
  const actualSize = Math.max(minDim, sizeBasedOnViewport);
  
  return { 
    width: actualSize, 
    height: actualSize,
    cellSize: actualSize / CELLS_PER_ROW // Taille de cellule calculée
  };
};

// Helper worklet to get translation limits
const getTranslationLimits = (currentScale: number, vW: number, vH: number, contentW: number, contentH: number) => {
  'worklet';
  if (vW <= 0 || vH <= 0 || contentW <= 0 || contentH <= 0) {
    return { maxTranslateX: 0, maxTranslateY: 0 };
  }

  const scaledContentWidth = currentScale * contentW;
  const scaledContentHeight = currentScale * contentH;
  
  // Calcul plus précis des limites de translation
  const maxTranslateX = Math.max(0, (scaledContentWidth - vW) / 2);
  const maxTranslateY = Math.max(0, (scaledContentHeight - vH) / 2);
  
  // Ajout d'une marge pour éviter les bords durs
  const margin = 20;
  return { 
    maxTranslateX: maxTranslateX + margin, 
    maxTranslateY: maxTranslateY + margin 
  };
};

// Helper worklet to constrain translation values
const constrainTranslation = (x: number, y: number, currentScale: number, vW: number, vH: number, contentW: number, contentH: number) => {
  'worklet';
  const { maxTranslateX, maxTranslateY } = getTranslationLimits(currentScale, vW, vH, contentW, contentH);
  return {
    x: Math.min(Math.max(x, -maxTranslateX), maxTranslateX),
    y: Math.min(Math.max(y, -maxTranslateY), maxTranslateY)
  };
};

// Ajout d'un nouveau composant pour le quadrillage statique
function StaticGrid({ size, colorScheme }: { size: number; colorScheme: 'light' | 'dark' }) {
  const colors = Colors[colorScheme];
  const borderColor = colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(142, 142, 147, 0.4)';
  
  return (
    <View style={[
      styles.staticGrid,
      {
        width: size,
        height: size,
        borderColor,
        backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)'
      }
    ]}>
      {Array(CELLS_PER_ROW - 1).fill(null).map((_, index) => (
        <React.Fragment key={`h-${index}`}>
          <View style={[
            styles.staticGridLine,
            styles.staticGridHorizontal,
            { 
              top: `${((index + 1) / CELLS_PER_ROW) * 100}%`,
              borderColor
            }
          ]} />
          <View style={[
            styles.staticGridLine,
            styles.staticGridVertical,
            { 
              left: `${((index + 1) / CELLS_PER_ROW) * 100}%`,
              borderColor
            }
          ]} />
        </React.Fragment>
      ))}
    </View>
  );
}

function GridView({ salleId }: { salleId: number }) {
    const colorScheme = useColorScheme() as 'light' | 'dark';
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const { tables, loading, error, refreshTables } = useTables(salleId);
    const { selectedRestaurant } = useRestaurants();
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;
    
    const scale = useSharedValue(1);
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const lastScale = useSharedValue(1);
    
    // Shared values for viewport dimensions
    const viewportWidthSV = useSharedValue(0);
    const viewportHeightSV = useSharedValue(0);
    
    const panGestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, GestureContext>({
      onStart: (_, context) => {
        context.startX = translateX.value;
        context.startY = translateY.value;
      },
      onActive: (event, context) => {
        if (viewportWidthSV.value === 0 || viewportHeightSV.value === 0) {
          return; // Viewport dimensions not yet available
        }
        const { width: cW, height: cH } = calculateGridContentDimensions(
            viewportWidthSV.value, 
            viewportHeightSV.value, 
            GRID_MIN_VISUAL_DIMENSION
        );
        
        const newX = context.startX + event.translationX;
        const newY = context.startY + event.translationY;
        
        const constrained = constrainTranslation(newX, newY, scale.value, viewportWidthSV.value, viewportHeightSV.value, cW, cH);
        translateX.value = constrained.x;
        translateY.value = constrained.y;
      },
    });
  
    const pinchGestureHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
      onStart: () => {
        lastScale.value = scale.value;
      },
      onActive: (event) => {
        if (viewportWidthSV.value === 0 || viewportHeightSV.value === 0) {
          return;
        }
        
        const { width: cW, height: cH } = calculateGridContentDimensions(
          viewportWidthSV.value, 
          viewportHeightSV.value, 
          GRID_MIN_VISUAL_DIMENSION
        );

        // Calcul plus fluide du zoom
        const newScaleAttempt = lastScale.value * event.scale;
        const newScale = Math.min(Math.max(newScaleAttempt, MIN_SCALE), MAX_SCALE);
        
        // Mise à jour de l'échelle avec interpolation
        scale.value = newScale;
        
        // Contrainte de translation avec interpolation
        const constrained = constrainTranslation(
          translateX.value, 
          translateY.value, 
          newScale, 
          viewportWidthSV.value, 
          viewportHeightSV.value, 
          cW, 
          cH
        );
        
        translateX.value = constrained.x;
        translateY.value = constrained.y;
      },
      onEnd: () => {
        // Animation de fin pour un zoom plus fluide
        const finalScale = Math.min(Math.max(scale.value, MIN_SCALE), MAX_SCALE);
        if (finalScale !== scale.value) {
          scale.value = finalScale;
        }
        lastScale.value = finalScale;
      }
    });
  
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ]
    }), []); // Empty dependency array as all values are shared values
  
    const getGridPosition = (position: number) => {
      // position is 0-100 from table.position_x/y
      return Math.floor((position / GRID_LOGICAL_CELL_UNITS) * CELLS_PER_ROW);
    };
  
    const grid = Array(CELLS_PER_ROW).fill(null).map((_, rowIndex) => 
      Array(CELLS_PER_ROW).fill(null).map((_, colIndex) => {
        const table = tables.find((t: Table) => { // Explicitly type 't'
          const tableRow = getGridPosition(t.position_y);
          const tableCol = getGridPosition(t.position_x);
          return tableRow === rowIndex && tableCol === colIndex;
        });
        
        return {
          id: table?.id || `${rowIndex}-${colIndex}`,
          row: rowIndex,
          col: colIndex,
          table: table,
          isOccupied: table?.is_occupied || false,
          position: table ? {
            x: table.position_x,
            y: table.position_y
          } : null
        };
      })
    );
  
    const handleTablePress = async (tableId: number, isOccupied: boolean) => {
        try {
            if (isOccupied) {
                // Trouver la table dans le tableau des tables
                const table = tables.find(t => t.id === tableId);
                
                if (table?.current_commande_id) {
                    // Si on a l'ID de la commande, on navigue directement
                    router.navigate(`/(tabs)/commande/${table.current_commande_id}?from=tables` as any);
                } else {
                    // Si par erreur il n'y a pas d'ID de commande pour une table occupée
                    console.error('Table occupée sans ID de commande');
                    // On rafraîchit les tables pour mettre à jour l'état
                    await refreshTables();
                    // On affiche un message à l'utilisateur
                    alert('Cette table n\'a pas de commande en cours. L\'état de la table va être mis à jour.');
                }
            } else {
                // Si la table est libre, on crée une nouvelle commande
                if (!selectedRestaurant) {
                    throw new Error('Restaurant non sélectionné');
                }

                const nouvelleCommande: CreateCommandeDTO = {
                    restaurant_id: selectedRestaurant.id_restaurant,
                    table_id: tableId,
                    created_by_id: 1, // À remplacer par l'ID de l'employé connecté
                    statut: 'EN_COURS',
                    nb_articles: 0,
                    montant: 0
                };

                const { data } = await commandeService.createCommande(nouvelleCommande);
                router.navigate(`/(tabs)/commande/${data.id}?from=tables` as any);
            }
            // Rafraîchir les tables après chaque action
            await refreshTables();
        } catch (err) {
            console.error('Erreur lors de la gestion de la commande:', err);
            // Rafraîchir les tables même en cas d'erreur
            await refreshTables();
        }
    };

    // Remplacer l'effet de focus par useFocusEffect
    useFocusEffect(
        React.useCallback(() => {
            refreshTables();
        }, [])
    );
  
    if (loading) {
      return (
        <View style={[styles.gridContainer, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      );
    }
  
    if (error) {
      return (
        <View style={[styles.gridContainer, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
          <ThemedText style={{ color: colors.error }}>Erreur de chargement des tables</ThemedText>
        </View>
      );
    }
  
    return (
      <View style={[styles.gridContainer, { backgroundColor: colors.surface }]}>
        <View style={styles.gridHeader}>
          <View style={styles.gridHeaderContent}>
            <ThemedText style={[styles.gridTitle, { color: colors.text }]}>
              Plan de la salle
            </ThemedText>
            <View style={styles.gridLegend}>
              <View style={styles.legendItem}>
                <View style={[styles.legendCircle, { backgroundColor: '#00FF00' }]} />
                <ThemedText style={[styles.legendText, { color: colors.textSecondary }]}>
                  Libre
                </ThemedText>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendCircle, { backgroundColor: '#FF0000' }]} />
                <ThemedText style={[styles.legendText, { color: colors.textSecondary }]}>
                  Occupé
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
        
        <View 
          style={[
            styles.gridViewport, 
            { 
              backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(142, 142, 147, 0.1)',
              borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(142, 142, 147, 0.5)',
              padding: GRID_PADDING
            }
          ]}
          onLayout={(event) => {
            viewportWidthSV.value = event.nativeEvent.layout.width;
            viewportHeightSV.value = event.nativeEvent.layout.height;
          }}
        >
          <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
            <Animated.View style={{ flex: 1 }}>
              <PanGestureHandler onGestureEvent={panGestureHandler}>
                <Animated.View style={[styles.gridCamera, animatedStyle]}>
                  {/* Couche statique du quadrillage */}
                  <StaticGrid 
                    size={GRID_MIN_VISUAL_DIMENSION} 
                    colorScheme={colorScheme} 
                  />
                  
                  {/* Couche interactive pour les tables */}
                  <View style={[
                    styles.gridContent,
                    { 
                      width: GRID_MIN_VISUAL_DIMENSION,
                      height: GRID_MIN_VISUAL_DIMENSION,
                    }
                  ]}>
                    {grid.map((row, rowIndex) => (
                      <View 
                        key={rowIndex} 
                        style={styles.gridRow}
                      >
                        {row.map((cell) => (
                          <View
                            key={cell.id}
                            style={styles.gridCell}
                          >
                            {cell.table && (
                              <TouchableOpacity
                                style={[
                                  styles.tableContainer,
                                  { 
                                    backgroundColor: cell.isOccupied 
                                      ? 'rgba(255, 0, 0, 0.15)'
                                      : 'rgba(0, 255, 0, 0.15)',
                                    borderColor: cell.isOccupied 
                                      ? 'rgba(255, 0, 0, 0.5)'
                                      : 'rgba(0, 255, 0, 0.5)',
                                  }
                                ]}
                                onPress={() => handleTablePress(cell.table!.id, cell.isOccupied)}
                                activeOpacity={0.7}
                              >
                                <View style={styles.tableInfo}>
                                  <ThemedText style={[
                                    styles.tableNumber, 
                                    { 
                                      color: cell.isOccupied ? '#FF0000' : '#00FF00',
                                      fontSize: isLandscape ? 18 : 22
                                    }
                                  ]}>
                                    {cell.table.numero}
                                  </ThemedText>
                                  {isLandscape && (
                                    <ThemedText style={[
                                      styles.tableCapacity, 
                                      { color: cell.isOccupied ? '#FF0000' : '#00FF00' }
                                    ]}>
                                      {cell.table.capacity} pers.
                                    </ThemedText>
                                  )}
                                </View>
                              </TouchableOpacity>
                            )}
                          </View>
                        ))}
                      </View>
                    ))}
                  </View>
                </Animated.View>
              </PanGestureHandler>
            </Animated.View>
          </PinchGestureHandler>
        </View>
      </View>
    );
  }

// SallesScreen component remains unchanged from your provided code
export default function SallesScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
  const { selectedRestaurant } = useRestaurants();
  const { salles, loading, error, refreshSalles } = useSalles(selectedRestaurant?.id_restaurant || null);
  const [selectedSalle, setSelectedSalle] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;

  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      await refreshSalles();
    } finally {
      setIsRefreshing(false);
    }
  };

  const getSelectedSalleName = () => {
    if (selectedSalle === null && salles.length > 0) { // Default to first salle if none selected and salles exist
      // Or handle "Toutes les salles" logic if applicable
      // For now, let's assume a specific salle should be selected or a default message.
      // return 'Sélectionner une salle'; // Or your 'Toutes les salles' logic
    }
    if (selectedSalle === null) return 'Sélectionner une salle'; // Or 'Toutes les salles'
    const salle = salles.find(s => s.id === selectedSalle);
    return salle ? salle.nom_salle : 'Sélectionner une salle';
  };

  // Ajouter un effet pour initialiser la sélection uniquement si aucune salle n'est sélectionnée
  // et que c'est la première fois que les salles sont chargées
  React.useEffect(() => {
    if (selectedSalle === null && salles && salles.length > 0 && !loading) {
      setSelectedSalle(salles[0].id);
    }
  }, [salles, loading]);

  if (loading && !isRefreshing) {
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
          Une erreur est survenue lors du chargement des salles
        </ThemedText>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]} // Use theme color
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
          Veuillez sélectionner un restaurant
        </ThemedText>
      </ThemedView>
    );
  }
  
  if (salles.length === 0 && !loading) {
     return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemedView style={styles.container}>
          <HeaderWithSidebars restaurantName={selectedRestaurant.nom_restaurant} />
          <View style={styles.errorContainer}>
            <CustomIcon name="alert-circle" size={48} color={colors.textSecondary} />
            <ThemedText style={styles.errorText}>
              Aucune salle n'est disponible pour ce restaurant.
            </ThemedText>
          </View>
        </ThemedView>
      </GestureHandlerRootView>
     );
  }


  const selectedSalleData = selectedSalle ? salles.find(s => s.id === selectedSalle) : null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <HeaderWithSidebars restaurantName={selectedRestaurant.nom_restaurant} />
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollViewContent}
          // Add RefreshControl for pull-to-refresh
          // refreshControl={
          //   <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[colors.primary]} tintColor={colors.primary}/>
          // }
        >
          <View style={[
            styles.dropdownContainer,
            isLandscape && styles.dropdownContainerLandscape
          ]}>
            <View style={styles.dropdownRow}>
              <TouchableOpacity
                style={[styles.dropdownButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                onPress={() => setIsDropdownVisible(!isDropdownVisible)} // Toggle visibility
              >
                <ThemedText style={[styles.dropdownButtonText, { color: colors.text }]}>
                  {getSelectedSalleName()}
                </ThemedText>
                <CustomIcon 
                  name="chevron-right" 
                  size={20} 
                  color={colors.text} 
                  style={{ transform: [{ rotate: isDropdownVisible ? '180deg' : '0deg' }] }}
                />
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={handleRefresh}
                style={[styles.refreshButton, { 
                  marginLeft: 8, 
                  backgroundColor: colors.surface, 
                  borderColor: colors.border, // Added border consistent with dropdown
                  borderWidth: 1,
                }]}
                disabled={isRefreshing}
              >
                <Animated.View style={isRefreshing ? { transform: [{ rotate: '0deg'}] } : {}}> 
                  {/* Basic rotation for refresh, consider reanimated for smooth spin */}
                  <CustomIcon 
                    name="refresh" 
                    size={24} 
                    color={isRefreshing ? colors.textSecondary : colors.primary} // Adjusted refreshing color
                  />
                </Animated.View>
              </TouchableOpacity>
            </View>

            {isDropdownVisible && (
              <View 
                style={[
                  styles.dropdownList,
                  { backgroundColor: colors.surface, borderColor: colors.border } // Added border
                ]}
              >
                {salles.map((salle) => (
                  <TouchableOpacity
                    key={salle.id}
                    style={[
                      styles.dropdownItem,
                      selectedSalle === salle.id && [styles.dropdownItemSelected, {backgroundColor: colors.primary + '20'}], // Use theme color
                      { borderBottomColor: colors.border }
                    ]}
                    onPress={() => {
                      setSelectedSalle(salle.id);
                      setIsDropdownVisible(false);
                    }}
                  >
                    <View style={styles.dropdownItemContent}>
                      <View style={styles.dropdownItemHeader}>
                        <ThemedText 
                          style={[
                            styles.dropdownItemText,
                            { color: colors.text }, // Default color
                            selectedSalle === salle.id && { color: colors.primary, fontWeight: '600' }
                          ]}
                        >
                          {salle.nom_salle}
                        </ThemedText>
                        {selectedSalle === salle.id && (
                          <CustomIcon name="check" size={20} color={colors.primary} />
                        )}
                      </View>
                      {/* Show details in dropdown only if selected AND isDropdownVisible (which it is if this renders) */}
                      {selectedSalle === salle.id && (
                        <SalleDetails salle={salle} isDropdown={true} />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
                 {salles.length === 0 && (
                    <ThemedText style={{padding: 16, textAlign: 'center', color: colors.textSecondary}}>
                        Aucune salle à afficher.
                    </ThemedText>
                 )}
              </View>
            )}
          </View>

          {selectedSalleData && (
            <View style={[
              styles.selectedSalleContainer,
              isLandscape && styles.selectedSalleContainerLandscape
            ]}>
              <SalleDetails salle={selectedSalleData} />
            </View>
          )}

          {/* Placeholder if no salle is selected and dropdown is closed */}
          {!selectedSalleData && !isDropdownVisible && salles.length > 0 && (
            <View style={styles.errorContainer}>
                <CustomIcon name="view-dashboard" size={48} color={colors.textSecondary}/>
                <ThemedText style={[styles.errorText, {color: colors.textSecondary}]}>
                    Veuillez sélectionner une salle pour afficher son plan.
                </ThemedText>
            </View>
          )}

        </ScrollView>
      </ThemedView>
    </GestureHandlerRootView>
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
    marginTop: 20, // Added margin for spacing
  },
  errorText: {
    marginTop: 10,
    textAlign: 'center',
    fontSize: 16,
  },
  retryButton: {
    marginTop: 20,
    paddingVertical: 12, // Adjusted padding
    paddingHorizontal: 24, // Adjusted padding
    borderRadius: 8,
    // backgroundColor is set dynamically
  },
  retryButtonText: {
    color: 'white', // Ensure contrast with primary color
    fontSize: 16,
    fontWeight: '600',
  },
  dropdownContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8, // Adjusted padding
    zIndex: 10, // Ensure dropdown is on top
  },
  dropdownContainerLandscape: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  dropdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dropdownButton: {
    flex: 1, // Ensure it takes available space
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16, // Consistent padding
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    // borderColor and backgroundColor set dynamically
    height: 48, // Fixed height for consistency
  },
  dropdownButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownList: {
    position: 'absolute', // Make dropdown float over content
    top: 68, // Position below the dropdown button (48 height + 8 marginTop + 12 paddingTop of parent)
    left: 16,
    right: 16,
    marginTop: 4, // Small gap from button
    borderRadius: 12,
    borderWidth: 1, // Added border
    // backgroundColor set dynamically
    elevation: 5, // Android shadow
    shadowColor: '#000', // iOS shadow
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    maxHeight: 300, // Limit height
    overflow: 'hidden', // Clip content if list is too long (ScrollView inside might be better for many items)
  },
  dropdownItem: {
    // flexDirection: 'row', // Not needed if content handles layout
    // alignItems: 'center',
    // justifyContent: 'space-between', // Handled by dropdownItemContent and dropdownItemHeader
    paddingVertical: 12, // Adjusted padding
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth, // Thinner border
    // borderBottomColor set dynamically
  },
  dropdownItemSelected: {
    // backgroundColor set dynamically with opacity
  },
  dropdownItemText: {
    fontSize: 16,
    // color set dynamically
  },
  dropdownItemContent: {
    width: '100%',
  },
  dropdownItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4, // Space before details if shown
  },
  salleDetailsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginBottom: 16, // Ajout d'une marge en bas
  },
  salleDetailsInfo: {
    marginBottom: 12, // Ajout d'une marge entre les infos et le GridView
  },
  salleDetailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  salleDetailsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Adjusted gap
  },
  salleDetailsText: {
    fontSize: 13, // Slightly smaller for dropdown context
  },
  selectedSalleContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flex: 1, // Allow GridView to take space
  },
  selectedSalleContainerLandscape: {
    maxWidth: 800, // Can be larger in landscape
    alignSelf: 'center',
    width: '100%',
  },
  refreshButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    // backgroundColor, borderColor, borderWidth set dynamically
  },
  gridContainer: { // This is for the entire GridView (header + viewport)
    // margin: 16, // This margin is on SallesScreen's selectedSalleContainer
    // padding: 16, // This padding is on SallesScreen's selectedSalleContainer
    borderRadius: 12,
    // elevation, shadow properties are good for the outer container
    // backgroundColor set dynamically
    flex: 1, // Allow GridView to expand
    minHeight: 450, // Ensure it has some minimum height
  },
  gridHeader: {
    marginBottom: 16,
    paddingHorizontal: 16, // Add padding if gridContainer doesn't have it
    paddingTop: 16,      // Add padding if gridContainer doesn't have it
  },
  gridHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  gridTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  gridLegend: {
    flexDirection: 'row', // Changé en row pour aligner horizontalement
    alignItems: 'center',
    gap: 16, // Espacement entre les éléments
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Espacement entre le cercle et le texte
  },
  legendCircle: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 13,
  },
  gridViewport: { // The actual window for pan/zoom gestures
    flex: 1, // Takes remaining space in gridContainer
    overflow: 'hidden',
    // minHeight: 400, // This is now controlled by gridContainer's flex & minHeight
    borderRadius: 8,
    borderWidth: 1, // Thinner border
    // borderColor and backgroundColor set dynamically
    marginHorizontal: 16, // Add margin if gridContainer doesn't have padding
    marginBottom: 16,   // Add margin if gridContainer doesn't have padding
  },
  gridCamera: { // The Animated.View that gets transformed
    width: '100%', // Takes full size of its parent (PinchGestureHandler's Animated.View)
    height: '100%',
    alignItems: 'center', // Centers the `grid` if grid is smaller than camera
    justifyContent: 'center', // Centers the `grid`
  },
  grid: {
    width: '100%',
    height: '100%',
    aspectRatio: 1,
    minWidth: GRID_MIN_VISUAL_DIMENSION,
    minHeight: GRID_MIN_VISUAL_DIMENSION,
    borderWidth: 1,
    // Ajout de propriétés pour améliorer le rendu
    transform: [{ perspective: 1000 }], // Améliore le rendu 3D
    backfaceVisibility: 'hidden', // Évite les artefacts de rendu
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth, // Thinner border
    // borderBottomColor set dynamically
  },
  gridCell: {
    flex: 1,
    borderRightWidth: StyleSheet.hairlineWidth,
    padding: 2, // Réduit pour un meilleur rendu
    alignItems: 'center',
    justifyContent: 'center',
    // Ajout de propriétés pour améliorer le rendu
    transform: [{ perspective: 1000 }],
    backfaceVisibility: 'hidden',
  },
  tableContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    padding: 4,
    borderWidth: 1.5,
  },
  tableInfo: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2,
  },
  tableNumber: {
    fontWeight: '700',
    textAlign: 'center',
  },
  tableCapacity: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 2,
  },
  tablePosition: {
    marginTop: 1, // Adjusted margin
    fontSize: 9, // Smaller font for coordinates
    opacity: 0.6, // Less prominent
  },
  staticGrid: {
    position: 'absolute',
    borderWidth: 1,
    zIndex: 1,
  },
  staticGridLine: {
    position: 'absolute',
    borderWidth: StyleSheet.hairlineWidth,
  },
  staticGridHorizontal: {
    width: '100%',
    height: 0,
  },
  staticGridVertical: {
    height: '100%',
    width: 0,
  },
  gridContent: {
    position: 'absolute',
    zIndex: 2,
  },
});