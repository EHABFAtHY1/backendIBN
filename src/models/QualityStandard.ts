import mongoose, { Schema, Document } from 'mongoose';

export interface IQualityStandard extends Document {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    icon: string;
    order: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const QualityStandardSchema = new Schema<IQualityStandard>(
    {
        titleAr: { type: String, required: true, trim: true },
        titleEn: { type: String, required: true, trim: true },
        descriptionAr: { type: String, required: true, trim: true },
        descriptionEn: { type: String, required: true, trim: true },
        icon: { type: String, default: '' },
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IQualityStandard>('QualityStandard', QualityStandardSchema);
