
import { Reservation } from '../../../src/models';
import apiClient from '../api';

const BASE_PATH = '/reservations';

export const getReservationsByIdRestaurant = async (id: number) => {
  return apiClient.get<Reservation[]>(`${BASE_PATH}/?restaurant_id=${id}`);
};