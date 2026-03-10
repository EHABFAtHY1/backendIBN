import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    color: string;
    countAr: string;
    countEn: string;
    order: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
    {
        titleAr: { type: String, required: true, trim: true },
        titleEn: { type: String, required: true, trim: true },
        descriptionAr: { type: String, required: true, trim: true },
        descriptionEn: { type: String, required: true, trim: true },
        color: { type: String, required: true, trim: true },
        countAr: { type: String, required: true, trim: true },
        countEn: { type: String, required: true, trim: true },
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IDepartment>('Department', DepartmentSchema);
