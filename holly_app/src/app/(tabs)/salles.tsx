// import { CustomIcon } from '@/components/common/CustomIcon';
// import { HeaderWithSidebars } from '@/components/common/HeaderWithSidebars';
// import { ThemedText } from '@/components/common/ThemedText';
// import ThemedView from '@/components/common/ThemedView';
// import { Colors } from '@/constants/Colors';
// import { useRestaurants } from '@/contexts/RestaurantContext';
// import { useColorScheme } from '@/hooks/useColorScheme';
// import { useSalles } from '@/hooks/useSalles';
// import { useTables } from '@/hooks/useTable';
// import { Salle } from '@/models/Salle';
// import { Table } from '@/models/Table';
// import React, { useState } from 'react';
// import { ActivityIndicator, ScrollView, StyleSheet, TouchableOpacity, View, useWindowDimensions } from 'react-native';
// import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent, PinchGestureHandler, PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
// import Animated, {
//     useAnimatedGestureHandler,
//     useAnimatedStyle,
//     useSharedValue
// } from 'react-native-reanimated';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// function SalleDetails({ salle, isDropdown = false }: { salle: Salle; isDropdown?: boolean }) {
//   const colorScheme = useColorScheme();
//   const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

//   return (
//     <View style={styles.salleDetailsContainer}>
//       <View style={styles.salleDetailsInfo}>
//         <View style={styles.salleDetailsRow}>
//           <View style={styles.salleDetailsItem}>
//             <CustomIcon name="account-group" size={16} color={colors.textSecondary} />
//             <ThemedText style={[styles.salleDetailsText, { color: colors.textSecondary }]}>
//               {salle.capacite} pers.
//             </ThemedText>
//           </View>
//           <View style={styles.salleDetailsItem}>
//             <CustomIcon name="view-dashboard" size={16} color={colors.textSecondary} />
//             <ThemedText style={[styles.salleDetailsText, { color: colors.textSecondary }]}>
//               Étage {salle.etage}
//             </ThemedText>
//           </View>
//         </View>
//       </View>
//       {!isDropdown && <GridView salleId={salle.id} />}
//     </View>
//   );
// }

// interface GestureContext extends Record<string, unknown> {
//   startX: number;
//   startY: number;
// }

// function GridView({ salleId }: { salleId: number }) {
//     const colorScheme = useColorScheme();
//     const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
//     const { tables, loading, error } = useTables(salleId);
//     const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    
//     // Valeurs animées optimisées
//     const scale = useSharedValue(1);
//     const translateX = useSharedValue(0);
//     const translateY = useSharedValue(0);
//     const lastScale = useSharedValue(1);
    
//     // Valeurs pour le pan gesture
//     const startTranslateX = useSharedValue(0);
//     const startTranslateY = useSharedValue(0);
    
//     // Constantes pour le zoom et les limites
//     const MIN_SCALE = 0.5;
//     const MAX_SCALE = 3;
//     const GRID_SIZE = 100;
//     const CELLS_PER_ROW = 10;
  
//     // Fonction pour calculer les limites de translation
//     const getTranslationLimits = (currentScale: number) => {
//       const maxTranslateX = Math.max(0, (currentScale - 1) * screenWidth / 2);
//       const maxTranslateY = Math.max(0, (currentScale - 1) * screenHeight / 2);
//       return { maxTranslateX, maxTranslateY };
//     };
  
//     // Fonction pour contraindre les valeurs de translation
//     const constrainTranslation = (x: number, y: number, currentScale: number) => {
//       'worklet';
//       const { maxTranslateX, maxTranslateY } = getTranslationLimits(currentScale);
//       return {
//         x: Math.min(Math.max(x, -maxTranslateX), maxTranslateX),
//         y: Math.min(Math.max(y, -maxTranslateY), maxTranslateY)
//       };
//     };
  
//     // Gestionnaire de pan optimisé
//     const panGestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, GestureContext>({
//       onStart: (_, context) => {
//         context.startX = translateX.value;
//         context.startY = translateY.value;
//       },
//       onActive: (event, context) => {
//         const newX = context.startX + event.translationX;
//         const newY = context.startY + event.translationY;
        
