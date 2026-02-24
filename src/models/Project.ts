import mongoose, { Schema, Document } from 'mongoose';

export interface IProject extends Document {
    _id: mongoose.Types.ObjectId;
    titleAr: string;
    titleEn: string;
    locationAr: string;
    locationEn: string;
    descriptionAr: string;
    descriptionEn: string;
    fullDescriptionAr: string;
    fullDescriptionEn: string;
    durationAr: string;
    durationEn: string;
    teamAr: string;
    teamEn: string;
    area: string;
    status: string;
    categoryId: mongoose.Types.ObjectId;
    techStack: string[];
    gallery: string[];
    createdAt: Date;
    updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
    {
        titleAr: { type: String, required: true },
        titleEn: { type: String, required: true },
        locationAr: { type: String, required: true },
        locationEn: { type: String, required: true },
        descriptionAr: { type: String, required: true },
        descriptionEn: { type: String, required: true },
        fullDescriptionAr: { type: String, required: true },
        fullDescriptionEn: { type: String, required: true },
        durationAr: { type: String, required: true },
        durationEn: { type: String, required: true },
        teamAr: { type: String, required: true },
        teamEn: { type: String, required: true },
        area: { type: String, required: true },
        status: { type: String, required: true },
        categoryId: {
            type: Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        techStack: { type: [String], default: [] },
        gallery: { type: [String], default: [] },
    },
    { timestamps: true }
);

export default mongoose.model<IProject>('Project', ProjectSchema);
