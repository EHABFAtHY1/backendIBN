# 📋 الإصلاحات المطلوبة - تفاصيل كاملة

## 🔴 المشاكل الرئيسية (7 مشاكل)

### ❌ المشكلة 1: Database غير صحيح

**الخطأ الحالي:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**الإصلاح:**
```prisma
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

**السبب:** المشروع يستخدم MongoDB مع Mongoose، ليس PostgreSQL

---

### ❌ المشكلة 2: User Roles خطأ

**الخطأ الحالي:**
```prisma
enum Role {
  admin
  user
}
```

**الإصلاح:**
```prisma
enum UserRole {
  admin
  editor
  viewer
}
```

**السبب:** المشروع يستخدم 3 roles وليس اثنين فقط

---

### ❌ المشكلة 3: User Model غير مطابق

**الخطأ الحالي:**
```prisma
model User {
  id            String  @id
  userName      String
  email         String? @unique
  passwordHash  String
  role          Role    @default(user)
  tel           String?
  photo         String?
  yearsOfExp    Int?
  descriptionAr String? @db.Text
  descriptionEn String? @db.Text

  sessions Session[]

  @@map("users")
}
```

**الإصلاح:**
```prisma
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  email     String   @unique
  password  String
  role      UserRole @default(viewer)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("users")
}
```

**الفروقات:**
| الحقل | الخطأ | الصحيح | الملاحظة |
|------|------|--------|---------|
| `id` | String | ObjectId | MongoDB ID type |
| `userName` | موجود | ❌ حذف | غير مستخدم |
| `email` | String? | String | يجب أن يكون required |
| `passwordHash` | passwordHash | password | اسم الحقل الصحيح |
| `role` | admin/user | admin/editor/viewer | إضافة viewer |
| `tel` | tel | ❌ حذف | غير مستخدم |
| `photo` | photo | ❌ حذف | غير مستخدم |
| `yearsOfExp` | yearsOfExp | ❌ حذف | غير مستخدم |
| `description` | موجود | ❌ حذف | غير مستخدم |
| `timestamps` | ❌ موجود | ✅ موجود | يجب إضافتها |
| `sessions` | موجود | ❌ حذف | JWT لا يحتاج sessions |

---

### ❌ المشكلة 4: Session Model غير ضروري

**الخطأ الحالي:**
```prisma
model Session {
  id        String   @id
  userId    String
  expiresAt DateTime
  user      User     @relation(references: [id], fields: [userId], onDelete: Cascade)

  @@map("sessions")
}
```

**الإصلاح:** ✅ احذف هذا الـ Model بالكامل

**السبب:** المشروع يستخدم JWT tokens، لا يحتاج database sessions

---

### ❌ المشكلة 5: Project Model غير مطابق

**الخطأ الحالي:**
```prisma
model Project {
  // ...
  durationAr String
  durationEn String

  teamAr String
  teamEn String
  // ...
}
```

**الإصلاح:**
```prisma
model Project {
  // ...
  duration String?
  team     String?
  // ...
}
```

**السبب:** Duration و Team يجب أن تكون حقول واحدة، ليست bilingual

---

### ❌ المشكلة 6: CompanySettings vs SiteSettings

**الخطأ الحالي:**
```prisma
model CompanySettings {
  id String @id @default(cuid())

  nameAr String
  nameEn String

  yearsExperience       String
  clientsCount          String
  projectsCount         String
  satisfiedClientsCount String
  successPercentage     String

  valuesAr String[]
  valuesEn String[]

  ourSeenAr String
  ourSeenEn String

  telephone  String
  email      String
  addressAr  String
  addressEn  String
  addressUrl String

  logo String
  // ...
}
```

**الإصلاح:**
```prisma
model SiteSettings {
  id String @id @default(auto()) @map("_id") @db.ObjectId

  companyName      BilingualField
  logoLight        String?
  logoDark         String?

  address          Address?
  contacts         Contact[]
  socialLinks      SocialLink[]
  workingHours     WorkingHours[]

  hero             HeroSection?
  about            AboutSection?
  standards        Standard[]

  mapEmbedUrl      String?
  mapDirectionsUrl String?
  footerText       BilingualField

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("site_settings")
}
```

**الفروقات الرئيسية:**
- اسم الـ Model: CompanySettings → SiteSettings
- الحقول مختلفة تماماً
- استخدام embedded types بدلاً من حقول منفصلة

---

### ❌ المشكلة 7: 5 Models مفقودة

**الخطأ:** هذه الـ Models غير موجودة في Prisma Schema:

#### 1️⃣ Service Model
```prisma
model Service {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  
  slug                String   @unique
  title               BilingualField
  shortDescription    BilingualField
  fullDescription     BilingualField
  icon                String?
  
  features            BilingualField[]
  benefits            ServiceBenefit[]
  process             ServiceProcess[]
  images              String[]
  
  stats               ServiceStats?
  
  order               Int      @default(0)
  isVisible           Boolean  @default(true)
  status              ServiceStatus @default(active)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("services")
}
```

#### 2️⃣ Partner Model
```prisma
model Partner {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  
  name        BilingualField
  logo        String
  
  order       Int      @default(0)
  isVisible   Boolean  @default(true)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("partners")
}
```

#### 3️⃣ Department Model
```prisma
model Department {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  
  title                BilingualField
  icon                 String?
  subDepartments       SubDepartment[]
  
  order                Int @default(0)
  isVisible            Boolean @default(true)
  status               DepartmentStatus @default(active)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("departments")
}
```

#### 4️⃣ ContactMessage Model
```prisma
model ContactMessage {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  
  name      String
  email     String
  phone     String
  subject   String
  message   String
  
  status    ContactMessageStatus @default(new)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("contact_messages")
}
```

#### 5️⃣ Media Model
```prisma
model Media {
  id String @id @default(auto()) @map("_id") @db.ObjectId
  
  filename      String
  originalName  String
  mimetype      String
  size          Int
  path          String
  
  uploadedBy    String?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@map("media")
}
```

---

## 📝 الخطوات التفصيلية للإصلاح

### ✅ الخطوة 1: استبدال Datasource
```bash
# انتقل إلى schema.prisma
# ابحث عن:
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