//         const constrained = constrainTranslation(newX, newY, scale.value);
//         translateX.value = constrained.x;
//         translateY.value = constrained.y;
//       },
//       onEnd: () => {
//         // Optionnel : ajouter une animation de rebond si nécessaire
//       }
//     });
  
//     // Gestionnaire de pinch optimisé
//     const pinchGestureHandler = useAnimatedGestureHandler<PinchGestureHandlerGestureEvent>({
//       onStart: () => {
//         lastScale.value = scale.value;
//       },
//       onActive: (event) => {
//         // Appliquer le nouveau scale
//         const newScale = Math.min(Math.max(lastScale.value * event.scale, MIN_SCALE), MAX_SCALE);
//         scale.value = newScale;
        
//         // Ajuster la translation pour rester dans les limites
//         const constrained = constrainTranslation(translateX.value, translateY.value, newScale);
//         translateX.value = constrained.x;
//         translateY.value = constrained.y;
//       },
//       onEnd: () => {
//         lastScale.value = scale.value;
//       }
//     });
  
//     // Style animé simplifié
//     const animatedStyle = useAnimatedStyle(() => ({
//       transform: [
//         { translateX: translateX.value },
//         { translateY: translateY.value },
//         { scale: scale.value }
//       ]
//     }), []);
  
//     // Fonction pour convertir les coordonnées 0-100 en indices de grille
//     const getGridPosition = (position: number) => {
//       return Math.floor((position / GRID_SIZE) * CELLS_PER_ROW);
//     };
  
//     // Créer une grille CELLS_PER_ROW x CELLS_PER_ROW
//     const grid = Array(CELLS_PER_ROW).fill(null).map((_, rowIndex) => 
//       Array(CELLS_PER_ROW).fill(null).map((_, colIndex) => {
//         const table = tables.find((table: Table) => {
//           const tableRow = getGridPosition(table.position_y);
//           const tableCol = getGridPosition(table.position_x);
//           return tableRow === rowIndex && tableCol === colIndex;
//         });
        
//         return {
//           id: table?.id || `${rowIndex}-${colIndex}`,
//           row: rowIndex,
//           col: colIndex,
//           table: table,
//           isOccupied: table?.is_occupied || false,
//           position: table ? {
//             x: table.position_x,
//             y: table.position_y
//           } : null
//         };
//       })
//     );
  
//     if (loading) {
//       return (
//         <View style={[styles.gridContainer, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
//           <ActivityIndicator size="large" color={colors.primary} />
//         </View>
//       );
//     }
  
//     if (error) {
//       return (
//         <View style={[styles.gridContainer, { backgroundColor: colors.surface, justifyContent: 'center', alignItems: 'center' }]}>
//           <ThemedText style={{ color: colors.error }}>Erreur de chargement des tables</ThemedText>
//         </View>
//       );
//     }
  
//     return (
//       <View style={[styles.gridContainer, { backgroundColor: colors.surface }]}>
//         <View style={styles.gridHeader}>
//           <View style={styles.gridHeaderContent}>
//             <ThemedText style={[styles.gridTitle, { color: colors.text }]}>
//               Plan de la salle
//             </ThemedText>
//             <View style={styles.gridLegend}>
//               <View style={styles.legendItem}>
//                 <CustomIcon name="view-dashboard" size={16} color={colors.primary} />
//                 <ThemedText style={[styles.legendText, { color: colors.textSecondary }]}>
//                   Disponible
//                 </ThemedText>
//               </View>
//               <View style={styles.legendItem}>
//                 <CustomIcon name="view-dashboard" size={16} color={colors.error} />
//                 <ThemedText style={[styles.legendText, { color: colors.textSecondary }]}>
//                   Occupé
//                 </ThemedText>
//               </View>
//             </View>
//           </View>
//         </View>
        
