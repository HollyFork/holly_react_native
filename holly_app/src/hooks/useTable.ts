import { useEffect, useRef, useState } from "react";

import { Commande } from "@/models/Commande";
import { Table } from "@/models/Table";
import { commandeService } from "@/services/entities/commandeService";
import { tableService } from "@/services/entities/tableService";

export function useTables(salleId: number | null) {
    const [tables, setTables] = useState<Table[]>([]);
    const [commandesByTable, setCommandesByTable] = useState<Map<number, Commande[]>>(new Map());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const lastSalleId = useRef<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchCommandesForTable = async (tableId: number) => {
        try {
            const { data } = await commandeService.getByTableId(tableId);
            return data;
        } catch (err) {
            console.error(`Erreur lors du chargement des commandes pour la table ${tableId}:`, err);
            return [];
        }
    };

    const fetchTables = async () => {
        if (!salleId) {
            setTables([]);
            setCommandesByTable(new Map());
            setLoading(false);
            return;
        }

        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const controller = new AbortController();
        abortControllerRef.current = controller;

        try {
            setLoading(true);
            setError(null);

            // Charger les tables
            const { data: tablesData } = await tableService.getTablesBySalleId(salleId);
            
            // Charger les commandes pour chaque table
            const commandesMap = new Map<number, Commande[]>();
            await Promise.all(
                tablesData.map(async (table) => {
                    const commandes = await fetchCommandesForTable(table.id);
                    commandesMap.set(table.id, commandes);
                    // Mettre à jour l'état is_occupied et current_commande_id
                    table.is_occupied = commandes.length > 0;
                    table.current_commande_id = commandes.length > 0 ? commandes[0].id : undefined;
                })
            );
            
            setTables(tablesData);
            setCommandesByTable(commandesMap);
            setError(null);
        } catch (err) {
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err instanceof Error ? err.message : 'Une erreur est survenue');
            }
        } finally {
            setLoading(false);
        }
    };

    const refreshCommandesForTable = async (tableId: number) => {
        const commandes = await fetchCommandesForTable(tableId);
        setCommandesByTable(prev => new Map(prev).set(tableId, commandes));
        return commandes;
    };

    useEffect(() => {
        if (salleId !== lastSalleId.current) {
            lastSalleId.current = salleId;
            fetchTables();
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [salleId]);

    return { 
        tables, 
        commandesByTable,
        loading, 
        error, 
        refreshTables: fetchTables,
        refreshCommandesForTable
    };
}