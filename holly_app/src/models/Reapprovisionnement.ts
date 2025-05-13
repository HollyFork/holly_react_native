import { Restaurant } from './Restaurant';
import { Ingredient } from './Ingredient';

export interface Reapprovisionnement {
  id: number;
  restaurant: Restaurant;
  ingredient: Ingredient;
  quantite_ajoutee: number;
  date_ajout: string; // format ISO datetime
  prix_achat?: number;
} 