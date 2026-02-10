import mongoose, { Schema, Document } from 'mongoose';

export interface IServiceBenefit {
    title: { ar: string; en: string };
    description: { ar: string; en: string };
}

export interface IServiceProcess {
    step: number;
    title: { ar: string; en: string };
    description: { ar: string; en: string };
}

export interface IServiceStats {
    projects: string;
    experience: string;
    satisfaction: string;
}

export interface IService extends Document {
    slug: string;
    title: { ar: string; en: string };
    shortDescription: { ar: string; en: string };
    fullDescription: { ar: string; en: string };
    icon: string;
    features: { ar: string; en: string }[];
    benefits: IServiceBenefit[];
    process: IServiceProcess[];
    images: string[];
    stats: IServiceStats;
    order: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const bilingualField = {
    ar: { type: String, default: '' },
    en: { type: String, default: '' },
};

const ServiceSchema = new Schema<IService>(
    {
        slug: { type: String, required: true, unique: true },
        title: { type: bilingualField, required: true },
        shortDescription: { type: bilingualField, default: () => ({ ar: '', en: '' }) },
        fullDescription: { type: bilingualField, default: () => ({ ar: '', en: '' }) },
        icon: { type: String, default: '' },
        features: { type: [bilingualField], default: [] },
        benefits: {
            type: [
                {
                    title: bilingualField,
                    description: bilingualField,
                },
            ],
            default: [],
        },
        process: {
            type: [
                {
                    step: { type: Number },
                    title: bilingualField,
                    description: bilingualField,
                },
            ],
            default: [],
        },
        images: { type: [String], default: [] },
        stats: {
            type: {
                projects: { type: String, default: '' },
                experience: { type: String, default: '' },
                satisfaction: { type: String, default: '' },
            },
            default: () => ({ projects: '', experience: '', satisfaction: '' }),
        },
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IService>('Service', ServiceSchema);
