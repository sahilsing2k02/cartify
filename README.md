<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/b8ea1efb-33b2-483f-9f45-76d53580b53f" /># 🛒 Cartify — Inventory & Logistics Management System

Cartify is a full-stack **MERN** application built for modern retail and warehouse operations. It provides role-based portals for employers and employees, covering inventory management, sales terminals with printable receipts, and a complete packing/logistics workflow.

---

## ✨ Features

### 👤 User Management
- **Role-Based Access Control (RBAC):** Separate, protected portals for **Employers** and **Employees**.
- **Secure Authentication:** JWT-based session tokens with `bcryptjs` password hashing.
- **Protected Routes:** React Router guards redirect unauthenticated users to the login page.
- **Registration & Login:** Toggle between signing in and creating a new account on the same page (includes micro-interactive underline hover effects).
- **Self-Service Password Changes:** Users can update their password securely from the navigation bar.
- **Account Blocking Guard:** Employers can block or unblock employee accounts, immediately invalidating active JWT session tokens and preventing login.

### 💼 Employer Dashboard
- **Product Management:** Full CRUD for inventory items with name and price, complete with safe inline confirm toggles for deletions.
- **Stock Control:** Dedicated Stock tab to set and monitor unit quantities per product. Auto-clears out-of-stock flags when stock is replenished.
- **Session & Activity Logs:** Live reporting dashboard tracking consolidated sessions, last login time, last exit time, and access status (Blocked/Online/Offline) for all registered employees.
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
| `POST` | `/api/auth/login` | Public | Login and receive JWT (blocked users rejected) |
| `POST` | `/api/auth/logout` | Public | Log exit time for user session |
| `PUT` | `/api/auth/change-password` | Private | Change password for logged-in user |
| `GET` | `/api/auth/sessions` | Employer | List consolidated sessions and block statuses |
| `PUT` | `/api/auth/users/:id/block` | Employer | Block an employee user account |
| `PUT` | `/api/auth/users/:id/unblock` | Employer | Unblock an employee user account |

### Items
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/items` | Private | List all items |
| `POST` | `/api/items` | Employer | Create a new item |
| `PUT` | `/api/items/:id` | Employer | Update item name/price |
| `DELETE` | `/api/items/:id` | Employer | Delete an item (inline verification) |
| `PUT` | `/api/items/:id/stock` | Employer | Update stock quantity |
| `PUT` | `/api/items/:id/report` | Private | Flag item as out-of-stock |
| `POST` | `/api/items/checkout` | Private | Checkout cart and decrement stock levels in MongoDB |

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

## Some Screenshots of The projects
1.Admin Portal
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/b776f0da-c8e1-42ec-8e72-2228497929d9" />

2.After Login
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/7cd60134-4935-4a28-ae6b-9c45ca9a03b8" />

3.Inventory with adding and deleting options
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6210555f-8eef-4545-9d7e-0186b51fb76f" />

4. Distribution unit where we can add what to pack and deliver. 
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/19bac7b6-f20a-4436-8ce9-488257ee29f0" />

5. Variable stock unit where you can add and manage your stock. 
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/35a4a04d-caaf-4943-b634-895cd670409c" />

6. Activity log to monitor the security. 
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1cf4c3ea-1ff9-4090-ba5c-c02f35273403" />

Staff Portal
 Basically, in the staff portal, This is especially made for staff. In this portal, staff can create bills, report if the products are unavailable to stock up, and if there are any vulnerabilities or misleading information, we can address those as well. 
 The history of the products to be sent is also mentioned so that, in case of human error, we can refer back to it. 

 <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/88f53878-2934-4b1f-abc5-a776c430b4f6" />
 <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/bbb89dc3-34a2-41e5-8b52-80e42ef159ef" />
 <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/32d87d1c-df0d-49b6-b278-4b79174e68a0" />
 <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1ae53233-107b-4556-bc74-dfec24e9c0a5" />


## 📄 License
This project is licensed under **Sahil Singh 2026**.
