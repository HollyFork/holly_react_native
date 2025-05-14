import { useState, useEffect, useRef } from 'react';
import { Reservation } from '@/src/models';
import { reservationService } from '@/src/services';

// Cache pour stocker les réservations par restaurant
const reservationsCache = new Map<number, {
    data: Reservation[];
    timestamp: number;
}>();

const CACHE_DURATION = 30000; // 30 secondes

export function useReservations(restaurantId: number | null) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastRestaurantId = useRef<number | null>(null);

  const fetchReservations = async (forceRefresh = false) => {
    if (!restaurantId) {
      setReservations([]);
      setLoading(false);
      return;
    }

    // Vérifier si nous avons des données en cache valides
    const cachedData = reservationsCache.get(restaurantId);
    const now = Date.now();
    
    if (!forceRefresh && cachedData && (now - cachedData.timestamp) < CACHE_DURATION) {
      setReservations(cachedData.data);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data } = await reservationService.getByRestaurantId(restaurantId);
      setReservations(data);
      // Mettre à jour le cache
      reservationsCache.set(restaurantId, {
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
      fetchReservations();
    }
  }, [restaurantId]);

  const getReservationsForToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.date_heure);
      return reservationDate >= today && reservationDate < tomorrow;
    });
  };

  const getUpcomingReservations = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.date_heure);
      return reservationDate >= tomorrow;
    });
  };

  const getFutureReservations = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return reservations.filter(reservation => {
      const reservationDate = new Date(reservation.date_heure);
      return reservationDate >= today;
    });
  };

  return {
    reservations,
    loading,
    error,
    refreshReservations: () => fetchReservations(true),
    getReservationsForToday,
    getUpcomingReservations,
    getFutureReservations,
  };
} 