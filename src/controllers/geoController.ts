import type { Request, Response, NextFunction } from 'express';
import prisma from '../prisma.js';

function convertBigInts(data: any): any { 
  if (data === null || typeof data !== 'object') {
    return data;
  }
  if (data instanceof Date) {
    return data;
  }
  if (Array.isArray(data)) {
    return data.map(convertBigInts);
  }
  const obj: { [key: string]: any } = {};
  for (const key in data) {
    if (typeof data[key] === 'bigint') {
      obj[key] = data[key].toString(); 
    } else {
      obj[key] = convertBigInts(data[key]); 
    }
  }
  return obj;
}

// --- Continents ---

export const getContinents = async (req: Request, res: Response) => {
    try {
        const continents = await prisma.continent.findMany({
             orderBy: { name: 'asc' }
        });
        res.json(convertBigInts(continents));
    } catch (error) {
        console.error("Erro ao buscar continentes:", error); 
        res.status(500).json({ error: 'Erro ao buscar continentes.' });
    }
};

export const createContinent = async (req: Request, res: Response) => {
    const { name: rawName, area, population, imageUrl } = req.body; 
    const name = rawName || ''; 
    
    if (!name) return res.status(400).json({ error: 'O nome é obrigatório.' });

    try {
        const populationString = (population || '0').toString().replace(/\./g, '').trim();
        const areaString = (area || '0').toString().trim();
        
        const finalArea = parseFloat(areaString);
        const finalPopulation = BigInt(populationString);

        if (isNaN(finalArea)) {
            return res.status(400).json({ error: 'O valor da área é inválido.' });
        }

        const continent = await prisma.continent.create({
            data: { 
                name, 
                area: finalArea, 
                population: finalPopulation,
                imageUrl: imageUrl || '' 
            },
        });
        
        res.status(201).json(convertBigInts(continent));

    } catch (error: any) {
         if (error instanceof SyntaxError || (error.message && error.message.includes("BigInt"))) {
             return res.status(400).json({ error: 'O valor da população é inválido (deve ser um número inteiro sem vírgulas ou espaços).' });
        }
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Um continente com esse nome já existe.' });
        }
        console.error("Erro ao criar continente:", error); 
        res.status(500).json({ error: 'Erro interno ao criar continente.' });
    }
};

export const getContinentById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID do continente é obrigatório.' });

    try {
        const continent = await prisma.continent.findUnique({
            where: { id: parseInt(id) },
            include: { countries: true } 
        });
        
        if (!continent) {
            return res.status(404).json({ error: 'Continente não encontrado.' });
        }
        
        res.json(convertBigInts(continent));
    } catch (error) {
        console.error("Erro ao buscar continente por ID:", error); 
        res.status(500).json({ error: 'Erro ao buscar continente.' });
    }
};

// Update Continent
export const updateContinent = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name: rawName, area, population, imageUrl } = req.body;
    
    const name = rawName || ''; 

    if (!name) return res.status(400).json({ error: 'O nome é obrigatório.' });

    try {
        const populationString = (population || '0').toString().replace(/\./g, '').trim();
        const areaString = (area || '0').toString().trim();

        const finalArea = parseFloat(areaString);
        const finalPopulation = BigInt(populationString);

        if (isNaN(finalArea)) {
            return res.status(400).json({ error: 'O valor da área é inválido.' });
        }

        const continent = await prisma.continent.update({
            where: { id: parseInt(id!) }, 
            data: {
                name,
                area: finalArea,
                population: finalPopulation,
                imageUrl: imageUrl || ''
            },
        });

        res.json(convertBigInts(continent));

    } catch (error: any) {
         if (error instanceof SyntaxError || (error.message && error.message.includes("BigInt"))) {
             return res.status(400).json({ error: 'O valor da população é inválido (deve ser um número inteiro sem vírgulas ou espaços).' });
        }
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Um continente com esse nome já existe.' });
        }
        if (error.code === 'P2025') {
             return res.status(404).json({ error: 'Continente não encontrado para atualização.' });
        }
        console.error("Erro ao atualizar continente:", error);
        res.status(500).json({ error: 'Erro interno ao atualizar continente.' });
    }
};

