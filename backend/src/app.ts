import express from 'express';
import cors from 'cors';
import { clerkMiddleware } from '@clerk/express';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import cliRoutes from './routes/cliRoutes';
import memoryRoutes from './routes/memoryRoutes';

const app = express();

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    process.env.FRONTEND_URL || '',
  ].filter(Boolean),
  credentials: true,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(clerkMiddleware());

app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/cli', cliRoutes);
app.use('/api/cli', memoryRoutes);



app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

export default app;
