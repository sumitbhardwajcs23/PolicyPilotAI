import { useState, useEffect, useCallback, useRef } from 'react';
import type { WeatherData, ForecastDay } from '@/types';
import axios from 'axios';

interface UseWeatherReturn {
  weather: WeatherData | null;
  forecast: ForecastDay[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  lastUpdated: Date | null;
  mapCoords?: { lat: number; lng: number } | null;
}

// Simulated weather API call
// Weather API call to our backend
const fetchWeatherData = async (lat: number, lng: number): Promise<{ weather: WeatherData; forecast: ForecastDay[] }> => {
  const response = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/weather`, {
    params: { lat, lng }
  });
  
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch weather');
  }

  // Since Open-Meteo doesn't provide a 5-day forecast in the same format as our mock easily without more params,
  // we'll keep a simplified forecast or adapt it. For now, let's just use the weather data.
  // In a real app, we'd fetch forecast separately or use a more comprehensive API.
  
  return { 
    weather: response.data.data, 
    forecast: [] // We'll handle forecast update separately if needed, or just keep it empty for now to focus on AQI
  };
};

export function useWeather(pollingInterval = 300000): UseWeatherReturn {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [mapCoords, setMapCoords] = useState<{ lat: number; lng: number } | null>(null);

  const coordsRef = useRef<{ lat: number; lng: number } | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!coordsRef.current) {
        // First try reading from cached login location
        const cached = localStorage.getItem('cachedLocation');
        if (cached) {
          try {
            coordsRef.current = JSON.parse(cached);
          } catch {}
        }
        
        // If not found in cache, fallback to fetching it here
        if (!coordsRef.current) {
          try {
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000, maximumAge: 60000 });
            });
            coordsRef.current = { lat: pos.coords.latitude, lng: pos.coords.longitude };
            localStorage.setItem('cachedLocation', JSON.stringify(coordsRef.current));
          } catch (e) {
            console.warn('Geolocation failed or denied, using default coordinates', e);
            coordsRef.current = { lat: 52.52, lng: 13.41 }; // Default to Berlin
          }
        }
      }

      setMapCoords({ lat: coordsRef.current.lat, lng: coordsRef.current.lng });
      
      const data = await fetchWeatherData(coordsRef.current.lat, coordsRef.current.lng);
      setWeather(data.weather);
      setForecast(data.forecast);
      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch weather data');
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
    
    // Set up polling
    const interval = setInterval(refresh, pollingInterval);
    
    return () => clearInterval(interval);
  }, [refresh, pollingInterval]);

  return { weather, forecast, loading, error, refresh, lastUpdated, mapCoords };
}
