import apiClient from '../api';
import { Restaurant } from '../../../src/models';

const BASE_PATH = '/restaurants';

/**
 * Récupère la liste des restaurants
 * @returns Promise avec la liste des restaurants
 */
export const getRestaurants = async () => {
  return apiClient.get<Restaurant[]>(`${BASE_PATH}/`);
};

/**
 * Récupère un restaurant par son ID
 * @param id Identifiant du restaurant
 * @returns Promise avec le restaurant
 */
export const getRestaurantById = async (id: number) => {
  return apiClient.get<Restaurant>(`${BASE_PATH}/${id}/`);
};

/**
 * Récupère les restaurants associés à un employé
 * @param userId ID de l'employé
 * @returns Promise avec la liste des restaurants
 */
export const getRestaurantByIdEmploye = async (userId: number) => {
  return apiClient.get<Restaurant[]>(`${BASE_PATH}/?user_id=${userId}`);
};

/**
 * Service pour gérer les opérations liées aux restaurants
 */
export const restaurantService = {
  getAll: getRestaurants,
  getById: getRestaurantById,
  getByUserId: getRestaurantByIdEmploye,
}; 