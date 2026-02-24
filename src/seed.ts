import mongoose from 'mongoose';
import config from './config';
import { connectDB } from './config/db';
import User from './models/User';
import Project from './models/Project';
import ProjectCategory from './models/ProjectCategory';
import Service from './models/Service';
import Partner from './models/Partner';
import Department from './models/Department';
import SiteSettings from './models/SiteSettings';
import ContactMessage from './models/ContactMessage';
import Employee from './models/Employee';
import Media from './models/Media';
import CompanySettings from './models/CompanySettings';

// Project Categories - Updated for new schema
const categoriesData = [
    {
        titleAr: 'المشاريع السكنية',
        titleEn: 'Residential Projects',
        descriptionAr: 'فلل فاخرة ومجمعات سكنية متكاملة بأعلى معايير الجودة',
        descriptionEn: 'Luxury villas and integrated residential complexes with highest quality standards',
        color: 'from-[#c5a572] to-[#a88b4d]',
        countAr: '150+',
        countEn: '150+',
    },
    {
        titleAr: 'المشاريع التجارية',
        titleEn: 'Commercial Projects',
        descriptionAr: 'مراكز تجارية ومباني إدارية مصممة لتعزيز بيئة الأعمال',
        descriptionEn: 'Commercial centers and office buildings designed to enhance business environment',
        color: 'from-[#1a1a1a] to-[#4a4a4a]',
        countAr: '80+',
        countEn: '80+',
    },
    {
        titleAr: 'المشاريع الصناعية',
        titleEn: 'Industrial Projects',
        descriptionAr: 'مصانع ومستودعات مجهزة بأحدث الانظمة الصناعية',
        descriptionEn: 'Factories and warehouses equipped with latest industrial systems',
        color: 'from-[#2c3e50] to-[#34495e]',
        countAr: '40+',
        countEn: '40+',
    },
    {
        titleAr: 'المرافق التعليمية',
        titleEn: 'Educational Facilities',
        descriptionAr: 'مدارس وجامعات بمعايير تعليمية عالمية وبيئة محفزة',
        descriptionEn: 'Schools and universities with global educational standards',
        color: 'from-[#27ae60] to-[#2ecc71]',
        countAr: '25+',
        countEn: '25+',
    },
];

// Partners Data
const partnersData = [
    { name: { ar: 'الشركة السعودية للكهرباء', en: 'Saudi Electricity Company' }, logo: 'https://via.placeholder.com/200x100?text=SEC' },
    { name: { ar: 'أرامكو السعودية', en: 'Saudi Aramco' }, logo: 'https://via.placeholder.com/200x100?text=Aramco' },
    { name: { ar: 'صندوق التنمية الصناعية', en: 'Industrial Development Fund' }, logo: 'https://via.placeholder.com/200x100?text=IDF' },
];