// Delete Continent
export const deleteContinent = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.continent.delete({
            where: { id: parseInt(id!) }, 
        });
        res.status(204).send(); 
    } catch (error: any) {
         if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Continente não encontrado para exclusão.' });
        }
         if (error.code === 'P2003') { 
            return res.status(409).json({ error: 'Não é possível excluir: existem países associados a este continente.' });
        }
        console.error("Erro ao deletar continente:", error);
        res.status(500).json({ error: 'Erro ao deletar continente.' });
    }
};

// --- Countries ---

export const getCountries = async (req: Request, res: Response) => {
    const { continent } = req.query;
    
    try {
        const where = continent ? { continentId: parseInt(continent as string) } : {};
        const countries = await prisma.country.findMany({
            where,
            include: { continent: true },
            orderBy: { name: 'asc' }
        });
        res.json(convertBigInts(countries));
    } catch (error) {
        console.error("Erro ao buscar países:", error); 
        res.status(500).json({ error: 'Erro ao buscar países.' });
    }
};

export const createCountry = async (req: Request, res: Response) => {
    const { 
        name: rawName, capital, isoCode: rawIsoCode, population, flagUrl, continentId,
        description, language, currency, area, callingCode,
        imageUrl 
    } = req.body;
    
    const name = rawName || ''; 
    const isoCode = rawIsoCode || ''; 

    if (!name || !isoCode || !continentId) {
        return res.status(400).json({ error: 'Nome, Código ISO e Continente são obrigatórios.' });
    }

    try {
        const populationString = (population || '0').toString().replace(/\./g, '').trim();
        const areaString = (area || '0').toString().trim();

        const country = await prisma.country.create({
            data: { 
                name, 
                capital: capital || '', 
                isoCode, 
                population: BigInt(populationString), 
                flagUrl: flagUrl || '', 
                continentId: parseInt(continentId!),
                
                description: description || '',
                language: language || '',
                currency: currency || '',
                area: parseFloat(areaString) || null,
                callingCode: callingCode || '',
                imageUrl: imageUrl || '' 
            },
        });
        res.status(201).json(convertBigInts(country));
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Um país com esse nome ou Código ISO já existe.' });
        }
        console.error("Erro ao criar país:", error); 
        res.status(500).json({ error: 'Erro ao criar país.' });
    }
};

export const getCountryById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID do país é obrigatório.' });

    try {
        const country = await prisma.country.findUnique({
            where: { id: parseInt(id) },
            include: { continent: true, cities: true } 
        });

        if (!country) {
            return res.status(404).json({ error: 'País não encontrado.' });
        }
        res.json(convertBigInts(country));
    } catch (error) {
        console.error("Erro ao buscar país por ID:", error); 
        res.status(500).json({ error: 'Erro ao buscar país.' });
    }
};

// Update Country
export const updateCountry = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        name: rawName, capital, isoCode: rawIsoCode, population, flagUrl, continentId,
        description, language, currency, area, callingCode,
        imageUrl
    } = req.body;
    
    const name = rawName || ''; 
    const isoCode = rawIsoCode || ''; 

    if (!name || !isoCode || !continentId) {
        return res.status(400).json({ error: 'Nome, Código ISO e Continente são obrigatórios.' });
    }

    try {
        const populationString = (population || '0').toString().replace(/\./g, '').trim();
        const areaString = (area || '0').toString().trim();

        const country = await prisma.country.update({
            where: { id: parseInt(id!) }, 
            data: {
                name,
                capital: capital || '',
                isoCode,
                population: BigInt(populationString),
                flagUrl: flagUrl || '',
                continentId: parseInt(continentId!),

                description: description || '',
                language: language || '',
                currency: currency || '',
                area: parseFloat(areaString) || null,
                callingCode: callingCode || '',
                imageUrl: imageUrl || ''
            },
        });
        res.json(convertBigInts(country));
    } catch (error: any) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Um país com esse nome ou Código ISO já existe.' });
        }
        if (error.code === 'P2025') {
             return res.status(404).json({ error: 'País não encontrado para atualização.' });
        }
        console.error("Erro ao atualizar país:", error);
        res.status(500).json({ error: 'Erro ao atualizar país.' });
    }
};

// Delete Country
export const deleteCountry = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.country.delete({
            where: { id: parseInt(id!) }, 
        });
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'País não encontrado para exclusão.' });
        }
        if (error.code === 'P2003') { 
            return res.status(409).json({ error: 'Não é possível excluir: existem cidades associadas a este país.' });
        }
        console.error("Erro ao deletar país:", error);
        res.status(500).json({ error: 'Erro ao deletar país.' });
    }
};


