import { Article } from './Article';

// Interface pour éviter la dépendance circulaire
interface CommandeBase {
  id: number;
}

export interface LigneCommande {
  id?: number;
  commande_id: number;
  article_id: number;
  quantite: number;
  prix_unitaire: number;
  article?: Article;
  created_at?: string;
  updated_at?: string;
} 