// Site Settings Data
const siteSettingsData = {
    companyName: { ar: 'شركة إبن الشيخ للمقاولات العامة', en: 'Ibn Al-Sheikh General Contracting' },
    address: {
        street: { ar: 'شارع الملك عبد العزيز، حي العليا', en: 'King Abdulaziz St, Al Olaya' },
        city: { ar: 'الرياض', en: 'Riyadh' },
        country: { ar: 'المملكة العربية السعودية', en: 'Saudi Arabia' },
    },
    contacts: [
        { label: { ar: 'الهاتف', en: 'Phone' }, value: '+966 50 000 0000', icon: 'Phone' },
        { label: { ar: 'البريد الإلكتروني', en: 'Email' }, value: 'info@ibnalshaekh.com', icon: 'Mail' },
    ],
    socialLinks: [
        { platform: 'facebook', label: { ar: 'فيسبوك', en: 'Facebook' }, url: 'https://www.facebook.com/iibnalshaikh', icon: 'Facebook' },
        { platform: 'twitter', label: { ar: 'تويتر', en: 'Twitter' }, url: 'https://twitter.com', icon: 'Twitter' },
        { platform: 'instagram', label: { ar: 'انستغرام', en: 'Instagram' }, url: 'https://instagram.com', icon: 'Instagram' },
        { platform: 'linkedin', label: { ar: 'لينكد إن', en: 'LinkedIn' }, url: 'https://linkedin.com', icon: 'Linkedin' },
    ],
    workingHours: [
        { days: { ar: 'الأحد - الخميس', en: 'Sun - Thu' }, hours: '8:00 AM - 6:00 PM' },
        { days: { ar: 'السبت', en: 'Sat' }, hours: '9:00 AM - 2:00 PM' },
    ],
    footerText: {
        ar: 'جميع الحقوق محفوظة © 2024 شركة إبن الشيخ للمقاولات العامة',
        en: 'All rights reserved © 2024 Ibn Al-Sheikh General Contracting',
    },
};
const servicesData = [
    {
        slug: 'construction',
        title: { ar: 'الأعمال الإنشائية', en: 'Construction Works' },
        shortDescription: { ar: 'تصميم وتنفيذ الأعمال الإنشائية بأعلى معايير الجودة', en: 'Design and execution of construction works with highest quality standards' },
        fullDescription: {
            ar: 'نقدم خدمات إنشائية متكاملة تبدأ من التخطيط والتصميم وصولاً إلى التنفيذ والتسليم النهائية...',
            en: 'We provide integrated construction services starting from planning and design to execution and final handover...',
        },
        icon: 'Building',
        features: [
            { ar: 'إدارة مشاريع احترافية', en: 'Professional Project Management' },
            { ar: 'فريق هندسي متخصص', en: 'Specialized Engineering Team' },
            { ar: 'التزام بالمواعيد', en: 'Commitment to Deadlines' },
        ],
        images: [
            'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
            'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
        ],
    },
    {
        slug: 'architecture',
        title: { ar: 'التصميم المعماري', en: 'Architectural Design' },
        shortDescription: { ar: 'تصاميم معمارية عصرية تراعي الهوية والوظيفة', en: 'Modern architectural designs considering identity and function' },
        fullDescription: { ar: 'نبتكر تصاميم معمارية فريدة تجمع بين الجمال والوظيفة...', en: 'We create unique architectural designs combining beauty and function...' },
        icon: 'PencilRuler',
        features: [
            { ar: 'تصاميم ثلاثية الابعاد', en: '3D Designs' },
            { ar: 'حلول مبتكرة', en: 'Innovative Solutions' },
        ],
        images: ['https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800'],
    },
];

// Sample Project Data - Updated for new schema
const projectsData = [
    {
        titleAr: 'فيلا سكنية فاخرة',
        titleEn: 'Luxury Residential Villa',
        locationAr: 'الرياض',
        locationEn: 'Riyadh',
        descriptionAr: 'تصميم معماري عصري فاخر مع مساحات واسعة',
        descriptionEn: 'Modern luxury architectural design with spacious areas',
        fullDescriptionAr: 'فيلا سكنية فاخرة تجمع بين الفخامة والراحة مع أحدث التقنيات',
        fullDescriptionEn: 'Luxury residential villa combining luxury and comfort with latest technology',
        durationAr: '12 شهر',
        durationEn: '12 Months',
        teamAr: '25 عضو',
        teamEn: '25 Members',
        area: '850 m²',
        status: 'Completed',
        techStack: ['3D Design', 'Thermal Insulation', 'Smart Home'],
        gallery: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        ],
        categoryId: '', // Will be populated with actual ID
    },
    {
        titleAr: 'برج الأعمال',
        titleEn: 'Business Tower',
        locationAr: 'جدة',
        locationEn: 'Jeddah',
        descriptionAr: 'برج مكتبي حديث في قلب المنطقة التجارية',
        descriptionEn: 'Modern office tower in the heart of commercial district',
        fullDescriptionAr: 'برج سكني تجاري متعدد الاستخدام بتصميم حديث',
        fullDescriptionEn: 'Multi-use residential commercial tower with modern design',
        durationAr: '18 شهر',
        durationEn: '18 Months',
        teamAr: '40 عضو',
        teamEn: '40 Members',
        area: '2500 m²',
        status: 'Under Construction',
        techStack: ['BIM Technology', 'Green Building', 'Modern Architecture'],
        gallery: [
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
        ],
        categoryId: '', // Will be populated with actual ID
    },
];

