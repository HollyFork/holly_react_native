import { Employe } from './Employe';
import { Restaurant } from './Restaurant';

export interface Note {
  id: number;
  created_by: Employe;
  restaurant: Restaurant;
  created_at: string; // format ISO datetime
  message: string;
} 