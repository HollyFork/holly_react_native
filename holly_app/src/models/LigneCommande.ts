import { Article } from './Article';

// Interface pour éviter la dépendance circulaire
interface CommandeBase {
  id: number;
}

export interface LigneCommande {
  id: number;
  commande: string; // URL de la commande
  article: Article;
  quantite: number;
  prix_unitaire: number;
  article_id: number;
} 