// Departments Data
const departmentsData = [
    {
        title: { ar: 'قسم الهندسة', en: 'Engineering Department' },
        icon: 'Hammer',
        subDepartments: [
            {
                title: { ar: 'الهندسة المدنية', en: 'Civil Engineering' },
                icon: 'Building',
                sections: [
                    { ar: 'التصميم الإنشائي', en: 'Structural Design' },
                    { ar: 'المراقبة الفنية', en: 'Technical Supervision' },
                ],
            },
            {
                title: { ar: 'الهندسة المعمارية', en: 'Architecture' },
                icon: 'PencilRuler',
                sections: [
                    { ar: 'التصميم المعماري', en: 'Architectural Design' },
                    { ar: 'التخطيط الحضري', en: 'Urban Planning' },
                ],
            },
        ],
        order: 1,
        isVisible: true,
    },
    {
        title: { ar: 'قسم المشاريع', en: 'Projects Department' },
        icon: 'Briefcase',
        subDepartments: [
            {
                title: { ar: 'إدارة المشاريع', en: 'Project Management' },
                icon: 'ClipboardList',
                sections: [
                    { ar: 'تخطيط المشاريع', en: 'Project Planning' },
                    { ar: 'متابعة المشاريع', en: 'Project Tracking' },
                ],
            },
        ],
        order: 2,
        isVisible: true,
    },
    {
        title: { ar: 'قسم الموارد البشرية', en: 'HR Department' },
        icon: 'Users',
        subDepartments: [
            {
                title: { ar: 'التوظيف والتطوير', en: 'Recruitment & Development' },
                icon: 'HeadsetIcon',
                sections: [
                    { ar: 'التوظيف', en: 'Recruitment' },
                    { ar: 'التدريب والتطوير', en: 'Training & Development' },
                ],
            },
        ],
        order: 3,
        isVisible: true,
    },
    {
        title: { ar: 'قسم المالية', en: 'Finance Department' },
        icon: 'DollarSign',
        subDepartments: [
            {
                title: { ar: 'المحاسبة', en: 'Accounting' },
                icon: 'Receipt',
                sections: [
                    { ar: 'الفواتير', en: 'Invoicing' },
                    { ar: 'التقارير المالية', en: 'Financial Reports' },
                ],
            },
        ],
        order: 4,
        isVisible: true,
    },
];

// Media Data
const mediaData = [
    {
        filename: 'project-001.jpg',
        originalName: 'Luxury Villa Construction',
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
        mimeType: 'image/jpeg',
        size: 245000,
        alt: 'صورة بناء فيلا سكنية فاخرة',
    },
    {
        filename: 'project-002.jpg',
        originalName: 'Business Tower',
        url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
        mimeType: 'image/jpeg',
        size: 318000,
        alt: 'صورة برج الأعمال',
    },
    {
        filename: 'office-workspace.jpg',
        originalName: 'Office Workspace',
        url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
        mimeType: 'image/jpeg',
        size: 267000,
        alt: 'مساحة العمل الحديثة',
    },
    {
        filename: 'team-meeting.jpg',
        originalName: 'Team Meeting',
        url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800',
        mimeType: 'image/jpeg',
        size: 287000,
        alt: 'اجتماع فريق العمل',
    },
    {
        filename: 'construction-site.jpg',
        originalName: 'Construction Site',
        url: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800',
        mimeType: 'image/jpeg',
        size: 302000,
        alt: 'موقع البناء',
    },
];

