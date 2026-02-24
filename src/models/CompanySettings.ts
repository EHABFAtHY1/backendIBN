import mongoose, { Schema, Document } from 'mongoose';

export interface ICompanySettings extends Document {
    _id: mongoose.Types.ObjectId;
    nameAr: string;
    nameEn: string;
    yearsExperience: string;
    clientsCount: string;
    projectsCount: string;
    satisfiedClientsCount: string;
    successPercentage: string;
    valuesAr: string[];
    valuesEn: string[];
    ourSeenAr: string;
    ourSeenEn: string;
    telephone: string;
    email: string;
    addressAr: string;
    addressEn: string;
    addressUrl: string;
    logo: string;
    createdAt: Date;
    updatedAt: Date;
}

const CompanySettingsSchema = new Schema<ICompanySettings>(
    {
        nameAr: { type: String, required: true },
        nameEn: { type: String, required: true },
        yearsExperience: { type: String, required: true },
        clientsCount: { type: String, required: true },
        projectsCount: { type: String, required: true },
        satisfiedClientsCount: { type: String, required: true },
        successPercentage: { type: String, required: true },
        valuesAr: { type: [String], default: [] },
        valuesEn: { type: [String], default: [] },
        ourSeenAr: { type: String, required: true },
        ourSeenEn: { type: String, required: true },
        telephone: { type: String, required: true },
        email: { type: String, required: true },
        addressAr: { type: String, required: true },
        addressEn: { type: String, required: true },
        addressUrl: { type: String, required: true },
        logo: { type: String, required: true },
    },
    { timestamps: true }
);

export default mongoose.model<ICompanySettings>('CompanySettings', CompanySettingsSchema);
