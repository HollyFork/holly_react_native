import { CategorieArticle } from '@/models/CategorieArticle';
import apiClient from '../utils/api';

const BASE_PATH = '/categories';

export const getAll = async (queryParams?: string) => {
    return apiClient.get<CategorieArticle[]>(`${BASE_PATH}/${queryParams ? queryParams : ''}`);
};

export const getByRestaurantId = async (restaurantId: number) => {
    return apiClient.get<CategorieArticle[]>(`${BASE_PATH}/?restaurant_id=${restaurantId}`);
};

export const getById = async (id: number) => {
    return apiClient.get<CategorieArticle>(`${BASE_PATH}/${id}/`);
};

export const create = async (categorie: Omit<CategorieArticle, 'id'>) => {
    return apiClient.post<CategorieArticle>(`${BASE_PATH}/`, categorie);
};

export const update = async (id: number, categorie: Partial<CategorieArticle>) => {
    return apiClient.put<CategorieArticle>(`${BASE_PATH}/${id}/`, categorie);
};

export const remove = async (id: number) => {
    return apiClient.delete(`${BASE_PATH}/${id}/`);
};

export const getByNom = async (nom: string) => {
    return apiClient.get<CategorieArticle[]>(`${BASE_PATH}/?nom=${encodeURIComponent(nom)}`);
};

export const categorieService = {
    getAll,
    getById,
    getByRestaurantId,
    create,
    update,
    remove,
    getByNom,
}; 