import { CategorieArticle } from './CategorieArticle';

interface Ingredient {
    id: number;
    ingredient: {
        id: number;
        nom: string;
        unite: string;
    };
    quantite_necessaire: number;
}

export interface Article {
    id: number;
    nom: string;
    description?: string;
    prix: number;
    categorie: CategorieArticle;
    categorie_id: number;
    ingredients?: Ingredient[];
    allergenes?: string[];
    image_url?: string;
    disponible: boolean;
    created_at?: string;
    updated_at?: string;
} 