import { CustomIcon } from '@/components/common/CustomIcon';
import { HeaderWithSidebars } from '@/components/common/HeaderWithSidebars';
import { ThemedText } from '@/components/common/ThemedText';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { useArticles } from '@/hooks/useArticles';
import { useCategories } from '@/hooks/useCategories';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Article } from '@/models/Article';
import { CategorieArticle } from '@/models/CategorieArticle';
import { articleService } from '@/services/entities/articleService';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';

export default function ArticlesScreen() {
  const { colors, styles: themeStyles } = useThemeColor();
  const { selectedRestaurant } = useRestaurants();
  const { articles, loading: articlesLoading, refresh: refreshArticles } = useArticles(selectedRestaurant?.id_restaurant || null);
  const { categories, loading: categoriesLoading, createCategory, refresh: refreshCategories } = useCategories();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCategorieNom, setNewCategorieNom] = useState('');
  const [newCategorieOrdre, setNewCategorieOrdre] = useState('');
  const [newCategorieDescription, setNewCategorieDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { refresh } = useLocalSearchParams();
  const swipeableRef = useRef<Swipeable>(null);

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refreshArticles(), refreshCategories()]);
    setRefreshing(false);
  };

  useEffect(() => {
    if (refresh) {
      onRefresh();
    }
  }, [refresh]);

  const handleAddArticle = () => {
    router.push('/(tabs)/articles/new' as any);
  };

  const handleEditArticle = (article: Article) => {
    router.push(`/(tabs)/articles/${article.id}` as any);
  };

  const handleAddCategorie = () => {
    setNewCategorieNom('');
    setNewCategorieOrdre('');
    setNewCategorieDescription('');
    setModalVisible(true);
  };

  const handleSubmitCategorie = async () => {
    if (!newCategorieNom.trim()) {
      Alert.alert('Erreur', 'Le nom de la catégorie est requis');
      return;
    }

    const ordre = parseInt(newCategorieOrdre) || 0;

    try {
      setIsSubmitting(true);
      await createCategory({
        nom: newCategorieNom.trim(),
        ordre_affichage: ordre,
        description: newCategorieDescription.trim()
      });
      
      setModalVisible(false);
      Alert.alert('Succès', 'Catégorie créée avec succès');
    } catch (error: any) {
      // Ne pas logger l'erreur ici car elle est déjà loggée dans useCategories
      const errorMessage = error?.message || 'Impossible de créer la catégorie';
      Alert.alert('Erreur', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtrer les articles en fonction de la recherche
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return articles;
    const query = searchQuery.toLowerCase().trim();
    return articles.filter(article => 
      article.nom.toLowerCase().includes(query)
    );
  }, [articles, searchQuery]);

  // Mettre à jour articlesByCategorie pour utiliser les articles filtrés
  const articlesByCategorie = useMemo(() => {
    const grouped = filteredArticles.reduce((acc, article) => {
      const catId = article.categorie.id;
      if (!acc[catId]) {
        acc[catId] = {
          categorie: article.categorie,
          articles: []
        };
      }
      acc[catId].articles.push(article);
      return acc;
    }, {} as Record<number, { categorie: CategorieArticle; articles: Article[] }>);

    return Object.values(grouped).sort((a, b) => 
      a.categorie.ordre_affichage - b.categorie.ordre_affichage
    );
  }, [filteredArticles]);

  const menuItems = [
    {
      icon: 'folder-plus',
      label: 'Nouvelle catégorie',
      onPress: handleAddCategorie,
    },
    {
      icon: 'plus',
      label: 'Nouvel article',
      onPress: handleAddArticle,
    },
  ];

  const handleDeleteArticle = async (articleId: number) => {
    Alert.alert(
      'Supprimer l\'article',
      'Êtes-vous sûr de vouloir supprimer cet article ?',
      [
        {
          text: 'Annuler',
          style: 'cancel'
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await articleService.remove(articleId);
              await refreshArticles();
            } catch (error) {
              console.error('Erreur lors de la suppression de l\'article:', error);
              Alert.alert('Erreur', 'Impossible de supprimer l\'article');
            }
          }
        }
      ]
    );
  };

  const renderRightActions = (articleId: number) => {
    return (
      <View style={[styles.deleteActionContainer, { width: 80, height: '100%' }]}>
        <TouchableOpacity
          style={[styles.deleteAction, { backgroundColor: colors.error }]}
          onPress={() => handleDeleteArticle(articleId)}
        >
          <CustomIcon name="alert" size={24} color={colors.surface} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderArticleItem = (article: Article) => (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={() => renderRightActions(article.id)}
      rightThreshold={40}
      containerStyle={styles.swipeableContainer}
    >
      <TouchableOpacity
        style={[styles.articleCard, { backgroundColor: colors.surface }]}
        onPress={() => router.push(`/(tabs)/articles/${article.id}` as any)}
        activeOpacity={0.7}
      >
        <View style={styles.articleInfo}>
          <ThemedText style={[styles.articleName, { color: colors.text }]}>
            {article.nom}
          </ThemedText>
          <ThemedText style={[styles.articleCategory, { color: colors.textSecondary }]}>
            {article.categorie.nom}
          </ThemedText>
        </View>
        <View style={styles.articleDetails}>
          <ThemedText style={[styles.articlePrice, { color: colors.primary }]}>
            {article.prix.toFixed(2)} €
          </ThemedText>
          <View style={[
            styles.availabilityIndicator,
            { backgroundColor: article.disponible ? colors.success : colors.error }
          ]} />
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <HeaderWithSidebars restaurantName={selectedRestaurant?.nom_restaurant || 'Articles'} />
          <View style={styles.searchContainer}>
            <View style={[styles.searchInputContainer, { borderColor: colors.border, backgroundColor: colors.surface }]}>
              <CustomIcon name="note-text" size={20} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Rechercher un article..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.leftButtons}>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: colors.primary }]}
                onPress={handleAddCategorie}
              >
                <CustomIcon name="plus" size={20} color={colors.surface} />
                <ThemedText style={[styles.headerButtonText, { color: colors.surface }]}>
                  Catégorie
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.headerButton, { backgroundColor: colors.primary }]}
                onPress={handleAddArticle}
              >
                <CustomIcon name="plus" size={20} color={colors.surface} />
                <ThemedText style={[styles.headerButtonText, { color: colors.surface }]}>
                  Article
                </ThemedText>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.refreshButton, { backgroundColor: colors.primary }]}
              onPress={onRefresh}
            >
              <CustomIcon name="refresh" size={20} color={colors.surface} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.content}>
          <View style={styles.mainContent}>
            {/* Liste des catégories */}
            <View style={[styles.categoriesContainer, { 
              backgroundColor: colors.surface,
              borderRightColor: colors.border
            }]}>
              {categories.map((categorie) => (
                <TouchableOpacity
                  key={categorie.id}
                  style={[
                    styles.categorieItem,
                    selectedCategorie === categorie.id && { 
                      backgroundColor: colors.primary + '15',
                      borderLeftColor: colors.primary,
                      borderLeftWidth: 3,
                    }
                  ]}
                  onPress={() => setSelectedCategorie(categorie.id)}
                >
                  <ThemedText style={[
                    styles.categorieName,
                    selectedCategorie === categorie.id && { color: colors.primary }
                  ]}>
                    {categorie.nom}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Liste des articles */}
            <ScrollView 
              style={[styles.articlesContainer, { backgroundColor: colors.surface }]}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={onRefresh}
                  colors={[colors.primary]}
                />
              }
              contentContainerStyle={styles.articlesContent}
            >
              {articlesLoading || categoriesLoading ? (
                <View style={styles.loadingContainer}>
                  <ThemedText>Chargement...</ThemedText>
                </View>
              ) : selectedCategorie ? (
                articlesByCategorie
                  .filter(({ categorie }) => categorie.id === selectedCategorie)
                  .map(({ categorie, articles }) => (
                    <View key={categorie.id}>
                      {articles.map((article) => (
                        <View key={article.id}>
                          {renderArticleItem(article)}
                        </View>
                      ))}
                    </View>
                  ))
              ) : (
                <View style={styles.emptyStateContainer}>
                  <ThemedText style={{ color: colors.textSecondary }}>
                    Veuillez sélectionner une catégorie
                  </ThemedText>
                </View>
              )}
            </ScrollView>
          </View>
        </View>

        {/* Modal pour créer une catégorie */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
                  <View style={styles.modalHeader}>
                    <ThemedText style={styles.modalTitle}>Nouvelle catégorie</ThemedText>
                    <TouchableOpacity
                      onPress={() => setModalVisible(false)}
                      style={styles.closeButton}
                    >
                      <CustomIcon name="close" size={24} color={colors.text} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.modalBody}>
                    <View style={styles.inputContainer}>
                      <ThemedText style={styles.inputLabel}>Nom de la catégorie</ThemedText>
                      <TextInput
                        style={[styles.input, { 
                          backgroundColor: colors.background,
                          color: colors.text,
                          borderColor: colors.border
                        }]}
                        value={newCategorieNom}
                        onChangeText={setNewCategorieNom}
                        placeholder="Entrez le nom de la catégorie"
                        placeholderTextColor={colors.textSecondary}
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <ThemedText style={styles.inputLabel}>Description</ThemedText>
                      <TextInput
                        style={[styles.input, styles.textArea, { 
                          backgroundColor: colors.background,
                          color: colors.text,
                          borderColor: colors.border
                        }]}
                        value={newCategorieDescription}
                        onChangeText={setNewCategorieDescription}
                        placeholder="Entrez la description de la catégorie"
                        placeholderTextColor={colors.textSecondary}
                        multiline
                        numberOfLines={3}
                        textAlignVertical="top"
                      />
                    </View>

                    <View style={styles.inputContainer}>
                      <ThemedText style={styles.inputLabel}>Ordre d'affichage</ThemedText>
                      <TextInput
                        style={[styles.input, { 
                          backgroundColor: colors.background,
                          color: colors.text,
                          borderColor: colors.border
                        }]}
                        value={newCategorieOrdre}
                        onChangeText={setNewCategorieOrdre}
                        placeholder="Entrez l'ordre d'affichage"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                      />
                    </View>
                  </View>

                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={[styles.cancelButton, { borderColor: colors.border }]}
                      onPress={() => setModalVisible(false)}
                    >
                      <ThemedText>Annuler</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.submitButton, { 
                        backgroundColor: colors.primary,
                        opacity: isSubmitting ? 0.7 : 1
                      }]}
                      onPress={handleSubmitCategorie}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <ActivityIndicator color={colors.surface} size="small" />
                      ) : (
                        <ThemedText style={{ color: colors.surface }}>Créer</ThemedText>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 8,
    fontSize: 16,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: '100%',
  },
  leftButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  headerButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  categoriesContainer: {
    width: 120,
    borderRightWidth: 1,
    maxHeight: '100%',
  },
  categorieItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  categorieName: {
    fontSize: 14,
    fontWeight: '500',
  },
  articlesContainer: {
    flex: 1,
  },
  articlesContent: {
    padding: 16,
    paddingBottom: 32,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  articleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 4,
    borderRadius: 8,
    width: '90%',
    alignSelf: 'center',
  },
  articleInfo: {
    flex: 1,
    marginRight: 12,
  },
  articleName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  articleDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  articlePrice: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  submitButton: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  categoriesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  categoriesTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  addCategorieButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  refreshButton: {
    padding: 8,
    borderRadius: 8,
  },
  textArea: {
    height: 80,
    paddingTop: 8,
    textAlignVertical: 'top',
  },
  swipeableContainer: {
    marginBottom: 12,
  },
  deleteActionContainer: {
    width: 80,
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
  availabilityIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 8,
  },
  articleCategory: {
    fontSize: 14,
    marginTop: 4,
  },
}); 