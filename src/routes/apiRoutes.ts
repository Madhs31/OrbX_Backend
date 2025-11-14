// src/routes/apiRoutes.ts
import { Router } from 'express';
import { 
    getContinents, createContinent, 
    getCountries, createCountry, 
    getCities, createCity
} from '../controllers/geoController.js';
import { getCountryInfo, getWeather } from '../services/externalApiService.js';
// import { authenticateToken, checkAdmin } from '../middleware/authMiddleware'; // Importar após criar

const router = Router();

// Continentes
router.get('/continents', getContinents);
router.post('/continents', createContinent); // Proteger com checkAdmin
// router.put('/continents/:id', authenticateToken, checkAdmin, updateContinent);
// router.delete('/continents/:id', authenticateToken, checkAdmin, deleteContinent);

// Países
router.get('/countries', getCountries);
router.post('/countries', createCountry); // Proteger com checkAdmin

// Cidades
router.get('/cities', getCities);
router.post('/cities', createCity); // Proteger com checkAdmin

router.get('/external/country/:countryName', getCountryInfo); 
router.get('/external/weather', getWeather);

export default router;