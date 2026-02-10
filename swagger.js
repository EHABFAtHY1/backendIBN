const swaggerAutogen = require('swagger-autogen')();

const doc = {
    info: {
        title: 'Ibnalshaekh API',
        description: 'API documentation for Ibnalshaekh Construction Company',
        version: '1.0.0',
    },
    host: 'localhost:5000',
    basePath: '/api',
    schemes: ['http', 'https'],
    consumes: ['application/json'],
    produces: ['application/json'],
    securityDefinitions: {
        bearerAuth: {
            type: 'apiKey',
            in: 'header',
            name: 'Authorization',
            description: 'JWT Authorization header using the Bearer scheme (Example: "Authorization: Bearer {token}")',
        },
    },
    definitions: {
        // Define common schemas here
        Error: {
            type: 'object',
            properties: {
                message: { type: 'string' },
                statusCode: { type: 'number' },
            },
        },
    },
};

const outputFile = './src/swagger-output.json';
const endpointsFiles = [
    './src/routes/index.ts',
    './src/routes/authRoutes.ts',
    './src/routes/userRoutes.ts',
    './src/routes/projectRoutes.ts',
    './src/routes/serviceRoutes.ts',
    './src/routes/departmentRoutes.ts',
    './src/routes/partnerRoutes.ts',
    './src/routes/mediaRoutes.ts',
    './src/routes/projectCategoryRoutes.ts',
    './src/routes/settingsRoutes.ts',
];

swaggerAutogen(outputFile, endpointsFiles, doc);
