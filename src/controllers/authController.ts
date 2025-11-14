// src/controllers/authController.ts
import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// --- Registro de Novo Usuário ---
export const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;
    
    // Simples validação de senha (o front deve fazer mais)
    if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios.' });
    }

    try {
        // Verifica se o usuário já existe
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'Email já cadastrado.' });
        }

        // 1. Criptografa a senha
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // 2. Cria o usuário no banco de dados
        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role: 'user' },
            select: { id: true, name: true, email: true, role: true } // Não retorna a senha
        });

        res.status(201).json({ message: 'Usuário registrado com sucesso!', user });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno ao registrar usuário.' });
    }
};

// --- Login de Usuário ---
export const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    try {
        // 1. Encontra o usuário
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // 2. Compara a senha (hashed)
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Credenciais inválidas.' });
        }

        // 3. Gera o Token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '1d' } // Expira em 1 dia
        );
        
        // 4. Retorna o token para o Front-end
        res.json({ 
            token, 
            user: { id: user.id, name: user.name, email: user.email, role: user.role } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro interno ao fazer login.' });
    }
};