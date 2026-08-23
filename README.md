<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/b8ea1efb-33b2-483f-9f45-76d53580b53f" /># 🛒 Cartify — Inventory & Logistics Management System

Cartify is a full-stack **MERN** (MongoDB, Express, React 19, Node.js) web application built for retail, warehouse, and POS operations. It features role-based access control (Employers & Employees), inventory stock management, live sales checkout with thermal receipt printing, task distribution manifests, and real-time security access logs.

---

# 🛠️ SECTION 1: TECHNICAL DESCRIPTION

## 1. System Architecture & Tech Stack

Cartify follows a decoupled client-server architecture:

```text
┌─────────────────────────────────────────────────────────┐
│                    React 19 + Vite                      │
│        (Tailwind CSS v3, Axios Interceptors, Context API)│
└────────────────────────────┬────────────────────────────┘
                             │ REST API (JSON / JWT)
┌────────────────────────────▼────────────────────────────┐
│                  Node.js + Express.js                   │
│        (JWT Auth, RBAC Middleware, Session Tracking)    │
└────────────────────────────┬────────────────────────────┘
                             │ Mongoose ODM
┌────────────────────────────▼────────────────────────────┐
│                     MongoDB Database                    │
│        (Primary: Atlas SRV / Fallback: Local Instance)  │
└─────────────────────────────────────────────────────────┘
```

| Layer | Technology | Function |
|---|---|---|
| **Frontend Framework** | React 19 + Vite | High-performance SPA frontend |
| **Styling** | Tailwind CSS v3 | Modern responsive UI system |
| **State Management** | React Context API | Global authentication & session state |
| **HTTP Client** | Axios | Custom instance with request/response interceptors |
| **Routing** | React Router DOM v7 | Role-guarded client-side routes (`/admin`, `/employee`, `/login`) |
| **Print System** | `react-to-print` | Thermal-style receipt rendering & printing |
| **Backend Runtime** | Node.js + Express.js | REST API server on port `5001` |
| **Database** | MongoDB (Mongoose ODM) | Document database for users, items, tasks, sessions |
| **Authentication** | JSON Web Tokens (JWT) | Signed token authentication (30-day expiry) |
| **Password Hashing** | `bcryptjs` | Salted password hashing (10 rounds) |

---

## 2. Data Models & Management

Data is modeled and managed using Mongoose schemas across four primary entities:

### 👤 User Model (`models/User.js`)
- `username` (String, unique, required, min 3 chars)
- `password` (String, required, min 6 chars, hashed via `bcryptjs`, hidden by default)
- `role` (String, enum: `['admin', 'employee']`, required)
- `isBlocked` (Boolean, default `false` — toggling invalidates active sessions)

### 📦 Item Model (`models/Item.js`)
- `name` (String, required, trimmed)
- `price` (Number, required, min 0)
- `stock` (Number, default 0, min 0)
- `reportedOutOfStock` (Boolean, default `false`)

### 📋 Task Model (`models/Task.js`)
- `recipient` (String, required)
- `items` (`[{ item: Ref<Item>, quantity: Number }]`)
- `status` (String, enum: `['pending', 'packed', 'delivered']`, default `'pending'`)
- `remark` (String, default `''`)
- `createdBy` (`Ref<User>`, required)

### ⏱️ Session Model (`models/Session.js`)
- `user` (`Ref<User>`, required)
- `username` (String, required)
- `loginTime` (Date, default `Date.now`)
- `logoutTime` (Date, optional — closed on sign out or new session initialization)

---

## 3. Database Connection Resiliency & Seeding

Cartify includes automatic database fallback handling in `server.js` and `seed.js`:

1. **Primary**: Connects to MongoDB Atlas URI configured in `.env`.
2. **Fallback**: If network restrictions or DNS lookup issues prevent Atlas connection, the server automatically connects to local MongoDB (`mongodb://127.0.0.1:27017/cartify`), preventing backend downtime.
3. **Database Seeding**: Running `node seed.js` automatically initializes default accounts and products.

---

## 4. Security & Access Control Features

- **JWT Protection Middleware (`middleware/authMiddleware.js`)**: Validates token signatures and enforces role restrictions (`protect` and `adminOnly`).
- **Axios Authorization Interceptor (`utils/api.jsx`)**: Automatically attaches JWT bearer tokens to requests and catches `401`/`403` status codes.
- **Immediate Account Block Guard**: Blocking an employee from the Employer Dashboard invalidates their active requests instantly, triggering a clean auto-logout and redirecting to the login page with a notification.
- **Stale Session Auto-Closure**: Logging in auto-closes any previous open sessions for that user to prevent orphaned "Active Now" records in system logs.

---

## 5. REST API Endpoint Reference

### Authentication Routes (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register user (`employee` or `admin`) |
| `POST` | `/api/auth/login` | Public | Authenticate user & receive JWT token |
| `POST` | `/api/auth/logout` | Public | Record session exit timestamp |
| `GET` | `/api/auth/sessions` | Admin Only | Get system session activity logs |
| `PUT` | `/api/auth/change-password` | Private | Update user password |
| `PUT` | `/api/auth/users/:id/block` | Admin Only | Block employee account |
| `PUT` | `/api/auth/users/:id/unblock` | Admin Only | Unblock employee account |

### Inventory Routes (`/api/items`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/items` | Private | Retrieve all catalog items |
| `POST` | `/api/items` | Admin Only | Add new product |
| `PUT` | `/api/items/:id` | Admin Only | Update product details |
| `DELETE` | `/api/items/:id` | Admin Only | Delete product |
| `PUT` | `/api/items/:id/stock` | Admin Only | Update item unit stock level |
| `PUT` | `/api/items/:id/report` | Private | Report product out-of-stock |
| `POST` | `/api/items/checkout` | Private | Process sale & decrement stock |