# استبدل ب:
datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```

### ✅ الخطوة 2: تحديث Enums
```prisma
# احذف:
enum Role {
  admin
  user
}

# استبدل ب:
enum UserRole {
  admin
  editor
  viewer
}

enum ServiceStatus {
  active
  inactive
}

enum DepartmentStatus {
  active
  inactive
}

enum ContactMessageStatus {
  new
  read
  replied
}

enum ProjectStatus {
  planned
  ongoing
  completed
}
```

### ✅ الخطوة 3: حذف User Relations
```bash
# احذف من User model:
sessions Session[]

# احذف كل model Session بالكامل
```

### ✅ الخطوة 4: تحديث User Model
```bash
# انظر التفاصيل أعلاه في المشكلة 3
```

### ✅ الخطوة 5: إضافة 5 Models المفقودة
```bash
# انظر التفاصيل أعلاه في المشكلة 7
```

---

## 🎯 ملف schema.prisma الصحيح

انظر ملف `schema_corrected.prisma` للـ Schema الكامل الصحيح

---

## ⏱️ الوقت المتوقع

```
تحديث Datasource:        5 دقائق
تحديث Enums:             5 دقائق
حذف Sessions:            2 دقيقة
تحديث User:              5 دقائق
إضافة 5 Models:          15 دقيقة
Embedded Types:          10 دقائق
Testing:                 10 دقائق
─────────────────────────────────
المجموع:                 52 دقيقة
```

---

## ✨ الفوائد بعد الإصلاح

```
✅ Schema يطابق التطبيق الفعلي
✅ توثيق دقيق للـ Database
✅ إمكانية استخدام Prisma Client
✅ أفضل Type Safety
✅ توثيق أتوماتي
✅ سهولة الـ Migrations
```

---

## 🚀 التالي بعد الإصلاح

```bash
# 1. تحديث schema.prisma
# 2. تشغيل:
npm install @prisma/client
npx prisma generate

# 3. اختياري - استخدام Prisma Client:
# إعادة كتابة Controllers لاستخدام Prisma بدلاً من Mongoose
```
