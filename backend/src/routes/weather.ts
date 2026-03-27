import { Router } from 'express';
import { getWeatherData, getAirQuality } from '../services/weatherService';
import { authenticate } from '../middleware/auth';

const router = Router();

// GET /api/weather
router.get('/', async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 19.0760; // Default to Mumbai
    const lng = parseFloat(req.query.lng as string) || 72.8777;

    const weatherData = await getWeatherData(lat, lng);
    res.json({ success: true, data: weatherData });
  } catch (error) {
    next(error);
  }
});

// GET /api/weather/air-quality
router.get('/air-quality', async (req, res, next) => {
  try {
    const lat = parseFloat(req.query.lat as string) || 19.0760;
    const lng = parseFloat(req.query.lng as string) || 72.8777;

    const aqData = await getAirQuality(lat, lng);
    res.json({ success: true, data: aqData });
  } catch (error) {
    next(error);
  }
});

export { router as weatherRouter };
