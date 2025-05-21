import { Commande } from '@/models/Commande';
import apiClient from '../utils/api';


const BASE_PATH = '/commandes';

export const getCommandesByIdRestaurant = async (id: number) => {
    return apiClient.get<Commande[]>(`${BASE_PATH}/?restaurant_id=${id}`);
};

export const getCommandeById = async (id: number) => {
    return apiClient.get<Commande>(`${BASE_PATH}/${id}/`);
};

export const commandeService = {
    getByRestaurantId: getCommandesByIdRestaurant,
    getById: getCommandeById,
};
