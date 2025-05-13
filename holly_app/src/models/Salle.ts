import { Restaurant } from './Restaurant';

export interface Salle {
  id: number;
  nom_salle: string;
  restaurant: Restaurant;
  capacite: number;
  etage: number;
  description?: string;
} 