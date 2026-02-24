import mongoose from 'mongoose';
import config from './index';

export async function connectDB(): Promise<void> {
    try {
        await mongoose.connect(config.mongoUri);
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
}

export async function disconnectDB(): Promise<void> {
    try {
        await mongoose.disconnect();
        console.log('✅ MongoDB disconnected successfully');
    } catch (error) {
        console.error('❌ MongoDB disconnection error:', error);
        process.exit(1);
    }
}

