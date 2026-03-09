import mongoose, { Schema, Document } from 'mongoose';

export interface ISection {
    titleAr: string;
    titleEn: string;
    icon: string;
}

export interface IDepartment extends Document {
    titleAr: string;
    titleEn: string;
    icon: string;
    sections: ISection[];
    order: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const SectionSchema = new Schema<ISection>(
    {
        titleAr: { type: String, required: true, trim: true },
        titleEn: { type: String, required: true, trim: true },
        icon: { type: String, default: '' },
    },
    { _id: true }
);

const DepartmentSchema = new Schema<IDepartment>(
    {
        titleAr: { type: String, required: true, trim: true },
        titleEn: { type: String, required: true, trim: true },
        icon: { type: String, default: '' },
        sections: { type: [SectionSchema], default: [] },
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IDepartment>('Department', DepartmentSchema);
