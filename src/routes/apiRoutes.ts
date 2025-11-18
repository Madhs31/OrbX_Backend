import { Router } from 'express';
import { 
    getContinents, createContinent, getContinentById, 
    getCountries, createCountry, getCountryById, 
    getCities, createCity, getCityById, 
    getDashboardStats,
    updateContinent, deleteContinent,
    updateCountry, deleteCountry,
    updateCity, deleteCity
} from '../controllers/geoController.js';

import { authenticateToken } from '../middleware/authMiddleware.js'; 
import { 
    getCountryInfo, 
    getWeather,
    getPexelsImage 
} from '../services/externalApiService.js';

const router = Router();

// Continentes
router.get('/continents', getContinents);
router.get('/continents/:id', getContinentById); 

// Países
router.get('/countries', getCountries);
router.get('/countries/:id', getCountryById); 

// Cidades
router.get('/cities', getCities);
router.get('/cities/:id', getCityById); 

// Status
router.get('/stats/dashboard', getDashboardStats); 

// Continentes
router.post('/continents', authenticateToken, createContinent); 
router.put('/continents/:id', authenticateToken, updateContinent); 
router.delete('/continents/:id', authenticateToken, deleteContinent); 

// Países
router.post('/countries', authenticateToken, createCountry);
router.put('/countries/:id', authenticateToken, updateCountry);
router.delete('/countries/:id', authenticateToken, deleteCountry);

// Cidades
router.post('/cities', authenticateToken, createCity);
router.put('/cities/:id', authenticateToken, updateCity);
router.delete('/cities/:id', authenticateToken, deleteCity);


// Rotas Externas
router.get('/external/country/:countryName', getCountryInfo); 
router.get('/external/weather', getWeather);
router.get('/external/image', getPexelsImage); 

export default router;