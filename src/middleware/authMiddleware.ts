import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';

// Estende a interface Request do Express para incluir o user
interface AuthRequest extends Request {
    user?: { id: number, email: string, role: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
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

export const checkAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user) {
        next();
    } else {
        res.status(403).json({ error: 'Permissão negada. Requer autenticação.' });
    }
};