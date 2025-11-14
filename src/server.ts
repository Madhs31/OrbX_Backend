import express from 'express';
import cors from 'cors'; // Importe o cors
import dotenv from 'dotenv';
import apiRoutes from './routes/apiRoutes.js'; 
import authRoutes from './routes/authRoutes.js'; 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares

// --- CORREÇÃO AQUI ---
// Removemos a restrição de 'origin' para permitir qualquer porta (localhost:3000, 5173, etc)
app.use(cors()); 
// --- FIM DA CORREÇÃO ---

app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 

// Rotas
app.use('/api', apiRoutes); 
app.use('/auth', authRoutes); 

// Rota padrão de saúde (Health Check)
app.get('/', (req, res) => {
    res.status(200).send('OrbX Backend is running!');
});

// Inicialização do Servidor
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});