import mongoose, { Schema, Document } from 'mongoose';

const bilingualField = {
    ar: { type: String, default: '' },
    en: { type: String, default: '' },
};

export interface ISiteSettings extends Document {
    companyName: { ar: string; en: string };
    logoLight: string;
    logoDark: string;
    address: {
        street: { ar: string; en: string };
        city: { ar: string; en: string };
        country: { ar: string; en: string };
    };
    contacts: {
        label: { ar: string; en: string };
        value: string;
        icon: string;
        link: string;
    }[];
    socialLinks: {
        platform: string;
        label: { ar: string; en: string };
        url: string;
        icon: string;
        color: string;
    }[];
    workingHours: {
        days: { ar: string; en: string };
        hours: string;
    }[];
    hero: {
        title: { ar: string; en: string };
        tagline: { ar: string; en: string };
        description: { ar: string; en: string };
        backgroundImage: string;
        stats: {
            value: string;
            label: { ar: string; en: string };
            icon: string;
        }[];
    };
    about: {
        title: { ar: string; en: string };
        description: { ar: string; en: string };
        vision: { ar: string; en: string };
        values: {
            title: { ar: string; en: string };
            description: { ar: string; en: string };
            icon: string;
        }[];
    };
    standards: {
        icon: string;
        title: { ar: string; en: string };
        description: { ar: string; en: string };
    }[];
    mapEmbedUrl: string;
    mapDirectionsUrl: string;
    footerText: { ar: string; en: string };
    updatedAt: Date;
}

const SiteSettingsSchema = new Schema<ISiteSettings>(
    {
        companyName: { type: bilingualField, default: () => ({ ar: 'شركة إبن الشيخ للمقاولات العامة', en: 'Ibn Al-Sheikh General Contracting' }) },
        logoLight: { type: String, default: '' },
        logoDark: { type: String, default: '' },
        address: {
            type: {
                street: bilingualField,
                city: bilingualField,
                country: bilingualField,
            },
            default: () => ({
                street: { ar: '', en: '' },
                city: { ar: '', en: '' },
                country: { ar: '', en: '' },
            }),
        },
        contacts: {
            type: [
                {
                    label: bilingualField,
                    value: { type: String, default: '' },
                    icon: { type: String, default: '' },
                    link: { type: String, default: '' },
                },
            ],
            default: [],
        },
        socialLinks: {
            type: [
                {
                    platform: { type: String, default: '' },
                    label: bilingualField,
                    url: { type: String, default: '' },
                    icon: { type: String, default: '' },
                    color: { type: String, default: '' },
                },
            ],
            default: [],
        },
        workingHours: {
            type: [
                {
                    days: bilingualField,
                    hours: { type: String, default: '' },
                },
            ],
            default: [],
        },
        hero: {
            type: {
                title: bilingualField,
                tagline: bilingualField,
                description: bilingualField,
                backgroundImage: { type: String, default: '' },
                stats: {
                    type: [
                        {
                            value: { type: String, default: '' },
                            label: bilingualField,
                            icon: { type: String, default: '' },
                        },
                    ],
                    default: [],
                },
            },
            default: () => ({
                title: { ar: '', en: '' },
                tagline: { ar: '', en: '' },
                description: { ar: '', en: '' },
                backgroundImage: '',
                stats: [],
            }),
        },
        about: {
            type: {
                title: bilingualField,
                description: bilingualField,
                vision: bilingualField,
                values: {
                    type: [
                        {
                            title: bilingualField,
                            description: bilingualField,
                            icon: { type: String, default: '' },
                        },
                    ],
                    default: [],
                },
            },
            default: () => ({
                title: { ar: '', en: '' },
                description: { ar: '', en: '' },
                vision: { ar: '', en: '' },
                values: [],
            }),
        },
        standards: {
            type: [
                {
                    icon: { type: String, default: '' },
                    title: bilingualField,
                    description: bilingualField,
                },
            ],
            default: [],
        },
        mapEmbedUrl: { type: String, default: '' },
        mapDirectionsUrl: { type: String, default: '' },
        footerText: { type: bilingualField, default: () => ({ ar: '', en: '' }) },
    },
    { timestamps: true }
);

export default mongoose.model<ISiteSettings>('SiteSettings', SiteSettingsSchema);
