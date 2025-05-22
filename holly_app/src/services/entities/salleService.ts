import { Salle } from "@/models/Salle";
import apiClient from "../utils/api";

const BASE_PATH = '/salles';

export const getSallesByIdRestaurant = async (id: number) => {
    return apiClient.get<Salle[]>(`${BASE_PATH}/?restaurant_id=${id}`);
};

export const getSalleById = async (id: number) => {
    return apiClient.get<Salle>(`${BASE_PATH}/${id}/`);
};

export const createSalle = async (salle: Salle) => {
    return apiClient.post<Salle>(BASE_PATH, salle);
};

export const updateSalle = async (id: number, salle: Salle) => {
    return apiClient.put<Salle>(`${BASE_PATH}/${id}/`, salle);
};

export const deleteSalle = async (id: number) => {
    return apiClient.delete<Salle>(`${BASE_PATH}/${id}/`);
};

export const salleService = {
    getByRestaurantId: getSallesByIdRestaurant,
    getById: getSalleById,
    create: createSalle,
    update: updateSalle,
    delete: deleteSalle,
};