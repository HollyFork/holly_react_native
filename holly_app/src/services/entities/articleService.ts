import { Article } from '@/models/Article';
import apiClient from '../utils/api';

const BASE_PATH = '/articles';

export const getAll = async (queryParams?: string) => {
    return apiClient.get<Article[]>(`${BASE_PATH}/${queryParams ? queryParams : ''}`);
};

export const getByRestaurantId = async (restaurantId: number) => {
    return apiClient.get<Article[]>(`${BASE_PATH}/?restaurant_id=${restaurantId}`);
};

export const getById = async (id: number) => {
    return apiClient.get<Article>(`${BASE_PATH}/${id}/`);
};

export const create = async (article: Omit<Article, 'id'>) => {
    return apiClient.post<Article>(`${BASE_PATH}/`, article);
};

export const update = async (id: number, article: Partial<Article>) => {
    return apiClient.patch<Article>(`${BASE_PATH}/${id}/`, article);
};

export const remove = async (id: number) => {
    return apiClient.delete(`${BASE_PATH}/${id}/`);
};

export const articleService = {
    getAll,
    getById,
    getByRestaurantId,
    create,
    update,
    remove,
}; 