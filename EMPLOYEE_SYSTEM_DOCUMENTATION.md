# Employee Management System - Frontend Developer Guide

## 📋 جدول المحتويات
1. [مقدمة عن النظام](#مقدمة)
2. [أنواع المستخدمين](#أنواع-المستخدمين)
3. [المصادقة والتفويض](#المصادقة-والتفويض)
4. [Endpoints API](#endpoints-api)
5. [أمثلة الاستخدام](#أمثلة-الاستخدام)
6. [معالجة الأخطاء](#معالجة-الأخطاء)

---

## مقدمة

النظام مقسم إلى نوعين من المستخدمين:

| النوع | الدور | الصلاحيات |
|------|------|----------|
| **Admin** | المدير | إنشاء وتعديل وحذف الموظفين |
| **Employee** | موظف | عرض بيانته الشخصية فقط |

---

## أنواع المستخدمين

### 1. المدير (Admin)
- **يمكنه**: 
  - عرض جميع الموظفين
  - إنشاء موظف جديد (ينشئ له حساب login)
  - تعديل بيانات أي موظف
  - تعديل المشاريع المسندة للموظف
  - حذف موظف وحسابه
  
- **لا يمكنه حذف نفسه** (نظام أمان)

### 2. الموظف (Employee)
- **يمكنه**:
  - عرض بيانات نفسه الشخصية (الراتب، الرقم القومي، إلخ)
  - عرض دليل الموظفين العام
  - عرض بيانات زملائه العام فقط
  
- **لا يمكنه**:
  - رؤية بيانات شخصية لزملائه
  - تعديل بيانات أي موظف
  - إنشاء أو حذف موظفين

### 3. الضيف (Guest)
- **يمكنه**:
  - عرض دليل الموظفين العام بدون تسجيل دخول
  - عرض بيانات عام لأي موظف

---

## المصادقة والتفويض

### خطوات تسجيل الدخول

```typescript
// 1. تسجيل الدخول
POST /api/auth/login
{
  "email": "employee@example.com",
  "password": "password123"
}

// الرد
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "user123",
      "name": "اسم الموظف",
      "email": "employee@example.com",
      "role": "viewer"
    }
  }
}

// 2. حفظ الـ Token
localStorage.setItem('authToken', response.data.token);

// 3. استخدام الـ Token في الطلبات
headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
}
```

### صيغة الـ Token

```typescript
// الـ Token مقسم إلى 3 أجزاء:
// Header.Payload.Signature

// مثال:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJpZCI6IjY5OTM5N2Y5NzQyY2U4NjQzN2ZiOTlkMCIsImlhdCI6MTc3MTI4MTczMSwiZXhwIjoxNzcxODg2NTMxfQ
.RVxp2F8T7CTRNMhp622mcs5XkHQTTMqWgzqhC_Puxco

// Payload (معلومات التشفير):
{
  "id": "699397f9742ce86437fb99d0",
  "iat": 1771281731,  // وقت الإصدار
  "exp": 1771886531   // وقت الانتهاء
}
```

---

## Endpoints API

### 🔓 Endpoints عامة (بدون مصادقة)

#### 1. عرض دليل الموظفين

```http
GET /api/employees/directory
```

**البيانات المرجعة:**
```json
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
      "projects": [
        {
          "_id": "proj1",
          "title": "مشروع فيلا سكنية"
        }
      ]
      // ملاحظة: لا توجد بيانات شخصية (ssn, salary)
    }
  ],
  "count": 45
}
```

**الاستخدام:**
```typescript
// React مثال
const [employees, setEmployees] = useState([]);

useEffect(() => {
  fetch('/api/employees/directory')
    .then(res => res.json())
    .then(data => setEmployees(data.data))
}, []);

// عرض الموظفين
{employees.map(emp => (
  <div key={emp._id}>
    <h3>{emp.firstName} {emp.lastName}</h3>
    <p>{emp.position} - {emp.department}</p>
    <p>{emp.phoneNumber}</p>
  </div>
))}
```

#### 2. عرض موظف واحد

```http
GET /api/employees/:id
```

**المسار:**
```
GET /api/employees/emp123
```

**البيانات المرجعة:**
```json
{
  "success": true,
  "data": {
    "_id": "emp123",
    "firstName": "أحمد",
    "lastName": "محمد",
    "position": "engineer",
    "department": "إنشاءات",
    "phoneNumber": "0501234567",
    "skills": ["AutoCAD"],
    "projects": []
  }
}
```

---

### 🔐 Endpoints محمية (تتطلب مصادقة)

#### 3. عرض بيانات الموظف نفسه

```http
GET /api/employees/me
Authorization: Bearer <token>
```

**البيانات المرجعة:**
```json
{
  "success": true,
  "data": {
    "_id": "emp123",
    "firstName": "أحمد",
    "lastName": "محمد",
    "position": "engineer",
    "department": "إنشاءات",
    "phoneNumber": "0501234567",
    "employeeId": "EMP001",
    
    // بيانات شخصية (مرئية فقط لصاحب الحساب)
    "ssn": "123456789",
    "salary": 5000,
    "dateOfBirth": "1990-05-15",
    "address": "الرياض - حي العليا",
    "emergencyContact": "0505555556",
    
    "skills": ["AutoCAD", "Revit"],
    "projects": [
      {
        "_id": "proj1",
        "title": "مشروع فيلا سكنية"
      }
    ],
    "user": {
      "_id": "user123",
      "name": "أحمد محمد",
      "email": "ahmed@example.com"
    }
  }
}
```

**الاستخدام:**
```typescript
const getMyProfile = async (token: string) => {
  const res = await fetch('/api/employees/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
};

// الاستخدام
useEffect(() => {
  const token = localStorage.getItem('authToken');
  getMyProfile(token).then(data => {
    setProfile(data.data);
  });
}, []);
```

---

### 👨‍💼 Endpoints للمدير (Admin only)

#### 4. إنشاء موظف جديد

```http
POST /api/employees
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**البيانات المطلوبة:**
```json
{
  "firstName": "محمد",
  "lastName": "أحمد",
  "email": "mohammad@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "0505555555",
  "employeeId": "EMP002",
  "position": "supervisor",
  "department": "الإشراف",
  "hireDate": "2024-03-15",
  
  // اختياري
  "skills": ["Project Management"],
  "salary": 4500,
  "ssn": "987654321",
  "dateOfBirth": "1990-01-01",
  "address": "الرياض",
  "emergencyContact": "0505555556"
}
```

**الرد:**
```json
{
  "success": true,
  "data": {
    "_id": "emp456",
    "firstName": "محمد",
    "lastName": "أحمد",
    "email": "mohammad@example.com",
    "employeeId": "EMP002",
    "position": "supervisor",
    "department": "الإشراف",
    "isActive": true,
    "user": {
      "_id": "user456",
      "name": "محمد أحمد",
      "email": "mohammad@example.com"
    }
  },
  "message": "Employee created successfully with login credentials."
}
```

**الاستخدام:**
```typescript
const createEmployee = async (formData: any, adminToken: string) => {
  const res = await fetch('/api/employees', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error);
  }
  
  return res.json();
};

// الاستخدام في Form
const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    const result = await createEmployee(formData, adminToken);
    console.log('تم إنشاء الموظف:', result.data);
    // عرض رسالة نجاح
  } catch (error) {
    console.error('خطأ:', error.message);
    // عرض رسالة خطأ
  }
};
```

#### 5. تعديل بيانات موظف

```http
PUT /api/employees/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**البيانات القابلة للتعديل:**
```json
{
  "firstName": "محمد",
  "lastName": "أحمد",
  "phoneNumber": "0505555555",
  "position": "manager",
  "department": "إدارة المشاريع",
  "ssn": "987654321",
  "dateOfBirth": "1990-01-01",
  "address": "الرياض",
  "emergencyContact": "0505555556",
  "skills": ["Management", "Leadership"],
  "salary": 6000,
  "isActive": true
}
```

**الاستخدام:**
```typescript
const updateEmployee = async (id: string, data: any, token: string) => {
  const res = await fetch(`/api/employees/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return res.json();
};
```

#### 6. تعديل مشاريع الموظف

```http
PUT /api/employees/:id/projects
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**البيانات:**
```json
{
  "projectIds": ["proj1", "proj2", "proj3"]
}
```

**الرد:**
```json
{
  "success": true,
  "data": {
    "_id": "emp123",
    "firstName": "أحمد",
    "projects": [
      {
        "_id": "proj1",
        "title": "مشروع فيلا"
      },
      {
        "_id": "proj2",
        "title": "مشروع برج"
      }
    ]
  },
  "message": "Employee projects updated successfully."
}
```

**الاستخدام:**
```typescript
const updateProjects = async (empId: string, projectIds: string[], token: string) => {
  const res = await fetch(`/api/employees/${empId}/projects`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ projectIds })
  });
  return res.json();
};

// Multi-select مثال
const handleProjectsChange = async (selectedProjects) => {
  const result = await updateProjects(empId, selectedProjects, token);
  console.log('تم تحديث المشاريع');
};
```

#### 7. حذف موظف

```http
DELETE /api/employees/:id
Authorization: Bearer <admin_token>
```

**الرد:**
```json
{
  "success": true,
  "message": "Employee and associated user account deleted successfully."
}
```

**الاستخدام:**
```typescript
const deleteEmployee = async (id: string, token: string) => {
  const confirmed = window.confirm('هل أنت متأكد من حذف هذا الموظف؟');
  if (!confirmed) return;
  
  const res = await fetch(`/api/employees/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  if (res.ok) {
    console.log('تم حذف الموظف');
    // حدّث قائمة الموظفين
  }
};
```

---

## أمثلة الاستخدام

### React Component مثال

```typescript
// EmployeeDirectory.tsx
import React, { useState, useEffect } from 'react';

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  position: string;
  department: string;
  phoneNumber: string;
  skills: string[];
}

