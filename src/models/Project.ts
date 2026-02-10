import mongoose, { Schema, Document } from 'mongoose';

export interface IBilingualField {
    ar: string;
    en: string;
}

export interface IProject extends Document {
    category: string;
    title: IBilingualField;
    image: string;
    location: IBilingualField;
    description: IBilingualField;
    fullDescription: IBilingualField;
    techStack: IBilingualField[];
    status: IBilingualField;
    area: string;
    duration: string;
    team: string;
    gallery: string[];
    isWorking: boolean;
    order: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const bilingualField = {
    ar: { type: String, default: '' },
    en: { type: String, default: '' },
};

const ProjectSchema = new Schema<IProject>(
    {
        category: { type: String, required: true, index: true },
        title: { type: bilingualField, required: true },
        image: { type: String, default: '' },
        location: { type: bilingualField, default: () => ({ ar: '', en: '' }) },
        description: { type: bilingualField, default: () => ({ ar: '', en: '' }) },
        fullDescription: { type: bilingualField, default: () => ({ ar: '', en: '' }) },
        techStack: { type: [bilingualField], default: [] },
        status: { type: bilingualField, default: () => ({ ar: '', en: '' }) },
        area: { type: String, default: '' },
        duration: { type: String, default: '' },
        team: { type: String, default: '' },
        gallery: { type: [String], default: [] },
        isWorking: { type: Boolean, default: false },
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IProject>('Project', ProjectSchema);
