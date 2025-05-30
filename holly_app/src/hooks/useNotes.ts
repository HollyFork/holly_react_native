import { Note } from '@/models';
import { notesService } from '@/services/entities/notesService';
import { useEffect, useState } from 'react';

export function useNotes(restaurantId: number | null) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchNotes = async () => {
        if (!restaurantId) {
            setNotes([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const { data } = await notesService.getByRestaurantId(restaurantId);
            setNotes(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const deleteNotes = async (noteId: number) => { 
        try {
            await notesService.delete(noteId);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Une erreur est survenue');
        }
    }

    useEffect(() => {
        fetchNotes();
    }, [restaurantId]);

    return {
        notes,
        loading,
        error,
        refreshNotes: fetchNotes,
        deleteNotes,
    };
}

