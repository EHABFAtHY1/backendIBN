# Swagger Documentation Setup Guide

## ✅ تم الانجاز

تم إعداد توثيق API كامل باستخدام **swagger-autogen** و **swagger-ui-express**.

---

## 📋 الملفات المُنشأة/المُحدثة

### 1. **swagger.js** (ملف الإعدادات الرئيسي)
```
Location: /backend/swagger.js
```
- يحتوي على إعدادات swagger-autogen
- يُحدّد مسارات endpoints الـ API
- يُنشئ ملف `swagger-output.json` تلقائياً

### 2. **swagger-output.json** (الملف المُنشأ تلقائياً)
```
Location: /backend/src/swagger-output.json
```
- يتم توليده تلقائياً عند تشغيل `npm run docs`
- يحتوي على كل التفاصيل الخاصة بـ API

### 3. **app.ts** (تم التحديث)
```typescript
import swaggerFile from './swagger-output.json';
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
```

### 4. **package.json** (تم إضافة Script)
```json
"docs": "node swagger.js"
```

---

## 🚀 كيفية الاستخدام

### أولاً: تشغيل Backend
```bash
cd backend
npm run dev
```

### ثانياً: الوصول للتوثيق
🌐 افتح في المتصفح:
```
http://localhost:5000/api-docs
```

### ثالثاً: تحديث التوثيق
عندما تضيف Endpoints جديدة:

```bash
# أضف JSDoc comments في route files
npm run docs
```

---

## 📝 مثال - إضافة JSDoc Comments

تم إضافة مثال في [authRoutes.ts](authRoutes.ts):

```typescript
/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login user
 *     description: Login with email and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
router.post('/login', login);
```

---

## 🔄 العملية التفصيلية

### الخطوة 1️⃣: تثبيت المكتبات
✅ تم تثبيت:
- `swagger-autogen` - لتوليد التوثيق
- `swagger-ui-express` - لعرض الـ UI

### الخطوة 2️⃣: إنشاء swagger.js
✅ تم إنشاء ملف الإعدادات الذي يحتوي على:
- معلومات الـ API (title, version, description)
- عنوان السيرفر (localhost:5000)
- مسارات الـ endpoints

### الخطوة 3️⃣: تحديث app.ts
✅ تم إضافة middleware:
```typescript
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));
```

### الخطوة 4️⃣: توليد التوثيق
✅ تم تشغيل:
```bash
npm run docs
```

---

## 📚 الملفات المؤثرة

يتم قراءة endpoints من هذه الملفات:
```
✅ /src/routes/authRoutes.ts
✅ /src/routes/userRoutes.ts
✅ /src/routes/projectRoutes.ts
✅ /src/routes/serviceRoutes.ts
✅ /src/routes/departmentRoutes.ts
✅ /src/routes/partnerRoutes.ts
✅ /src/routes/mediaRoutes.ts
✅ /src/routes/projectCategoryRoutes.ts
✅ /src/routes/settingsRoutes.ts
```

---

## ⚡ أوامر مفيدة

```bash
# توليد التوثيق
npm run docs

# تشغيل التطبيق
npm run dev

# بناء للإنتاج
npm run build

# تشغيل البناء
npm start
```

---

## 🎯 الخطوات التالية

لتحسين التوثيق بشكل أفضل، أضف JSDoc comments في:

1. ✅ **authRoutes.ts** - تم إضافة المثال بالفعل
2. **userRoutes.ts** - أضف comments للـ user endpoints
3. **projectRoutes.ts** - أضف comments للـ project endpoints
4. **serviceRoutes.ts** - أضف comments للـ service endpoints
5. وغيرها...

مثال نمط:
```typescript
/**
 * @swagger
 * /path:
 *   method:
 *     tags:
 *       - TagName
 *     summary: Brief summary
 *     description: Detailed description
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: {...}
 *     responses:
 *       200:
 *         description: Success message
 */
```

---

## ✨ المميزات

- ✅ توثيق تلقائي من الـ code
- ✅ واجهة رسومية سهلة الاستخدام
- ✅ اختبار الـ endpoints مباشرة
- ✅ دعم JWT Bearer token
- ✅ تحديث تلقائي عند تشغيل `npm run docs`

---

## 📞 الدعم

في حالة الأسئلة:
1. تأكد من تشغيل `npm run docs` بعد إضافة endpoints جديدة
2. تأكد من أن السيرفر يعمل على PORT 5000
3. افتح `http://localhost:5000/api-docs` في المتصفح
