# Ibnalshaekh Backend API

Backend service for Ibnalshaekh construction company website built with Node.js, Express, MongoDB, and TypeScript.

## Quick Start

### Development Mode

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Server runs at http://localhost:5000
```

### Docker Mode

```bash
# Start with Docker Compose (includes MongoDB)
npm run docker:up

# View logs
npm run docker:logs

# Stop services
npm run docker:down
```

## Available Scripts

```bash
npm run dev              # Start development server with hot reload
npm run build            # Build TypeScript to JavaScript
npm run start            # Run production build
npm run seed             # Populate database with sample data
npm run docs             # Generate Swagger API documentation

# Docker commands
npm run docker:up        # Start all services (Backend + MongoDB + Mongo Express)
npm run docker:down      # Stop all services
npm run docker:stop      # Stop services without removing
npm run docker:restart   # Restart services
npm run docker:logs      # View real-time logs
npm run docker:build     # Rebuild Docker image
```

## Access Points

- **API**: http://localhost:5000
- **API Docs**: http://localhost:5000/api/docs
- **Health Check**: http://localhost:5000/api/health
- **Mongo Express** (Docker only): http://localhost:8081

## Environment Variables

Copy `.env.example` to `.env`:

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ibnalshaekh
JWT_SECRET=your-secret-here
NODE_ENV=development
```

## Project Structure

```
src/
├── app.ts                 # Express app configuration
├── server.ts              # Server entry point
├── seed.ts                # Database seeding
├── swagger.ts             # Swagger configuration
├── config/
│   ├── db.ts              # Database connection
│   └── index.ts           # Config exports
├── controllers/           # Request handlers
├── models/                # MongoDB models
├── routes/                # API routes
├── middleware/            # Express middleware
└── utils/                 # Helper utilities
```

## API Endpoints

All endpoints documented in Swagger at `/api/docs`

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register user
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create project (Admin)
- `PUT /api/projects/:id` - Update project (Admin)
- `DELETE /api/projects/:id` - Delete project (Admin)

### Services
- `GET /api/services` - Get all services
- `GET /api/services/:slug` - Get service by slug
- `POST /api/services` - Create service (Admin)
- `PUT /api/services/:id` - Update service (Admin)
- `DELETE /api/services/:id` - Delete service (Admin)

### And more...
See full API documentation at `/api/docs` after starting the server

## Database

- **Engine**: MongoDB
- **ODM**: Mongoose
- **Development**: Uses local MongoDB at `mongodb://localhost:27017`
- **Docker**: Uses MongoDB service in docker-compose

## Database Seeding

### Populate Database with Sample Data

The seed script populates your database with initial data including users, projects, services, categories, and more:

```bash
npm run seed
```

### What Gets Seeded

The seed script creates:

1. **Admin User**
   - Email: `admin@ibnalshaekh.com`
   - Password: `Admin123!`
   - Role: Admin (full access to all features)

2. **Site Settings**
   - Company name (Arabic & English)
   - Contact information (phone, email)
   - Social media links (Facebook, Twitter, Instagram, LinkedIn)
   - Working hours
   - Hero section content with statistics
   - About company description
   - Vision & values

3. **Project Categories** (2 categories)
   - Residential Buildings
   - Commercial Centers

4. **Projects** (5 sample projects)
   - Each with images, descriptions, category, status, and specifications
   - Bilingual content (Arabic & English)
   - Real construction project details

5. **Services** (5 services)
   - Building Construction
   - Interior Design
   - Project Management
   - Quality Assurance
   - Consultation
   - Each with descriptions and images

6. **Partners** (4 companies)
   - Strategic business partners
   - With company details and logos

7. **Departments** (3 departments)
   - Engineering
   - Project Management
   - Quality Assurance
   - With team information

### When to Use Seed

- **First-time setup**: Populate initial data for development
- **Reset database**: Clear and re-populate with fresh data
- **Testing**: Ensure consistent test data

### Before Seeding

Make sure:
1. MongoDB is running (local or Docker)
2. `.env` file is configured with `MONGODB_URI`
3. Database is empty (seed will check for existing data)

### Example

```bash
# Make sure you're in backend directory
cd backend

# Seed the database
npm run seed

# Output:
# ✅ Admin user created
# ✅ Site settings created
# ✅ Project categories created
# ✅ Projects created
# ✅ Services created
# ✅ Partners created
# ✅ Departments created
# ✅ Database seeded successfully!
```

### Testing the Seeded Data

After seeding, test with admin credentials:

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@ibnalshaekh.com",
    "password": "Admin123!"
  }'

# Or access the frontend and login through the UI
```

### Default Credentials

**Admin Account** (created during seed):
- Email: `admin@ibnalshaekh.com`
- Password: `Admin123!`
- Role: Admin (full system access)

## Troubleshooting

### Port 5000 already in use
```bash
# Windows - kill process using port 5000
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### MongoDB connection error
- Ensure MongoDB is running locally or Docker MongoDB service is healthy
- Check `MONGODB_URI` in `.env`

### Docker issues
```bash
# View detailed logs
npm run docker:logs

# Rebuild without cache
npm run docker:build

# Check service health
docker-compose ps
```

## Documentation

- **Full Setup Guide**: See [DOCKER_SETUP_GUIDE.md](../DOCKER_SETUP_GUIDE.md)
- **Swagger Docs**: Available at http://localhost:5000/api/docs
- **API Documentation**: See `../BACKEND_DOCUMENTATION.md`

## Technologies

- **Node.js** 20.x
- **TypeScript** 5.7.x
- **Express.js** 4.21.x
- **MongoDB** 7.0.x
- **Mongoose** 8.10.x
- **JWT Authentication**
- **Swagger/OpenAPI** 3.0
- **Multer** for file uploads
- **BCryptjs** for password hashing

## License

Private - Ibnalshaekh LLC
