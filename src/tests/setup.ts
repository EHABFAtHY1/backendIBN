import dotenv from 'dotenv';

dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ibnalshaekh-test';
process.env.APP_ENV = 'test';
