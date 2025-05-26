import { Article } from '@/models/Article';
import { articleService } from '@/services/entities/articleService';

import { useEffect, useState } from 'react';

export const useArticles = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await articleService.getAll();
      if (response.data && Array.isArray(response.data)) {
        setArticles(response.data);
      } else {
        setError('Format de données invalide');
      }
    } catch (err) {
      console.error('Erreur lors du chargement des articles:', err);
      setError('Impossible de charger les articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  return {
    articles,
    loading,
    error,
    refetch: fetchArticles,
  };
}; 