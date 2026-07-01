# FindIt

Lost & Found platform for university students. Post lost or found items, browse listings, and manage your own posts.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React (Vite), React Router, Axios, CSS |
| **Backend** | Node.js, Express, Mongoose |
| **Database** | MongoDB |
| **Auth** | JWT (Bearer token), bcrypt |
| **Images** | Cloudinary, Multer |

## Features

### Authentication
- Register / Login with sliding yellow-themed UI
- JWT-based sessions (stored in `localStorage`)
- Forgot password & reset password flow
- Email and password validation (frontend + backend)

### Posts
- Create lost/found posts with images (Cloudinary upload)
- Browse all posts on the home feed (public, no login required)
- Search, filter by type/category, sort listings
- View post details with image gallery
- **My Posts** — view, edit, and delete your own listings only

### UI
- Single home page for everyone (guests + logged-in users)
- Profile menu with View Profile, My Posts, Create Post, Logout
- Responsive post cards with image hover carousel
- Hero banner slot (`client/public/hero-welcome.png`)

## Project Structure

```
FindIt/
├── client/
│   ├── public/
│   │   └── hero-welcome.png    # Hero banner (add your design here)
│   └── src/
│       ├── components/
│       │   ├── Auth/           # Login/Register sliding UI
│       │   ├── home/           # PostCard, FilterSidebar, MyPostCard
│       │   └── profile/        # ProfileMenu dropdown
│       ├── pages/
│       │   ├── Home.jsx        # Main feed (browse + filters)
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── CreatePost.jsx
│       │   ├── EditPost.jsx
│       │   ├── MyPosts.jsx
│       │   └── PostDetails.jsx
│       ├── context/            # AuthContext
│       ├── services/           # Axios API calls
│       └── utils/              # Validation, categories
└── server/
    ├── config/                 # MongoDB, Cloudinary, env
    ├── controllers/            # authController, postController
    ├── models/                 # User, Post
    ├── routes/                 # authRoutes, postRoutes
    ├── middleware/             # Auth, validation, upload
    └── utils/                  # Categories, Cloudinary upload, validation
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- [Cloudinary](https://cloudinary.com) account (for image uploads)

### 1. Clone & install

```bash
git clone https://github.com/sanuthmibandara/FindIt-Lost-and-Found-Platform.git
cd FindIt-Lost-and-Found-Platform

cd server && npm install
cd ../client && npm install
```

### 2. Backend environment

```bash
cd server
cp .env.example .env
```

Edit `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/findit
JWT_SECRET=your_strong_secret_here

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the API:

```bash
npm run dev
```

Runs at `http://localhost:5000`

### 3. Frontend

```bash
cd client
npm run dev
```

Runs at `http://localhost:5173`

Optional `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

## API Endpoints

### Health

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/health` | No | Health check |

### Auth

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Register user |
| POST | `/api/auth/login` | No | Login, returns JWT |
| POST | `/api/auth/forgot-password` | No | Request reset code |
| POST | `/api/auth/reset-password` | No | Reset password |

### Posts

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/api/posts` | No | Get all posts |
| GET | `/api/posts/my` | Yes | Get logged-in user's posts |
| GET | `/api/posts/:id` | No | Get single post |
| POST | `/api/posts` | Yes | Create post (multipart/form-data) |
| PUT | `/api/posts/:id` | Yes (owner) | Update post |
| DELETE | `/api/posts/:id` | Yes (owner) | Delete post |

Protected routes require: `Authorization: Bearer <token>`

### Create post (multipart fields)

| Field | Required | Notes |
|-------|----------|-------|
| `title` | Yes | |
| `description` | Yes | |
| `type` | Yes | `Lost` or `Found` |
| `category` | Yes | See categories below |
| `location` | Yes | |
| `dateLostOrFound` | Yes | ISO date string |
| `reward` | No | e.g. `LKR 500` |
| `images` | No | Up to 5 files, 5MB each |

## Post Categories

```
Electronics · Wallet · Keys · ID Card · Books · Clothing
Helmet · Bag · Jewelry · Water Bottle · Others
```

## Post Statuses

`Open` · `Claim Pending` · `Returned` · `Closed`

## Validation Rules

- **Email:** valid email format
- **Password:** min 8 chars, uppercase, lowercase, number, special character  
  Example: `Password1!`

## Frontend Routes

| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Home feed with search & filters |
| `/login` | Public | Sign in |
| `/register` | Public | Sign up |
| `/posts/:id` | Public | Post details |
| `/create-post` | Auth | Create new post |
| `/my-posts` | Auth | Manage your posts |
| `/edit-post/:id` | Auth (owner) | Edit a post |

## Hero Banner

Place your welcome banner at:

```
client/public/hero-welcome.png
```

**Recommended size:** `2400 × 560 px` (landscape, ~4.3:1 ratio)  
Display height is fixed at **280px**; image uses `object-fit: cover`.

## Development Progress

| Phase | Status |
|-------|--------|
| Day 1 — Project scaffolding | ✅ Done |
| Day 2 — Authentication (JWT, UI, forgot password) | ✅ Done |
| Day 3 — Posts CRUD, Cloudinary, home feed | ✅ Done |
| My Posts, Edit, Delete | ✅ Done |
| Claims & notifications | 🔜 Coming soon |

## Notes

- Do **not** commit `.env` files — only `.env.example`.
- Password reset codes are returned in the API response during development (no email service yet). In production, send via email.
- Restart the server after changing `.env` or adding new routes.

## Author

**Sanuthmi Bandara** — [GitHub](https://github.com/sanuthmibandara)