export const EmployeeDirectory: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const response = await fetch('/api/employees/directory');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      setEmployees(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>جاري التحميل...</div>;
  if (error) return <div>خطأ: {error}</div>;

  const filtered = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase()
      .includes(filter.toLowerCase())
  );

  return (
    <div>
      <input
        type="text"
        placeholder="بحث عن موظف..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      
      <div className="employees-grid">
        {filtered.map(emp => (
          <div key={emp._id} className="employee-card">
            <h3>{emp.firstName} {emp.lastName}</h3>
            <p><strong>المنصب:</strong> {emp.position}</p>
            <p><strong>القسم:</strong> {emp.department}</p>
            <p><strong>الهاتف:</strong> {emp.phoneNumber}</p>
            {emp.skills && (
              <div>
                <strong>المهارات:</strong>
                <div className="skills">
                  {emp.skills.map(skill => (
                    <span key={skill} className="skill-badge">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
```

### MyProfile Component مثال

```typescript
// MyProfile.tsx
import React, { useState, useEffect } from 'react';

interface EmployeeProfile {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  position: string;
  department: string;
  salary: number;
  ssn: string;
  dateOfBirth: string;
  address: string;
  emergencyContact: string;
}

export const MyProfile: React.FC = () => {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/employees/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      setProfile(data.data);
      setLoading(false);
    };

    fetchProfile();
  }, []);

  if (loading) return <div>جاري التحميل...</div>;
  if (!profile) return <div>لا توجد بيانات</div>;

  return (
    <div className="profile-container">
      <h1>ملفي الشخصي</h1>
      
      <div className="profile-section">
        <h2>المعلومات الشخصية</h2>
        <p><strong>الاسم:</strong> {profile.firstName} {profile.lastName}</p>
        <p><strong>البريد:</strong> {profile.email}</p>
        <p><strong>تاريخ الميلاد:</strong> {profile.dateOfBirth}</p>
        <p><strong>العنوان:</strong> {profile.address}</p>
        <p><strong>جهة الاتصال الطارئة:</strong> {profile.emergencyContact}</p>
      </div>

      <div className="profile-section">
        <h2>معلومات العمل</h2>
        <p><strong>المنصب:</strong> {profile.position}</p>
        <p><strong>القسم:</strong> {profile.department}</p>
        <p><strong>الراتب:</strong> {profile.salary} ريال</p>
        <p><strong>الرقم القومي:</strong> {profile.ssn}</p>
        <p><strong>الهاتف:</strong> {profile.phoneNumber}</p>
      </div>
    </div>
  );
};
```

---

## معالجة الأخطاء

### أكواد الأخطاء

| الكود | المعنى | الحل |
|------|--------|------|
| 400 | بيانات خاطئة | تحقق من البيانات المرسلة |
| 401 | غير مصرح | تسجيل الدخول مجدداً |
| 403 | لا توجد صلاحيات | تحقق من دور المستخدم |
| 404 | موظف غير موجود | تحقق من ID |
| 409 | بيانات مكررة (email/ID) | استخدم بيانات مختلفة |
| 500 | خطأ من السيرفر | أعد المحاولة لاحقاً |

### مثال معالجة الأخطاء

```typescript
const handleApiCall = async (url: string, options: any) => {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      
      switch (response.status) {
        case 400:
          throw new Error(`خطأ في البيانات: ${error.error}`);
        case 401:
          localStorage.removeItem('authToken');
          window.location.href = '/login';
          break;
        case 403:
          throw new Error('ليس لديك صلاحيات لهذا الإجراء');
        case 404:
          throw new Error('البيانات المطلوبة غير موجودة');
        case 409:
          throw new Error('هذه البيانات موجودة بالفعل');
        default:
          throw new Error(error.error || 'خطأ غير معروف');
      }
    }
    
    return await response.json();
    
  } catch (error) {
    console.error('Error:', error);
    // عرض رسالة خطأ للمستخدم
    throw error;
  }
};
```

---

## ملاحظات أمان مهمة

✅ **ممنوع**:
- تخزين البيانات الشخصية (SSN, Salary) في localStorage
- إرسال كلمة المرور مع طلبات إضافية

✅ **مطلوب**:
- استخدام HTTPS في الإنتاج
- التحقق من صلاحيات المستخدم على كل طلب
- تحديث الـ Token قبل انتهاء صلاحيته

---

## نصائح الأداء

1. **استخدم caching**:
```typescript
const [cachedDirectory, setCachedDirectory] = useState(null);
const [lastFetch, setLastFetch] = useState(0);

const fetchDirectory = async () => {
  const now = Date.now();
  if (cachedDirectory && (now - lastFetch) < 5 * 60 * 1000) {
    return cachedDirectory; // استخدم الـ cache
  }
  // ... fetch جديد
};
```

2. **استخدم pagination** للموظفين الكثيرين:
```typescript
GET /api/employees/directory?page=1&limit=20
```

3. **تقليل عدد الـ requests**:
```typescript
// بدلاً من جلب كل موظف بشكل منفصل
const employees = await fetchDirectory(); // جلب الكل مرة واحدة
```

---

**تم التطوير بواسطة**: Backend Team  
**آخر تحديث**: February 17, 2026
