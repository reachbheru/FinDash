# FinDash - Financial Management API

A comprehensive financial management REST API built with Node.js, Express, and MongoDB. Track income, expenses, and analyze spending patterns with advanced dashboard analytics.

## 📋 Features

- **User Management**: Registration, login, profile management with JWT authentication
- **Transaction Management**: Create, read, update, delete transactions with soft delete support
- **Admin System**: Separate admin authentication with secret key protection
- **Role-Based Access Control**: Three roles (admin, analyst, viewer) with granular permissions
- **Dashboard Analytics**:
  - Monthly & weekly trends analysis
  - Income vs expense comparison
  - Category-wise breakdown with percentages
  - Spending patterns (by day of week, top categories, top dates)
  - Average daily spending calculations
  - Recent transactions view
- **Advanced Filtering**: Filter by type, category, date range with pagination
- **Transaction Summary**: Overview with income, expense, and balance calculations
- **Error Handling**: Comprehensive error handling with proper HTTP status codes
- **Logging**: Colored console logging with structured event types
- **Rate Limiting**: API rate limiting for security
- **Data Validation**: Zod-based input validation with DTOs

## 🛠 Tech Stack

- **Backend**: Node.js + Express.js 5.2.1
- **Database**: MongoDB with Mongoose 9.3.3
- **Authentication**: JWT (access tokens: 7 days, refresh tokens: 30 days)
- **Validation**: Zod schemas
- **Security**: Helmet, bcrypt password hashing, CORS, rate limiting
- **Logging**: Chalk for colored console output
- **Environment**: dotenv for environment variables

## 📦 Installation

```bash
# Clone the repository
git clone https://github.com/reachbheru/FinDash.git
cd FinDash

# Install dependencies
npm install
```

## 🔧 Environment Setup

1. Create a `.env` file in the root directory:

```env
# Server
PORT=8000
NODE_ENV=development

# Database
MONGO_URI=db_uri
MONGO_TEST_URI=test_db_uri

# JWT
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_secret_key_here
ACCESS_TOKEN_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d

# Admin
ADMIN_SECRET_KEY=your_admin_secret_key_here

# CORS
CORS_ORIGIN=http://localhost:3000
```

2. Refer to `.env.example` for complete configuration

## 🚀 Running the Project

```bash
# Development mode (with auto-reload)
npm run start:dev

# Production mode
npm run start

# Seed database with 50 sample transactions
npm run seed
```

Server runs on `http://localhost:8000`

## 📊 Database Seeding

The seed script populates the database with:
- **50 sample transactions** spanning 90 days
- **7 income transactions** ($11,500 total)
- **39 expense transactions** ($4,251.46 total)
- **Admin user**: admin@findash.com
- **Multiple categories**: Food, Transport, Utilities, Entertainment, Healthcare, Education, Shopping, Rent, Insurance, Subscriptions, etc.

```bash
npm run seed
```

## 🔐 Authentication

### User Registration & Login
```
POST /api/v1/users/register
POST /api/v1/users/login
```

### Admin Authentication
```
POST /api/v1/admin/register (requires ADMIN_SECRET_KEY header)
POST /api/v1/admin/login
```

**Note**: Admin registration requires the `ADMIN_SECRET_KEY` in request body to prevent unauthorized admin creation.

## 📡 API Endpoints

### Transaction Endpoints
- `GET /api/v1/transactions` - Get all transactions with pagination
- `GET /api/v1/transactions/:id` - Get single transaction
- `POST /api/v1/transactions` - Create transaction
- `PUT /api/v1/transactions/:id` - Update transaction
- `DELETE /api/v1/transactions/:id` - Soft delete transaction
- `POST /api/v1/transactions/restore/:id` - Restore deleted transaction
- `GET /api/v1/transactions/summary` - Get transaction summary
- `POST /api/v1/transactions/bulk-delete` - Bulk delete transactions

