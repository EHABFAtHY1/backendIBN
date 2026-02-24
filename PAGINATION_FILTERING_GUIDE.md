# Pagination, Filtering & Searching Guide

## 📖 نظرة عامة

تم إضافة نظام شامل للـ Pagination والـ Filtering والـ Searching لجميع endpoints الـ GET list الموجودة.

---

## 🔧 الاستخدام الأساسي

### 1. Pagination (الصفحات)

```bash
# الحصول على الصفحة الأولى (10 عناصر افتراضياً)
GET /api/employees/directory

# الحصول على الصفحة الثانية
GET /api/employees/directory?page=2

# تغيير عدد العناصر في الصفحة
GET /api/employees/directory?size=20

# معاً
GET /api/employees/directory?page=2&size=20
```

**Response الـ Pagination:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 100,
    "page": 2,
    "size": 20,
    "totalPages": 5,
    "hasNextPage": true,
    "hasPrevPage": true
  },
  "filters": {...}
}
```

### 2. Searching (البحث)

```bash
# البحث عن موظف بالاسم أو الوظيفة أو القسم
GET /api/employees/directory?search=محمد

# البحث عن مشروع بـ title أو description
GET /api/projects?search=منزل

# مع pagination
GET /api/employees/directory?search=محمد&page=1&size=10
```

**البحث يتم في هذه الحقول:**
- **Employees**: firstName, lastName, position, department
- **Projects**: title, description
- **Services**: title, description
- **Users**: name, email
- **Partners**: name, description
- **Categories**: name, description
- **Departments**: name, description

### 3. Filtering (التصفية)

#### حسب الحقول الدقيقة:
```bash
# تصفية الموظفين حسب الوظيفة
GET /api/employees/directory?position=engineer

# تصفية حسب القسم
GET /api/employees/directory?department=إنشاءات

# تصفية المشاريع حسب الفئة
GET /api/projects?category=residential
```

#### فلاتر متقدمة (Operators):
```bash
# أكبر من (Greater Than)
GET /api/employees/directory?salary_gt=5000

# أصغر من (Less Than)
GET /api/employees/directory?salary_lt=10000

# أكبر من أو يساوي (Greater or Equal)
GET /api/employees/directory?salary_gte=5000&salary_lte=10000

# ضمن مجموعة (In Array)
GET /api/employees/directory?position_in=engineer,manager

# الحقل موجود (Exists)
GET /api/employees/directory?salary_exists=true
```

### 4. Sorting (الترتيب)

```bash
# ترتيب تصاعدي
GET /api/employees/directory?sort=firstName

# ترتيب تنازلي
GET /api/employees/directory?sort=-firstName

# ترتيب متعدد
GET /api/employees/directory?sort=department,-firstName

# الترتيب الافتراضي:
# - Employees: createdAt (تنازلي)
# - Projects: order, createdAt (تنازلي)
# - Services: order
```

### 5. Field Selection (اختيار الحقول)

```bash
# إرجاع حقول معينة فقط
GET /api/employees/directory?fields=firstName,lastName,position

# استبعاد حقول معينة
GET /api/employees/directory?fields=-ssn,-salary

# معاً مع pagination
GET /api/employees/directory?fields=firstName,lastName&page=1
```

---

## 📋 أمثلة عملية

### مثال 1: موظفين بـ department معين

```bash
GET /api/employees/directory?department=إنشاءات&page=1&size=10&sort=firstName
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "firstName": "أحمد",
      "lastName": "علي",
      "position": "engineer",
      "department": "إنشاءات"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "size": 10,
    "totalPages": 1,
    "hasNextPage": false,
    "hasPrevPage": false
  }
}
```

### مثال 2: بحث + تصفية

```bash
GET /api/employees/directory?search=محمد&position=engineer&department=إنشاءات
```

### مثال 3: مشاريع مع pagination ومعلومات محدودة

```bash
GET /api/projects?page=1&size=5&fields=title,description,category&sort=-createdAt
```

### مثال 4: موظفين بـ salary معين

```bash
# موظفين بـ salary بين 5000 و 10000
GET /api/employees/directory?salary_gte=5000&salary_lte=10000

