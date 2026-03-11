import mongoose, { Schema, Document } from 'mongoose';

export interface ISection extends Document {
    titleAr: string;
    titleEn: string;
    icon: string;
    departmentId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const SectionSchema = new Schema<ISection>(
    {
        titleAr: { type: String, required: true, trim: true },
        titleEn: { type: String, required: true, trim: true },
        icon: { type: String, default: '' },
        departmentId: {
            type: Schema.Types.ObjectId,
            ref: 'Department',
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model<ISection>('Section', SectionSchema);
