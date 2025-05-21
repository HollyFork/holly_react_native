import { LigneCommande } from '@/models/LigneCommande';
import { ligneCommandeService } from '@/services/entities/ligneCommandeService';
import { useEffect, useState } from 'react';

export function useLignesCommande(commandeId: number | null) {
    const [lignesCommande, setLignesCommande] = useState<LigneCommande[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchLignesCommande = async () => {
        if (!commandeId) {
            setLignesCommande([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const { data } = await ligneCommandeService.getByIdCommande(commandeId);
            setLignesCommande(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLignesCommande();
    }, [commandeId]);

    return {
        lignesCommande,
        loading,
        error,
        refreshLignesCommande: fetchLignesCommande,
    };
}