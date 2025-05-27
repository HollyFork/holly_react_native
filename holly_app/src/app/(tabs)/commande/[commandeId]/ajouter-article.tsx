import { CustomIcon } from '@/components/common/CustomIcon';
import { HeaderWithSidebars } from '@/components/common/HeaderWithSidebars';
import { ThemedText } from '@/components/common/ThemedText';
import { Colors } from '@/constants/Colors';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { useArticles } from '@/hooks/useArticles';
import { useCategories } from '@/hooks/useCategories';
import { Article } from '@/models/Article';
import { CategorieArticle } from '@/models/CategorieArticle';
import { LigneCommande } from '@/models/LigneCommande';
import { ligneCommandeService } from '@/services/entities/ligneCommandeService';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, TouchableOpacity, View, useColorScheme } from 'react-native';

export default function AjouterArticleScreen() {
  const { commandeId, from } = useLocalSearchParams();
  const [selectedArticle, setSelectedArticle] = useState<number | null>(null);
  const [selectedCategorie, setSelectedCategorie] = useState<number | null>(null);
  const [quantite, setQuantite] = useState('1');
  const [loading, setLoading] = useState(false);
  const { selectedRestaurant } = useRestaurants();
  const { articles, loading: articlesLoading } = useArticles(selectedRestaurant?.id_restaurant || null);
  const { categories, loading: categoriesLoading } = useCategories();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme === 'dark' ? 'dark' : 'light'];

  // Grouper les articles par catégorie
  const articlesByCategorie = React.useMemo(() => {
    const grouped = articles.reduce((acc, article) => {
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

    // Trier les catégories selon l'ordre d'affichage
    const sortedCategories = categories.sort((a, b) => a.ordre_affichage - b.ordre_affichage);
    
    // Retourner uniquement les catégories qui ont des articles
    return sortedCategories
      .filter(cat => grouped[cat.id])
      .map(cat => grouped[cat.id]);
  }, [articles, categories]);

  const quantiteOptions = React.useMemo(() => 
    Array.from({ length: 20 }, (_, i) => (i + 1).toString()), 
    []
  );

  const handleSubmit = async () => {
    if (!selectedArticle || !quantite || isNaN(Number(quantite)) || Number(quantite) <= 0) {
      Alert.alert('Erreur', 'Veuillez sélectionner un article et une quantité valide');
      return;
    }

    try {
      setLoading(true);
      const article = articles.find((a: Article) => a.id === selectedArticle);
      if (!article) throw new Error('Article non trouvé');

      const nouvelleLigne: Omit<LigneCommande, 'id' | 'article' | 'created_at' | 'updated_at'> = {
        commande_id: Number(commandeId),
        article_id: selectedArticle,
        quantite: Number(quantite),
        prix_unitaire: article.prix,
      };

      await ligneCommandeService.addLigneCommande(nouvelleLigne);
      router.push(`/commande/${commandeId}?from=${from || 'commandes'}`);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la ligne de commande:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter la ligne de commande');
    } finally {
      setLoading(false);
    }
  };

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
          onPress={() => router.back()}
          style={[styles.navButton, { backgroundColor: colors.background }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <CustomIcon name="chevron-right" size={24} color={colors.primary} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>

        <ThemedText style={[styles.navTitle, { color: colors.text }]}>
          Ajouter un article
        </ThemedText>

        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.mainContent}>
          {/* Liste des catégories */}
          <View style={[styles.categoriesContainer, { 
            backgroundColor: colors.surface,
            borderRightColor: colors.border
          }]}>
            <ScrollView>
              {categoriesLoading ? (
                <View style={styles.loadingContainer}>
                  <ThemedText>Chargement des catégories...</ThemedText>
                </View>
              ) : (
                categories
                  .sort((a, b) => a.ordre_affichage - b.ordre_affichage)
                  .map((categorie) => (
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
                      onPress={() => {
                        setSelectedCategorie(categorie.id);
                        setSelectedArticle(null);
                      }}
                    >
                      <ThemedText style={[
                        styles.categorieName,
                        selectedCategorie === categorie.id && { color: colors.primary }
                      ]}>
                        {categorie.nom}
                      </ThemedText>
                    </TouchableOpacity>
                  ))
              )}
            </ScrollView>
          </View>

          {/* Liste des articles */}
          <View style={[styles.articlesContainer, { backgroundColor: colors.surface }]}>
            <ScrollView>
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
                        <TouchableOpacity
                          key={article.id}
                          style={[
                            styles.articleItem,
                            { backgroundColor: colors.background },
                            selectedArticle === article.id && { 
                              backgroundColor: colors.primary + '15',
                              borderColor: colors.primary,
                            }
                          ]}
                          onPress={() => setSelectedArticle(article.id)}
                        >
                          <View style={styles.articleInfo}>
                            <ThemedText style={[
                              styles.articleName,
                              selectedArticle === article.id && { color: colors.primary }
                            ]}>
                              {article.nom}
                            </ThemedText>
                          </View>
                          <ThemedText style={[styles.articlePrice, { color: colors.primary }]}>
                            {Number(article.prix).toFixed(2)} €
                          </ThemedText>
                        </TouchableOpacity>
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

        {/* Sélecteur de quantité et bouton d'ajout */}
        <View style={[styles.bottomContainer, { 
          backgroundColor: colors.surface, 
          borderTopColor: colors.border,
        }]}>
          <View style={styles.bottomContent}>
            <View style={styles.bottomRow}>
              <View style={styles.leftSection}>
                <TouchableOpacity
                  onPress={handleSubmit}
                  disabled={!selectedArticle || loading}
                  style={[
                    styles.submitButton,
                    { 
                      backgroundColor: colors.primary,
                      opacity: (!selectedArticle || loading) ? 0.5 : 1,
                    }
                  ]}
                >
                  {loading ? (
                    <ActivityIndicator color={colors.surface} size="small" />
                  ) : (
                    <CustomIcon name="plus" size={24} color={colors.surface} />
                  )}
                </TouchableOpacity>
              </View>

              <View style={styles.centerSection}>
                <View style={styles.quantityContainer}>
                  <ThemedText style={[styles.label, { color: colors.textSecondary }]}></ThemedText>
                  <View style={[styles.quantitySelector, { 
                    backgroundColor: colors.background,
                    borderColor: colors.border,
                  }]}>
                    <TouchableOpacity
                      onPress={() => {
                        const newValue = Math.max(1, Number(quantite) - 1);
                        setQuantite(newValue.toString());
                      }}
                      style={[styles.quantityButton, { borderRightColor: colors.border }]}
                      disabled={Number(quantite) <= 1}
                    >
                      <View style={[
                        styles.minusIcon,
                        { 
                          backgroundColor: Number(quantite) <= 1 ? colors.textSecondary : colors.primary,
                          width: 12,
                          height: 2,
                        }
                      ]} />
                    </TouchableOpacity>
                    
                    <View style={styles.quantityDisplay}>
                      <ThemedText style={[styles.quantityText, { color: colors.text }]}>
                        {quantite}
                      </ThemedText>
                    </View>

                    <TouchableOpacity
                      onPress={() => {
                        const newValue = Math.min(20, Number(quantite) + 1);
                        setQuantite(newValue.toString());
                      }}
                      style={[styles.quantityButton, { borderLeftColor: colors.border }]}
                      disabled={Number(quantite) >= 20}
                    >
                      <CustomIcon 
                        name="plus" 
                        size={20} 
                        color={Number(quantite) >= 20 ? colors.textSecondary : colors.primary} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View style={styles.rightSection} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(142, 142, 147, 0.12)',
    minHeight: 64,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '600',
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
    width: 150,
    borderRightWidth: 1,
  },
  categorieItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  categorieName: {
    fontSize: 15,
    fontWeight: '500',
  },
  articlesContainer: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  categorieTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 16,
  },
  articleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  articleInfo: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  articleName: {
    fontSize: 16,
    fontWeight: '500',
  },
  articlePrice: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomContainer: {
    borderTopWidth: 1,
    paddingBottom: Platform.OS === 'ios' ? 32 : 24,
    paddingTop: 8,
  },
  bottomContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '100%',
    paddingLeft: 16,
  },
  leftSection: {
    width: 44,
    marginRight: 48,
  },
  centerSection: {
    flex: 0,
    alignItems: 'center',
  },
  rightSection: {
    flex: 1,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 120,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  quantitySelector: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    height: 44,
    width: 120,
  },
  quantityButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
  },
  quantityDisplay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  minusIcon: {
    borderRadius: 1,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 