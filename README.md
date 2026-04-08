# Inventory Management System

A production-ready Inventory Management System built for teams of ~100 people, featuring role-based access control, real-time stock alerts, and comprehensive activity logging.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Frontend**: React (Vite), Tailwind CSS
- **Auth**: JWT with role-based access control (Admin, Manager, Staff)
- **Testing**: Jest, Supertest, mongodb-memory-server
- **API Docs**: Swagger UI (OpenAPI 3.0)

## Features

- **Authentication**: Login/Signup with admin-approval workflow. The first registered user becomes Admin automatically.
- **Role-Based Access Control**: Admin, Manager, and Staff roles with granular permissions.
- **Inventory Dashboard**: Full CRUD operations for items (Name, SKU, Category, Quantity, Unit Price, Supplier).
- **Stock Alerts**: Items with quantity below 10 are highlighted with visual warnings.
- **Activity Log**: Tracks who created, updated, or deleted items and when.
- **Search & Filter**: Search items by SKU or Name; filter by Category.
- **API Documentation**: Interactive Swagger docs at `/api/docs`.

## Prerequisites

- Node.js >= 18
- MongoDB >= 6.0 (running locally or a cloud URI)
- npm >= 9

## Quick Start (Automated Setup)

The easiest way to get started is using the setup script. It installs MongoDB, sets up dependencies, generates a JWT secret, and runs the tests:

```bash
git clone https://github.com/Sarthak05U/InventoryManagementSystem.git
cd InventoryManagementSystem
chmod +x setup.sh
bash setup.sh
```

Then start the app:

```bash
# Terminal 1 - Backend
cd server && npm run dev

# Terminal 2 - Frontend
cd client && npm run dev
```

## Manual Setup

### 1. Install MongoDB

#### Ubuntu / Debian

```bash
sudo apt-get update
sudo apt-get install -y gnupg curl
curl -fsSL https://www.mongodb.org/static/pgp/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] http://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### macOS (Homebrew)

```bash
brew tap mongodb/brew
brew install mongodb-community@7.0
brew services start mongodb-community@7.0
```

#### Windows

Download and install from: https://www.mongodb.com/try/download/community

After installing, start the MongoDB service from Services or run:
```bash
net start MongoDB
```

#### Verify MongoDB is running

```bash
mongosh --eval "db.runCommand({ ping: 1 })"
```

### 2. Clone the repository

```bash
git clone https://github.com/Sarthak05U/InventoryManagementSystem.git
cd InventoryManagementSystem
```

### 3. Backend setup

```bash
cd server
cp .env.example .env
# Edit .env and set your JWT_SECRET (MONGO_URI defaults to localhost)
npm install
```

### 4. Frontend setup

```bash
cd client
npm install
```

### 5. Environment variables

Copy `.env.example` to `.env` in the **server** directory and configure:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/inventory_management` |
| `JWT_SECRET` | Secret key for JWT tokens | (set your own) |
| `JWT_EXPIRE` | Token expiration time | `7d` |

## Running the Application

### Start the backend

```bash
cd server
npm run dev
```

Server runs at `http://localhost:5000`  
API docs available at `http://localhost:5000/api/docs`

### Start the frontend

```bash
cd client
npm run dev
```

Frontend runs at `http://localhost:5173`

## Running Tests

```bash
cd server
npm test
```

Tests use an in-memory MongoDB instance, so no external database is needed.

## API Endpoints

### Auth
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/signup` | Register new user | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/me` | Get current user | Authenticated |
| PATCH | `/api/auth/approve/:id` | Approve user | Admin |
| GET | `/api/auth/pending` | Get pending users | Admin |
| GET | `/api/auth/users` | Get all users | Admin |

### Items
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/items` | List items (search/filter) | Authenticated |
| GET | `/api/items/:id` | Get single item | Authenticated |
| POST | `/api/items` | Create item | Admin, Manager |
| PUT | `/api/items/:id` | Update item | Admin, Manager |
| DELETE | `/api/items/:id` | Delete item | Admin |
| GET | `/api/items/alerts` | Low stock items | Authenticated |
| GET | `/api/items/categories` | All categories | Authenticated |

### Activity
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/activity` | Get activity logs | Authenticated |

## Project Structure

```
InventoryManagementSystem/
├── server/
│   ├── src/
│   │   ├── config/         # DB & Swagger config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/      # Auth & RBAC middleware
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routes
│   │   ├── utils/           # JWT helper
│   │   ├── __tests__/       # Jest test suites
│   │   └── index.js         # App entry point
│   ├── .env.example
│   └── package.json
├── client/
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # Reusable UI components
│   │   ├── context/         # Auth context
│   │   ├── pages/           # Page components
│   │   ├── App.jsx          # Router setup
│   │   └── main.jsx         # Entry point
│   ├── .env
│   └── package.json
├── .env.example
├── .gitignore
├── setup.sh            # Automated setup script
└── README.md
```

## Roles & Permissions

| Action | Admin | Manager | Staff |
|--------|-------|---------|-------|
| View items | Yes | Yes | Yes |
| Create items | Yes | Yes | No |
| Edit items | Yes | Yes | No |
| Delete items | Yes | No | No |
| Approve users | Yes | No | No |
| View activity log | Yes | Yes | Yes |
| View stock alerts | Yes | Yes | Yes |