# موظفين بـ salary أكثر من 5000
GET /api/employees/directory?salary_gt=5000
```

### مثال 5: البحث + الفلترة + الترتيب

```bash
GET /api/employees/directory?search=محمد&department=إدارة&sort=-salary&page=1&size=10
```

---

## 🔐 القيود والحدود

| المعامل | الحد الأدنى | الحد الأقصى | الافتراضي |
|--------|----------|----------|---------|
| `page` | 1 | ∞ | 1 |
| `size` | 1 | 100 | 10 |
| `search` | - | - | - |
| `sort` | - | - | حسب الـ endpoint |
| `fields` | - | - | جميع الحقول |

---

## 🛡️ حقول خاصة (Excluded from Search)

بعض الحقول تم استبعادها من البحث لأسباب أمنية:
- **Passwords**: لا يتم البحث أبداً
- **Private fields** (SSN, Salary): يتم إظهارها حسب الصلاحيات

---

## 📌 ملاحظات مهمة

### 1. البحث case-insensitive
البحث لا يفرق بين الحروف الكبيرة والصغيرة:
```bash
# جميع هذه الاستعلامات متساوية
GET /api/employees/directory?search=محمد
GET /api/employees/directory?search=محمد
GET /api/employees/directory?search=محمد
```

### 2. الترتيب المتعدد
يمكن ترتيب النتائج حسب عدة حقول:
```bash
GET /api/employees/directory?sort=department,-salary,firstName
# النتيجة: ترتيب أولاً حسب القسم، ثم حسب الراتب (تنازلي)، ثم الاسم (تصاعدي)
```

### 3. الفلاتر الديناميكية
يمكن إضافة أي فلتر حسب الحقول الموجودة في الـ Model:
```bash
GET /api/employees/directory?isActive=true&hireDate_gte=2024-01-01
```

---

## 🔄 Migration Guide

### قبل (الـ API القديمة):
```javascript
// جلب جميع الموظفين بدون pagination
GET /api/employees/directory

const employees = res.body.data; // array of all employees
```

### بعد (الـ API الجديدة):
```javascript
// جلب الموظفين مع pagination
GET /api/employees/directory?page=1&size=10

const { data, pagination } = res.body;
// data: موظفي الصفحة
// pagination: معلومات pagination

// أمثلة إضافية:
GET /api/employees/directory?search=محمد // البحث
GET /api/employees/directory?sort=-salary // الترتيب
GET /api/employees/directory?fields=firstName,lastName // اختيار الحقول
```

---

## 🚀 الـ Endpoints المحدثة

✅ **Employees:**
- GET /api/employees/directory
- GET /api/employees/:id (بدون pagination)

✅ **Projects:**
- GET /api/projects
- GET /api/projects/all

✅ **Services:**
- GET /api/services
- GET /api/services/all

✅ **Users:**
- GET /api/users

✅ **Partners:**
- GET /api/partners
- GET /api/partners/all

✅ **Project Categories:**
- GET /api/project-categories
- GET /api/project-categories/all

✅ **Departments:**
- GET /api/departments
- GET /api/departments/all

---

## 🔗 الملفات ذات الصلة

- `src/dtos/PaginationDto.ts` - تعريفات DTO والـ helper functions
- `src/utils/ListControllerTemplate.ts` - template لتحديث المزيد من الـ controllers
- `src/controllers/*Controller.ts` - الـ controllers المحدثة

---

## 💡 نصائح الأداء

```bash
# ❌ تجنب هذا
GET /api/employees/directory?size=1000

# ✅ استخدم هذا
GET /api/employees/directory?size=100&page=1

# ❌ استعلام معقد جداً
GET /api/employees/directory?search=x&department=y&position=z&salary_gte=a&salary_lte=b

# ✅ استخدم البحث المحدد أولاً
GET /api/employees/directory?search=محمد&department=إنشاءات
```

---

## 📞 للمساعدة

راجع `src/dtos/PaginationDto.ts` لفهم كيفية عمل الـ helper functions.
