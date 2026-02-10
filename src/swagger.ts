import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ibnalshaekh API',
            version: '1.0.0',
            description: 'API documentation for Ibnalshaekh Construction Company backend',
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                // We can add reusable schemas here if needed, 
                // but for now we'll rely on JSDoc in controllers/routes if we were adding them there.
                // Since we didn't add JSDoc annotations to controllers yet, this basic setup 
                // initializes Swagger. To have full docs, we'd need to add @swagger comments.
                // For this implementation, we'll keep the config ready.
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/models/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
