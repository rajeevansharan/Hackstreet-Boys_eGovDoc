// hooks/useTimeSlots.js
import { useState, useEffect } from 'react';

export const useTimeSlots = (completionDate) => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [showSlots, setShowSlots] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (completionDate) {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setAvailableSlots([
          { id: 1, time: "9:00 AM - 10:00 AM", available: true },
          { id: 2, time: "10:30 AM - 11:30 AM", available: true },
          { id: 3, time: "2:00 PM - 3:00 PM", available: false },
          { id: 4, time: "3:30 PM - 4:30 PM", available: true },
        ]);
        setShowSlots(true);
        setLoading(false);
      }, 500);
    } else {
      setShowSlots(false);
      setAvailableSlots([]);
    }
  }, [completionDate]);

  return { availableSlots, showSlots, loading };
};