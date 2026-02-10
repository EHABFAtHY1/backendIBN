import express from 'express';
import cors from 'cors';
import path from 'path';
import swaggerUi from 'swagger-ui-express';
import swaggerFile from './swagger-output.json';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import config from './config';

const app = express();

// Middleware
app.use(cors(
    { origin: '*' }
));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded images)
app.use('/uploads', express.static(path.resolve(config.uploadDir)));

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

// Routes
app.use('/api', routes);

// Global Error Handler
app.use(errorHandler);

export default app;
