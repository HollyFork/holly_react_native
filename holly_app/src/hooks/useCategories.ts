import { useRestaurants } from '@/contexts/RestaurantContext';
import { CategorieArticle } from '@/models/CategorieArticle';
import { categorieService } from '@/services/entities/categorieService';
import { useEffect, useState } from 'react';

interface CreateCategoryDTO {
  nom: string;
  ordre_affichage: number;
  description?: string;
  restaurant_id: number;
}

export function useCategories() {
  const [categories, setCategories] = useState<CategorieArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedRestaurant } = useRestaurants();

  const fetchCategories = async () => {
    if (!selectedRestaurant?.id_restaurant) {
      setCategories([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await categorieService.getByRestaurantId(selectedRestaurant.id_restaurant);
      setCategories(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
      setError('Impossible de charger les catégories');
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categorie: Omit<CategorieArticle, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      if (!selectedRestaurant?.id_restaurant) {
        throw new Error('Aucun restaurant sélectionné');
      }

      // Formater les données selon le format attendu par l'API
      const categorieData: CreateCategoryDTO = {
        nom: categorie.nom.charAt(0).toUpperCase() + categorie.nom.slice(1), // Première lettre en majuscule
        ordre_affichage: Math.max(1, Number(categorie.ordre_affichage) || 1), // S'assurer que c'est un nombre positif
        description: categorie.description || undefined, // Optionnel
        restaurant_id: selectedRestaurant.id_restaurant, // Ajouter l'ID du restaurant
      };

      console.log('Création de catégorie avec les données:', categorieData);
      const response = await categorieService.create(categorieData);
      
      // Mise à jour optimiste de l'état local
      const newCategory = response.data;
      setCategories(prevCategories => {
        // Vérifier si la catégorie n'existe pas déjà
        const exists = prevCategories.some(cat => cat.id === newCategory.id);
        if (!exists) {
          const updatedCategories = [...prevCategories, newCategory];
          return updatedCategories.sort((a, b) => a.ordre_affichage - b.ordre_affichage);
        }
        return prevCategories;
      });
      
      // Rafraîchir la liste complète pour s'assurer de la cohérence
      setTimeout(() => {
        fetchCategories();
      }, 100);
      
      return response.data;
    } catch (err) {
      console.error('Erreur lors de la création de la catégorie:', err);
      throw err;
    }
  };

  const updateCategory = async (id: number, categorie: Partial<CategorieArticle>) => {
    try {
      const response = await categorieService.update(id, categorie);
      await fetchCategories(); // Rafraîchir la liste après mise à jour
      return response.data;
    } catch (err) {
      console.error('Erreur lors de la mise à jour de la catégorie:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await categorieService.remove(id);
      await fetchCategories(); // Rafraîchir la liste après suppression
    } catch (err) {
      console.error('Erreur lors de la suppression de la catégorie:', err);
      throw err;
    }
  };

  useEffect(() => {
    console.log('useCategories: restaurantId changé, nouveau ID:', selectedRestaurant?.id_restaurant);
    fetchCategories();
  }, [selectedRestaurant?.id_restaurant]);

  return {
    categories,
    loading,
    error,
    refresh: fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
} 