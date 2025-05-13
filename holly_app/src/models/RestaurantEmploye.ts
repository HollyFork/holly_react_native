import { Restaurant } from './Restaurant';
import { Employe } from './Employe';

export interface RestaurantEmploye {
  id: number;
  id_restaurant: Restaurant;
  id_employe: Employe;
} 