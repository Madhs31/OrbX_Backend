// src/services/externalApiService.ts
import axios from 'axios';
import type { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

// 1. Função para buscar dados do País (Rest Countries)
export const getCountryInfo = async (req: Request, res: Response) => {
    // O front-end envia o nome via path parameter: /api/external/country/Japan
    const { countryName } = req.params; 
    
    try {
        const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}`);
        // Retorna o primeiro resultado (o mais relevante)
        res.json(response.data[0]); 
    } catch (error: any) {
        if (axios.isAxiosError(error) && error.response?.status === 404) {
            return res.status(404).json({ error: 'País não encontrado.' });
        }
        res.status(500).json({ error: 'Erro ao buscar informações do país.' });
    }
};

// 2. Função para buscar o clima (OpenWeatherMap)
export const getWeather = async (req: Request, res: Response) => {
    // O front-end envia lat/lon via query parameters: /api/external/weather?lat=X&lon=Y
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude e Longitude são obrigatórias.' });
    }
    
    if (!OPENWEATHERMAP_API_KEY) {
         return res.status(500).json({ error: 'Chave da API OpenWeatherMap ausente.' });
    }

    try {
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHERMAP_API_KEY}&units=metric`
        );
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar dados do clima.' });
    }
};