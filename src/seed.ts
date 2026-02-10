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
    hero: {
        title: { ar: 'نبني المستقبل برؤية عصرية', en: 'Building the Future with Modern Vision' },
        tagline: { ar: 'شريكك الاستراتيجي في البناء والتشييد', en: 'Your Strategic Partner in Construction' },
        description: {
            ar: 'نقدم حلولاً إنشائية متكاملة تجمع بين الجودة والابتكار، مع التزامنا التام بالمواعيد والمعايير العالمية',
            en: 'We provide integrated construction solutions combining quality and innovation, with full commitment to deadlines and global standards',
        },
        stats: [
            { value: '٠٥+', label: { ar: 'سنوات الخبرة', en: 'Years Experience' }, icon: 'Award' },
            { value: '١٠٠+', label: { ar: 'مشروع منجز', en: 'Completed Projects' }, icon: 'Building2' },
            { value: '١٠٠+', label: { ar: 'عميل راضٍ', en: 'Happy Clients' }, icon: 'Users' },
            { value: '٩٨٪', label: { ar: 'نسبة النجاح', en: 'Success Rate' }, icon: 'TrendingUp' },
        ],
    },
    about: {
        title: { ar: 'عن الشركة', en: 'About Us' },
        description: {
            ar: 'تأسست شركة إبن الشيخ للمقاولات العامة لتكون رائدة في مجال البناء والتشييد في المملكة العربية السعودية.',
            en: 'Ibn Al-Sheikh General Contracting was established to be a leader in construction in Saudi Arabia.',
        },
        vision: {
            ar: 'أن نكون الخيار الأول في قطاع المقاولات من خلال تقديم خدمات متميزة ومبتكرة.',
            en: 'To be the first choice in the contracting sector by providing distinguished and innovative services.',
        },
        values: [
            {
                title: { ar: 'الجودة', en: 'Quality' },
                description: { ar: 'نلتزم بأعلى معايير الجودة في جميع أعمالنا', en: 'We commit to the highest quality standards in all our work' },
                icon: 'Award',
            },
            {
                title: { ar: 'الالتزام', en: 'Commitment' },
                description: { ar: 'نحترم المواعيد ونفي بوعودنا لعملائنا', en: 'We respect deadlines and keep promises to our clients' },
                icon: 'Clock',
            },
        ],
    },
    standards: [
        {
            title: { ar: 'فحص المواد', en: 'Material Testing' },
            description: { ar: 'فحص شامل ودقيق لجميع المواد المستخدمة', en: 'Comprehensive and accurate testing of all used materials' },
            icon: 'Search',
        },
    ],
    footerText: {
        ar: 'جميع الحقوق محفوظة © 2024 شركة إبن الشيخ للمقاولات العامة',
        en: 'All rights reserved © 2024 Ibn Al-Sheikh General Contracting',
    },
};

