import { Reservation } from '../../../src/models';
import apiClient from '../utils/api';

const BASE_PATH = '/reservations';

export const getReservationsByIdRestaurant = async (id: number) => {
  return apiClient.get<Reservation[]>(`${BASE_PATH}/?restaurant_id=${id}`);
};

export const reservationService = {
  getByRestaurantId: getReservationsByIdRestaurant,
};