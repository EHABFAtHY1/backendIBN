import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole = 'admin' | 'user';

export interface IUser extends Document {
    _id: mongoose.Types.ObjectId;
    userName: string;
    email?: string;
    passwordHash: string;
    role: UserRole;
    tel?: string;
    photo?: string;
    yearsOfExp?: number;
    descriptionAr?: string;
    descriptionEn?: string;
    createdAt: Date;
    updatedAt: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
    {
        userName: { type: String, required: true },
        email: { type: String, unique: true, sparse: true, lowercase: true },
        passwordHash: { type: String, required: true, select: false },
        role: {
            type: String,
            enum: ['admin', 'user'],
            default: 'user',
        },
        tel: { type: String },
        photo: { type: String },
        yearsOfExp: { type: Number },
        descriptionAr: { type: String },
        descriptionEn: { type: String },
    },
    { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('passwordHash')) return next();
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
    next();
});

// Compare password method
UserSchema.methods.comparePassword = async function (
    candidatePassword: string
): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.passwordHash);
};

export default mongoose.model<IUser>('User', UserSchema);
