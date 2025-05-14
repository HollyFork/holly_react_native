import { useState, useEffect } from 'react';

import { Commande } from '@/src/models';
import { commandeService } from '@/src/services/entities/commandeService';

export function useCommandes(restaurantId: number | null) {
    const [commandes, setCommandes] = useState<Commande[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);    

    const fetchCommandes = async () => {
        if (!restaurantId) {
            setCommandes([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const { data } = await commandeService.getByRestaurantId(restaurantId);
            setCommandes(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCommandes();
    }, [restaurantId]);
    
    return {
        commandes,
        loading,
        error,
        refreshCommandes: fetchCommandes,
    };
}
