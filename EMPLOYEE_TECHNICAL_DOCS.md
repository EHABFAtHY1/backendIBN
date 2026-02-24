# Employee System - Technical Architecture

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (React)                   │
├─────────────────────────────────────────────────────────┤
│  ├─ Employee Directory Component                       │
│  ├─ Employee Profile Component                         │
│  ├─ Admin Dashboard (Create/Edit/Delete)              │
│  └─ Project Assignment Component                       │
├─────────────────────────────────────────────────────────┤
│            HTTP Requests with JWT Token                │
├─────────────────────────────────────────────────────────┤
│                    Express API Server                   │
├─────────────────────────────────────────────────────────┤
│  Routes Layer:                                          │
│  ├─ /employees/directory       (GET)  - Public        │
│  ├─ /employees/:id             (GET)  - Public        │
│  ├─ /employees/me              (GET)  - Protected      │
│  ├─ /employees                 (POST) - Admin Only     │
│  ├─ /employees/:id             (PUT)  - Admin Only     │
│  ├─ /employees/:id/projects    (PUT)  - Admin Only     │
│  └─ /employees/:id             (DELETE)- Admin Only    │
├─────────────────────────────────────────────────────────┤
│  Controllers Layer:                                     │
│  ├─ employeeController.ts      (Business Logic)        │
│  └─ authController.ts          (Authentication)        │
├─────────────────────────────────────────────────────────┤
│  Models Layer (MongoDB):                               │
│  ├─ Employee Collection                                │
│  ├─ User Collection (Reference)                        │
│  └─ Project Collection (Reference)                     │
└─────────────────────────────────────────────────────────┘
```

---

## 📁 Database Schema

### User Collection (تم تعديله قليلاً)

```typescript
{
  _id: ObjectId,
  name: String,              // اسم كامل
  email: String,             // فريد ومشفر
  password: String,          // مشفر بـ bcryptjs
  role: 'admin' | 'employee',
  createdAt: Date,
  updatedAt: Date
}
```

### Employee Collection (جديد)

```typescript
{
  _id: ObjectId,
  
  // Reference
  user: ObjectId,            // Reference to User
  
  // Basic Info
  firstName: String,
  lastName: String,
  phoneNumber: String,
  
  // Employment Info
  employeeId: String,        // Unique ID (e.g., EMP001)
  position: 'engineer' | 'technician' | 'supervisor' | 'manager',
  department: String,        // e.g., "إنشاءات"
  hireDate: Date,
  
  // Personal Info (select: false - not included by default)
  ssn: String,              // Social Security Number
  dateOfBirth: Date,
  address: String,
  emergencyContact: String,
  
  // Work Info
  projects: [ObjectId],     // Array of Project references
  skills: [String],         // e.g., ["AutoCAD", "Revit"]
  salary: Number,           // Only visible to self and admin
  
  // Status
  isActive: Boolean,        // Default: true
  joinDate: Date,           // Default: now
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔐 Data Privacy & Access Control

### تحكم الوصول بناءً على الدور

```
┌─────────────────────────────────────────────────────────┐
│ PUBLIC Endpoints (No Auth Required)                    │
├─────────────────────────────────────────────────────────┤
│ GET /employees/directory                              │
│ ├─ Shows: firstName, lastName, position, department  │
│ ├─ Shows: phoneNumber, skills, projects              │
│ └─ HIDES: ssn, salary, dateOfBirth, address          │
│                                                       │
│ GET /employees/:id                                    │
│ ├─ Shows: PUBLIC info only                           │
│ └─ HIDES: Personal & Financial data                  │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ PROTECTED Endpoints (Auth Required - Any User)        │
├─────────────────────────────────────────────────────────┤
│ GET /employees/me (WITH TOKEN)                        │
│ ├─ Shows: ALL personal data                          │
│ ├─ Shows: ssn, salary, address, emergency contact  │
│ └─ ONLY: for the logged-in employee                 │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ ADMIN ONLY Endpoints (Admin Role Required)             │
├─────────────────────────────────────────────────────────┤
│ POST   /employees              (Create)                │
│ PUT    /employees/:id          (Update)                │
│ PUT    /employees/:id/projects (Update Projects)      │
│ DELETE /employees/:id          (Delete)                │
│                                                       │
│ Admin can see ALL data for ALL employees             │
└─────────────────────────────────────────────────────────┘
```

---

## 🔄 Request/Response Flow

### 1. إنشاء موظف جديد (Admin)

```
Admin Frontend
    │
    │ POST /api/employees
    │ {
    │   "firstName": "أحمد",
    │   "lastName": "محمد",
    │   "email": "ahmed@example.com",
    │   "password": "SecurePass123!",
    │   ...
    │ }
    ↓
Express Server - employeeRoutes.ts
    │
    ├─ Check: User is authenticated? (middleware)
    ├─ Check: User role is admin? (middleware)
    ├─ Pass to: createEmployee controller
    ↓
employeeController.ts - createEmployee()
    │
    ├─ Validate required fields
    ├─ Check: Email already exists?
    ├─ Check: Employee ID already exists?
    ├─ Create User: User.create()
    │   └─ bcryptjs hashes password (pre-save hook)
    ├─ Create Employee: Employee.create()
    │   └─ Link to user via reference
    ├─ Populate relations
    └─ Return: success + employee data
    ↓
Response (201 Created)
{
  "success": true,
  "data": {
    "_id": "emp123",
    "firstName": "أحمد",
    "user": {
      "_id": "user123",
      "email": "ahmed@example.com"
    }
  },
  "message": "Employee created with login credentials"
}
```

### 2. عرض ملفي الشخصي (Employee)

```
Employee Frontend
    │
    │ GET /api/employees/me
    │ Headers: {
    │   "Authorization": "Bearer eyJ..."
    │ }
    ↓
Express Server
    │
    ├─ middleware: authenticate()
    │   ├─ Extract token from header
    │   ├─ Verify JWT signature
    │   ├─ Find user by decoded ID
    │   └─ Attach user to req.user
    │
    ├─ Pass to: getMyProfile()
    ↓
employeeController.ts - getMyProfile()
    │
    ├─ Get userId from req.user._id
    ├─ Find employee: Employee.findOne({ user: userId })
    ├─ Select private fields: +ssn +salary +address
    ├─ Populate: user, projects
    └─ Return: complete employee data
    ↓
Response (200 OK)
{
  "success": true,
  "data": {
    "_id": "emp123",
    "firstName": "أحمد",
    "ssn": "123456789",        ← VISIBLE (only for own profile)
    "salary": 5000,            ← VISIBLE (only for own profile)
    "address": "الرياض",       ← VISIBLE (only for own profile)
    "projects": [...]
  }
}
```

### 3. محاولة الوصول لبيانات شخص آخر

```
Employee-A Frontend
    │
    │ GET /api/employees/:employee-b-id
    │ (No token)
    ↓
Express Server
    │
    ├─ No auth required for public endpoint
    ├─ Pass to: getEmployee()
    ↓
employeeController.ts - getEmployee()
    │
    ├─ Find employee by ID
    ├─ DON'T select private fields (default exclude)
    └─ Return: public data only
    ↓
Response (200 OK)
{
  "success": true,
  "data": {
    "_id": "emp-b-123",
    "firstName": "فاطمة",
    "position": "engineer",
    // ssn, salary NOT included
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests (`employee.unit.test.ts`)

تختبر كل دالة في الـ Controller بمعزل:

```typescript
describe('Employee Controller', () => {
  describe('getMyProfile', () => {
    test('should return profile with personal data');
    test('should return 404 if not found');
  });
  
  describe('createEmployee', () => {
    test('should create user and employee');
    test('should reject duplicate email');
    test('should reject missing fields');
  });
  
  // ... more tests
});
```

### Integration Tests (`employee.integration.test.ts`)

تختبر الـ API Routes كاملة مع Database:

```typescript
describe('Employee API', () => {
  describe('GET /employees/directory', () => {
    test('should return directory without auth');
    test('should not include personal data');
  });
  
  describe('POST /employees', () => {
    test('should create with auth token');
    test('should reject non-admin');
  });
  
  // ... more tests
});
```

### Test Coverage

- ✅ Public endpoints access
- ✅ Protected endpoints authentication
- ✅ Admin-only operations
- ✅ Data privacy (personal data hiding)
- ✅ Authorization checks
- ✅ Error handling
- ✅ Input validation

---

## 🚀 Running Tests

```bash
# Install test dependencies
npm install --save-dev jest @types/jest ts-jest supertest

# Create jest.config.js
npx jest --init

# Run all tests
npm test

# Run specific test file
npm test -- employee.unit.test.ts

# Run with coverage
npm test -- --coverage
```

---

## 🔧 Implementation Checklist

- [x] Employee Model created
- [x] Employee Controller with all operations
- [x] Employee Routes configured
- [x] Routes registered in index.ts
- [x] Unit Tests written
- [x] Integration Tests written
- [x] Frontend Documentation created
- [ ] Frontend Components implementation
- [ ] API testing in Postman/Insomnia
- [ ] Production deployment

---

## 📝 Code Examples for Frontend

### TypeScript Interfaces

```typescript
// Copy these to your Frontend

interface Employee {
  _id: string;
  firstName: string;
  lastName: string;
  position: 'engineer' | 'technician' | 'supervisor' | 'manager';
  department: string;
  phoneNumber: string;
  employeeId: string;
  skills?: string[];
  projects?: string[]; // or Project[]
  isActive: boolean;
  joinDate: Date;
}

interface EmployeeProfile extends Employee {
  ssn: string;          // Only for own profile
  salary: number;       // Only for own profile
  dateOfBirth: Date;    // Only for own profile
  address: string;      // Only for own profile
  emergencyContact: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
}

interface CreateEmployeeRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phoneNumber: string;
  employeeId: string;
  position: EmployeeRole;
  department: string;
  hireDate: string; // ISO date
  
  // Optional
  skills?: string[];
  salary?: number;
  ssn?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
}
```

### API Service (Composable/Service)

```typescript
// api.ts or services/employeeService.ts