// Partners Data
const partnersData = [
    { name: { ar: 'الشركة السعودية للكهرباء', en: 'Saudi Electricity Company' }, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Saudi_Electricity_Company_Logo.svg/1200px-Saudi_Electricity_Company_Logo.svg.png' },
    { name: { ar: 'أرامكو السعودية', en: 'Saudi Aramco' }, logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/Saudi_Aramco_Logo.svg/1200px-Saudi_Aramco_Logo.svg.png' },
    // ... add more from frontend data if needed
];

// Project Categories
const categoriesData = [
    {
        slug: 'residential',
        title: { ar: 'المشاريع السكنية', en: 'Residential Projects' },
        description: { ar: 'فلل فاخرة ومجمعات سكنية متكاملة بأعلى معايير الجودة', en: 'Luxury villas and integrated residential complexes with highest quality standards' },
        color: 'from-[#c5a572] to-[#a88b4d]',
        icon: 'Home',
        count: '150+',
    },
    {
        slug: 'commercial',
        title: { ar: 'المشاريع التجارية', en: 'Commercial Projects' },
        description: { ar: 'مراكز تجارية ومباني إدارية مصممة لتعزيز بيئة الأعمال', en: 'Commercial centers and office buildings designed to enhance business environment' },
        color: 'from-[#1a1a1a] to-[#4a4a4a]',
        icon: 'Building2',
        count: '80+',
    },
    {
        slug: 'industrial',
        title: { ar: 'المشاريع الصناعية', en: 'Industrial Projects' },
        description: { ar: 'مصانع ومستودعات مجهزة بأحدث الانظمة الصناعية', en: 'Factories and warehouses equipped with latest industrial systems' },
        color: 'from-[#2c3e50] to-[#34495e]',
        icon: 'Factory',
        count: '40+',
    },
    {
        slug: 'educational',
        title: { ar: 'المرافق التعليمية', en: 'Educational Facilities' },
        description: { ar: 'مدارس وجامعات بمعايير تعليمية عالمية وبيئة محفزة', en: 'Schools and universities with global educational standards' },
        color: 'from-[#27ae60] to-[#2ecc71]',
        icon: 'GraduationCap',
        count: '25+',
    },
    {
        slug: 'medical',
        title: { ar: 'المنشآت الطبية', en: 'Medical Facilities' },
        description: { ar: 'مستشفيات ومراكز صحية مجهزة بأعلى مواصفات السلامة', en: 'Hospitals and health centers equipped with highest safety specs' },
        color: 'from-[#e74c3c] to-[#c0392b]',
        icon: 'HeartPulse',
        count: '20+',
    },
    {
        slug: 'mixed',
        title: { ar: 'مشاريع متعددة الاستخدام', en: 'Mixed-Use Projects' },
        description: { ar: 'مجمعات تجمع بين السكن والعمل والترفيه في مكان واحد', en: 'Complexes combining living, working, and entertainment' },
        color: 'from-[#8e44ad] to-[#9b59b6]',
        icon: 'LayoutGrid',
        count: '15+',
    },
];

// Services Data
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

// Sample Project Data (Residential)
const projectsData = [
    {
        category: 'residential',
        title: { ar: 'فيلا سكنية فاخرة', en: 'Luxury Residential Villa' },
        image: 'https://images.unsplash.com/photo-1706380469118-1e5c57701a05?w=1080',
        location: { ar: 'الرياض', en: 'Riyadh' },
        description: { ar: 'تصميم معماري عصري فاخر مع مساحات واسعة', en: 'Modern luxury architectural design with spacious areas' },
        fullDescription: { ar: 'فيلا سكنية فاخرة تجمع بين الفخامة والراحة...', en: 'Luxury residential villa combining luxury and comfort...' },
        techStack: [
            { ar: 'تصميم ثلاثي الأبعاد', en: '3D Design' },
            { ar: 'عزل حراري', en: 'Thermal Insulation' },
        ],
        status: { ar: 'مكتمل', en: 'Completed' },
        area: '850 m²',
        duration: '12 Months',
        team: '25 Members',
        gallery: [
            'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800',
        ],
        isWorking: false,
    },
    {
        category: 'commercial',
        title: { ar: 'برج الأعمال', en: 'Business Tower' },
        image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
        location: { ar: 'جدة', en: 'Jeddah' },
        description: { ar: 'برج مكتبي حديث في قلب المنطقة التجارية', en: 'Modern office tower in the heart of commercial district' },
        status: { ar: 'قيد التنفيذ', en: 'Under Construction' },
        isWorking: true,
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
        ]);

        console.log('👤 Creating admin user...');
        await User.create({
            name: 'Admin User',
            email: 'admin@ibnalshaekh.com',
            password: 'Admin123!',
            role: 'admin',
        });

        console.log('⚙️ Seeding site settings...');
        await SiteSettings.create(siteSettingsData);

        console.log('🤝 Seeding partners...');
        await Partner.insertMany(partnersData);

        console.log('📂 Seeding categories...');
        await ProjectCategory.insertMany(categoriesData);

        console.log('🛠️ Seeding services...');
        await Service.insertMany(servicesData);

        console.log('🏗️ Seeding projects...');
        await Project.insertMany(projectsData);

        // Clear existing contact messages
        await ContactMessage.deleteMany({});

        console.log('✅ Database seeded successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seed();
