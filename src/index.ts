import 'reflect-metadata';  // MUST be first import!
import express from 'express';
import cors from 'cors';
import { AppDataSource } from './config/data-source';
import { userRoutes } from './routes/userRoutes';
import { taskRoutes } from './routes/taskRoutes';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
   res.json({
       success: true,
       message: 'API is running',
       timestamp: new Date().toISOString()
   });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api', taskRoutes);

// 404 handler (Must be placed AFTER all valid routes)
app.use((req, res) => {
   res.status(404).json({
       success: false,
       error: {
           code: 'ROUTE_NOT_FOUND',
           message: `Route ${req.method} ${req.url} not found`
       }
   });
});

// Initialize database connection and start server
AppDataSource.initialize()
   .then(() => {
       console.log('✅ Database connected successfully!');
       
       app.listen(PORT, () => {
           console.log(`🚀 Server running on http://localhost:${PORT}`);
       });
   })
   .catch((error) => {
       console.error('❌ Database connection failed:', error);
   });