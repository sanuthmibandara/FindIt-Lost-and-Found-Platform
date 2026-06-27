# FindIt

Lost & Found platform for university students.

## Tech Stack

- **Frontend:** React (Vite), React Router, Axios
- **Backend:** Node.js, Express, Mongoose
- **Database:** MongoDB

## Project Structure

```
FindIt/
├── client/     # React frontend
└── server/     # Express API
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB running locally or a MongoDB Atlas connection string

### Backend

```bash
cd server
cp .env.example .env   # Edit MONGO_URI if needed
npm install
npm run dev
```

API runs at `http://localhost:5000`. Health check: `GET /api/health`

### Frontend

```bash
cd client
npm install
npm run dev
```

App runs at `http://localhost:5173`

## Development Phases

1. **Day 1 (current):** Project scaffolding
2. **Day 2:** Authentication (JWT)
3. **Later:** Posts, claims, notifications
