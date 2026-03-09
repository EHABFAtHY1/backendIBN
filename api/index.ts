import app from '../src/app';
import { connectDB } from '../src/config/db';

let isDbReady = false;

export default async function handler(req: any, res: any) {
    if (!isDbReady) {
        await connectDB();
        isDbReady = true;
    }

    return app(req, res);
}
