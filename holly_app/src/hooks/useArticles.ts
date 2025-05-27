import { Article } from '@/models/Article';
import { articleService } from '@/services/entities/articleService';
import { useEffect, useState } from 'react';

export function useArticles(restaurantId: number | null) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    if (!restaurantId) {
      setArticles([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await articleService.getByRestaurantId(restaurantId);
      const articlesWithNumericPrices = response.data.map(article => ({
        ...article,
        prix: typeof article.prix === 'string' ? parseFloat(article.prix) : Number(article.prix)
      }));
      setArticles(articlesWithNumericPrices);
    } catch (err) {
      console.error('Erreur lors du chargement des articles:', err);
      setError('Impossible de charger les articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('useArticles: restaurantId changé, nouveau ID:', restaurantId);
    fetchArticles();
  }, [restaurantId]);

  return {
    articles,
    loading,
    error,
    refresh: fetchArticles
  };
} 