//         <View style={[
//           styles.gridViewport, 
//           { 
//             backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.3)' : 'rgba(142, 142, 147, 0.1)',
//             borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(142, 142, 147, 0.5)'
//           }
//         ]}>
//           <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
//             <Animated.View style={{ flex: 1 }}>
//               <PanGestureHandler onGestureEvent={panGestureHandler}>
//                 <Animated.View style={[styles.gridCamera, animatedStyle]}>
//                   <View style={[
//                     styles.grid,
//                     { 
//                       borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(142, 142, 147, 0.6)',
//                       backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)'
//                     }
//                   ]}>
//                     {grid.map((row, rowIndex) => (
//                       <View 
//                         key={rowIndex} 
//                         style={[
//                           styles.gridRow,
//                           { 
//                             borderBottomColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(142, 142, 147, 0.4)'
//                           }
//                         ]}
//                       >
//                         {row.map((cell) => (
//                           <View
//                             key={cell.id}
//                             style={[
//                               styles.gridCell,
//                               { 
//                                 borderRightColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(142, 142, 147, 0.4)',
//                                 backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)'
//                               }
//                             ]}
//                           >
//                             {cell.table && (
//                               <View style={[
//                                 styles.tableContainer,
//                                 { 
//                                   backgroundColor: colorScheme === 'dark'
//                                     ? cell.isOccupied 
//                                       ? colors.error + '40'
//                                       : colors.primary + '40'
//                                     : cell.isOccupied
//                                       ? colors.error + '20'
//                                       : colors.primary + '20',
//                                   borderColor: cell.isOccupied 
//                                     ? colors.error + '60' 
//                                     : colors.primary + '60'
//                                 }
//                               ]}>
//                                 <CustomIcon 
//                                   name="view-dashboard" 
//                                   size={24} 
//                                   color={cell.isOccupied ? colors.error : colors.primary} 
//                                 />
//                                 <View style={styles.tableInfo}>
//                                   <ThemedText style={[
//                                     styles.tableNumber, 
//                                     { color: cell.isOccupied ? colors.error : colors.text }
//                                   ]}>
//                                     {cell.table.numero}
//                                   </ThemedText>
//                                   <ThemedText style={[
//                                     styles.tableCapacity, 
//                                     { color: colors.textSecondary }
//                                   ]}>
//                                     {cell.table.capacity} pers.
//                                   </ThemedText>
//                                   <ThemedText style={[
//                                     styles.tablePosition, 
//                                     { color: colors.textSecondary, fontSize: 10 }
//                                   ]}>
//                                     ({cell.position?.x}, {cell.position?.y})
//                                   </ThemedText>
//                                 </View>
//                               </View>
//                             )}
//                           </View>
//                         ))}
//                       </View>
//                     ))}
//                   </View>
//                 </Animated.View>
//               </PanGestureHandler>
//             </Animated.View>
//           </PinchGestureHandler>
//         </View>
//       </View>
//     );
//   }

// export default function SallesScreen() {
//   const colorScheme = useColorScheme();
//   const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
//   const { selectedRestaurant } = useRestaurants();
//   const { salles, loading, error, refreshSalles } = useSalles(selectedRestaurant?.id_restaurant || null);
//   const [selectedSalle, setSelectedSalle] = useState<number | null>(null);
//   const [isRefreshing, setIsRefreshing] = useState(false);
//   const [isDropdownVisible, setIsDropdownVisible] = useState(false);
//   const insets = useSafeAreaInsets();
//   const { width, height } = useWindowDimensions();
//   const isLandscape = width > height;

//   const handleRefresh = async () => {
//     if (isRefreshing) return;
//     setIsRefreshing(true);
//     try {
//       await refreshSalles();
//     } finally {
//       setIsRefreshing(false);
//     }
//   };

//   const getSelectedSalleName = () => {
//     if (selectedSalle === null) return 'Toutes les salles';
//     const salle = salles.find(s => s.id === selectedSalle);
//     return salle ? salle.nom_salle : 'Sélectionner une salle';
//   };

//   if (loading && !isRefreshing) {
//     return (
//       <ThemedView style={styles.loadingContainer}>
//         <ActivityIndicator size="large" color={colors.primary} />
//       </ThemedView>
//     );
//   }

