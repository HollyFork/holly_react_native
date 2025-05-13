import { Salle } from './Salle';

export interface Reservation {
  id: number;
  nom_client: string;
  nombre_personnes: number;
  date_heure: string; // format ISO datetime
  telephone: string;
  salle: Salle;
} 