# ⚙️ Cartify - Backend

The server-side API for Cartify, built with Node.js, Express, and MongoDB.

## 🚀 Features
- **Authentication:** Secure login and registration using JWT and Bcrypt.
- **RESTful API:** Endpoints for inventory items and user management.
- **Database:** MongoDB integration via Mongoose.
- **Security:** Helmet, CORS, and role-based permissions.

## 🛠️ API Endpoints

### Auth
- `POST /api/auth/register` - Create a new user.
- `POST /api/auth/login` - Authenticate user and receive token.

### Items
- `GET /api/items` - List all inventory items (All authenticated users).
- `POST /api/items` - Add a new item (Employer only).
- `PUT /api/items/:id` - Update an existing item (Employer only).
- `DELETE /api/items/:id` - Remove an item (Employer only).

## 🛡️ Authentication Middleware
The backend uses custom middleware to secure routes:
- `protect`: Verifies the JWT and attaches the user object to the request.
- `employerOnly`: Restricts access to users with the `employer` role.

## 🛠️ Scripts
- `npm start`: Runs the server.
- `npm run dev`: Runs the server (development mode).

## 📁 Structure
- `models/`: Mongoose schemas.
- `routes/`: API endpoint definitions.
- `server.js`: Entry point.

## 🔧 Environment Variables
Create a `.env` file with:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
```
