import mongoose, { Schema, Document } from 'mongoose';

export interface IDepartment extends Document {
    titleAr: string;
    titleEn: string;
    icon: string;
    sections?: mongoose.Types.ObjectId[];
    order: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
    {
        titleAr: { type: String, required: true, trim: true },
        titleEn: { type: String, required: true, trim: true },
        icon: { type: String, default: '' },
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
    }
);

DepartmentSchema.virtual('sections', {
    ref: 'Section',
    localField: '_id',
    foreignField: 'departmentId',
});

export default mongoose.model<IDepartment>('Department', DepartmentSchema);
