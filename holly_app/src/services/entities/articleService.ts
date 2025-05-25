import { Article } from '@/models/Article';
import apiClient from '../utils/api';

const BASE_PATH = '/articles';

export const getAll = async () => {
    return apiClient.get<Article[]>(`${BASE_PATH}/`);
};

export const getById = async (id: number) => {
    return apiClient.get<Article>(`${BASE_PATH}/${id}/`);
};

export const create = async (article: Omit<Article, 'id'>) => {
    return apiClient.post<Article>(`${BASE_PATH}/`, article);
};

export const update = async (id: number, article: Partial<Article>) => {
    return apiClient.put<Article>(`${BASE_PATH}/${id}/`, article);
};

export const remove = async (id: number) => {
    return apiClient.delete(`${BASE_PATH}/${id}/`);
};

export const articleService = {
    getAll,
    getById,
    create,
    update,
    remove,
}; 