import { useState, useEffect } from 'react';
import { Reservation } from '@/src/models';
import { reservationService } from '@/src/services';

export function useReservations(restaurantId: number | null) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReservations = async () => {
    if (!restaurantId) {
      setReservations([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { data } = await reservationService.getByRestaurantId(restaurantId);
      setReservations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
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
    refreshReservations: fetchReservations,
    getReservationsForToday,
    getUpcomingReservations,
    getFutureReservations,
  };
} 