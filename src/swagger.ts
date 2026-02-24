import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Ibnalshaekh API',
            version: '1.0.0',
            description: 'API documentation for Ibnalshaekh Construction Company backend',
            contact: {
                name: 'Ibnalshaekh',
                email: 'info@ibnalshaekh.com',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Development server',
            },
            {
                url: 'https://api.ibnalshaekh.com',
                description: 'Production server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'SessionID',
                    description: 'Session ID obtained from login endpoint',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        userName: { type: 'string' },
                        email: { type: 'string' },
                        role: { type: 'string', enum: ['admin', 'user'] },
                        tel: { type: 'string' },
                        photo: { type: 'string' },
                        yearsOfExp: { type: 'number' },
                        descriptionAr: { type: 'string' },
                        descriptionEn: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Project: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        titleAr: { type: 'string' },
                        titleEn: { type: 'string' },
                        locationAr: { type: 'string' },
                        locationEn: { type: 'string' },
                        descriptionAr: { type: 'string' },
                        descriptionEn: { type: 'string' },
                        fullDescriptionAr: { type: 'string' },
                        fullDescriptionEn: { type: 'string' },
                        durationAr: { type: 'string' },
                        durationEn: { type: 'string' },
                        teamAr: { type: 'string' },
                        teamEn: { type: 'string' },
                        area: { type: 'string' },
                        status: { type: 'string' },
                        categoryId: { type: 'string' },
                        techStack: { type: 'array', items: { type: 'string' } },
                        gallery: { type: 'array', items: { type: 'string' } },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Category: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        titleAr: { type: 'string' },
                        titleEn: { type: 'string' },
                        descriptionAr: { type: 'string' },
                        descriptionEn: { type: 'string' },
                        color: { type: 'string' },
                        countAr: { type: 'string' },
                        countEn: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                CompanySettings: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        nameAr: { type: 'string' },
                        nameEn: { type: 'string' },
                        yearsExperience: { type: 'string' },
                        clientsCount: { type: 'string' },
                        projectsCount: { type: 'string' },
                        satisfiedClientsCount: { type: 'string' },
                        successPercentage: { type: 'string' },
                        valuesAr: { type: 'array', items: { type: 'string' } },
                        valuesEn: { type: 'array', items: { type: 'string' } },
                        ourSeenAr: { type: 'string' },
                        ourSeenEn: { type: 'string' },
                        telephone: { type: 'string' },
                        email: { type: 'string' },
                        addressAr: { type: 'string' },
                        addressEn: { type: 'string' },
                        addressUrl: { type: 'string' },
                        logo: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                        statusCode: { type: 'number' },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
        tags: [
            { name: 'Health Check', description: 'API health status' },
            { name: 'Authentication', description: 'User authentication endpoints' },
            { name: 'Users', description: 'User management (Admin only)' },
            { name: 'Projects', description: 'Project management' },
            { name: 'Categories', description: 'Project category management' },
            { name: 'Company Settings', description: 'Company information management' },
        ],
    },
    apis: [
        './src/routes/*.ts',
        './src/controllers/*.ts',
    ],
};

export const swaggerSpec = swaggerJsdoc(options);
