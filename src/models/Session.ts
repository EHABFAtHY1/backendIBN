import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
    userId: mongoose.Types.ObjectId;
    expiresAt: Date;
    user?: any; // Populated user reference
    createdAt: Date;
    updatedAt: Date;
}

const SessionSchema = new Schema<ISession>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expireAfterSeconds: 0 }, // Auto-delete expired sessions
        },
    },
    {
        timestamps: true,
        _id: true // Allow MongoDB to use default _id
    }
);

export default mongoose.model<ISession>('Session', SessionSchema);
