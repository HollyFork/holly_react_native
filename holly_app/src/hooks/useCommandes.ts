import { useEffect, useRef, useState } from 'react';

import { Commande } from '@/models/Commande';
import { commandeService } from '@/services/entities/commandeService';

export function useCommandes(restaurantId: number | null) {
    const [commandes, setCommandes] = useState<Commande[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);    
    const lastRestaurantId = useRef<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchCommandes = async (forceRefresh = false) => {
        if (!restaurantId) {
            setCommandes([]);
            setLoading(false);
            return;
        }

        // Annuler la requête précédente si elle existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Créer un nouveau AbortController pour cette requête
        abortControllerRef.current = new AbortController();

        try {
            setLoading(true);
            setError(null);
            console.log(`Chargement des commandes pour le restaurant ${restaurantId}...`);
            const { data } = await commandeService.getByRestaurantId(restaurantId);
            
            console.log(`${data.length} commandes chargées pour le restaurant ${restaurantId}`);
            setCommandes(data);
            setError(null);
        } catch (err) {
            console.error('Erreur lors du chargement des commandes:', err);
            
            if (err instanceof Error && err.name === 'AbortError') {
                setError('Requête interrompue');
            } else {
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            }
        } finally {
            setLoading(false);
            abortControllerRef.current = null;
        }
    };

    useEffect(() => {
        // Ne faire la requête que si le restaurant a changé
        if (restaurantId !== lastRestaurantId.current) {
            lastRestaurantId.current = restaurantId;
            fetchCommandes();
        }
        
        // Nettoyer lors du démontage du composant
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [restaurantId]);

    return {
        commandes,
        loading,
        error,
        refreshCommandes: () => fetchCommandes(true),
    };
}
