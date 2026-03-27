import axios from 'axios';
import { AirQualityData, WeatherData } from '@shared/types';

const OPEN_METEO_AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const OPEN_METEO_WEATHER_URL = 'https://api.open-meteo.com/v1/forecast';
const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';

export const getAirQuality = async (lat: number, lng: number): Promise<AirQualityData> => {
  try {
    const response = await axios.get(OPEN_METEO_AIR_QUALITY_URL, {
      params: {
        latitude: lat,
        longitude: lng,
        current: 'european_aqi,pm2_5,pm10,ozone,nitrogen_dioxide,sulphur_dioxide,carbon_monoxide,uv_index,ammonia,dust',
        timezone: 'auto'
      }
    });

    const { current } = response.data;

    return {
      aqi: current.european_aqi,
      pm2_5: current.pm2_5,
      pm10: current.pm10,
      ozone: current.ozone,
      no2: current.nitrogen_dioxide,
      so2: current.sulphur_dioxide,
      co: current.carbon_monoxide,
      uvIndex: current.uv_index,
      ammonia: current.ammonia,
      dust: current.dust
    };
  } catch (error) {
    console.error('Error fetching air quality data:', error);
    throw new Error('Failed to fetch air quality data');
  }
};

export const getReverseGeocoding = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await axios.get(NOMINATIM_REVERSE_URL, {
      params: {
        lat,
        lon: lng,
        format: 'json',
        addressdetails: 1
      },
      headers: {
        'User-Agent': 'GigShield-Platform/1.0'
      }
    });

    const { address } = response.data;
    if (address) {
      const city = address.city || address.town || address.village || address.suburb || '';
      const state = address.state || '';
      if (city && state) return `${city}, ${state}`;
      if (city) return city;
      if (state) return state;
    }
    return 'Unknown Location';
  } catch (error) {
    console.warn('Reverse geocoding failed:', error);
    return 'Current Location';
  }
};

export const getWeatherData = async (lat: number, lng: number): Promise<WeatherData> => {
  try {
    const [weatherRes, aqRes, locationName] = await Promise.all([
      axios.get(OPEN_METEO_WEATHER_URL, {
        params: {
          latitude: lat,
          longitude: lng,
          current: 'temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m',
          timezone: 'auto'
        }
      }),
      getAirQuality(lat, lng),
      getReverseGeocoding(lat, lng)
    ]);

    const { current } = weatherRes.data;

    // Map WMO Weather interpretation codes to conditions
    const interpretWeatherCode = (code: number): string => {
      if (code === 0) return 'Clear sky';
      if (code <= 3) return 'Partly cloudy';
      if (code <= 48) return 'Fog';
      if (code <= 55) return 'Drizzle';
      if (code <= 65) return 'Rain';
      if (code <= 77) return 'Snow';
      if (code <= 82) return 'Rain showers';
      if (code <= 86) return 'Snow showers';
      if (code <= 99) return 'Thunderstorm';
      return 'Unknown';
    };

    return {
      location: locationName,
      temperature: Math.round(current.temperature_2m),
      condition: interpretWeatherCode(current.weather_code),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      rainfall: current.precipitation,
      icon: current.weather_code <= 3 ? 'sun' : 'cloud-rain', // Simplified
      airQuality: aqRes,
      alerts: []
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw new Error('Failed to fetch weather data');
  }
};
