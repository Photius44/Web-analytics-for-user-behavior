import express from 'express';
import cors from 'cors';
import trackRoutes from './routes/track.routes';
import analyticsRoutes from './routes/analytics.routes';
import projectRoutes from './routes/project.routes';
import 'dotenv/config';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 5000;

// Apply CORS middleware to enable cross-origin stream logging from external client websites
app.use(cors({
  origin: '*', // Allows tracking beacons from any origin
  methods: ['POST', 'OPTIONS', 'GET'],
  allowedHeaders: ['Content-Type']
}));

// Built-in JSON parser for request payload processing
app.use(express.json());

// Cho phép gọi file tracker.js trực tiếp từ server backend
app.use(express.static('public'));

//Bind request logger to track
app.use(morgan('dev'));

// Bind tracking routes to '/api' prefix -> maps to /api/track
app.use('/api', trackRoutes);
app.use('/api', projectRoutes);
app.use('/api/analytics', analyticsRoutes);

// Server health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

// Run server
app.listen(PORT, () => {
  console.log(`[Analytics Server] running on http://localhost:${PORT}`);
});
