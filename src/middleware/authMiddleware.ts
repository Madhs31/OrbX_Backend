import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Estende a interface Request do Express para incluir o user
interface AuthRequest extends Request {
    user?: { id: number, email: string, role: string };
}

// 1. Verifica se o token JWT é válido e adiciona os dados do usuário à requisição
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    // Espera-se o formato: Bearer TOKEN
    const token = authHeader && authHeader.split(' ')[1]; 

    if (token == null) return res.status(401).json({ error: 'Acesso negado. Token ausente.' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
        if (err) {
            return res.status(403).json({ error: 'Token inválido ou expirado.' });
        }
        
        req.user = user; 
        next();
    });
};

// 2. Verifica se o usuário autenticado tem a role de 'admin'
export const checkAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Permissão negada. Requer acesso de administrador.' });
    }
};