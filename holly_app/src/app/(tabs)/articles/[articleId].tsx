import { CustomIcon } from '@/components/common/CustomIcon';
import { HeaderWithSidebars } from '@/components/common/HeaderWithSidebars';
import { ThemedText } from '@/components/common/ThemedText';
import { useRestaurants } from '@/contexts/RestaurantContext';
import { useArticles } from '@/hooks/useArticles';
import { useCategories } from '@/hooks/useCategories';
import { useIngredients } from '@/hooks/useIngredients';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Article } from '@/models/Article';
import { Ingredient } from '@/models/Ingredient';
import { articleService } from '@/services/entities/articleService';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';

type CreateArticleDTO = {
  nom: string;
  prix: number;
  description: string;
  disponible: boolean;
  categorie_id: number;
  restaurant_id: number | undefined;
  ingredients?: { ingredient_id: number; quantite_necessaire: number }[];
};

type ArticleIngredient = {
  ingredient: Ingredient;
  quantite: string;
};

export default function ArticleDetailsScreen() {
  const { articleId } = useLocalSearchParams();
  const { colors } = useThemeColor();
  const { selectedRestaurant } = useRestaurants();
  const { articles, refresh: refreshArticles } = useArticles(selectedRestaurant?.id_restaurant || null);
  const { categories } = useCategories();
  const { ingredients, loading: ingredientsLoading } = useIngredients();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  
  const [nom, setNom] = useState('');
  const [prix, setPrix] = useState('');
  const [description, setDescription] = useState('');
  const [disponible, setDisponible] = useState(true);
  const [selectedCategorie, setSelectedCategorie] = useState<number | null>(null);
  const [selectedIngredients, setSelectedIngredients] = useState<ArticleIngredient[]>([]);
  const [showIngredientModal, setShowIngredientModal] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [ingredientQuantite, setIngredientQuantite] = useState('');

  // Fonction pour transformer la virgule en point
  const formatPrix = (value: string) => {
    // Remplacer la virgule par un point
    return value.replace(',', '.');
  };

  useEffect(() => {
    const loadArticle = async () => {
      try {
        if (articleId === 'new') {
          // Réinitialiser tous les états pour un nouvel article
          setArticle(null);
          setNom('');
          setPrix('');
          setDescription('');
          setDisponible(true);
          setSelectedCategorie(null);
          setSelectedIngredients([]);
          setLoading(false);
          return;
        }

        setLoading(true);
        console.log('Chargement de l\'article avec ID:', articleId);
        const { data: articleData } = await articleService.getById(Number(articleId));
        console.log('Données de l\'article reçues:', JSON.stringify(articleData, null, 2));
        
        setArticle(articleData);
        setNom(articleData.nom);
        setPrix(articleData.prix.toString().replace('.', ','));
        setDescription(articleData.description || '');
        setDisponible(articleData.disponible);
        setSelectedCategorie(articleData.categorie.id);
        
        console.log('Ingrédients de l\'article:', articleData.ingredients);
        if (articleData.ingredients && articleData.ingredients.length > 0) {
          const mappedIngredients = articleData.ingredients.map(ing => ({
            ingredient: ing.ingredient,
            quantite: ing.quantite_necessaire.toString()
          }));
          console.log('Ingrédients mappés:', mappedIngredients);
          setSelectedIngredients(mappedIngredients);
        } else {
          console.log('Aucun ingrédient trouvé pour cet article');
          setSelectedIngredients([]);
        }
      } catch (error) {
        console.error('Erreur détaillée lors du chargement de l\'article:', error);
        Alert.alert('Erreur', 'Impossible de charger les détails de l\'article');
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [articleId]);

  // Ajout d'un log pour vérifier l'état des ingrédients sélectionnés
  useEffect(() => {
    console.log('État actuel des ingrédients sélectionnés:', selectedIngredients);
  }, [selectedIngredients]);

  const handleAddIngredient = () => {
    if (!selectedIngredient) return;
    
    const quantite = parseFloat(ingredientQuantite.replace(',', '.'));
    if (isNaN(quantite) || quantite <= 0) {
      Alert.alert('Erreur', 'Veuillez entrer une quantité valide');
      return;
    }

    setSelectedIngredients(prev => [
      ...prev,
      { ingredient: selectedIngredient, quantite: ingredientQuantite }
    ]);
    setShowIngredientModal(false);
    setSelectedIngredient(null);
    setIngredientQuantite('');
  };

  const handleRemoveIngredient = async (ingredientId: number) => {
    try {
      // Mettre à jour l'état local
      const updatedIngredients = selectedIngredients.filter(item => item.ingredient.id !== ingredientId);
      setSelectedIngredients(updatedIngredients);

      // Si nous sommes en mode édition (articleId !== 'new'), mettre à jour l'article
      if (articleId !== 'new' && selectedCategorie) {
        // Préparer les données de l'article avec le format correct pour les ingrédients
        const articleData = {
          ingredients_update: updatedIngredients.map(item => ({
            ingredient_id: item.ingredient.id,
            quantite_necessaire: item.quantite // Garder le format string comme dans l'exemple
          }))
        };

        console.log('Données envoyées au backend:', JSON.stringify(articleData, null, 2));
        await articleService.update(Number(articleId), articleData as any);
        await refreshArticles();
      }
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'ingrédient:', error);
      if (error.response) {
        console.error('Réponse du serveur:', JSON.stringify(error.response.data, null, 2));
      }
      Alert.alert('Erreur', 'Impossible de supprimer l\'ingrédient');
      // Restaurer l'état précédent en cas d'erreur
      setSelectedIngredients(selectedIngredients);
    }
  };

  const handleSave = async () => {
    if (!nom.trim()) {
      Alert.alert('Erreur', 'Le nom de l\'article est requis');
      return;
    }

    if (!selectedCategorie) {
      Alert.alert('Erreur', 'Veuillez sélectionner une catégorie');
      return;
    }

    const prixValue = parseFloat(formatPrix(prix));
    if (isNaN(prixValue) || prixValue < 0) {
      Alert.alert('Erreur', 'Veuillez entrer un prix valide');
      return;
    }

    try {
      setSaving(true);
      const articleData = {
        nom: nom.trim(),
        prix: prixValue,
        description: description.trim(),
        disponible,
        categorie_id: selectedCategorie,
        restaurant_id: selectedRestaurant?.id_restaurant,
        ingredients: selectedIngredients.map(item => ({
          ingredient_id: item.ingredient.id,
          quantite_necessaire: parseFloat(item.quantite.replace(',', '.'))
        }))
      } as any; // Utilisation de 'any' temporairement pour contourner les problèmes de typage

      if (articleId === 'new') {
        await articleService.create(articleData);
      } else {
        await articleService.update(Number(articleId), articleData);
      }

      await refreshArticles();
      router.replace('/(tabs)/articles' as any);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de l\'article:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder l\'article');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <HeaderWithSidebars restaurantName={selectedRestaurant?.nom_restaurant || ''} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <HeaderWithSidebars restaurantName={selectedRestaurant?.nom_restaurant || ''} />
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <View style={[styles.navBar, { backgroundColor: colors.surface }]}>
          <TouchableOpacity 
            onPress={() => router.replace('/(tabs)/articles' as any)}
            style={[styles.navButton, { backgroundColor: colors.background }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <CustomIcon name="chevron-right" size={24} color={colors.primary} style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>

          <ThemedText style={[styles.navTitle, { color: colors.text }]}>
            {article ? 'Modifier l\'article' : 'Nouvel article'}
          </ThemedText>

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            style={[styles.saveButton, { 
              backgroundColor: colors.primary,
              opacity: saving ? 0.5 : 1
            }]}
          >
            {saving ? (
              <ActivityIndicator color={colors.surface} size="small" />
            ) : (
              <ThemedText style={[styles.saveButtonText, { color: colors.surface }]}>
                Enregistrer
              </ThemedText>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={[styles.formContainer, { backgroundColor: colors.surface }]}>
            <View style={styles.formGroup}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Nom de l'article
              </ThemedText>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border
                }]}
                value={nom}
                onChangeText={setNom}
                placeholder="Nom de l'article"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Prix
              </ThemedText>
              <View style={[styles.priceInputContainer, { 
                backgroundColor: colors.background,
                borderColor: colors.border
              }]}>
                <CustomIcon name="currency-eur" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.priceInput, { color: colors.text }]}
                  value={prix}
                  onChangeText={(value) => {
                    // Permettre uniquement les chiffres, la virgule et le point
                    if (/^[0-9]*[,.]?[0-9]*$/.test(value)) {
                      setPrix(value);
                    }
                  }}
                  placeholder="0,00"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Description
              </ThemedText>
              <TextInput
                style={[styles.textArea, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border
                }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Description de l'article"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Catégorie
              </ThemedText>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesScroll}
              >
                {categories.map((categorie) => (
                  <TouchableOpacity
                    key={categorie.id}
                    style={[
                      styles.categorieChip,
                      { 
                        backgroundColor: selectedCategorie === categorie.id 
                          ? colors.primary + '15' 
                          : colors.background,
                        borderColor: selectedCategorie === categorie.id 
                          ? colors.primary 
                          : colors.border
                      }
                    ]}
                    onPress={() => setSelectedCategorie(categorie.id)}
                  >
                    <ThemedText style={[
                      styles.categorieChipText,
                      { 
                        color: selectedCategorie === categorie.id 
                          ? colors.primary 
                          : colors.text
                      }
                    ]}>
                      {categorie.nom}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={[styles.formGroup, styles.switchContainer]}>
              <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                Disponible
              </ThemedText>
              <Switch
                value={disponible}
                onValueChange={setDisponible}
                trackColor={{ false: colors.error + '40', true: colors.success + '40' }}
                thumbColor={disponible ? colors.success : colors.error}
              />
            </View>

            <View style={styles.formGroup}>
              <View style={styles.ingredientsHeader}>
                <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                  Ingrédients
                </ThemedText>
                <TouchableOpacity
                  style={[styles.addButton, { backgroundColor: colors.primary }]}
                  onPress={() => setShowIngredientModal(true)}
                >
                  <CustomIcon name="plus" size={20} color={colors.surface} />
                  <ThemedText style={[styles.addButtonText, { color: colors.surface }]}>
                    Ajouter
                  </ThemedText>
                </TouchableOpacity>
              </View>

              {selectedIngredients.length > 0 ? (
                <View style={styles.ingredientsList}>
                  {selectedIngredients.map((item) => (
                    <View
                      key={item.ingredient.id}
                      style={[styles.ingredientItem, { backgroundColor: colors.background }]}
                    >
                      <View style={styles.ingredientInfo}>
                        <ThemedText style={[styles.ingredientName, { color: colors.text }]}>
                          {item.ingredient.nom}
                        </ThemedText>
                        <ThemedText style={[styles.ingredientQuantity, { color: colors.textSecondary }]}>
                          {item.quantite} {item.ingredient.unite}
                        </ThemedText>
                      </View>
                      <TouchableOpacity
                        onPress={() => handleRemoveIngredient(item.ingredient.id)}
                        style={[styles.removeButton, { backgroundColor: colors.error + '15' }]}
                      >
                        <CustomIcon name="close" size={20} color={colors.error} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={[styles.emptyIngredients, { backgroundColor: colors.background }]}>
                  <ThemedText style={[styles.emptyText, { color: colors.textSecondary }]}>
                    Aucun ingrédient sélectionné
                  </ThemedText>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Modal pour ajouter un ingrédient */}
        <Modal
          visible={showIngredientModal}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowIngredientModal(false)}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <View style={styles.modalHeader}>
                  <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
                    Ajouter un ingrédient
                  </ThemedText>
                  <TouchableOpacity
                    onPress={() => setShowIngredientModal(false)}
                    style={styles.closeButton}
                  >
                    <CustomIcon name="close" size={24} color={colors.text} />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.formGroup}>
                    <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                      Ingrédient
                    </ThemedText>
                    <ScrollView style={styles.ingredientsScroll}>
                      {ingredients.map((ingredient) => (
                        <TouchableOpacity
                          key={ingredient.id}
                          style={[
                            styles.ingredientOption,
                            { 
                              backgroundColor: selectedIngredient?.id === ingredient.id 
                                ? colors.primary + '15' 
                                : colors.background,
                              borderColor: selectedIngredient?.id === ingredient.id 
                                ? colors.primary 
                                : colors.border
                            }
                          ]}
                          onPress={() => setSelectedIngredient(ingredient)}
                        >
                          <ThemedText style={[
                            styles.ingredientOptionText,
                            { 
                              color: selectedIngredient?.id === ingredient.id 
                                ? colors.primary 
                                : colors.text
                            }
                          ]}>
                            {ingredient.nom}
                          </ThemedText>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>

                  <View style={styles.formGroup}>
                    <ThemedText style={[styles.label, { color: colors.textSecondary }]}>
                      Quantité
                    </ThemedText>
                    <View style={[styles.quantityInputContainer, { 
                      backgroundColor: colors.background,
                      borderColor: colors.border
                    }]}>
                      <TextInput
                        style={[styles.quantityInput, { color: colors.text }]}
                        value={ingredientQuantite}
                        onChangeText={setIngredientQuantite}
                        placeholder="0.00"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="decimal-pad"
                      />
                      {selectedIngredient && (
                        <ThemedText style={[styles.unitText, { color: colors.textSecondary }]}>
                          {selectedIngredient.unite}
                        </ThemedText>
                      )}
                    </View>
                  </View>
                </View>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={[styles.cancelButton, { borderColor: colors.border }]}
                    onPress={() => setShowIngredientModal(false)}
                  >
                    <ThemedText style={[styles.buttonText, { color: colors.text }]}>
                      Annuler
                    </ThemedText>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.submitButton, { 
                      backgroundColor: colors.primary,
                      opacity: selectedIngredient && ingredientQuantite ? 1 : 0.5
                    }]}
                    onPress={handleAddIngredient}
                    disabled={!selectedIngredient || !ingredientQuantite}
                  >
                    <ThemedText style={[styles.buttonText, { color: colors.surface }]}>
                      Ajouter
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </View>
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
  saveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  formContainer: {
    padding: 16,
    gap: 20,
  },
  formGroup: {
    gap: 8,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  priceInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
  },
  textArea: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  categoriesScroll: {
    flexDirection: 'row',
    marginTop: 8,
  },
  categorieChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categorieChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ingredientsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  ingredientInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 4,
  },
  ingredientQuantity: {
    fontSize: 14,
  },
  removeButton: {
    padding: 8,
    borderRadius: 8,
  },
  emptyIngredients: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    padding: 20,
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
    gap: 20,
  },
  ingredientsScroll: {
    maxHeight: 200,
  },
  ingredientOption: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  ingredientOptionText: {
    fontSize: 15,
    fontWeight: '500',
  },
  quantityInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
  },
  quantityInput: {
    flex: 1,
    fontSize: 16,
  },
  unitText: {
    fontSize: 14,
    marginLeft: 8,
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
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
}); 