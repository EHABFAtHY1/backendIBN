import mongoose, { Schema, Document } from 'mongoose';

export interface ISubDepartment {
    title: { ar: string; en: string };
    icon: string;
    sections: { ar: string; en: string }[];
}

export interface IDepartment extends Document {
    title: { ar: string; en: string };
    icon: string;
    subDepartments: ISubDepartment[];
    order: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const bilingualField = {
    ar: { type: String, default: '' },
    en: { type: String, default: '' },
};

const DepartmentSchema = new Schema<IDepartment>(
    {
        title: { type: bilingualField, required: true },
        icon: { type: String, default: '' },
        subDepartments: {
            type: [
                {
                    title: bilingualField,
                    icon: { type: String, default: '' },
                    sections: { type: [bilingualField], default: [] },
                },
            ],
            default: [],
        },
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IDepartment>('Department', DepartmentSchema);
