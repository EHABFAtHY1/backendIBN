# Employee API - Quick Reference

## BASE URL
```
http://localhost:5000/api/employees
```

---

## 📚 QUICK API REFERENCE

### 🔓 PUBLIC ENDPOINTS (No Auth Required)

#### 1. Get Employee Directory
```
GET /directory

Response:
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
      "skills": ["AutoCAD"],
      "projects": []
    }
  ],
  "count": 5
}
```

#### 2. Get Single Employee
```
GET /:id

Response:
{
  "success": true,
  "data": {
    "_id": "emp123",
    "firstName": "أحمد",
    "position": "engineer",
    ...
  }
}
```

---

### 🔐 PROTECTED ENDPOINTS (Auth Required)

#### 3. Get My Profile
```
GET /me
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "_id": "emp123",
    "firstName": "أحمد",
    "ssn": "123456789",        ← Only visible
    "salary": 5000,             ← Only visible
    "dateOfBirth": "1990-05-15",← Only visible
    "address": "الرياض",        ← Only visible
    "emergencyContact": "..."   ← Only visible
  }
}
```

---

### 👨‍💼 ADMIN ENDPOINTS

#### 4. Create Employee
```
POST /
Authorization: Bearer <admin_token>
Content-Type: application/json

Body:
{
  "firstName": "محمد",
  "lastName": "أحمد",
  "email": "mohammad@example.com",
  "password": "SecurePass123!",
  "phoneNumber": "0505555555",
  "employeeId": "EMP002",
  "position": "supervisor",
  "department": "إشراف",
  "hireDate": "2024-03-15",
  "skills": ["Management"],
  "salary": 4500
}

Response: 201 Created
{
  "success": true,
  "data": { ... },
  "message": "Employee created successfully"
}
```

#### 5. Update Employee
```
PUT /:id
Authorization: Bearer <admin_token>
Content-Type: application/json

Body (all optional):
{
  "firstName": "محمد",
  "lastName": "أحمد",
  "phoneNumber": "0505555555",
  "position": "manager",
  "department": "إدارة",
  "salary": 6000,
  "skills": ["Management", "Leadership"],
  "ssn": "987654321",
  "dateOfBirth": "1990-01-01",
  "address": "الرياض",
  "emergencyContact": "0505555556",
  "isActive": true
}

Response: 200 OK
{
  "success": true,
  "data": { ... },
  "message": "Employee updated successfully."
}
```

#### 6. Update Employee Projects
```
PUT /:id/projects
Authorization: Bearer <admin_token>
Content-Type: application/json

Body:
{
  "projectIds": ["proj1", "proj2", "proj3"]
}

Response: 200 OK
{
  "success": true,
  "data": { ... },
  "message": "Employee projects updated successfully."
}
```

#### 7. Delete Employee
```
DELETE /:id
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "success": true,
  "message": "Employee and associated user account deleted successfully."
}
```

---

## 🚨 ERROR RESPONSES

### 400 - Bad Request
```json
{
  "success": false,
  "error": "Missing required fields."
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "Access denied. No token provided."
}
```

### 403 - Forbidden
```json
{
  "success": false,
  "error": "You do not have permission to perform this action."
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "Employee not found."
}
```

### 409 - Conflict
```json
{
  "success": false,
  "error": "Email already registered."
}
```

---

## 🔑 ROLES & PERMISSIONS

| Role | Create | Read | Update | Delete |
|------|--------|------|--------|--------|
| Admin | ✅ | ✅ | ✅ | ✅ |
| Employee | ❌ | ✅ (own) | ❌ | ❌ |
| Viewer | ❌ | ✅ (public) | ❌ | ❌ |
| Public | ❌ | ✅ (public) | ❌ | ❌ |

---

## 💻 JAVASCRIPT EXAMPLES

### Fetch Employee Directory
```javascript
const fetchDirectory = async () => {
  const res = await fetch('http://localhost:5000/api/employees/directory');
  const data = await res.json();
  return data.data;
};
```

### Fetch My Profile (with Token)
```javascript
const fetchMyProfile = async (token) => {
  const res = await fetch('http://localhost:5000/api/employees/me', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return res.json();
};
```

### Create Employee (Admin)
```javascript
const createEmployee = async (formData, adminToken) => {
  const res = await fetch('http://localhost:5000/api/employees', {
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
```

### Update Employee (Admin)
```javascript
const updateEmployee = async (id, updates, adminToken) => {
  const res = await fetch(`http://localhost:5000/api/employees/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updates)
  });
  return res.json();
};
```

### Delete Employee (Admin)
```javascript
const deleteEmployee = async (id, adminToken) => {
  const res = await fetch(`http://localhost:5000/api/employees/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  return res.json();
};
```

---

## 🔄 COMMON WORKFLOWS

### Workflow 1: View Employee Directory
```
1. GET /api/employees/directory
2. Display list (no auth needed)
3. Click on employee → GET /api/employees/:id
4. Show public profile
```

### Workflow 2: Employee Login & View Profile
```
1. POST /api/auth/login (email + password)
2. Get token from response
3. Store token in localStorage
4. GET /api/employees/me (with token)
5. Display personal data
```

### Workflow 3: Admin Create Employee
```
1. POST /api/auth/login (admin credentials)
2. Get admin token
3. Fill employee form
4. POST /api/employees (with admin token)
5. Employee account created
6. Employee can login with provided credentials
```

### Workflow 4: Admin Update Employee Projects
```
1. GET /api/employees/directory (list all)
2. Select employee
3. Show available projects (multi-select)
4. PUT /api/employees/:id/projects
5. Update employee.projects array
```

---

## ⚠️ IMPORTANT NOTES

- ⚠️ **Always include Authorization header** for protected endpoints
- ⚠️ **Use HTTPS in production** (not just HTTP)
- ⚠️ **Don't store personal data** in localStorage (only token)
- ⚠️ **Validate inputs** on frontend before sending
- ⚠️ **Handle token expiration** (7 days)
- ⚠️ **Employee cannot modify** their own data (only Admin)
- ⚠️ **Email and EmployeeID** must be unique

---

## 📱 RESPONSE FIELDS

### Employee Object
```typescript
{
  _id: string;              // MongoDB ID
  firstName: string;
  lastName: string;
  phoneNumber: string;
  employeeId: string;       // Unique ID
  position: string;         // Position
  department: string;
  hireDate: Date;
  skills: string[];
  projects: string[];       // Project IDs
  isActive: boolean;
  joinDate: Date;
  
  // Private (only if authorized)
  ssn?: string;
  salary?: number;
  dateOfBirth?: Date;
  address?: string;
  emergencyContact?: string;
  
  // Relations
  user?: { _id, name, email };
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

**Quick Ref Version**: 1.0.0  
**Updated**: Feb 17, 2026
