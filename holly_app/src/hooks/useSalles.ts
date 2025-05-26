import { useEffect, useRef, useState } from "react";

import { Salle } from "@/models/Salle";
import { salleService } from "@/services/entities/salleService";

export function useSalles(restaurantId: number | null) {
    const [salles, setSalles] = useState<Salle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const lastRestaurantId = useRef<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchSalles = async (forceRefresh = false) => {
        if (!restaurantId) {
            setSalles([]);
            setLoading(false);
            return;
        }

        // Annuler la requête précédente si elle existe
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        // Créer un nouveau AbortController pour cette requête
        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            const response = await salleService.getByRestaurantId(restaurantId);
            const data = response.data;
            setSalles(data);
            setLoading(false);
            setError(null);
        } catch (err: any) {
            if (err.name !== 'AbortError') {    
                setError(err.message);
                setLoading(false);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (restaurantId !== lastRestaurantId.current) {
            lastRestaurantId.current = restaurantId;
            fetchSalles(true);
        }

        // Nettoyer lors du démontage du composant
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [restaurantId, fetchSalles]);

    return { 
        salles, 
        loading, 
        error, 
        refreshSalles: () => fetchSalles(true) 
    };  
}