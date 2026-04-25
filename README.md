# 🛒 Cartify — Inventory & Logistics Management System

Cartify is a full-stack **MERN** application built for modern retail and warehouse operations. It provides role-based portals for employers and employees, covering inventory management, sales terminals with printable receipts, and a complete packing/logistics workflow.

---

## ✨ Features

### 👤 User Management
- **Role-Based Access Control (RBAC):** Separate, protected portals for **Employers** and **Employees**.
- **Secure Authentication:** JWT-based session tokens with `bcryptjs` password hashing.
- **Protected Routes:** React Router guards redirect unauthenticated users to the login page.
- **Registration & Login:** Toggle between signing in and creating a new account on the same page.

### 💼 Employer Dashboard
- **Product Management:** Full CRUD (Create, Read, Update, Delete) for inventory items with name and price.
- **Stock Control:** Dedicated Stock tab to set and monitor unit quantities per product. Auto-clears out-of-stock flags when stock is replenished.
- **Logistics Assignment:** Create packing/delivery tasks for employees with a recipient, selected items, and quantities via the TaskCreator component.
- **Task Overview:** View all assigned tasks with live status badges (Pending → Packed → Delivered) and staff remarks.

### 🛠️ Employee Portal
- **Sales Terminal:** Browse the live product catalogue and add items to a cart.
- **Cart & Checkout:** Full cart management — update quantities, remove items, enter a customer name, and finalize with a professional bill.
- **Printable Receipts:** Thermal-style receipts (₹ currency, VAT breakdown, receipt ID, barcode placeholder) generated via `react-to-print`.
- **Task Management:** Two-tab task view — **To Pack** (pending + packed tasks) and **History** (delivered tasks).
  - Check off individual items on a packing manifest as you prepare them.
  - Advance task status: **Pending → Packed → Delivered**.
  - **Undo delivery:** Move a delivered task back to Packed status with a single click.
  - **Staff Remarks:** Write and save persistent notes per task (e.g., "Item X was out of stock").
  - **Handoff to Checkout:** Push ticked packing manifest items directly into the sales cart.
- **Stock Reporting:** View live stock levels and flag items as out-of-stock to notify management.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 19 + Vite |
| Styling | Tailwind CSS v3 |
| State Management | React Context API |
| HTTP Client | Axios |
| Routing | React Router DOM v7 |
| Print | react-to-print |
| Backend Runtime | Node.js + Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JSON Web Tokens (JWT) |
| Password Hashing | bcryptjs |
| Dev Server | Nodemon |

---

## 🏁 Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **MongoDB Atlas** account (recommended) or a local MongoDB instance
- `npm` (comes with Node.js)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd cartify
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` directory (copy from `.env.example`):
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_strong_random_secret
```

> ⚠️ **Never commit your `.env` file.** It is included in `.gitignore`.

### 3. Frontend Setup
```bash
cd ../frontend
npm install
```

Optionally create a `.env` file in `frontend/` to point at a different backend:
```env
VITE_API_URL=http://localhost:5000
```

---

## ▶️ Running the Application

Open **two terminals** side-by-side:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev     # starts with nodemon (auto-restarts on file changes)
# or: npm start  (production, plain node)
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev     # starts Vite dev server at http://localhost:5173
```

### 🌱 Seed the Database (Optional)
Populate the database with demo users and products:
```bash
cd backend
node seed.js
```
This creates:
| Username | Password | Role |
|---|---|---|
| `admin` | `employer123` | Employer |
| `staff` | `employee123` | Employee |

---

## 📂 Project Structure

```text
cartify/
├── README.md
├── .gitignore
│
├── backend/                    # Express.js API Server
│   ├── middleware/
│   │   └── authMiddleware.js   # JWT protect & employerOnly guards
│   ├── models/
│   │   ├── User.js             # User schema (username, password, role)
│   │   ├── Item.js             # Item schema (name, price, stock, reportedOutOfStock)
│   │   └── Task.js             # Task schema (recipient, items, status, remark)
│   ├── routes/
│   │   ├── authRoutes.js       # POST /register, POST /login
│   │   ├── itemRoutes.js       # CRUD + /stock + /report endpoints
│   │   └── taskRoutes.js       # CRUD + /status + /remark endpoints
│   ├── seed.js                 # Database seeder (demo users + items)
│   ├── server.js               # App entry point
│   ├── .env.example            # Environment variable template
│   └── package.json
│
└── frontend/                   # React + Vite Application
    ├── src/
    │   ├── components/
    │   │   ├── Cart.jsx         # Cart sidebar with VAT + checkout + receipt
    │   │   ├── Navbar.jsx       # Top navigation with user info + logout
    │   │   ├── Receipt.jsx      # Printable thermal-style receipt
    │   │   └── TaskCreator.jsx  # Employer task assignment form
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state (login, register, logout)
    │   ├── pages/
    │   │   ├── Login.jsx        # Combined login/register page
    │   │   ├── employer/
    │   │   │   └── Dashboard.jsx  # Inventory, Distribution, Stock tabs
    │   │   └── employee/
    │   │       └── Portal.jsx     # Sales, Tasks, Stock tabs
    │   ├── utils/
    │   │   └── api.jsx          # Axios instance with JWT interceptor
    │   ├── App.jsx              # Router + PrivateRoute guards
    │   └── index.css            # Global Tailwind layers + custom utilities
    ├── tailwind.config.js       # Custom primary palette, shadows, animations
    ├── vite.config.js
    ├── .env.example
    └── package.json
```

---

## 🔌 API Reference

### Auth
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login and receive JWT |

### Items
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/items` | Private | List all items |
| `POST` | `/api/items` | Employer | Create a new item |
| `PUT` | `/api/items/:id` | Employer | Update item name/price |
| `DELETE` | `/api/items/:id` | Employer | Delete an item |
| `PUT` | `/api/items/:id/stock` | Employer | Update stock quantity |
| `PUT` | `/api/items/:id/report` | Private | Flag item as out-of-stock |

### Tasks
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/tasks` | Employer | Create a packing/delivery task |
| `GET` | `/api/tasks` | Private | List all tasks |
| `PUT` | `/api/tasks/:id/status` | Private | Update task status |
| `PUT` | `/api/tasks/:id/remark` | Private | Save a staff remark |

---

## 🔒 Security
- Passwords hashed with `bcryptjs` (10 salt rounds).
- JWT tokens expire after **30 days**.
- All sensitive configuration stored in `.env` (excluded from version control).
- Role-based middleware (`employerOnly`) enforces access at the API level.

---

## 📄 License
This project is licensed under **Sahil Singh**.
