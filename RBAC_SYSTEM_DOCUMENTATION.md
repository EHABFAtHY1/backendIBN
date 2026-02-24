# Role-Based Access Control (RBAC) System

## 📋 تعريف الأدوار والصلاحيات

### 1️⃣ ADMIN (مسؤول النظام)

**الصلاحيات:**
- ✅ إنشاء حسابات موظفين جدد
- ✅ عرض جميع بيانات الموظفين (بيانات شخصية + مالية)
- ✅ تعديل بيانات أي موظف
- ✅ حذف حسابات الموظفين
- ✅ إسناد وتعديل المشاريع للموظفين
- ✅ عرض دليل الموظفين

**الـ Endpoints:**
```
POST   /api/employees                 → إنشاء موظف
GET    /api/employees                 → عرض جميع الموظفين (مع بيانات)
GET    /api/employees/:id             → عرض موظف واحد (مع بيانات)
PUT    /api/employees/:id             → تعديل موظف
DELETE /api/employees/:id             → حذف موظف
PUT    /api/employees/:id/projects    → تعديل مشاريع الموظف
```

**مثال - إنشاء موظف:**
```bash
curl -X POST http://localhost:5000/api/employees \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "أحمد",
    "lastName": "محمد",
    "email": "ahmed@example.com",
    "password": "SecurePass123!",
    "phoneNumber": "0501234567",
    "employeeId": "EMP001",
    "position": "engineer",
    "department": "إنشاءات",
    "hireDate": "2024-01-15",
    "salary": 5000,
    "ssn": "123456789"
  }'
```

---

### 2️⃣ EMPLOYEE (موظف)

**الصلاحيات:**
- ✅ تسجيل الدخول فقط (Login)
- ✅ عرض بيانات ملفه الشخصي (بيانات شخصية + مالية)
- ✅ عرض دليل الموظفين

**ممنوع:**
- ❌ تعديل أي بيانات
- ❌ إنشاء أو حذف حسابات
- ❌ عرض بيانات موظفين آخرين (خاصة)
- ❌ إسناد مشاريع

**الـ Endpoints:**
```
GET /api/employees/me                 → عرض بيانات ملفي الشخصي
GET /api/employees/directory          → عرض دليل الموظفين (بيانات عامة فقط)
GET /api/employees/:id                → عرض موظف آخر (بيانات عامة فقط)
```

**مثال - عرض ملفي الشخصي:**
```bash
curl -X GET http://localhost:5000/api/employees/me \
  -H "Authorization: Bearer EMPLOYEE_TOKEN"

# الرد
{
  "success": true,
  "data": {
    "_id": "emp123",
    "firstName": "أحمد",
    "lastName": "محمد",
    "phoneNumber": "0501234567",
    "position": "engineer",
    "department": "إنشاءات",
    
    # بيانات شخصية (مرئية فقط لصاحب الحساب)
    "ssn": "123456789",
    "salary": 5000,
    "dateOfBirth": "1990-05-15",
    "address": "الرياض",
    "emergencyContact": "0505555556"
  }
}
```

---

### 3️⃣ VIEWER (مشاهد)

**الصلاحيات:**
- ✅ عرض دليل الموظفين (بيانات عامة فقط)
- ✅ عرض بيانات موظف واحد (بيانات عامة فقط)

**ممنوع:**
- ❌ تسجيل الدخول (للموظفين المسجلين فقط)
- ❌ عرض بيانات شخصية
- ❌ تعديل أي بيانات
- ❌ إنشاء أو حذف

**الـ Endpoints:**
```
GET /api/employees/directory          → عرض دليل الموظفين
GET /api/employees/:id                → عرض موظف واحد (بيانات عامة)
```

**مثال - عرض دليل الموظفين (بدون مصادقة):**
```bash
curl -X GET http://localhost:5000/api/employees/directory

# الرد
{
  "success": true,
  "data": [
    {
      "_id": "emp123",
      "firstName": "أحمد",
      "lastName": "محمد",
      "position": "engineer",
      "department": "إنشاءات",
      "phoneNumber": "0501234567",
      "skills": ["AutoCAD", "Revit"],
      
      # ملاحظة: لا توجد بيانات شخصية (ssn, salary, address, إلخ)
    }
  ],
  "count": 5
}
```