class EmployeeService {
  private baseUrl = '/api/employees';
  private token = localStorage.getItem('authToken');

  async getDirectory() {
    return fetch(`${this.baseUrl}/directory`).then(r => r.json());
  }

  async getById(id: string) {
    return fetch(`${this.baseUrl}/${id}`).then(r => r.json());
  }

  async getMyProfile() {
    return fetch(`${this.baseUrl}/me`, {
      headers: { 'Authorization': `Bearer ${this.token}` }
    }).then(r => r.json());
  }

  async create(data: CreateEmployeeRequest) {
    return fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(r => r.json());
  }

  async update(id: string, data: Partial<Employee>) {
    return fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).then(r => r.json());
  }

  async delete(id: string) {
    return fetch(`${this.baseUrl}/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${this.token}` }
    }).then(r => r.json());
  }

  async updateProjects(id: string, projectIds: string[]) {
    return fetch(`${this.baseUrl}/${id}/projects`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ projectIds })
    }).then(r => r.json());
  }
}

export default new EmployeeService();
```

---

## 🔐 Security Considerations

1. **Password Hashing**: bcryptjs (12 rounds)
2. **JWT Token**: 7 days expiration
3. **Private Fields**: Not selected by default (select: false)
4. **Unique Constraints**: email, employeeId
5. **Cascade Delete**: Delete user when delete employee
6. **Role-based**: All admin routes protected

---

**Version**: 1.0.0  
**Last Updated**: February 17, 2026  
**Status**: Ready for Frontend Implementation