// --- Cities ---

export const getCities = async (req: Request, res: Response) => {
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
            include: { country: { include: { continent: true } } },
            orderBy: { name: 'asc' }
        });
        res.json(convertBigInts(cities));
    } catch (error) {
        console.error("Erro ao buscar cidades:", error); 
        res.status(500).json({ error: 'Erro ao buscar cidades.' });
    }
};

export const createCity = async (req: Request, res: Response) => {
    const { 
        name: rawName, latitude, longitude, population, countryId,
        area, timezone, language, imageUrl 
    } = req.body;
    
    const name = rawName || ''; 
    
    if (!name || !population || !countryId) {
        return res.status(400).json({ error: 'Nome, População e País são obrigatórios.' });
    }

    try {
        const populationString = (population || '0').toString().replace(/\./g, '').trim();
        const areaString = (area || '0').toString().trim();
        
        const city = await prisma.city.create({
            data: { 
                name, 
                latitude: parseFloat(latitude || '0'), 
                longitude: parseFloat(longitude || '0'), 
                population: BigInt(populationString), 
                countryId: parseInt(countryId!),
                
                area: parseFloat(areaString) || null,
                timezone: timezone || '',
                language: language || '',
                imageUrl: imageUrl || '' 
            },
        });
        res.status(201).json(convertBigInts(city));
    } catch (error: any) {
         if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Uma cidade com esse nome já existe nesse país.' });
        }
        console.error("Erro ao criar cidade:", error); 
        res.status(500).json({ error: 'Erro ao criar cidade.' });
    }
};

export const getCityById = async (req: Request, res: Response) => {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'ID da cidade é obrigatório.' });

    try {
        const city = await prisma.city.findUnique({
            where: { id: parseInt(id) },
            include: { country: { include: { continent: true } } }
        });
        
        if (!city) {
            return res.status(404).json({ error: 'Cidade não encontrada.' });
        }
        res.json(convertBigInts(city));
    } catch (error) {
        console.error("Erro ao buscar cidade por ID:", error); 
        res.status(500).json({ error: 'Erro ao buscar cidade.' });
    }
};

// Update City
export const updateCity = async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
        name: rawName, latitude, longitude, population, countryId,
        area, timezone, language, imageUrl
    } = req.body;
    
    const name = rawName || ''; 

    if (!name || !population || !countryId) {
        return res.status(400).json({ error: 'Nome, População e País são obrigatórios.' });
    }

    try {
        const populationString = (population || '0').toString().replace(/\./g, '').trim();
        const areaString = (area || '0').toString().trim();

        const city = await prisma.city.update({
            where: { id: parseInt(id!) }, 
            data: {
                name,
                latitude: parseFloat(latitude || '0'),
                longitude: parseFloat(longitude || '0'),
                population: BigInt(populationString),
                countryId: parseInt(countryId!),

                area: parseFloat(areaString) || null,
                timezone: timezone || '',
                language: language || '',
                imageUrl: imageUrl || ''
            },
        });
        res.json(convertBigInts(city));
    } catch (error: any) {
         if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Uma cidade com esse nome já existe nesse país.' });
        }
        if (error.code === 'P2025') {
             return res.status(404).json({ error: 'Cidade não encontrada para atualização.' });
        }
        console.error("Erro ao atualizar cidade:", error);
        res.status(500).json({ error: 'Erro ao atualizar cidade.' });
    }
};

// Delete City
export const deleteCity = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        await prisma.city.delete({
            where: { id: parseInt(id!) }, 
        });
        res.status(204).send();
    } catch (error: any) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Cidade não encontrada para exclusão.' });
        }
        console.error("Erro ao deletar cidade:", error);
        res.status(500).json({ error: 'Erro ao deletar cidade.' });
    }
};


// --- Status ---
export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const countryCount = await prisma.country.count();
        const cityCount = await prisma.city.count();
        const continentCount = await prisma.continent.count();

        res.json({
            totalCountries: countryCount,
            totalCities: cityCount,
            totalContinents: continentCount,
            apiStatus: "Operational",
            dataPointsSynced: (countryCount + cityCount + continentCount) * 100
        });
    } catch (error) {
         console.error("Erro ao buscar estatísticas:", error); 
         res.status(500).json({ error: 'Erro ao buscar estatísticas.' });
    }
};