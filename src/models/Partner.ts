import mongoose, { Schema, Document } from 'mongoose';

export interface IPartner extends Document {
    name: { ar: string; en: string };
    logo: string;
    order: number;
    isVisible: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const PartnerSchema = new Schema<IPartner>(
    {
        name: {
            type: { ar: { type: String, default: '' }, en: { type: String, default: '' } },
            default: () => ({ ar: '', en: '' }),
        },
        logo: { type: String, required: true },
        order: { type: Number, default: 0 },
        isVisible: { type: Boolean, default: true },
    },
    { timestamps: true }
);

export default mongoose.model<IPartner>('Partner', PartnerSchema);
