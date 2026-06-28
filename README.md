# FindIt

Lost & Found platform for university students.

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios
- **Backend:** Node.js, Express, Mongoose, JWT, bcrypt
- **Database:** MongoDB
- **Auth:** JWT (Bearer token)

## Project Structure

```
FindIt/
├── client/
│   └── src/
│       ├── components/   # Navbar, Auth UI
│       ├── pages/        # Home, Login, Register, Dashboard, etc.
│       ├── context/      # AuthContext
│       ├── services/     # Axios API calls
│       └── utils/        # Form validation
└── server/
    ├── config/           # MongoDB connection
    ├── controllers/      # Auth logic
    ├── models/           # User model
    ├── routes/           # API routes
    ├── middleware/       # Auth & validation
    └── utils/            # Shared validation rules
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas connection string

### Backend

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Create `server/.env` with:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/findit
JWT_SECRET=your_strong_secret_here
```

API runs at `http://localhost:5000`

### Frontend

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`

Optional `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login, returns JWT |
| POST | `/api/auth/forgot-password` | Request password reset code |
| POST | `/api/auth/reset-password` | Reset password with code |

### Auth request examples

**Register**
```json
{ "name": "John Doe", "email": "john@university.edu", "password": "Password1!" }
```

**Login**
```json
{ "email": "john@university.edu", "password": "Password1!" }
```

**Forgot password**
```json
{ "email": "john@university.edu" }
```

**Reset password**
```json
{ "email": "john@university.edu", "resetToken": "123456", "newPassword": "NewPass1!" }
```

Protected routes require header: `Authorization: Bearer <token>`

## Validation Rules

- **Email:** valid email format
- **Password:** minimum 8 characters, at least 1 uppercase, 1 lowercase, 1 number, and 1 special character

Example valid password: `Password1!`

## Development Phases

1. **Day 1:** Project scaffolding ✅
2. **Day 2:** Authentication (JWT, login/register UI, forgot password) ✅
3. **Day 3+:** Posts, search/filter, claim requests, notifications

## Notes

- Password reset codes are returned in the API response during development (no email service yet). In production, send the code via email instead.
- Never commit `.env` files — only `.env.example`.
