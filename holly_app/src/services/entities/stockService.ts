import apiClient from '../utils/api';

import { Stock } from '@/src/models';

const BASE_PATH = '/stocks';

export const getStocksByIdRestaurant = async (id: number) => {
    return apiClient.get<Stock[]>(`${BASE_PATH}/?restaurant_id=${id}`);
};

export const stockService = {
    getByRestaurantId: getStocksByIdRestaurant,
};