### Task Routes (`/api/tasks`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/tasks` | Admin Only | Create packing & delivery task |
| `GET` | `/api/tasks` | Private | Retrieve assigned tasks |
| `PUT` | `/api/tasks/:id/status` | Private | Update task status (`pending` → `packed` → `delivered`) |
| `PUT` | `/api/tasks/:id/remark` | Private | Save persistent staff remark |

---

# 🚀 SECTION 2: USER USAGE & GETTING STARTED GUIDE

## 1. Prerequisites & Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** (comes bundled with Node.js)
- **MongoDB** (Atlas account or local MongoDB)

---

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd cartify
```

---

### Step 2: Set Up Backend
```bash
cd backend
npm install
```

Create a `.env` file inside `backend/`:
```env
PORT=5001
JWT_SECRET=supersecretkey_cartify_123
MONGO_URI=mongodb+srv://your_connection_string
```

---

### Step 3: Set Up Frontend
```bash
cd ../frontend
npm install
```

Optionally verify `.env` inside `frontend/`:
```env
VITE_API_URL=http://localhost:5001
```

---

### Step 4: Seed Demo Data (Optional)
To populate demo users and products automatically:
```bash
cd ../backend
node seed.js
```

---

## 2. Running the Application

Open **two terminal windows**:

**Terminal 1 — Backend API Server:**
```bash
cd backend
npm run dev
```
*Backend runs at:* **[http://localhost:5001](http://localhost:5001)**

**Terminal 2 — Frontend User Interface:**
```bash
cd frontend
npm run dev
```
*Frontend runs at:* **[http://localhost:5173](http://localhost:5173)**

👉 Open **[http://localhost:5173](http://localhost:5173)** in your web browser to launch Cartify.

---

## 3. Demo Credentials

| Portal | Role | Username | Password |
|---|---|---|---|
| **Employer Portal** | Admin / Employer | `admin` | `employer123` |
| **Employee Portal** | Staff / Employee | `staff` | `employee123` |

*Note: You can also register a new Employer or Employee account directly from the Sign In page by toggling to **Register**.*

---

## 4. User Feature Guide

### 💼 Employer / Admin Portal (`/admin`)
- **Inventory Tab**: Add new products (Name, Unit Price), edit prices, or remove products with inline confirm toggles.
- **Distribution Tab**: Create packing & logistics tasks by entering recipient details and selecting products and quantities.
- **Stock Tab**: Monitor live stock unit counts, update stock levels, and review items reported out-of-stock by employees.
- **Activity Logs Tab**: Review system user access logs (Login Time, Exit Time, Duration, Online/Offline state) and toggle employee account access (**Block / Unblock**).

### 🛠️ Employee / Staff Portal (`/employee`)
- **Sales Tab**: Browse product cards, add items to cart, enter customer names, checkout sales, and generate/print thermal receipts.
- **Tasks Tab (To Pack & History)**:
  - Check off items on packing manifests.
  - Advance status: **Pending → Packed → Delivered**.
  - Move delivered orders back to packing using **Undo**.
  - Write persistent staff remarks on tasks.
  - Handoff manifest items directly into the sales cart.
- **Stock Tab**: View live product availability and click **Report Empty** to alert management when stock runs out.
- **Password Management**: Change your account password securely at any time from the top navigation bar.

---

## 📸 Screenshots & Interface Tour

### 1. Admin Portal Overview
<img width="1920" height="1080" alt="Admin Portal" src="https://github.com/user-attachments/assets/b776f0da-c8e1-42ec-8e72-2228497929d9" />

### 2. Employer Dashboard
<img width="1920" height="1080" alt="Dashboard" src="https://github.com/user-attachments/assets/7cd60134-4935-4a28-ae6b-9c45ca9a03b8" />

### 3. Inventory Management
<img width="1920" height="1080" alt="Inventory" src="https://github.com/user-attachments/assets/6210555f-8eef-4545-9d7e-0186b51fb76f" />

### 4. Distribution Task Assignment
<img width="1920" height="1080" alt="Tasks" src="https://github.com/user-attachments/assets/19bac7b6-f20a-4436-8ce9-488257ee29f0" />

### 5. Variable Stock Control
<img width="1920" height="1080" alt="Stock Control" src="https://github.com/user-attachments/assets/35a4a04d-caaf-4943-b634-895cd670409c" />

### 6. System Activity & Access Control Logs
<img width="1920" height="1080" alt="Activity Logs" src="https://github.com/user-attachments/assets/1cf4c3ea-1ff9-4090-ba5c-c02f35273403" />

### 7. Staff POS & Billing Terminal
<img width="1920" height="1080" alt="Staff Terminal" src="https://github.com/user-attachments/assets/88f53878-2934-4b1f-abc5-a776c430b4f6" />
<img width="1920" height="1080" alt="Staff POS 2" src="https://github.com/user-attachments/assets/bbb89dc3-34a2-41e5-8b52-80e42ef159ef" />
<img width="1920" height="1080" alt="Staff POS 3" src="https://github.com/user-attachments/assets/32d87d1c-df0d-49b6-b278-4b79174e68a0" />
<img width="1920" height="1080" alt="Staff POS 4" src="https://github.com/user-attachments/assets/1ae53233-107b-4556-bc74-dfec24e9c0a5" />

---

## 📄 License
This project is maintained under **Sahil Singh 2026**.
