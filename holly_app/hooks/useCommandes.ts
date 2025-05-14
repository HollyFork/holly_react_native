import { useState, useEffect, useRef } from 'react';

import { Commande } from '@/src/models';
import { commandeService } from '@/src/services/entities/commandeService';

// Cache pour stocker les commandes par restaurant
const commandesCache = new Map<number, {
    data: Commande[];
    timestamp: number;
}>();

const CACHE_DURATION = 30000; // 30 secondes

export function useCommandes(restaurantId: number | null) {
    const [commandes, setCommandes] = useState<Commande[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);    
    const lastRestaurantId = useRef<number | null>(null);

    const fetchCommandes = async (forceRefresh = false) => {
        if (!restaurantId) {
            setCommandes([]);
            setLoading(false);
            return;
        }

        // Vérifier si nous avons des données en cache valides
        const cachedData = commandesCache.get(restaurantId);
        const now = Date.now();
        
        if (!forceRefresh && cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
            setCommandes(cachedData.data);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const { data } = await commandeService.getByRestaurantId(restaurantId);
            setCommandes(data);
            // Mettre à jour le cache
            commandesCache.set(restaurantId, {
                data,
                timestamp: now
            });
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Ne faire la requête que si le restaurant a changé
        if (restaurantId !== lastRestaurantId.current) {
            lastRestaurantId.current = restaurantId;
            fetchCommandes();
        }
    }, [restaurantId]);
    
    return {
        commandes,
        loading,
        error,
        refreshCommandes: () => fetchCommandes(true),
    };
}
