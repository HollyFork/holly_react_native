import { useState, useEffect, useRef } from 'react';

import { Commande } from '@/src/models';
import { commandeService } from '@/src/services/entities/commandeService';

// Cache pour stocker les commandes par restaurant
const commandesCache = new Map<number, {
    data: Commande[];
    timestamp: number;
}>();

const CACHE_DURATION = 30000; // 30 secondes
const FETCH_TIMEOUT = 15000; // 15 secondes timeout

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

        // Vérifier si nous avons des données en cache valides
        const cachedData = commandesCache.get(restaurantId);
        const now = Date.now();
        
        if (!forceRefresh && cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
            setCommandes(cachedData.data);
            setLoading(false);
            return;
        }

        // Annuler la requête précédente si elle existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Créer un nouveau AbortController pour cette requête
        abortControllerRef.current = new AbortController();
        
        // Créer un timeout pour éviter les blocages
        const timeoutId = setTimeout(() => {
            if (abortControllerRef.current) {
                console.log('Timeout atteint pour le chargement des commandes');
                abortControllerRef.current.abort();
                setError('Délai d\'attente dépassé pour le chargement des commandes');
                setLoading(false);
            }
        }, FETCH_TIMEOUT);

        try {
            setLoading(true);
            setError(null);
            console.log(`Chargement des commandes pour le restaurant ${restaurantId}...`);
            const { data } = await commandeService.getByRestaurantId(restaurantId);
            
            console.log(`${data.length} commandes chargées pour le restaurant ${restaurantId}`);
            setCommandes(data);
            
            // Mettre à jour le cache
            commandesCache.set(restaurantId, {
                data,
                timestamp: now
            });
            setError(null);
        } catch (err) {
            console.error('Erreur lors du chargement des commandes:', err);
            // Utiliser les données du cache si disponibles en cas d'erreur
            if (cachedData) {
                console.log('Utilisation des données en cache suite à une erreur');
                setCommandes(cachedData.data);
            }
            
            if (err instanceof Error && err.name === 'AbortError') {
                setError('Requête interrompue');
            } else {
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            }
        } finally {
            clearTimeout(timeoutId);
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