### Dashboard Endpoints
- `GET /api/v1/dashboard/overview` - Dashboard overview with statistics
- `GET /api/v1/dashboard/monthly-trends` - Monthly trends analysis
- `GET /api/v1/dashboard/weekly-trends` - Weekly trends analysis
- `GET /api/v1/dashboard/recent-transactions` - Recent transactions
- `GET /api/v1/dashboard/category-breakdown` - Category-wise breakdown
- `GET /api/v1/dashboard/spending-patterns` - Spending patterns analysis
- `GET /api/v1/dashboard/income-expense-comparison` - Income vs expense comparison

### User Endpoints
- `GET /api/v1/users/profile` - Get user profile
- `PUT /api/v1/users/profile` - Update user profile
- `POST /api/v1/users/change-password` - Change password

## 🧪 Testing with Postman

1. Import the Postman collection: `FinDash-API.postman_collection.json`
2. Import environment variables: `FinDash-Environment.postman_environment.json`
3. The collection includes 50+ documented endpoints with example requests

**Login Flow:**
1. Register/Login as user or admin
2. Copy the `accessToken` from response
3. Set it in Postman environment: `token = <accessToken>`
4. All protected endpoints will use this token automatically

## 📚 Swagger/OpenAPI Documentation

Interactive API documentation with built-in testing:

**Access Swagger UI:** `http://localhost:8000/api/v1/docs`

**How to test protected endpoints:**
1. Open Swagger UI
2. Find a protected endpoint (indicated with 🔒 lock icon)
3. Click the **"Authorize"** button (top-right)
4. Paste your JWT token: `<your_access_token_here>` (just the token, no "Bearer" prefix)
5. Click "Authorize"
6. Try out any protected endpoint - the token will be automatically included

**Quick Start:**
```bash
# 1. Login to get token
POST /api/v1/users/login
Body: { "email": "admin@findash.com", "password": "..." }
Response: { "accessToken": "eyJ0eXAi..." }

# 2. Copy accessToken
# 3. Click Authorize button in Swagger
# 4. Paste token
# 5. Test any endpoint
```

**Features:**
- 🔒 Lock icon shows protected endpoints
- 💾 Token persists across page refreshes (persistAuthorization enabled)
- 📝 Try out endpoints directly from browser
- 📊 See responses in real-time
- 🔍 Full request/response inspection

## 📅 Test Data Date Range

Seeded transactions span **90 days**:
- **Start Date**: January 6, 2026
- **End Date**: April 5, 2026

Use these dates for testing filter endpoints:
```
?startDate=2026-01-06&endDate=2026-04-05
```

## 🎯 Query Parameters

### Transactions
- `page` - Page number (default: 1)
- `limit` - Results per page (default: 10)
- `type` - Filter by type (income/expense)
- `category` - Filter by category
- `startDate` - Filter from date (ISO format)
- `endDate` - Filter to date (ISO format)
- `sortBy` - Sort field (default: -date)

### Dashboard
- `months` - Number of months for trends (default: 12)
- `weeks` - Number of weeks for trends (default: 12)
- `startDate` - Custom start date for monthly trends
- `period` - Period for comparison (week/month)
- `type` - Filter by transaction type
- `limit` - Limit recent transactions (default: 10)

## 📝 Error Handling

The API returns standardized error responses:
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400
}
```

**Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate entry)
- `500` - Server Error

## 📂 Project Structure

```
src/
├── admin/                 # Admin authentication system
├── user/                  # User management
├── transaction/           # Transaction CRUD operations
├── dashboard/             # Analytics & dashboards
├── middlewares/           # Authentication, validation, logging
├── common/                # Utilities (logger, JWT, enums)
└── server.js              # Express app initialization

root/
├── README.md              # This file
├── .env.example           # Environment template
├── package.json           # Dependencies
├── seed-transactions.js   # Database seeding script
```

## 🔄 Development Workflow

1. Start development server: `npm run start:dev`
2. Check logs for any errors
3. Test endpoints using Postman collection
4. Database changes persist in MongoDB
5. Use seed script to reset data: `npm run seed`

## 🤝 Role-Based Access

| Role | Permissions |
|------|------------|
| **Admin** | Full access to all endpoints, can manage users |
| **Analyst** | Can view and create transactions, access all dashboard features |
| **Viewer** | Read-only access to transactions and dashboards |

---

**Version**: 1.0.0  
**Last Updated**: April 5, 2026
