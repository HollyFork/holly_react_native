import { LigneCommande } from '@/models/LigneCommande';
import apiClient from '../utils/api';

const BASE_PATH = '/lignes-commandes';

export const getLigneCommandesByIdCommande = async (id: number) => {
    return apiClient.get<LigneCommande[]>(`${BASE_PATH}/?commande_id=${id}`);
};

export const ligneCommandeService = {
    getByIdCommande: getLigneCommandesByIdCommande,
};