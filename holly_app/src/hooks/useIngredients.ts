import { useRestaurants } from '@/contexts/RestaurantContext';
import { Ingredient } from '@/models/Ingredient';
import apiClient from '@/services/utils/api';
import { useEffect, useState } from 'react';

const BASE_PATH = '/ingredients';

export function useIngredients() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { selectedRestaurant } = useRestaurants();

  const fetchIngredients = async () => {
    if (!selectedRestaurant?.id_restaurant) {
      setIngredients([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await apiClient.get<Ingredient[]>(`${BASE_PATH}/?restaurant_id=${selectedRestaurant.id_restaurant}`);
      setIngredients(response.data);
    } catch (err) {
      console.error('Erreur lors du chargement des ingrédients:', err);
      setError('Impossible de charger les ingrédients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, [selectedRestaurant?.id_restaurant]);

  return {
    ingredients,
    loading,
    error,
    refresh: fetchIngredients
  };
} 