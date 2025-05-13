import { Restaurant } from './Restaurant';
import { Ingredient } from './Ingredient';

export interface Stock {
  id: number;
  restaurant: Restaurant;
  ingredient: Ingredient;
  quantite_en_stock: number;
  seuil_alerte: number;
} 