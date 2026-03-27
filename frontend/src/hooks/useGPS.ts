import { useState, useEffect, useCallback, useRef } from 'react';
import type { Worker, GeoZone } from '@/types';
import { mockWorkers, mockGeoZones } from '@/services/mockData';

interface UseGPSReturn {
  workers: Worker[];
  zones: GeoZone[];
  selectedWorker: Worker | null;
  userLocation: { lat: number; lng: number } | null;
  loading: boolean;
  error: string | null;
  selectWorker: (worker: Worker | null) => void;
  refreshLocations: () => void;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
}

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Check if a point is inside a polygon (geofencing)
export function isPointInPolygon(
  point: { lat: number; lng: number },
  polygon: { lat: number; lng: number }[]
): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].lat;
    const yi = polygon[i].lng;
    const xj = polygon[j].lat;
    const yj = polygon[j].lng;
    
    const intersect =
      yi > point.lng !== yj > point.lng &&
      point.lat < ((xj - xi) * (point.lng - yi)) / (yj - yi) + xi;
    
    if (intersect) inside = !inside;
  }
  return inside;
}

export function useGPS(): UseGPSReturn {
  const [workers, setWorkers] = useState<Worker[]>(mockWorkers);
  const [zones] = useState<GeoZone[]>(mockGeoZones);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  // Get user's current location
  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setError(`Location error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Start live tracking
  const startTracking = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsTracking(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (err) => {
        setError(`Tracking error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  }, []);

  // Stop live tracking
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Simulate worker location updates
  const refreshLocations = useCallback(() => {
    setLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      setWorkers(prevWorkers =>
        prevWorkers.map(worker => ({
          ...worker,
          location: {
            lat: worker.location.lat + (Math.random() - 0.5) * 0.001,
            lng: worker.location.lng + (Math.random() - 0.5) * 0.001,
          },
          lastUpdate: new Date(),
        }))
      );
      setLoading(false);
    }, 500);
  }, []);

  const selectWorker = useCallback((worker: Worker | null) => {
    setSelectedWorker(worker);
  }, []);

  // Auto-refresh worker locations every 30 seconds
  useEffect(() => {
    const interval = setInterval(refreshLocations, 30000);
    return () => clearInterval(interval);
  }, [refreshLocations]);

  // Get initial user location
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  // Cleanup tracking on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    workers,
    zones,
    selectedWorker,
    userLocation,
    loading,
    error,
    selectWorker,
    refreshLocations,
    isTracking,
    startTracking,
    stopTracking,
  };
}
