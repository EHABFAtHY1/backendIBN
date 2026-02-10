import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectCategory extends Document {
    slug: string;
    title: { ar: string; en: string };
    description: { ar: string; en: string };
    icon: string;
    color: string;
    count: string;
    order: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const bilingualField = {
    ar: { type: String, default: '' },
    en: { type: String, default: '' },
};

const ProjectCategorySchema = new Schema<IProjectCategory>(
    {
        slug: { type: String, required: true, unique: true },
        title: { type: bilingualField, required: true },
        description: { type: bilingualField, default: () => ({ ar: '', en: '' }) },
        icon: { type: String, default: '' },
        color: { type: String, default: '' },
        count: { type: String, default: '' },
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IProjectCategory>('ProjectCategory', ProjectCategorySchema);