---

### 4️⃣ GUEST (زائر بدون حساب)

**الصلاحيات:**
- ✅ عرض دليل الموظفين (بيانات عامة فقط)

**ممنوع:**
- ❌ تسجيل الدخول
- ❌ إنشاء حساب (No public registration)
- ❌ عرض بيانات شخصية
- ❌ تعديل أي بيانات

---

## 🔐 مقارنة الوصول حسب الدور

```
┌─────────────────────┬────────┬──────────┬────────┬─────────┐
│ الـ Action           │ Admin  │ Employee │ Viewer │ Guest   │
├─────────────────────┼────────┼──────────┼────────┼─────────┤
│ إنشاء موظف          │   ✅   │    ❌    │   ❌   │   ❌    │
│ عرض جميع الموظفين   │   ✅   │    ❌    │   ❌   │   ❌    │
│ عرض موظف (بيانات)   │   ✅   │    ❌    │   ❌   │   ❌    │
│ تعديل موظف          │   ✅   │    ❌    │   ❌   │   ❌    │
│ حذف موظف            │   ✅   │    ❌    │   ❌   │   ❌    │
│ إسناد مشاريع         │   ✅   │    ❌    │   ❌   │   ❌    │
├─────────────────────┼────────┼──────────┼────────┼─────────┤
│ عرض ملفي            │   ✅   │    ✅    │   ❌   │   ❌    │
│ عرض دليل الموظفين   │   ✅   │    ✅    │   ✅   │   ✅    │
│ عرض موظف (عام)      │   ✅   │    ✅    │   ✅   │   ✅    │
└─────────────────────┴────────┴──────────┴────────┴─────────┘
```

---

## 📊 مقارنة البيانات المرئية

```
┌────────────────────┬─────────┬──────────┬────────┬───────────┐
│ البيان              │ Admin   │ Employee │ Viewer │ Guest     │
├────────────────────┼─────────┼──────────┼────────┼───────────┤
│ firstName          │   ✅    │    ✅    │   ✅   │    ✅     │
│ lastName           │   ✅    │    ✅    │   ✅   │    ✅     │
│ position           │   ✅    │    ✅    │   ✅   │    ✅     │
│ department         │   ✅    │    ✅    │   ✅   │    ✅     │
│ phoneNumber        │   ✅    │    ✅    │   ✅   │    ✅     │
│ skills             │   ✅    │    ✅    │   ✅   │    ✅     │
├────────────────────┼─────────┼──────────┼────────┼───────────┤
│ salary             │   ✅    │    ✅*   │   ❌   │    ❌     │
│ ssn                │   ✅    │    ✅*   │   ❌   │    ❌     │
│ dateOfBirth        │   ✅    │    ✅*   │   ❌   │    ❌     │
│ address            │   ✅    │    ✅*   │   ❌   │    ❌     │
│ emergencyContact   │   ✅    │    ✅*   │   ❌   │    ❌     │
└────────────────────┴─────────┴──────────┴────────┴───────────┘

* = Only for own profile
```

---

## 🛡️ كيفية تطبيق RBAC في الكود

### Middleware Authentication
```typescript
// src/middleware/auth.ts
export async function authenticate(
    req: Request,
    _res: Response,
    next: NextFunction
): Promise<void> {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('Access denied. No token provided.', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwtSecret) as { id: string };

        const user = await User.findById(decoded.id);
        if (!user) {
            throw new AppError('User not found.', 401);
        }

        req.user = user;
        next();
    } catch (error) {
        if (error instanceof AppError) {
            next(error);
        } else {
            next(new AppError('Invalid token.', 401));
        }
    }
}
```

### Middleware Role Check
```typescript
// src/middleware/auth.ts
export function requireRole(...roles: UserRole[]) {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new AppError('User not authenticated.', 401));
        }

        if (!roles.includes(req.user.role)) {
            return next(
                new AppError(
                    `Access denied. Required role: ${roles.join(' or ')}.`,
                    403
                )
            );
        }

        next();
    };
}
```

