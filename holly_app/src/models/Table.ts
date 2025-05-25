import { Employe } from './Employe';
import { Salle } from './Salle';

export interface Table {
  id: number;
  numero: number;
  capacity: number;
  reserved_seats: number;
  salle: Salle;
  employee_in_charge: Employe;
  is_occupied: boolean;
  current_commande_id?: number;
  position_x: number;
  position_y: number;
} 