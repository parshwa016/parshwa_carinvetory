import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import vehicleRoutes from './routes/vehicleRoutes';

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);

// Catch-all route for unmatched endpoints
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

export default app;
