import { Article } from './Article';
import { Ingredient } from './Ingredient';

export interface ArticleIngredient {
  id: number;
  article: Article;
  ingredient: Ingredient;
  quantite_necessaire: number;
} 