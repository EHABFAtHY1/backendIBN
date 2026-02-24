# شرح تفصيلي - نظام RBAC والـ Testing

## 📋 جدول المحتويات

1. [مقدمة عن RBAC](#مقدمة-عن-rbac)
2. [شرح الأدوار](#شرح-الأدوار)
3. [كيفية عمل النظام](#كيفية-عمل-النظام)
4. [Unit Tests الشرح](#unit-tests-الشرح)
5. [Integration Tests الشرح](#integration-tests-الشرح)
6. [أمثلة عملية](#أمثلة-عملية)

---

## مقدمة عن RBAC

### ما هو RBAC؟

**RBAC** = **Role-Based Access Control**

نظام للتحكم في صلاحيات المستخدمين بناءً على **الدور** الذي يملكونه في النظام.

### الفكرة الأساسية

بدلاً من إعطاء صلاحيات لكل مستخدم بشكل فردي، نعطي صلاحيات لـ **الأدوار**، ثم نسند الأدوار للمستخدمين.

```
User → Role → Permissions

مثال:
Ahmed (User) → Admin (Role) → Create, Read, Update, Delete (Permissions)
Fatima (User) → Employee (Role) → Read Only (Permissions)
```

---

## شرح الأدوار

### 1. الدور: Admin (مسؤول النظام)

#### الصلاحيات:
```typescript
const adminPermissions = {
  createEmployee: true,      // إنشاء موظفين
  viewAll: true,             // عرض جميع الموظفين
  viewPersonalData: true,    // عرض البيانات الشخصية
  updateEmployee: true,      // تعديل موظفين
  deleteEmployee: true,      // حذف موظفين
  assignProjects: true,      // إسناد مشاريع
};
```

#### أمثلة من الـ API:

```bash
# ✅ Admin يمكنه إنشاء موظف
POST /api/employees
Header: Authorization: Bearer ADMIN_TOKEN

# ✅ Admin يمكنه عرض جميع الموظفين مع البيانات الشخصية
GET /api/employees
Header: Authorization: Bearer ADMIN_TOKEN

# ✅ Admin يمكنه تعديل أي موظف
PUT /api/employees/emp123
Header: Authorization: Bearer ADMIN_TOKEN

# ✅ Admin يمكنه حذف أي موظف
DELETE /api/employees/emp123
Header: Authorization: Bearer ADMIN_TOKEN
```

### 2. الدور: Employee (موظف)

#### الصلاحيات:
```typescript
const employeePermissions = {
  createEmployee: false,     // ❌ لا يمكنه إنشاء
  viewAll: false,            // ❌ لا يمكنه عرض الكل
  viewOwnData: true,         // ✅ يمكنه عرض بيانته فقط
  viewPersonalData: true,    // ✅ يمكنه عرض بيانته الشخصية
  updateEmployee: false,     // ❌ لا يمكنه تعديل
  deleteEmployee: false,     // ❌ لا يمكنه حذف
  assignProjects: false,     // ❌ لا يمكنه إسناد
};
```

#### أمثلة من الـ API:

```bash
# ✅ Employee يمكنه عرض بيانته الشخصية
GET /api/employees/me
Header: Authorization: Bearer EMPLOYEE_TOKEN

# ✅ Employee يمكنه عرض دليل الموظفين (بدون بيانات شخصية)
GET /api/employees/directory
Header: Authorization: Bearer EMPLOYEE_TOKEN

# ❌ Employee لا يمكنه إنشاء موظف
POST /api/employees
Header: Authorization: Bearer EMPLOYEE_TOKEN
Response: 403 Forbidden

# ❌ Employee لا يمكنه تعديل أي موظف
PUT /api/employees/other-emp
Header: Authorization: Bearer EMPLOYEE_TOKEN
Response: 403 Forbidden
```

### 3. الدور: Viewer (مشاهد)

#### الصلاحيات:
```typescript
const viewerPermissions = {
  viewDirectory: true,       // ✅ عرض دليل الموظفين (بيانات عامة)
  viewPublicData: true,      // ✅ عرض بيانات عامة
  viewPersonalData: false,   // ❌ لا يمكنه عرض البيانات الشخصية
  anyModification: false,    // ❌ لا يمكنه أي تعديل
};
```

### 4. الدور: Guest (زائر - بدون حساب)

#### الصلاحيات:
```typescript
const guestPermissions = {
  viewPublicDirectory: true,  // ✅ عرض دليل عام
  login: false,               // ❌ لا يمكنه تسجيل دخول
  selfRegister: false,        // ❌ لا يمكنه إنشاء حساب
  viewAnyData: false,         // ❌ لا يمكنه عرض بيانات شخصية
};
```

---

## كيفية عمل النظام

### المرحلة 1: Authentication (المصادقة)

```
Step 1: المستخدم يُدخل البريد والكلمة
        ↓
Step 2: النظام يتحقق من وجود البريد في Database
        ↓
Step 3: النظام يقارن الكلمة (مشفرة)
        ↓
Step 4: إذا صحيح، ينشئ JWT Token
        ↓
Step 5: المستخدم يحصل على Token
```

#### مثال الكود:

```typescript
// src/middleware/auth.ts
export async function authenticate(req, res, next) {
    // 1. استخرج Token من Header
    const authHeader = req.headers.authorization;
    // Expected: "Bearer eyJ..."
    
    // 2. استخرج الـ Token الفعلي
    const token = authHeader.split(' ')[1];
    
    // 3. تحقق من صحة التوقيع
    const decoded = jwt.verify(token, config.jwtSecret);
    // decoded = { id: "user123", iat: ..., exp: ... }
    
    // 4. اجلب المستخدم من Database
    const user = await User.findById(decoded.id);
    
    // 5. أضفه إلى Request
    req.user = user;
    
    // 6. انتقل للـ Handler التالي
    next();
}
```

### المرحلة 2: Authorization (التفويض)

```
Step 1: المستخدم لديه Token (مصرح)
        ↓
Step 2: يطلب endpoint معين (مثل: POST /employees)
        ↓
Step 3: النظام يتحقق: هل لديه الصلاحية المطلوبة؟
        ↓
Step 4: إذا نعم → تنفيذ الـ Action
        إذا لا → رفع 403 Forbidden
```

#### مثال الكود:

```typescript
// src/middleware/auth.ts
export function requireRole(...roles) {
    return (req, res, next) => {
        // 1. تحقق: هل المستخدم موجود؟
        if (!req.user) {
            return next(new AppError('Not authenticated', 401));
        }
        
        // 2. تحقق: هل دور المستخدم في القائمة المسموحة؟
        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    `Access denied. Required role: ${roles.join(' or ')}.`,
                    403
                )
            );
        }
        
        // 3. هو مصرح، انتقل للـ Handler
        next();
    };
}
```

### مثال من الـ Routes:

```typescript
// src/routes/employeeRoutes.ts

// ✅ Endpoint عام (بدون حاجة auth)
router.get('/directory', getEmployeeDirectory);

// 🔐 Endpoint محمي (يحتاج auth وأي دور)
router.get('/me', authenticate, getMyProfile);

// 👨‍💼 Endpoint خاص بـ Admin فقط
router.post('/', authenticate, requireRole('admin'), createEmployee);
router.put('/:id', authenticate, requireRole('admin'), updateEmployee);
router.delete('/:id', authenticate, requireRole('admin'), deleteEmployee);
```

---

## Unit Tests الشرح

### ما هي Unit Tests؟

اختبارات **الوحدة** = اختبار جزء صغير من الكود بشكل منعزل

```
مثال:
- اختبار دالة authenticate() بمفردها
- اختبار دالة requireRole() بمفردها
- لا نختبر Database أو HTTP requests
```

### الملف: `src/tests/unit/rbac.unit.test.ts`

#### Test 1: رفض الطلب بدون Token

```typescript
test('should reject request without token', async () => {
    // Setup
    const mockRequest = { headers: {} };
    const mockNext = jest.fn();
    
    // Execute
    await authenticate(mockRequest, {}, mockNext);
    
    // Verify
    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const error = mockNext.mock.calls[0][0];
    expect(error.statusCode).toBe(401);
});

// ماذا يحدث:
// 1. نمرر request بدون Authorization header
// 2. middleware يجب أن يرفع AppError مع رقم 401
// 3. نتحقق من أن الخطأ تم رفعه بشكل صحيح
```

#### Test 2: السماح بـ Admin

```typescript
test('should allow admin if user is admin', () => {
    // Setup
    const mockRequest = {
        user: {
            role: 'admin'
        }
    };
    const mockNext = jest.fn();
    
    // Execute
    const middleware = requireRole('admin');
    middleware(mockRequest, {}, mockNext);
    
    // Verify
    expect(mockNext).toHaveBeenCalledWith(); // No error
});

// ماذا يحدث:
// 1. نعطي middleware دور 'admin' المطلوب
// 2. نعطي request user بـ role = 'admin'
// 3. يجب أن يمرر بدون مشاكل (next() بدون args)
```

#### Test 3: رفض Employee من إنشاء

```typescript
test('should deny employee from creating', () => {
    // Setup
    const mockRequest = {
        user: {
            role: 'viewer'  // ← موظف عادي
        }
    };
    const mockNext = jest.fn();
    
    // Execute
    const middleware = requireRole('admin');
    middleware(mockRequest, {}, mockNext);
    
    // Verify
    expect(mockNext).toHaveBeenCalledWith(expect.any(AppError));
    const error = mockNext.mock.calls[0][0];
    expect(error.statusCode).toBe(403);
});

// ماذا يحدث:
// 1. الـ middleware يطلب دور 'admin'
// 2. الـ user لديه دور 'viewer'
// 3. يرفع AppError مع 403 Forbidden
```

### فائدة Unit Tests:

✅ اختبر كل دالة بسرعة  
✅ لا تحتاج Database  
✅ سهل التصحيح لو فشلت  
✅ توثيق للـ Code  

---

## Integration Tests الشرح

### ما هي Integration Tests؟

اختبارات **التكامل** = اختبار الـ API كاملة مع Database

```
مثال:
- اختبر الطلب HTTP من البداية للنهاية
- استخدم Database حقيقية (أو test database)
- اختبر جميع الطبقات معاً
```

### الملف: `src/tests/integration/rbac.integration.test.ts`

#### Test 1: Admin يمكنه إنشاء موظف

```typescript
test('admin can create employee', async () => {
    // 1. الـ Setup: لدينا admin token
    const adminToken = '...';
    
    // 2. الـ Request: POST مع admin token
    const res = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
            firstName: 'Ahmed',
            email: 'ahmed@example.com',
            password: 'Ahmed123!',
            // ... باقي البيانات
        });
    
    // 3. الـ Assertion: نتحقق من النجاح
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.firstName).toBe('Ahmed');
});

// ماذا يحدث في الخلفية:
// 1. Express يستقبل POST request
// 2. Middleware auth يتحقق من Token
// 3. Middleware requireRole يتحقق: هل Admin؟
// 4. Controller createEmployee ينفذ
// 5. Database تحفظ الموظف
// 6. Response مع 201 يعود للـ Test
```

#### Test 2: Employee لا يمكنه إنشاء

```typescript
test('employee CANNOT create employee', async () => {
    // 1. لدينا employee token (ليس admin)
    const employeeToken = '...';
    
    // 2. محاولة إنشاء موظف
    const res = await request(app)
        .post('/api/employees')
        .set('Authorization', `Bearer ${employeeToken}`)
        .send({/* ... */});
    
    // 3. التحقق: يجب أن يرفع 403
    expect(res.status).toBe(403);
    expect(res.body.error).toContain('Access denied');
});

// ماذا يحدث في الخلفية:
// 1. Express يستقبل POST request
// 2. Middleware auth يتحقق من Token ✅
// 3. Middleware requireRole يتحقق: هل Admin؟ ❌
// 4. middleware يرفع 403 Forbidden
// 5. Response مع 403 يعود للـ Test
```

#### Test 3: Guest يمكنه عرض الدليل (بدون حساب)

```typescript
test('guest can view directory without auth', async () => {
    // 1. NO token
    
    // 2. طلب دليل الموظفين
    const res = await request(app)
        .get('/api/employees/directory');
    
    // 3. يجب أن ينجح
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
    
    // 4. التحقق: بيانات عامة فقط
    const employee = res.body.data[0];
    expect(employee.firstName).toBeDefined(); // ✅ عام
    expect(employee.salary).toBeUndefined();  // ❌ شخصي
});
```

### فائدة Integration Tests:

✅ اختبر الـ API كاملة  
✅ تأكد من تعاون جميع الأجزاء  
✅ اختبر مع Database حقيقية  
✅ اختبر HTTP status codes  

---

## أمثلة عملية

### مثال 1: Admin ينشئ موظف

```bash
# Step 1: Admin يسجل دخول
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin123!"
  }'

# Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "admin_id_123",
      "role": "admin"
    }
  }
}

# Step 2: Admin ينشئ موظف جديد
curl -X POST http://localhost:5000/api/employees \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Ahmed",
    "lastName": "Ali",
    "email": "ahmed@example.com",
    "password": "Ahmed123!",
    "phoneNumber": "0501234567",
    "employeeId": "EMP001",
    "position": "engineer",
    "department": "Construction",
    "hireDate": "2024-01-15",
    "salary": 5000,
    "ssn": "123456789"
  }'

# Response:
{
  "success": true,
  "data": {
    "_id": "emp_id_456",
    "firstName": "Ahmed",
    "email": "ahmed@example.com",
    "role": "viewer"  // ← موظف جديد دوره viewer
  }
}
```

### مثال 2: Employee يعرض ملفه

```bash
# Step 1: Employee يسجل دخول
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ahmed@example.com",
    "password": "Ahmed123!"
  }'

# Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "emp_id_456",
      "role": "viewer"
    }
  }
}

# Step 2: Employee يعرض ملفه الشخصي
curl -X GET http://localhost:5000/api/employees/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Response:
{
  "success": true,
  "data": {
    "_id": "emp_id_456",
    "firstName": "Ahmed",
    "lastName": "Ali",
    "position": "engineer",
    "department": "Construction",
    "phoneNumber": "0501234567",
    
    # بيانات شخصية (مرئية للموظف)
    "salary": 5000,
    "ssn": "123456789",
    "address": "Riyadh",
    "emergencyContact": "0505555556"
  }
}

# Step 3: Employee محاولة إنشاء موظف (FAILS)
curl -X POST http://localhost:5000/api/employees \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Unauthorized",
    "email": "unauthorized@example.com",
    "password": "Pass123!",
    // ...
  }'

# Response:
{
  "success": false,
  "error": "Access denied. Required role: admin."
}
```

### مثال 3: Guest يعرض دليل (بدون حساب)

```bash
# بدون Token
curl -X GET http://localhost:5000/api/employees/directory

# Response:
{
  "success": true,
  "data": [
    {
      "_id": "emp_id_456",
      "firstName": "Ahmed",
      "lastName": "Ali",
      "position": "engineer",
      "department": "Construction",
      "phoneNumber": "0501234567",
      "skills": ["AutoCAD"],
      
      # ملاحظة: لا يوجد salary, ssn, address
    }
  ],
  "count": 1
}
```

---

## 🧪 تشغيل الـ Tests

```bash
# تثبيت Jest
npm install --save-dev jest @types/jest ts-jest

# تشغيل جميع Tests
npm test

# تشغيل RBAC Tests فقط
npm test -- rbac

# تشغيل مع Coverage
npm test -- --coverage

# تشغيل في Watch Mode (لـ Development)
npm test -- --watch
```

---

## 📝 ملخص النقاط المهمة

### 1. Authentication vs Authorization

| النوع | التعريف | المثال |
|-------|----------|--------|
| **Authentication** | التحقق من **من أنت؟** | التحقق من البريد والكلمة |
| **Authorization** | التحقق من **ماذا تستطيع؟** | التحقق من الصلاحيات |

### 2. الأدوار وصلاحياتها

| الدور | Login | Create | Read | Update | Delete |
|------|-------|--------|------|--------|--------|
| Admin | ✅ | ✅ | ✅ | ✅ | ✅ |
| Employee | ✅ | ❌ | ✅ (Own) | ❌ | ❌ |
| Viewer | ❌ | ❌ | ✅ (Public) | ❌ | ❌ |
| Guest | ❌ | ❌ | ✅ (Public) | ❌ | ❌ |

### 3. الأخطاء الشائعة

❌ **خطأ**: تخزين كلمة المرور بدون تشفير
✅ **الحل**: استخدم bcryptjs

❌ **خطأ**: إرسال البيانات الشخصية لـ Guest
✅ **الحل**: استخدم `select: false`

❌ **خطأ**: عدم التحقق من Token validity
✅ **الحل**: استخدم `jwt.verify()`

---

**Version**: 1.0.0  
**Created**: February 17, 2026  
**Status**: Ready for Implementation
