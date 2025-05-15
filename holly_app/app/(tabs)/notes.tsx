import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity, TextInput } from 'react-native';
import { useNotes } from '@/hooks/useNotes'; // Correction du chemin d'importation
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Note } from '@/src/models'; // Correction du chemin d'importation
import { Colors } from '@/constants/Colors'; // Assurez-vous que ce chemin est correct
import { useColorScheme } from '@/hooks/useColorScheme'; // Assurez-vous que ce chemin est correct
import { HeaderWithSidebars } from '@/components/HeaderWithSidebars'; // Ajout de l'import
import { useRestaurants } from '@/contexts/RestaurantContext'; // Ajout de l'import
import { CustomIcon } from '@/components/CustomIcon'; // Ajout pour l'écran d'erreur

// ID du restaurant (à remplacer par la logique appropriée pour obtenir l'ID dynamiquement)
// const RESTAURANT_ID = 1; // Commenté car nous utiliserons selectedRestaurant.id_restaurant

export default function NotesScreen() {
  const { selectedRestaurant } = useRestaurants(); // Récupération du restaurant sélectionné
  // Utiliser l'ID du restaurant sélectionné, ou null si aucun n'est sélectionné
  const restaurantId = selectedRestaurant?.id_restaurant || null;
  const { notes, loading, error, refreshNotes } = useNotes(restaurantId);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState(''); // État pour la recherche
  const colorScheme = useColorScheme() ?? 'light'; // Fournir une valeur par défaut si undefined
  const colors = Colors[colorScheme]; // Récupération des couleurs du thème

  const onRefresh = async () => {
    if (refreshing) return; // Évite les rafraîchissements multiples
    setRefreshing(true);
    try {
      await refreshNotes();
    } catch (e) {
      console.error("Erreur lors du rafraîchissement des notes:", e);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    // Optionnel: rafraîchir les notes lors du focus sur l'écran
    // import { useFocusEffect } from 'expo-router';
    // useFocusEffect(
    //   React.useCallback(() => {
    //     refreshNotes();
    //   }, [])
    // );
  }, [refreshNotes]);

  // Filtrage des notes
  const filteredNotes = useMemo(() => {
    if (!searchQuery) {
      return notes;
    }
    return notes.filter(note => {
      const searchTerm = searchQuery.toLowerCase();
      const createdByMatch = note.created_by && 
                             (note.created_by.prenom?.toLowerCase().includes(searchTerm) || 
                              note.created_by.nom?.toLowerCase().includes(searchTerm));
      const messageMatch = note.message?.toLowerCase().includes(searchTerm);
      return createdByMatch || messageMatch;
    });
  }, [notes, searchQuery]);

  const renderNoteItem = ({ item }: { item: Note }) => (
    <View style={[styles.card, { backgroundColor: colors.background, borderColor: colors.icon }]}>
      <View style={styles.cardHeader}>
        <ThemedText type="subtitle" style={{ color: colors.text }}>{item.created_by.prenom} {item.created_by.nom}</ThemedText>
        <ThemedText style={[styles.dateText, { color: colors.icon }]}>{new Date(item.created_at).toLocaleDateString()}</ThemedText>
      </View>
      <ThemedText style={[styles.messageText, { color: colors.text }]}>{item.message}</ThemedText>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <ThemedView style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <ThemedText style={[styles.loadingText, { color: colors.text }]}>Chargement des notes...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !selectedRestaurant) {
    return (
      <ThemedView style={[styles.errorContainer, { backgroundColor: colors.background }]}>
        <CustomIcon name="alert-circle" size={48} color={colors.error} />
        <ThemedText style={[styles.errorText, { color: colors.error }]}>
          {error ? error : "Aucun restaurant sélectionné ou erreur de chargement."}
        </ThemedText>
        <TouchableOpacity 
          style={[styles.retryButton, { backgroundColor: colors.primary }]} 
          onPress={onRefresh}
        >
          <ThemedText style={[styles.retryButtonText, { color: '#FFFFFF' }]}>Réessayer</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <>
      <HeaderWithSidebars restaurantName={selectedRestaurant?.nom_restaurant || "Notes"} />
      <ThemedView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.headerControlsContainer, { borderBottomColor: colors.icon }]}>
          <View style={styles.searchContainer}>
            <View style={[styles.searchInputContainer, { backgroundColor: colors.background === '#fff' ? '#F0F0F0' : '#2C2C2E'}]}>
              <CustomIcon name="account-group" size={20} color={colors.icon} style={styles.searchIcon} /> 
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Rechercher une note (auteur, message)..."
                placeholderTextColor={colors.icon}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={styles.clearButton}
                >
                  <CustomIcon name="close" size={20} color={colors.icon} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <TouchableOpacity 
            onPress={onRefresh}
            style={styles.refreshButton}
            disabled={refreshing}
          >
            <CustomIcon 
              name="refresh" 
              size={24} 
              color={refreshing ? colors.icon : colors.primary} 
            />
          </TouchableOpacity>
        </View>

        {loading && !refreshing && notes.length === 0 ? (
           null
        ) : filteredNotes.length === 0 && !loading ? (
          <ThemedView style={[styles.centered, { backgroundColor: colors.background }]}>
            <CustomIcon name="help-circle" size={48} color={colors.icon} />
            <ThemedText style={{color: colors.text, marginTop: 10}}>
              {searchQuery ? `Aucune note ne correspond à \"${searchQuery}\"` : "Aucune note pour le moment."}
            </ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={filteredNotes}
            renderItem={renderNoteItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContentContainer}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
                tintColor={colors.primary}
              />
            }
          />
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
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
    marginBottom: 8,
  },
  messageText: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  dateText: {
    fontSize: 12,
  },
  listContentContainer: {
    paddingBottom: 16,
    paddingTop: 8,
  },
  headerControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  searchContainer: {
    flex: 1,
    marginRight: 12,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: '100%',
  },
  clearButton: {
    padding: 6,
  },
  refreshButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  }
}); 