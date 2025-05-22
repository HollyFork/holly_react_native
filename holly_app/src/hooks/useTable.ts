import { useEffect, useRef, useState } from "react";

import { Table } from "@/models/Table";
import { tableService } from "@/services/entities/tableService";

const tablesCache = new Map<number, {
    data: Table[];
    timestamp: number;
}>();

const CACHE_DURATION = 100; // 30 secondes
const FETCH_TIMEOUT = 15000; // 15 secondes timeout

export function useTables(salleId: number | null) {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const lastSalleId = useRef<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchTables = async (forceRefresh = false) => {
        if (!salleId) {
            setTables([]);
            setLoading(false);
            return;
        }

        // Vérifier si nous avons des données en cache valides
        const cachedData = tablesCache.get(salleId);
        const now = Date.now();

        if (!forceRefresh && cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
            setTables(cachedData.data);
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
            const response = await tableService.getTablesBySalleId(salleId);
            const data = response.data;
            
            // Mettre à jour le cache
            tablesCache.set(salleId, {
                data,
                timestamp: now,
            });
            
            setTables(data);
            setLoading(false);
            setError(null); 
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (salleId !== lastSalleId.current) {
            lastSalleId.current = salleId;
            fetchTables(true);
        }
    }, [salleId, fetchTables]);

    return { tables, loading, error, refreshTables: fetchTables };
}