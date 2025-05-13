import apiClient from '../api';
import { Restaurant } from '../../../src/models';
import { PaginatedResponse } from '../types';

const BASE_PATH = '/restaurants';

/**
 * Récupère la liste des restaurants avec pagination
 * @param page Numéro de page (défaut: 1)
 * @param size Nombre d'éléments par page (défaut: 10)
 * @returns Promise avec la réponse contenant les restaurants
 */
export const getRestaurants = async (page = 1, size = 10) => {
  return apiClient.get<PaginatedResponse<Restaurant>>(
    `${BASE_PATH}/?page=${page}&size=${size}`
  );
};

/**
 * Récupère un restaurant par son ID
 * @param id Identifiant du restaurant
 * @returns Promise avec la réponse contenant le restaurant
 */
export const getRestaurantById = async (id: number) => {
  return apiClient.get<Restaurant>(`${BASE_PATH}/${id}/`);
};

/**
 * Récupère les restaurants associés à un utilisateur
 * @param id ID de l'utilisateur
 * @returns Promise avec la réponse contenant les restaurants de l'utilisateur
 */
export const getRestaurantByIdEmploye = async (id: number | undefined) => {
  // Vérifier si l'ID est défini et valide
  if (typeof id === 'undefined' || id === null) {
    console.error('ID utilisateur non défini ou invalide:', id);
    throw new Error('ID utilisateur non défini');
  }
  
  console.log(`Appel API restaurants pour utilisateur ID: ${id}`);
  const url = `${BASE_PATH}/?user_id=${id}`;
  console.log('URL de requête:', url);
  
  try {
    return await apiClient.get<Restaurant[]>(url);
  } catch (error) {
    console.error('Erreur lors de la requête restaurants:', error);
    throw error;
  }
};

/**
 * Service pour gérer les opérations liées aux restaurants
 */
export const restaurantService = {
  getAll: getRestaurants,
  getById: getRestaurantById,
  getByUserId: getRestaurantByIdEmploye,
}; 