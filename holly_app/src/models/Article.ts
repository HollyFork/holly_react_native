
export interface Article {
  id: number;
  nom: string;
  description?: string;
  prix: number;
  categorie_id: number;
  ingredients?: string[];
  allergenes?: string[];
  image_url?: string;
  disponible: boolean;
  created_at?: string;
  updated_at?: string;
} 