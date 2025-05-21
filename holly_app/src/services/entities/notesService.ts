
import { Note } from '@/models/Note';
import apiClient from '../utils/api';
const BASE_PATH = '/notes';

export const getNotesByIdRestaurant = async (id: number) => {
  return apiClient.get<Note[]>(`${BASE_PATH}/?restaurant_id=${id}`);
};

export const deleteNote = async (id: number) => {
  return apiClient.delete(`${BASE_PATH}/${id}`);
};

export const notesService = {
  getByRestaurantId: getNotesByIdRestaurant,
  delete: deleteNote,
};