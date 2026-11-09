import 'reflect-metadata';  // MUST be first import!
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { AppDataSource } from './config/data-source';
import { userRoutes } from './routes/v1/userRoutes';
import { taskRoutes } from './routes/v1/taskRoutes';
import { authRoutes } from './routes/v1/authRoutes';
import * as dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// --- CUSTOM REQUEST LOGGING MIDDLEWARE (Task 13) ---
app.use((req: Request, res: Response, next: NextFunction) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
    next(); // Pass control to the next middleware or route controller
});

// Health check endpoint
app.get('/health', (req, res) => {
   res.json({
       success: true,
       message: 'API is running',
       timestamp: new Date().toISOString()
   });
});

// Routes
app.use('/api/v1/auth', authRoutes); 
app.use('/api/v1/users', userRoutes);
app.use('/api/v1', taskRoutes);

// Legacy /api/ fallback returning 410 Gone (Task 30)
app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    // If the path actually starts with /v1/, let it pass through to the 404 handler instead
    if (req.url.startsWith('/v1') || req.baseUrl.startsWith('/api/v1')) {
        return next();
    }

   res.status(410).json({
        success: false,
        error: {
            code: 'ENDPOINT_DEPRECATED',
            message: `This API endpoint is deprecated and has moved to v1. Please use /api/v1${req.url}`
        }
   });
});

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
        
        const server = app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });

        // --- GRACEFUL SHUTDOWN HANDLERS (Task 29) ---
        const gracefulShutdown = async (signal: string) => {
            console.log(`\n⚠️ Received ${signal}. Starting graceful shutdown...`);

            // 1. Stop accepting new HTTP requests
            server.close(async () => {
                console.log('HTTP server closed.');

                try {
                    // 2. Destroy TypeORM database connection
                    if (AppDataSource.isInitialized) {
                        await AppDataSource.destroy();
                        console.log('Database connection destroyed successfully.');
                    }
                    console.log('Graceful shutdown completed.');
                    process.exit(0);
                } catch (error) {
                    console.error('Error during database shutdown:', error);
                    process.exit(1);
                }
            });

            // Force close server after 10 seconds if connections hang
            setTimeout(() => {
                console.error('Could not close connections in time, forcefully shutting down');
                process.exit(1);
            }, 10000);
        };

        // Listen for termination signals
        process.on('SIGINT', () => gracefulShutdown('SIGINT'));   // Triggered by Ctrl+C in terminal
        process.on('SIGTERM', () => gracefulShutdown('SIGTERM')); // Triggered by process managers / Docker
   })
   .catch((error) => {
        console.error('❌ Database connection failed:', error);
   });