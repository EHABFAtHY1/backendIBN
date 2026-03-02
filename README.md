<div align="center">

# 🏗️ Ibnalshaekh Backend API

**Enterprise-grade RESTful API for Ibnalshaekh Construction Company**

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Swagger](https://img.shields.io/badge/Swagger-OpenAPI%203.0-85EA2D?logo=swagger&logoColor=black)](https://swagger.io/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)

[Features](#-features) · [Quick Start](#-quick-start) · [API Docs](#-api-documentation) · [Architecture](#-architecture) · [Testing](#-testing) · [Deployment](#-deployment)

</div>

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Session-Based Auth** | Secure authentication with session management, RBAC (Admin/User) |
| 🌐 **Bilingual Support** | Full Arabic & English content support across all models |
| 📄 **Swagger Docs** | Auto-generated OpenAPI 3.0 documentation with precise schemas |
| 📦 **CRUD for All Modules** | Projects, Services, Departments, Partners, Employees, Categories, Media, Contact |
| 📊 **Pagination & Filtering** | Advanced pagination, search, sort, and field selection on all list endpoints |
| 📁 **Media Upload** | Single & bulk file uploads with Multer |
| 🐳 **Docker Ready** | One-command setup with Docker Compose (API + MongoDB + Mongo Express) |
| ✅ **Tested** | Integration tests with Jest + Supertest |
| 🛡️ **Input Validation** | express-validator on all public inputs |

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20.x
- **MongoDB** >= 7.0 (local or Docker)
- **npm** >= 9.x

### 1. Install & Configure

```bash
# Clone and install
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB URI
```

### 2. Run

```bash
# Development (hot reload)
npm run dev

# Production
npm run build && npm start
```

### 3. Docker (Recommended)

```bash
# Start everything (API + MongoDB + Mongo Express)
npm run docker:up

# View logs
npm run docker:logs

# Stop
npm run docker:down
```

> **Access Points:**
> | Service | URL |
> |---------|-----|
> | API | http://localhost:5000/api |
> | Swagger Docs | http://localhost:5000/api-docs |
> | Mongo Express | http://localhost:8081 |

---

## 📚 API Documentation

Interactive Swagger documentation is available at **`/api-docs`** after starting the server.

### Modules Overview

| Module | Public | Admin | Endpoints |
|--------|--------|-------|-----------|
| **Authentication** | Login | Register, Manage | 5 |
| **Users** | — | Full CRUD | 5 |
| **Projects** | List, View, By Category | Create, Update, Delete | 7 |
| **Categories** | List, View | Create, Update, Delete | 5 |
| **Services** | List, View by Slug | Create, Update, Delete | 6 |
| **Departments** | List | Create, Update, Delete | 5 |
| **Employees** | Directory, Profile | Create, Update, Delete, Assign Projects | 7 |
| **Partners** | List | Create, Update, Delete | 5 |
| **Media** | — | Upload, List, Delete | 4 |
| **Contact** | Submit Message | List, Stats, Update Status, Delete | 6 |
| **Company Settings** | View | Create, Update | 3 |
| **Site Settings** | View, Hero, About, Contact | Update | 5 |

### Authentication

All admin endpoints require a **Bearer token** (Session ID) obtained from login:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@ibnalshaekh.com", "password": "Admin123!"}'

# Use the sessionId in subsequent requests
curl -H "Authorization: Bearer <sessionId>" http://localhost:5000/api/users
```

### Pagination & Filtering

All list endpoints support:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `page` | Page number (starts at 1) | `?page=2` |
| `size` / `limit` | Items per page (max 100) | `?size=20` |
| `search` | Full-text search in text fields | `?search=villa` |
| `sort` | Sort fields (prefix `-` for DESC) | `?sort=-createdAt,title` |
| `fields` | Select specific fields | `?fields=title,status` |

---

## 🏗️ Architecture

```
src/
├── app.ts                  # Express app setup (CORS, middleware, routes)
├── server.ts               # Server entry point & DB connection
├── seed.ts                 # Database seeder
├── swagger.ts              # OpenAPI 3.0 schema definitions
├── swagger-output.json     # Generated Swagger output
│
├── config/
│   ├── db.ts               # MongoDB connection (Mongoose)
│   └── index.ts            # Environment config
│
├── controllers/            # Business logic
│   ├── authController.ts
│   ├── projectController.ts
│   ├── serviceController.ts
│   ├── departmentController.ts
│   ├── employeeController.ts
│   ├── partnerController.ts
│   ├── contactController.ts
│   ├── mediaController.ts
│   ├── companySettingsController.ts
│   ├── settingsController.ts
│   ├── projectCategoryController.ts
│   └── userController.ts
│
├── models/                 # Mongoose schemas & interfaces
│   ├── User.ts             # User with bcrypt password hashing
│   ├── Session.ts          # Session-based auth
│   ├── Project.ts          # Bilingual project data
│   ├── ProjectCategory.ts  # Project categories
│   ├── Service.ts          # Services with nested bilingual fields
│   ├── Department.ts       # Departments with sub-departments
│   ├── Employee.ts         # Employee profiles (sensitive fields hidden)
│   ├── Partner.ts          # Business partners
│   ├── Media.ts            # Uploaded media files
│   ├── ContactMessage.ts   # Contact form submissions
│   ├── CompanySettings.ts  # Company information
│   └── SiteSettings.ts     # Site configuration
│
├── routes/                 # Express routers with Swagger JSDoc
│   ├── index.ts            # Route aggregator + health check
│   ├── authRoutes.ts
│   ├── projectRoutes.ts
│   ├── serviceRoutes.ts
│   ├── departmentRoutes.ts
│   ├── employeeRoutes.ts
│   ├── partnerRoutes.ts
│   ├── contactRoutes.ts
│   ├── mediaRoutes.ts
│   ├── companySettingsRoutes.ts
│   ├── settingsRoutes.ts
│   ├── projectCategoryRoutes.ts
│   └── userRoutes.ts
│
├── middleware/
│   ├── auth.ts             # authenticate + authorize (RBAC)
│   ├── errorHandler.ts     # Global error handler (AppError)
│   ├── upload.ts           # Multer file upload config
│   └── validate.ts         # express-validator wrapper
│
├── dtos/
│   └── PaginationDto.ts    # Pagination, search, sort, filter helpers
│
├── utils/
│   ├── AppError.ts         # Custom error class
│   ├── ListControllerTemplate.ts
│   └── i18n.ts             # Internationalization helpers
│
└── tests/
    ├── setup.ts            # Test environment setup
    ├── integration/        # API integration tests
    │   ├── auth.integration.test.ts
    │   ├── projects.integration.test.ts
    │   ├── categories.integration.test.ts
    │   ├── services.integration.test.ts
    │   ├── departments.integration.test.ts
    │   ├── partners.integration.test.ts
    │   ├── contact.integration.test.ts
    │   ├── company-settings.integration.test.ts
    │   ├── employee.integration.test.ts
    │   ├── rbac.integration.test.ts
    │   └── users.integration.test.ts
    └── unit/               # Unit tests
        ├── auth.unit.test.ts
        ├── employee.unit.test.ts
        └── rbac.unit.test.ts
```

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Integration tests only
npm run test:integration

# Unit tests only
npm run test:unit

# Coverage report
npm run test:coverage
```

> ⚠️ Tests require a MongoDB instance. Configure `MONGODB_URI` in `.env.test`.

---

## 📋 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with hot reload (ts-node-dev) |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm start` | Run production build |
| `npm run seed` | Seed database with sample data |
| `npm run docs` | Regenerate Swagger documentation |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:integration` | Run integration tests only |
| `npm run test:unit` | Run unit tests only |
| `npm run docker:up` | Start Docker services |
| `npm run docker:down` | Stop & remove Docker services |
| `npm run docker:stop` | Stop Docker services |
| `npm run docker:restart` | Restart Docker services |
| `npm run docker:logs` | View Docker service logs |
| `npm run docker:build` | Rebuild Docker images (no cache) |

---

## 🌱 Database Seeding

```bash
npm run seed
```

Creates initial data for development:

| Data | Details |
|------|---------|
| 👤 **Admin User** | `admin@ibnalshaekh.com` / `Admin123!` |
| ⚙️ **Site Settings** | Company info, hero section, contact, social links |
| 📂 **Categories** (2) | Residential Buildings, Commercial Centers |
| 🏗️ **Projects** (5) | Full bilingual project data with specs |
| 🔧 **Services** (5) | Construction, Interior Design, PM, QA, Consulting |
| 🤝 **Partners** (4) | Strategic business partners |
| 🏢 **Departments** (3) | Engineering, Project Management, QA |

---

## ⚙️ Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/ibnalshaekh` |
| `JWT_SECRET` | Secret for JWT signing | — |
| `NODE_ENV` | Environment mode | `development` |
| `UPLOAD_DIR` | File upload directory | `uploads` |

---

## 🐛 Troubleshooting

<details>
<summary><strong>Port 5000 already in use</strong></summary>

```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```
</details>

<details>
<summary><strong>MongoDB connection error</strong></summary>

- Verify MongoDB is running: `mongosh` or check Docker: `docker-compose ps`
- Confirm `MONGODB_URI` in `.env` matches your setup
- For Docker: run `npm run docker:up` first
</details>

<details>
<summary><strong>Docker issues</strong></summary>

```bash
npm run docker:logs       # Check logs
npm run docker:build      # Rebuild
docker-compose ps         # Check health
```
</details>

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|-----------|
| **Runtime** | Node.js 20.x |
| **Language** | TypeScript 5.7 |
| **Framework** | Express.js 4.21 |
| **Database** | MongoDB 7.0 + Mongoose 8.10 |
| **Auth** | Session-based (bcryptjs) |
| **Docs** | Swagger / OpenAPI 3.0 (swagger-jsdoc) |
| **Upload** | Multer |
| **Validation** | express-validator |
| **Testing** | Jest + Supertest + ts-jest |
| **DevOps** | Docker + Docker Compose |
| **Hosting** | Vercel-ready |

---

## 📄 License

**Private** — Ibnalshaekh LLC. All rights reserved.
