import { Router } from 'express';
import { 
    getContinents, createContinent, getContinentById, 
    getCountries, createCountry, getCountryById, 
    getCities, createCity, getCityById, 
    getDashboardStats 
} from '../controllers/geoController.js';
import { 
    getCountryInfo, 
    getWeather,
    getPexelsImage 
} from '../services/externalApiService.js';

const router = Router();

// Continentes
router.get('/continents', getContinents);
router.get('/continents/:id', getContinentById); 
router.post('/continents', createContinent); 

// Países
router.get('/countries', getCountries);
router.get('/countries/:id', getCountryById); 
router.post('/countries', createCountry); 

// Cidades
router.get('/cities', getCities);
router.get('/cities/:id', getCityById); 
router.post('/cities', createCity); 

// Stats
router.get('/stats/dashboard', getDashboardStats); 

// Rotas Externas
router.get('/external/country/:countryName', getCountryInfo); 
router.get('/external/weather', getWeather);
router.get('/external/image', getPexelsImage); // <-- ADICIONADO

export default router;