// Contact Messages Data
const contactMessagesData = [
    {
        name: 'أحمد محمد السعيد',
        email: 'ahmed@example.com',
        phone: '+966 50 123 4567',
        subject: 'استفسار عن مشروع سكني',
        message: 'أود الاستفسار عن إمكانية تنفيذ مشروع سكني بمواصفات معينة. يمكنكم التواصل معي في الوقت المناسب.',
        status: 'new',
    },
    {
        name: 'فاطمة علي العتيبي',
        email: 'fatima@company.com',
        phone: '+966 55 987 6543',
        subject: 'عرض سعر للمشاريع التجارية',
        message: 'نحتاج إلى عرض سعر شامل للمشاريع التجارية. يرجى إرسال التفاصيل والأسعار.',
        status: 'read',
    },
    {
        name: 'محمد عبدالرحمن الدوسري',
        email: 'mohammad@construction.com',
        phone: '+966 50 555 8888',
        subject: 'شكوى بخصوص جودة المواد',
        message: 'لدينا استفسارات حول جودة المواد المستخدمة في المشروع. نرجو التواصل العاجل.',
        status: 'replied',
    },
    {
        name: 'نور بنت سالم الحربي',
        email: 'noor@mail.com',
        phone: '+966 55 444 3333',
        subject: 'طلب معلومات عن الخدمات',
        message: 'أود معرفة المزيد عن خدمات التصميم المعماري والاستشارات الهندسية.',
        status: 'new',
    },
    {
        name: 'علي حسن الغامدي',
        email: 'ali.ghemadi@company.com',
        phone: '+966 50 777 9999',
        subject: 'تقييم المشاريع المنجزة',
        message: 'نشكركم على جودة العمل في المشروع. نتطلع للتعاون معكم في مشاريع مستقبلية.',
        status: 'replied',
    },
];

// Employees Data
const employeesData = [
    {
        firstName: 'محمد',
        lastName: 'الدوسري',
        phoneNumber: '+966 50 111 2222',
        employeeId: 'EMP001',
        position: 'engineer',
        department: 'قسم الهندسة',
        hireDate: new Date('2020-01-15'),
        ssn: '1234567890',
        dateOfBirth: new Date('1990-05-20'),
        address: 'الرياض، السعودية',
        emergencyContact: '+966 50 111 2223',
        skills: ['CAD', 'Structural Design', 'Site Supervision'],
        salary: 8500,
        isActive: true,
    },
    {
        firstName: 'فاطمة',
        lastName: 'العتيبي',
        phoneNumber: '+966 50 333 4444',
        employeeId: 'EMP002',
        position: 'engineer',
        department: 'قسم الهندسة',
        hireDate: new Date('2021-03-20'),
        ssn: '1234567891',
        dateOfBirth: new Date('1992-08-15'),
        address: 'جدة، السعودية',
        emergencyContact: '+966 50 333 4445',
        skills: ['Architectural Design', '3D Modeling', 'Urban Planning'],
        salary: 8000,
        isActive: true,
    },
    {
        firstName: 'عبدالرحمن',
        lastName: 'الحربي',
        phoneNumber: '+966 50 555 6666',
        employeeId: 'EMP003',
        position: 'supervisor',
        department: 'قسم المشاريع',
        hireDate: new Date('2019-06-10'),
        ssn: '1234567892',
        dateOfBirth: new Date('1988-12-30'),
        address: 'الدمام، السعودية',
        emergencyContact: '+966 50 555 6667',
        skills: ['Project Management', 'Team Leadership', 'Quality Control'],
        salary: 9500,
        isActive: true,
    },
    {
        firstName: 'نور',
        lastName: 'السعيد',
        phoneNumber: '+966 50 777 8888',
        employeeId: 'EMP004',
        position: 'technician',
        department: 'قسم المشاريع',
        hireDate: new Date('2022-01-05'),
        ssn: '1234567893',
        dateOfBirth: new Date('1995-03-10'),
        address: 'الخبر، السعودية',
        emergencyContact: '+966 50 777 8889',
        skills: ['Site Documentation', 'Schedule Management', 'Cost Control'],
        salary: 5500,
        isActive: true,
    },
    {
        firstName: 'سارة',
        lastName: 'الحربي',
        phoneNumber: '+966 50 999 1111',
        employeeId: 'EMP005',
        position: 'manager',
        department: 'قسم الموارد البشرية',
        hireDate: new Date('2018-09-01'),
        ssn: '1234567894',
        dateOfBirth: new Date('1987-07-22'),
        address: 'الرياض، السعودية',
        emergencyContact: '+966 50 999 1112',
        skills: ['HR Management', 'Recruitment', 'Training'],
        salary: 12000,
        isActive: true,
    },
    {
        firstName: 'خالد',
        lastName: 'العتيبي',
        phoneNumber: '+966 50 222 3333',
        employeeId: 'EMP006',
        position: 'supervisor',
        department: 'قسم المالية',
        hireDate: new Date('2020-11-15'),
        ssn: '1234567895',
        dateOfBirth: new Date('1991-04-18'),
        address: 'الرياض، السعودية',
        emergencyContact: '+966 50 222 3334',
        skills: ['Accounting', 'Financial Analysis', 'Auditing'],
        salary: 10000,
        isActive: true,
    },
];

