import mongoose from 'mongoose';
import config from './index';

let connectionPromise: Promise<typeof mongoose> | null = null;

export async function connectDB(): Promise<void> {
    if (mongoose.connection.readyState === 1) {
        return;
    }

    if (!connectionPromise) {
        connectionPromise = mongoose.connect(config.mongoUri);
    }

    try {
        await connectionPromise;

        if (process.env.NODE_ENV !== 'test') {
            console.log('✅ MongoDB connected successfully');
        }
    } catch (error) {
        connectionPromise = null;
        console.error('❌ MongoDB connection error:', error);
        throw error;
    }
}

export async function disconnectDB(): Promise<void> {
    try {
        await mongoose.disconnect();
        connectionPromise = null;
        console.log('✅ MongoDB disconnected successfully');
    } catch (error) {
        console.error('❌ MongoDB disconnection error:', error);
        throw error;
    }
}
