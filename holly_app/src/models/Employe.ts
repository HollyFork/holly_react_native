import { User } from './User';
import { TypeEmploye } from './TypeEmploye';

export interface Employe {
  id: number;
  user?: User;
  nom: string;
  prenom: string;
  type_employe: TypeEmploye;
  salaire: number;
  date_embauche: string; // format ISO date
  numero_telephone?: string;
} 