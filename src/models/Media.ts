import mongoose, { Schema, Document } from 'mongoose';

export interface IMedia extends Document {
    filename: string;
    originalName: string;
    url: string;
    mimeType: string;
    size: number;
    alt: string;
    createdAt: Date;
}

const MediaSchema = new Schema<IMedia>(
    {
        filename: { type: String, required: true },
        originalName: { type: String, required: true },
        url: { type: String, required: true },
        mimeType: { type: String, required: true },
        size: { type: Number, required: true },
        alt: { type: String, default: '' },
    },
    { timestamps: true }
);

export default mongoose.model<IMedia>('Media', MediaSchema);