### Protected Routes
```typescript
// src/routes/employeeRoutes.ts
import { authenticate, requireRole } from '../middleware/auth';

// Admin only
router.post('/', authenticate, requireRole('admin'), createEmployee);
router.put('/:id', authenticate, requireRole('admin'), updateEmployee);
router.delete('/:id', authenticate, requireRole('admin'), deleteEmployee);

// Authenticated employees only
router.get('/me', authenticate, getMyProfile);

// Public endpoints (no auth required)
router.get('/directory', getEmployeeDirectory);
router.get('/:id', getEmployee);
```

---

## 🧪 Testing RBAC

### Test Scenario 1: Admin Creating Employee
```bash
# 1. Admin logs in
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin123!"}'

# Response
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": {
      "role": "admin"
    }
  }
}

# 2. Admin creates employee
curl -X POST http://localhost:5000/api/employees \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{
    "firstName":"Ahmed",
    "email":"ahmed@example.com",
    ...
  }'

# Response: 201 Created
```

### Test Scenario 2: Employee Cannot Create
```bash
# 1. Employee logs in
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"employee@example.com","password":"Pass123!"}'

# Response
{
  "success": true,
  "data": {
    "token": "eyJ...",
    "user": {
      "role": "viewer"
    }
  }
}

# 2. Employee tries to create (FAILS)
curl -X POST http://localhost:5000/api/employees \
  -H "Authorization: Bearer eyJ..." \
  -H "Content-Type: application/json" \
  -d '{...}'

# Response: 403 Forbidden
{
  "success": false,
  "error": "Access denied. Required role: admin."
}
```

### Test Scenario 3: Employee Can View Own Profile
```bash
# 1. Employee logs in and gets token
# 2. Employee views own profile
curl -X GET http://localhost:5000/api/employees/me \
  -H "Authorization: Bearer eyJ..."

# Response: 200 OK with personal data
{
  "success": true,
  "data": {
    "firstName": "Ahmed",
    "ssn": "123456789",      ← Visible
    "salary": 5000,          ← Visible
    "address": "Riyadh"      ← Visible
  }
}
```

### Test Scenario 4: Guest Cannot View Personal Data
```bash
# 1. No authentication
curl -X GET http://localhost:5000/api/employees/123

# Response: 200 OK but only public data
{
  "success": true,
  "data": {
    "firstName": "Ahmed",
    "position": "engineer",
    
    # NO ssn, salary, address
  }
}
```

---

## 📝 Implementation Checklist

- [x] User Model with Role field
- [x] Employee Model with private fields
- [x] Authentication Middleware
- [x] Role-based Authorization Middleware
- [x] Protected Routes
- [x] Field Selection (select: false)
- [ ] Unit Tests for RBAC
- [ ] Integration Tests for RBAC
- [ ] Frontend Conditional Rendering
- [ ] Error Handling for Permission Denied

---

## ⚠️ Important Security Notes

1. **No Public Registration**
   - Employees cannot self-register
   - Only Admin can create accounts
   - Password is auto-generated or provided by Admin

2. **Private Fields Protection**
   - SSN, Salary, Address hidden by default
   - Only included in responses when authorized
   - Use `.select('+fieldName')` to include

3. **Token Expiration**
   - JWT token expires in 7 days
   - User must re-login after expiration
   - Frontend should handle token refresh

4. **Password Security**
   - Passwords hashed with bcryptjs (12 rounds)
   - Never return password in responses
   - Use `select: false` in schema

5. **Error Messages**
   - Don't leak sensitive data in error messages
   - Use generic messages ("Invalid credentials")
   - Log detailed errors server-side only

---

## 🔗 Related Files

- **Models**: `src/models/User.ts`, `src/models/Employee.ts`
- **Middleware**: `src/middleware/auth.ts`
- **Controllers**: `src/controllers/authController.ts`, `src/controllers/employeeController.ts`
- **Routes**: `src/routes/authRoutes.ts`, `src/routes/employeeRoutes.ts`

---

**Version**: 1.0.0  
**Last Updated**: February 17, 2026  
**Status**: Complete & Ready for Testing
