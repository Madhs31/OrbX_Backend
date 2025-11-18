import axios from 'axios';
import type { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;

// Chave e URL do Pexels
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_API_URL = "https://api.pexels.com/v1/search";

// Instância do Axios para o Pexels
const pexelsApi = axios.create({
    baseURL: PEXELS_API_URL
});


// 1. Função para buscar dados do País (Rest Countries)
export const getCountryInfo = async (req: Request, res: Response) => {
    const { countryName } = req.params; 
    
    try {
        const response = await axios.get(`https://restcountries.com/v3.1/name/${countryName}`);
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

export const getPexelsImage = async (req: Request, res: Response) => {
    const { q } = req.query;

    if (!q) {
        return res.status(400).json({ error: 'Um termo de busca (q) é obrigatório.' });
    }

    if (!PEXELS_API_KEY) {
        return res.status(500).json({ error: 'Chave da API Pexels ausente.' });
    }

    try {
        const response = await pexelsApi.get('', {
            params: {
                query: q as string,
                per_page: 1, 
                locale: 'pt-BR' 
            },

            headers: {
                Authorization: PEXELS_API_KEY
            }
        });
        
        if (response.data.photos && response.data.photos.length > 0) {
            res.json(response.data.photos[0]);
        } else {
            res.status(404).json({ error: 'Nenhuma imagem encontrada para o termo.' });
        }
        
    } catch (error: any) {
        console.error("Erro ao buscar imagem no Pexels:", error.message);
        res.status(500).json({ error: 'Erro ao buscar imagem no Pexels.' });
    }
};