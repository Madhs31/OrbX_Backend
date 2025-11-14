// src/controllers/geoController.ts
import type { Request, Response, NextFunction } from 'express';
import prisma from '../prisma.js';

// --- Continents ---

export const getContinents = async (req: Request, res: Response) => {
    try {
        const continents = await prisma.continent.findMany({
             orderBy: { name: 'asc' }
        });
        res.json(continents);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar continentes.' });
    }
};

export const createContinent = async (req: Request, res: Response) => {
    const { name, area, population } = req.body;
    try {
        const continent = await prisma.continent.create({
            data: { name, area: parseFloat(area), population: BigInt(population) },
        });
        res.status(201).json(continent);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao criar continente.' });
    }
};

// ... Implementar updateContinent e deleteContinent

// --- Countries ---

export const getCountries = async (req: Request, res: Response) => {
    const { continent } = req.query; // Filtro do seu Front-end: /countries?continent=ID
    
    try {
        const where = continent ? { continentId: parseInt(continent as string) } : {};
        const countries = await prisma.country.findMany({
            where,
            include: { continent: true }, // Inclui dados do continente
            orderBy: { name: 'asc' }
        });
        res.json(countries);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar países.' });
    }
};

export const createCountry = async (req: Request, res: Response) => {
    const { name, capital, isoCode, population, flagUrl, continentId } = req.body;
    try {
        const country = await prisma.country.create({
            data: { 
                name, 
                capital, 
                isoCode, 
                population: BigInt(population), 
                flagUrl, 
                continentId: parseInt(continentId) 
            },
        });
        res.status(201).json(country);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao criar país.' });
    }
};

// ... Implementar updateCountry e deleteCountry

// --- Cities ---

export const getCities = async (req: Request, res: Response) => {
    // Filtros do seu Front-end: /cities?country=ID ou /cities?continent=ID
    const { country, continent } = req.query; 

    try {
        let where: any = {};
        
        if (country) {
            where = { countryId: parseInt(country as string) };
        } else if (continent) {
            where = { country: { continentId: parseInt(continent as string) } };
        }

        const cities = await prisma.city.findMany({
            where,
            include: { country: { include: { continent: true } } }, // Inclui País e Continente
            orderBy: { name: 'asc' }
        });
        res.json(cities);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar cidades.' });
    }
};

export const createCity = async (req: Request, res: Response) => {
    const { name, latitude, longitude, population, countryId } = req.body;
    try {
        const city = await prisma.city.create({
            data: { 
                name, 
                latitude: parseFloat(latitude), 
                longitude: parseFloat(longitude), 
                population: BigInt(population), 
                countryId: parseInt(countryId) 
            },
        });
        res.status(201).json(city);
    } catch (error) {
        res.status(400).json({ error: 'Erro ao criar cidade.' });
    }
};

// ... Implementar updateCity e deleteCity