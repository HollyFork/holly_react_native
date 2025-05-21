import { Stock } from '@/models/Stock';
import { stockService } from '@/services/entities/stockService';
import { useEffect, useState } from 'react';

export function useStocks(restaurantId: number | null) {
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStocks = async () => {
        if (!restaurantId) {
            setStocks([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const { data } = await stockService.getByRestaurantId(restaurantId);
            setStocks(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStocks();
    }, [restaurantId]);

    const getStocksCritiques = () => {
        return stocks.filter(stock => stock.quantite_en_stock < stock.seuil_alerte);
    };

    return {
        stocks,
        loading,
        error,
        refreshStocks: fetchStocks,
        getStocksCritiques,
    };
}