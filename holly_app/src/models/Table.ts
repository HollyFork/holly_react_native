import { Salle } from './Salle';
import { Employe } from './Employe';

export interface Table {
  id: number;
  numero: number;
  capacity: number;
  reserved_seats: number;
  salle: Salle;
  employee_in_charge: Employe;
  is_occupied: boolean;
  position_x: number;
  position_y: number;
} 