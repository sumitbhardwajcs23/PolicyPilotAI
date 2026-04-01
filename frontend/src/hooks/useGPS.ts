import { useState, useEffect, useCallback, useRef } from 'react';
import type { Worker, GeoZone } from '@/types';
import { mockWorkers, mockGeoZones } from '@/services/mockData';
import { adminApi } from '@/services/api';

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
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [zones] = useState<GeoZone[]>(mockGeoZones);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const watchIdRef = useRef<number | null>(null);
  
  const loadRealWorkers = useCallback(async () => {
    setLoading(true);
    try {
      const resp = await adminApi.getUsers({ role: 'worker', limit: 1000 }) as any;
      const apiUsers = resp?.data?.data || [];
      
      const realWorkers: Worker[] = apiUsers.map((u: any) => {
        let baseLat = 19.0760;
        let baseLng = 72.8777;
        
        const zoneStr = (u.zone || '').toLowerCase();
        if (zoneStr.includes('bandra')) {
          baseLat = 19.0450; baseLng = 72.8250;
        } else if (zoneStr.includes('east')) {
          baseLat = 19.0800; baseLng = 72.9050; // Andheri East approx
        } else if (zoneStr.includes('west')) {
          baseLat = 19.0800; baseLng = 72.8750; // Andheri West approx
        } else if (zoneStr.includes('khar')) {
          baseLat = 19.0667; baseLng = 72.8400; // Khar approx
        } else if (zoneStr.includes('juhu')) {
          baseLat = 19.1075; baseLng = 72.8263; // Juhu approx
        }
        
        let lat = baseLat;
        let lng = baseLng;

        if (u.lastLocation?.lat && u.lastLocation?.lng) {
          lat = u.lastLocation.lat;
          lng = u.lastLocation.lng;
        } else {
          // Jitter to spread them out around the zone center if no real location exists
          lat += (Math.random() - 0.5) * 0.03;
          lng += (Math.random() - 0.5) * 0.03;
        }

        let status = 'inactive';
        if (u.isActive) {
           status = Math.random() > 0.9 ? 'alert' : 'active';
        }

        return {
          id: u._id,
          name: u.name,
          phone: u.mobile || '+91 0000000000',
          location: { lat, lng },
          status: status as 'active' | 'inactive' | 'alert',
          zone: u.zone || 'Unknown',
          lastUpdate: new Date(u.updatedAt || u.createdAt || Date.now())
        };
      });

      if (realWorkers.length > 0) {
        setWorkers(realWorkers);
      } else {
        setWorkers(mockWorkers);
      }
    } catch (err) {
      console.error('Failed to fetch real workers:', err);
      // Fallback
      setWorkers(mockWorkers);
    } finally {
      setLoading(false);
    }
  }, []);

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
  }, []);

  const selectWorker = useCallback((worker: Worker | null) => {
    setSelectedWorker(worker);
  }, []);

  // Fetch real workers on mount
  useEffect(() => {
    loadRealWorkers();
  }, [loadRealWorkers]);

  // Auto-refresh worker locations (simulation) every 30 seconds
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
    refreshLocations: loadRealWorkers, // manual refresh button triggers real fetch
    isTracking,
    startTracking,
    stopTracking,
  };
}
