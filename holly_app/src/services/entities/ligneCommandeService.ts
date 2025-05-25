import { LigneCommande } from '@/models/LigneCommande';
import apiClient from '../utils/api';

const BASE_PATH = '/lignes-commandes';

export const getLigneCommandesByIdCommande = async (id: number) => {
    return apiClient.get<LigneCommande[]>(`${BASE_PATH}/?commande_id=${id}`);
};

export const addLigneCommande = async (ligneCommande: LigneCommande) => {
    return apiClient.post<LigneCommande>(`${BASE_PATH}/`, ligneCommande);
};

export const updateLigneCommande = async (id: number, ligneCommande: LigneCommande) => {
    return apiClient.put<LigneCommande>(`${BASE_PATH}/${id}/`, ligneCommande);
};

export const deleteLigneCommande = async (id: number) => {
    return apiClient.delete<LigneCommande>(`${BASE_PATH}/${id}/`);
};

export const ligneCommandeService = {
    getByIdCommande: getLigneCommandesByIdCommande,
    addLigneCommande,
    updateLigneCommande,
    deleteLigneCommande,
};