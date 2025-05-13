import { Employe } from './Employe';
import { Restaurant } from './Restaurant';
import { Table } from './Table';

// Définition sans l'import circulaire
export interface Commande {
  id: number;
  nb_articles: number;
  montant: number;
  created_at: string; // format ISO datetime
  created_by: Employe;
  restaurant: Restaurant;
  statut: 'EN_COURS' | 'VALIDEE' | 'ANNULEE';
  table?: Table;
  lignes?: any[]; // Sera typé dans l'utilisation comme LigneCommande[]
} 