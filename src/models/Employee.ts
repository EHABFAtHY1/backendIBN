import mongoose, { Schema, Document } from 'mongoose';

export type EmployeeRole = 'engineer' | 'technician' | 'supervisor' | 'manager';

export interface IEmployee extends Document {
    // Basic Info
    user: mongoose.Types.ObjectId; // Reference to User
    firstName: string;
    lastName: string;
    phoneNumber: string;

    // Employment Info
    employeeId: string; // Unique employee ID
    position: EmployeeRole;
    department: string;
    hireDate: Date;

    // Personal Info (Only viewable by self and admin)
    ssn?: string; // Social Security Number (encrypted)
    dateOfBirth?: Date;
    address?: string;
    emergencyContact?: string;

    // Work Info
    projects: mongoose.Types.ObjectId[]; // Array of project references
    skills?: string[];
    salary?: number; // Only viewable by self and admin

    // Status
    isActive: boolean;
    joinDate: Date;

    createdAt: Date;
    updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            unique: true,
        },
        firstName: {
            type: String,
            required: true,
        },
        lastName: {
            type: String,
            required: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        employeeId: {
            type: String,
            required: true,
            unique: true,
        },
        position: {
            type: String,
            enum: ['engineer', 'technician', 'supervisor', 'manager'],
            required: true,
        },
        department: {
            type: String,
            required: true,
        },
        hireDate: {
            type: Date,
            required: true,
        },
        ssn: {
            type: String,
            select: false, // Don't include by default
        },
        dateOfBirth: {
            type: Date,
            select: false,
        },
        address: {
            type: String,
            select: false,
        },
        emergencyContact: {
            type: String,
            select: false,
        },
        projects: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Project',
            },
        ],
        skills: [String],
        salary: {
            type: Number,
            select: false, // Don't include by default
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        joinDate: {
            type: Date,
            default: Date.now,
        },
    },
    { timestamps: true }
);

// Middleware to populate user data
EmployeeSchema.pre(/^find/, function (next) {
    (this as any).populate('user', 'name email');
    next();
});

export default mongoose.model<IEmployee>('Employee', EmployeeSchema);
