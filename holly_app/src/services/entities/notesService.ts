import { Note } from '@/src/models';
import apiClient from '../api';
const BASE_PATH = '/notes';

export const getNotesByIdRestaurant = async (id: number) => {
  return apiClient.get<Note[]>(`${BASE_PATH}/?restaurant_id=${id}`);
};

export const notesService = {
  getByRestaurantId: getNotesByIdRestaurant,
};