//   if (error) {
//     return (
//       <ThemedView style={styles.errorContainer}>
//         <CustomIcon name="alert-circle" size={48} color={colors.error} />
//         <ThemedText style={styles.errorText}>
//           Une erreur est survenue lors du chargement des salles
//         </ThemedText>
//         <TouchableOpacity
//           style={styles.retryButton}
//           onPress={handleRefresh}
//         >
//           <ThemedText style={styles.retryButtonText}>Réessayer</ThemedText>
//         </TouchableOpacity>
//       </ThemedView>
//     );
//   }

//   if (!selectedRestaurant) {
//     return (
//       <ThemedView style={styles.errorContainer}>
//         <CustomIcon name="alert-circle" size={48} color={colors.error} />
//         <ThemedText style={styles.errorText}>
//           Veuillez sélectionner un restaurant
//         </ThemedText>
//       </ThemedView>
//     );
//   }

//   const selectedSalleData = selectedSalle ? salles.find(s => s.id === selectedSalle) : null;

//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <ThemedView style={styles.container}>
//         <HeaderWithSidebars restaurantName={selectedRestaurant.nom_restaurant} />
//         <ScrollView 
//           style={styles.scrollView} 
//           contentContainerStyle={styles.scrollViewContent}
//         >
//           <View style={[
//             styles.dropdownContainer,
//             isLandscape && styles.dropdownContainerLandscape
//           ]}>
//             <View style={styles.dropdownRow}>
//               <TouchableOpacity
//                 style={[styles.dropdownButton, { backgroundColor: colors.surface, flex: 1 }]}
//                 onPress={() => setIsDropdownVisible(true)}
//               >
//                 <ThemedText style={[styles.dropdownButtonText, { color: colors.text }]}>
//                   {getSelectedSalleName()}
//                 </ThemedText>
//                 <CustomIcon 
//                   name="chevron-right" 
//                   size={20} 
//                   color={colors.text} 
//                   style={[
//                     styles.dropdownIcon,
//                     isDropdownVisible && { transform: [{ rotate: '90deg' }] }
//                   ]} 
//                 />
//               </TouchableOpacity>

//               <TouchableOpacity 
//                 onPress={handleRefresh}
//                 style={[styles.refreshButton, { marginLeft: 8 }]}
//                 disabled={isRefreshing}
//               >
//                 <CustomIcon 
//                   name="refresh" 
//                   size={24} 
//                   color={isRefreshing ? colors.text + '80' : colors.primary} 
//                   style={isRefreshing ? { transform: [{ rotate: '360deg' }] } : undefined}
//                 />
//               </TouchableOpacity>
//             </View>

//             {isDropdownVisible && (
//               <View 
//                 style={[
//                   styles.dropdownList,
//                   { backgroundColor: colors.surface }
//                 ]}
//               >
//                 {salles.map((salle) => (
//                   <TouchableOpacity
//                     key={salle.id}
//                     style={[
//                       styles.dropdownItem,
//                       selectedSalle === salle.id && styles.dropdownItemSelected,
//                       { borderBottomColor: colors.border }
//                     ]}
//                     onPress={() => {
//                       setSelectedSalle(salle.id);
//                       setIsDropdownVisible(false);
//                     }}
//                   >
//                     <View style={styles.dropdownItemContent}>
//                       <View style={styles.dropdownItemHeader}>
//                         <ThemedText 
//                           style={[
//                             styles.dropdownItemText,
//                             selectedSalle === salle.id && { color: colors.primary, fontWeight: '600' }
//                           ]}
//                         >
//                           {salle.nom_salle}
//                         </ThemedText>
//                         {selectedSalle === salle.id && (
//                           <CustomIcon name="check" size={20} color={colors.primary} />
//                         )}
//                       </View>
//                       {selectedSalle === salle.id && (
//                         <SalleDetails salle={salle} isDropdown={true} />
//                       )}
//                     </View>
//                   </TouchableOpacity>
//                 ))}
//               </View>
//             )}
//           </View>

