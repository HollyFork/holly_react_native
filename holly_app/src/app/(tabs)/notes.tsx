import { CustomIcon } from '@/components/common/CustomIcon';
import { HeaderWithSidebars } from '@/components/common/HeaderWithSidebars';
import { ThemedText } from '@/components/common/ThemedText';
import ThemedView from '@/components/common/ThemedView';
import { Colors } from '@/constants/Colors';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useNotes } from '@/hooks/useNotes';
import { Note } from '@/models/Note';
import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

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
    <View style={[styles.card, { 
      backgroundColor: colors.surface,
      borderColor: colors.border,
      shadowColor: colors.text
    }]}>
      <View style={[styles.cardHeader, { borderBottomColor: colors.border }]}>
        <View style={styles.authorContainer}>
          <CustomIcon name="account-group" size={20} color={colors.icon} style={styles.authorIcon} />
          <ThemedText style={[styles.authorText, { color: colors.text }]}>
            {item.created_by.prenom} {item.created_by.nom}
          </ThemedText>
        </View>
        <ThemedText style={[styles.dateText, { color: colors.textSecondary }]}>
          {new Date(item.created_at).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </ThemedText>
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
        <View style={[styles.headerControlsContainer, { 
          backgroundColor: colors.surface,
          borderBottomColor: colors.border 
        }]}>
          <View style={styles.searchContainer}>
            <View style={[styles.searchInputContainer, { 
              backgroundColor: colors.background,
              borderColor: colors.border
            }]}>
              <CustomIcon name="account-group" size={20} color={colors.icon} style={styles.searchIcon} /> 
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Rechercher une note (auteur, message)..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setSearchQuery('')}
                  style={[styles.clearButton, { backgroundColor: colors.background }]}
                >
                  <CustomIcon name="close" size={20} color={colors.icon} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <TouchableOpacity 
            onPress={onRefresh}
            style={[styles.refreshButton, { backgroundColor: colors.background }]}
            disabled={refreshing}
          >
            <CustomIcon 
              name="refresh" 
              size={24} 
              color={refreshing ? colors.textSecondary : colors.primary} 
              style={refreshing ? styles.refreshingIcon : undefined}
            />
          </TouchableOpacity>
        </View>

        {loading && !refreshing && notes.length === 0 ? (
          null
        ) : filteredNotes.length === 0 && !loading ? (
          <ThemedView style={[styles.centered, { backgroundColor: colors.background }]}>
            <CustomIcon name="help-circle" size={48} color={colors.icon} />
            <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
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
  headerControlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  searchContainer: {
    flex: 1,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
    borderRadius: 8,
  },
  refreshButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  refreshingIcon: {
    transform: [{ rotate: '360deg' }],
  },
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorIcon: {
    marginRight: 8,
  },
  authorText: {
    fontSize: 16,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  dateText: {
    fontSize: 12,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  listContentContainer: {
    paddingVertical: 8,
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
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 