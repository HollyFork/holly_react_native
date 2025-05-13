import { Article } from './Article';

// Interface pour éviter la dépendance circulaire
interface CommandeBase {
  id: number;
}

export interface LigneCommande {
  id: number;
  commande: CommandeBase;
  article: Article;
  quantite: number;
  prix_unitaire: number;
} 