import { connectDB } from './config/db';
import User from './models/User';
import Project from './models/Project';
import ProjectCategory from './models/ProjectCategory';
import Service from './models/Service';
import Partner from './models/Partner';
import Department from './models/Department';
import Section from './models/Section';
import QualityStandard from './models/QualityStandard';
import SiteSettings from './models/SiteSettings';
import ContactMessage from './models/ContactMessage';
import Employee from './models/Employee';
import Media from './models/Media';
import CompanySettings from './models/CompanySettings';

async function clearSeed() {
    try {
        await connectDB();

        console.log('Clearing seeded collections...');
        await Promise.all([
            User.deleteMany({}),
            Project.deleteMany({}),
            ProjectCategory.deleteMany({}),
            Service.deleteMany({}),
            Partner.deleteMany({}),
            Department.deleteMany({}),
            Section.deleteMany({}),
            QualityStandard.deleteMany({}),
            SiteSettings.deleteMany({}),
            ContactMessage.deleteMany({}),
            Employee.deleteMany({}),
            Media.deleteMany({}),
            CompanySettings.deleteMany({}),
        ]);

        console.log('Seeded collections cleared successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to clear seeded collections:', error);
        process.exit(1);
    }
}

clearSeed();
