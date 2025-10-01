// /src/main.ts
import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import 'dotenv/config';
import { connectDB } from './infrastructure/database/mongo';
import { calendarRouter } from './interfaces/routes/calendar.routes';
import { errorHandler } from './interfaces/middleware/error.handler';
import { config } from './shared/config'; 

/**
 * The main entry point for the application.
 * It sets up the Express server, connects to the database, and defines routes.
 */
const app: Express = express();

// --- Middleware ---
app.use(helmet());              // Security headers
app.use(cors());                // Cross-Origin Resource Sharing
app.use(express.json());        // Body parser for JSON

// --- Routes ---
app.use('/api/v1', calendarRouter);

// --- Error Handling ---
app.use(errorHandler);

// --- Server Startup ---
const startServer = async (): Promise<void> => {
  try {
    await connectDB(config.mongo.uri);
    console.log('MongoDB connected successfully.');
    app.listen(config.port, () => {
      console.log(`Server is running on http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start the server:', error);
    process.exit(1);
  }
};

startServer();