//           {selectedSalleData && (
//             <View style={[
//               styles.selectedSalleContainer,
//               isLandscape && styles.selectedSalleContainerLandscape
//             ]}>
//               <SalleDetails salle={selectedSalleData} />
//             </View>
//           )}
//         </ScrollView>
//       </ThemedView>
//     </GestureHandlerRootView>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   scrollView: {
//     flex: 1,
//   },
//   scrollViewContent: {
//     flexGrow: 1,
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   errorContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 20,
//   },
//   errorText: {
//     marginTop: 10,
//     textAlign: 'center',
//     fontSize: 16,
//   },
//   retryButton: {
//     marginTop: 20,
//     padding: 10,
//     borderRadius: 8,
//     backgroundColor: '#3b82f6',
//   },
//   retryButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   dropdownContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 6,
//   },
//   dropdownContainerLandscape: {
//     maxWidth: 600,
//     alignSelf: 'center',
//     width: '100%',
//   },
//   dropdownRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   dropdownButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 12,
//     borderRadius: 8,
//     borderWidth: 1,
//     borderColor: 'rgba(142, 142, 147, 0.12)',
//     height: 48,
//   },
//   dropdownButtonText: {
//     fontSize: 16,
//     fontWeight: '500',
//   },
//   dropdownIcon: {
//     marginLeft: 8,
//   },
//   dropdownList: {
//     marginTop: 8,
//     borderRadius: 12,
//     elevation: 5,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.84,
//     maxHeight: 400,
//     overflow: 'hidden',
//   },
//   dropdownItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     padding: 16,
//     borderBottomWidth: 1,
//   },
//   dropdownItemSelected: {
//     backgroundColor: 'rgba(242, 126, 66, 0.1)',
//   },
//   dropdownItemText: {
//     fontSize: 16,
//   },
//   dropdownItemContent: {
//     width: '100%',
//   },
//   dropdownItemHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   salleDetailsContainer: {
//     marginTop: 12,
//     paddingTop: 12,
//     borderTopWidth: 1,
//     borderTopColor: 'rgba(142, 142, 147, 0.12)',
//   },
//   salleDetailsInfo: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   salleDetailsRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     width: '100%',
//   },
//   salleDetailsItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 8,
//   },
//   salleDetailsText: {
//     fontSize: 14,
//   },
//   selectedSalleContainer: {
//     paddingHorizontal: 16,
//     paddingTop: 0,
//     paddingBottom: 16,
//   },
//   selectedSalleContainerLandscape: {
//     maxWidth: 800,
//     alignSelf: 'center',
//     width: '100%',
//   },
//   refreshButton: {
//     width: 48,
//     height: 48,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 8,
//     backgroundColor: 'rgba(142, 142, 147, 0.12)',
//   },
//   gridContainer: {
//     margin: 16,
//     padding: 16,
//     borderRadius: 12,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   gridHeader: {
//     marginBottom: 16,
//   },
//   gridHeaderContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//   },
//   gridTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//   },
//   gridLegend: {
//     flexDirection: 'column',
//     gap: 8,
//   },
//   legendItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     gap: 4,
//   },
//   legendText: {
//     fontSize: 14,
//   },
//   gridViewport: {
//     flex: 1,
//     overflow: 'hidden',
//     minHeight: 400,
//     borderRadius: 8,
//     borderWidth: 2,
//     borderColor: 'rgba(142, 142, 147, 0.5)',
//     backgroundColor: 'rgba(142, 142, 147, 0.1)',
//   },
//   gridCamera: {
//     width: '100%',
//     height: '100%',
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   grid: {
//     width: '100%',
//     height: '100%',
//     aspectRatio: 1,
//     minWidth: 600,
//     minHeight: 600,
//     borderWidth: 1.5,
//     borderColor: 'rgba(142, 142, 147, 0.6)',
//     backgroundColor: 'rgba(255, 255, 255, 0.95)',
//   },
//   gridRow: {
//     flex: 1,
//     flexDirection: 'row',
//     borderBottomWidth: 1,
//     borderBottomColor: 'rgba(142, 142, 147, 0.4)',
//   },
//   gridCell: {
//     flex: 1,
//     borderRightWidth: 1,
//     borderRightColor: 'rgba(142, 142, 147, 0.4)',
//     padding: 4,
//     minHeight: 50,
//     backgroundColor: 'rgba(255, 255, 255, 0.7)',
//   },
//   tableContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     borderRadius: 8,
//     padding: 8,
//     gap: 4,
//     minHeight: 80,
//     borderWidth: 1.5,
//     borderColor: 'rgba(142, 142, 147, 0.4)',
//     backgroundColor: 'rgba(255, 255, 255, 0.9)',
//   },
//   tableInfo: {
//     alignItems: 'center',
//   },
//   tableNumber: {
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   tableCapacity: {
//     fontSize: 12,
//   },
//   tablePosition: {
//     marginTop: 2,
//     opacity: 0.7,
//   },
// });

import { CustomIcon } from '@/components/common/CustomIcon';
import { HeaderWithSidebars } from '@/components/common/HeaderWithSidebars';
import { ThemedText } from '@/components/common/ThemedText';
import ThemedView from '@/components/common/ThemedView';
import { Colors } from '@/constants/Colors';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useSalles } from '@/hooks/useSalles';
import { useTables } from '@/hooks/useTable'; // Corrected: useTable -> useTables
import { Salle } from '@/models/Salle';
import { Table } from '@/models/Table';
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

interface GestureContext { // Removed 'extends Record<string, unknown>' for simplicity unless specific unknown keys are used
  startX: number;
  startY: number;
}

// Constants for GridView
const MIN_SCALE = 0.5;
const MAX_SCALE = 3;
const GRID_LOGICAL_CELL_UNITS = 100; // The logical size of one dimension of the grid (e.g., 0-100)
const CELLS_PER_ROW = 10; // Visual grid cells
const GRID_MIN_VISUAL_DIMENSION = 600; // From styles.grid.minWidth/minHeight

// Helper worklet to calculate the actual dimensions of the grid content
const calculateGridContentDimensions = (vW: number, vH: number, minDim: number) => {
  'worklet';
  if (vW === 0 || vH === 0) {
    // Viewport not measured yet or has no area, default to minDim
    return { width: minDim, height: minDim };
  }
  // The grid style has width:'100%', height:'100%', aspectRatio:1, and minWidth/Height constraints.
  // It tries to be min(vW, vH) square due to 100% dimensions + aspectRatio,
  // but at least minDim square due to minWidth/Height.
  const sizeBasedOnViewportMinEdge = Math.min(vW, vH);
  const actualSize = Math.max(minDim, sizeBasedOnViewportMinEdge);
  return { width: actualSize, height: actualSize };
};

// Helper worklet to get translation limits
const getTranslationLimits = (currentScale: number, vW: number, vH: number, contentW: number, contentH: number) => {
  'worklet';
  // If viewport has no area, or content has no area, no translation possible.
  if (vW <= 0 || vH <= 0 || contentW <= 0 || contentH <= 0) {
      return { maxTranslateX: 0, maxTranslateY: 0 };
  }

  const scaledContentWidth = currentScale * contentW;
  const scaledContentHeight = currentScale * contentH;

  // Allow panning only if scaled content is larger than viewport
  const maxTranslateX = Math.max(0, (scaledContentWidth - vW) / 2);
  const maxTranslateY = Math.max(0, (scaledContentHeight - vH) / 2);

  return { maxTranslateX, maxTranslateY };
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

function GridView({ salleId }: { salleId: number }) {
    const colorScheme = useColorScheme();
    const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];
    const { tables, loading, error } = useTables(salleId);
    // screenWidth and screenHeight from useWindowDimensions are not directly used for gesture logic anymore
    // but can be kept if other parts of GridView depend on them.
    // const { width: screenWidth, height: screenHeight } = useWindowDimensions(); 
    
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
          return; // Viewport dimensions not yet available
        }
        const { width: cW, height: cH } = calculateGridContentDimensions(
            viewportWidthSV.value, 
            viewportHeightSV.value, 
            GRID_MIN_VISUAL_DIMENSION
        );

        const newScaleAttempt = lastScale.value * event.scale;
        const newScale = Math.min(Math.max(newScaleAttempt, MIN_SCALE), MAX_SCALE);
        
        // Calculate focal point relative to the content's original untransformed state
        // This part is for focal point zooming. For center zoom (current), this isn't strictly needed,
        // but it's good practice for future enhancements. For now, we simplify.
        // The currenttranslateX/Y values are kept, and then constrained.
        
        scale.value = newScale;
        
        const constrained = constrainTranslation(translateX.value, translateY.value, newScale, viewportWidthSV.value, viewportHeightSV.value, cW, cH);
        translateX.value = constrained.x;
        translateY.value = constrained.y;
      },
      onEnd: () => {
        lastScale.value = scale.value;
        // One final constraint check can be useful if focal point logic was complex
        // For now, onActive handles it.
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
          {/* ... Grid Header content (unchanged) ... */}
          <View style={styles.gridHeaderContent}>
            <ThemedText style={[styles.gridTitle, { color: colors.text }]}>
              Plan de la salle
            </ThemedText>
            <View style={styles.gridLegend}>
              <View style={styles.legendItem}>
                <CustomIcon name="view-dashboard" size={16} color={colors.primary} />
                <ThemedText style={[styles.legendText, { color: colors.textSecondary }]}>
                  Disponible
                </ThemedText>
              </View>
              <View style={styles.legendItem}>
                <CustomIcon name="view-dashboard" size={16} color={colors.error} />
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
              borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(142, 142, 147, 0.5)'
            }
          ]}
          onLayout={(event) => { // Add onLayout to measure viewport
            viewportWidthSV.value = event.nativeEvent.layout.width;
            viewportHeightSV.value = event.nativeEvent.layout.height;
          }}
        >
          <PinchGestureHandler onGestureEvent={pinchGestureHandler}>
            <Animated.View style={{ flex: 1 }}>
              <PanGestureHandler onGestureEvent={panGestureHandler}>
                <Animated.View style={[styles.gridCamera, animatedStyle]}>
                  <View style={[ // This is the "content" that has minWidth/Height of 600
                    styles.grid,
                    { 
                      borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.3)' : 'rgba(142, 142, 147, 0.6)',
                      backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.95)'
                    }
                  ]}>
                    {grid.map((row, rowIndex) => (
                      <View 
                        key={rowIndex} 
                        style={[
                          styles.gridRow,
                          { 
                            borderBottomColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(142, 142, 147, 0.4)'
                          }
                        ]}
                      >
                        {row.map((cell) => (
                          <View
                            key={cell.id}
                            style={[
                              styles.gridCell,
                              { 
                                borderRightColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(142, 142, 147, 0.4)',
                                backgroundColor: colorScheme === 'dark' ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.7)'
                              }
                            ]}
                          >
                            {cell.table && (
                              <View style={[
                                styles.tableContainer,
                                { 
                                  backgroundColor: colorScheme === 'dark'
                                    ? cell.isOccupied 
                                      ? colors.error + '40' // Added opacity
                                      : colors.primary + '40' // Added opacity
                                    : cell.isOccupied
                                      ? colors.error + '20' // Added opacity
                                      : colors.primary + '20', // Added opacity
                                  borderColor: cell.isOccupied 
                                    ? colors.error + '60' // Added opacity
                                    : colors.primary + '60' // Added opacity
                                }
                              ]}>
                                <CustomIcon 
                                  name="view-dashboard" 
                                  size={24} 
                                  color={cell.isOccupied ? colors.error : colors.primary} 
                                />
                                <View style={styles.tableInfo}>
                                  <ThemedText style={[
                                    styles.tableNumber, 
                                    { color: cell.isOccupied ? colors.error : colors.text }
                                  ]}>
                                    {cell.table.numero}
                                  </ThemedText>
                                  <ThemedText style={[
                                    styles.tableCapacity, 
                                    { color: colors.textSecondary }
                                  ]}>
                                    {cell.table.capacity} pers.
                                  </ThemedText>
                                  <ThemedText style={[
                                    styles.tablePosition, 
                                    { color: colors.textSecondary, fontSize: 10 }
                                  ]}>
                                    ({cell.position?.x}, {cell.position?.y})
                                  </ThemedText>
                                </View>
                              </View>
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
  const insets = useSafeAreaInsets(); // Kept, though not directly used in the provided snippet for SallesScreen logic
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

  // Auto-select first salle if available and none is selected
  // This is an opinionated change, adjust if needed.
  // React.useEffect(() => {
  //   if (!selectedSalle && salles && salles.length > 0) {
  //     setSelectedSalle(salles[0].id);
  //   }
  // }, [salles, selectedSalle]);


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
            <CustomIcon name="information-outline" size={48} color={colors.textSecondary} />
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
                  name={isDropdownVisible ? "chevron-up" : "chevron-down" } // More intuitive icons
                  size={20} 
                  color={colors.text} 
                  // style={[ // Rotation removed as icon name changes
                  //   styles.dropdownIcon,
                  //   isDropdownVisible && { transform: [{ rotate: '90deg' }] } 
                  // ]} 
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
                <CustomIcon name="table-search" size={48} color={colors.textSecondary}/>
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
  // dropdownIcon: { // Not strictly needed if icon name changes
  //   marginLeft: 8,
  // },
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
    marginTop: 8, // Reduced margin
    paddingTop: 8, // Reduced padding
    borderTopWidth: StyleSheet.hairlineWidth, // Thinner border
    // borderTopColor set dynamically (or use colors.border)
  },
  salleDetailsInfo: {
    // flexDirection: 'row', // Not needed as salleDetailsRow handles it
    // justifyContent: 'space-between',
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
    flexDirection: 'column', // Changed to column for better layout with limited space
    alignItems: 'flex-start', // Align items to start
    gap: 6, // Adjusted gap
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6, // Adjusted gap
  },
  legendText: {
    fontSize: 13, // Slightly smaller
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
  grid: { // The actual content being displayed (the 10x10 grid of cells)
    width: '100%', // Tries to fill gridCamera
    height: '100%', // Tries to fill gridCamera
    aspectRatio: 1, // Ensures it's a square, using the smaller of gridCamera's width/height
    minWidth: GRID_MIN_VISUAL_DIMENSION, // But at least 600x600
    minHeight: GRID_MIN_VISUAL_DIMENSION,
    borderWidth: 1, // Thinner border
    // borderColor and backgroundColor set dynamically
  },
  gridRow: {
    flex: 1,
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth, // Thinner border
    // borderBottomColor set dynamically
  },
  gridCell: {
    flex: 1,
    borderRightWidth: StyleSheet.hairlineWidth, // Thinner border
    // borderRightColor set dynamically
    padding: 4, // Keep some padding
    // minHeight: 50, // Implicitly set by grid size and CELLS_PER_ROW
    // backgroundColor set dynamically
    alignItems: 'center', // Center tableContainer if cell is larger
    justifyContent: 'center', // Center tableContainer
  },
  tableContainer: {
    flex: 1, // Take available space in cell, or shrink to content
    width: '100%', // Try to fill cell width
    height: '100%', // Try to fill cell height
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6, // Slightly smaller radius
    padding: 4, // Reduced padding
    gap: 2, // Reduced gap
    // minHeight: 80, // This might make tables too large if cells are small; let content define size or use relative sizing
    borderWidth: 1, // Thinner border
    // backgroundColor and borderColor set dynamically
  },
  tableInfo: {
    alignItems: 'center',
  },
  tableNumber: {
    fontSize: 14, // Adjusted size
    fontWeight: '600',
  },
  tableCapacity: {
    fontSize: 10, // Adjusted size
  },
  tablePosition: {
    marginTop: 1, // Adjusted margin
    fontSize: 9, // Smaller font for coordinates
    opacity: 0.6, // Less prominent
  },
});