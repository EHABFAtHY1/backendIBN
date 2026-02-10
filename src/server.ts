import app from './app';
import { connectDB } from './config/db';
import config from './config';

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
    console.error(err.name, err.message);
    process.exit(1);
});

async function startServer() {
    // Connect to Database
    await connectDB();

    const server = app.listen(config.port, () => {
        console.log(`✅ Server running on port ${config.port}`);
        console.log(`📄 Swagger docs available at http://localhost:${config.port}/api-docs`);
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (err: any) => {
        console.error('UNHANDLED REJECTION! 💥 Shutting down...');
        console.error(err.name, err.message);
        server.close(() => {
            process.exit(1);
        });
    });
}

startServer();
