import { Ingredient } from './Ingredient';
import { ArticleIngredient } from './ArticleIngredient';

export interface Article {
  id: number;
  nom: string;
  prix: number;
  description: string;
  disponible: boolean;
  ingredients: ArticleIngredient[];
} 