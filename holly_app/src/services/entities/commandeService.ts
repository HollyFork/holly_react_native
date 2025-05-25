import { Commande, CreateCommandeDTO } from '@/models/Commande';
import apiClient from '../utils/api';

const BASE_PATH = '/commandes';

export const getByRestaurantId = async (id: number) => {
    return apiClient.get<Commande[]>(`${BASE_PATH}/?restaurant_id=${id}`);
};

export const getById = async (id: number) => {
    return apiClient.get<Commande>(`${BASE_PATH}/${id}/`);
};

export const getByTableId = async (id: number) => {
    return apiClient.get<Commande[]>(`${BASE_PATH}/?table_id=${id}&statut=EN_COURS`);
};

export const getByTableAndRestaurantId = async (tableId: number, restaurantId: number) => {
    return apiClient.get<Commande[]>(`${BASE_PATH}/?restaurant_id=${restaurantId}&table_id=${tableId}`);
};

export const createCommande = async (commande: CreateCommandeDTO) => {
    return apiClient.post<Commande>(`${BASE_PATH}/`, commande);
};

export const updateCommande = async (id: number, commande: Commande) => {
    return apiClient.put<Commande>(`${BASE_PATH}/${id}/`, commande);
};

export const deleteCommande = async (id: number) => {
    return apiClient.delete<Commande>(`${BASE_PATH}/${id}/`);
};

export const commandeService = {
    getByRestaurantId,
    getById,
    getByTableId,
    getByTableAndRestaurantId,
    createCommande,
    updateCommande,
    deleteCommande,
};
