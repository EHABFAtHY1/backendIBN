import mongoose, { Schema, Document } from 'mongoose';

export interface IProjectCategory extends Document {
    _id: mongoose.Types.ObjectId;
    titleAr: string;
    titleEn: string;
    descriptionAr: string;
    descriptionEn: string;
    color: string;
    countAr: string;
    countEn: string;
    projects?: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const ProjectCategorySchema = new Schema<IProjectCategory>(
    {
        titleAr: { type: String, required: true },
        titleEn: { type: String, required: true },
        descriptionAr: { type: String, required: true },
        descriptionEn: { type: String, required: true },
        color: { type: String, required: true },
        countAr: { type: String, required: true },
        countEn: { type: String, required: true },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

ProjectCategorySchema.virtual('projects', {
    ref: 'Project',
    localField: '_id',
    foreignField: 'categoryId',
});

export default mongoose.model<IProjectCategory>('Category', ProjectCategorySchema);