async function seed() {
    try {
        await connectDB();

        console.log('🧹 Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Project.deleteMany({}),
            ProjectCategory.deleteMany({}),
            Service.deleteMany({}),
            Partner.deleteMany({}),
            Department.deleteMany({}),
            SiteSettings.deleteMany({}),
            ContactMessage.deleteMany({}),
            Employee.deleteMany({}),
            Media.deleteMany({}),
            CompanySettings.deleteMany({}),
        ]);

        console.log('👤 Creating admin user...');
        const adminUser = await User.create({
            userName: 'admin',
            email: 'admin@ibnalshaekh.com',
            passwordHash: 'Admin123!',
            role: 'admin',
        });

        console.log('📂 Seeding categories...');
        const categories = await ProjectCategory.insertMany(categoriesData);

        console.log('🏗️ Seeding projects...');
        // Update projects with actual category IDs
        const projectsWithCategoryIds = projectsData.map((proj) => ({
            ...proj,
            categoryId: categories[0]._id, // Assign residential category
        }));
        await Project.insertMany(projectsWithCategoryIds);

        console.log('🏢 Seeding company settings...');
        await CompanySettings.create({
            nameAr: 'شركة إبن الشيخ للمقاولات العامة',
            nameEn: 'Ibn Al-Sheikh General Contracting',
            yearsExperience: '25+',
            clientsCount: '500+',
            projectsCount: '100+',
            satisfiedClientsCount: '480+',
            successPercentage: '98%',
            valuesAr: ['الجودة', 'الالتزام', 'الابتكار'],
            valuesEn: ['Quality', 'Commitment', 'Innovation'],
            ourSeenAr: 'أن نكون الخيار الأول في قطاع المقاولات',
            ourSeenEn: 'To be the first choice in contracting',
            telephone: '+966 50 000 0000',
            email: 'info@ibnalshaekh.com',
            addressAr: 'شارع الملك عبد العزيز، الرياض',
            addressEn: 'King Abdulaziz St, Riyadh',
            addressUrl: 'https://maps.app.goo.gl/example',
            logo: 'https://via.placeholder.com/200x100?text=Logo',
        });

        console.log('⚙️ Seeding site settings...');
        await SiteSettings.create(siteSettingsData);

        console.log('🤝 Seeding partners...');
        await Partner.insertMany(partnersData);

        console.log('🛠️ Seeding services...');
        await Service.insertMany(servicesData);

        console.log('🏢 Seeding departments...');
        await Department.insertMany(departmentsData);

        console.log('📁 Seeding media...');
        await Media.insertMany(mediaData);

        console.log('💬 Seeding contact messages...');
        await ContactMessage.insertMany(contactMessagesData);

        console.log('👥 Creating employee users...');
        for (const employeeData of employeesData) {
            // Create user for each employee
            const user = await User.create({
                userName: `emp_${employeeData.employeeId.toLowerCase()}`,
                email: `${employeeData.employeeId.toLowerCase()}@ibnalshaekh.com`,
                passwordHash: 'Employee123!',
                role: 'user',
            });

            // Create employee profile
            await Employee.create({
                ...employeeData,
                user: user._id,
            });
        }

        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
