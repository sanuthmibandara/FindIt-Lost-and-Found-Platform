# FindIt

Lost & Found platform for university students. Post lost or found items, browse listings, connect lost reports with found items, and verify ownership through claims.

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
- View post details with image gallery and activity timeline
- **My Posts** — view, edit, and delete your own listings only
- Returned items cannot be edited or deleted (history preserved)

### Lost → Found → Claim workflow
1. **User A** posts a **Lost** item.
2. **User B** sees the Lost post and clicks **I Found This Item**.
3. **User B** is taken to Create Post with fields pre-filled from the Lost post.
4. **User B** submits a **Found** post linked to the original Lost report (`linkedLostPost`).
5. **User A** opens the Found post and clicks **Claim Item**.
6. **User B** (Found post owner) reviews verification answers and approves or rejects.
7. On approval, the Found post status becomes **Returned** and other pending claims are rejected.

| Post type | Action button | Who sees it |
|-----------|---------------|-------------|
| **Lost** | I Found This Item | Non-owners (navigates to pre-filled Found post form) |
| **Found** | Claim This Item | Non-owners (opens verification modal) |

### Claims
- Submit verification answers when claiming a Found item
- **My Claims** — track submitted claims (Pending, Approved, Rejected, Cancelled)
- **Received Claims** — post owners review answers and approve/reject
- Cancel a pending claim from My Claims
- Activity timeline on Found post details (Posted → Claim Submitted → Approved → Returned)

### UI
- Single home page for everyone (guests + logged-in users)
- Profile menu with View Profile, My Posts, My Claims, Received Claims, Create Post, Logout
- Responsive post cards with image hover carousel
- Toast notifications for success and error feedback
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
│       │   ├── claims/         # ClaimModal, PostTimeline
│       │   ├── home/           # PostCard, FilterSidebar, MyPostCard
│       │   ├── profile/        # ProfileMenu dropdown
│       │   └── Toast/          # Toast notifications
│       ├── pages/
│       │   ├── Home.jsx        # Main feed (browse + filters)
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── CreatePost.jsx
│       │   ├── EditPost.jsx
│       │   ├── MyPosts.jsx
│       │   ├── MyClaims.jsx
│       │   ├── ReceivedClaims.jsx
│       │   └── PostDetails.jsx
│       ├── context/            # AuthContext, ToastContext
│       ├── services/           # Axios API calls
│       └── utils/              # Validation, categories, claims
└── server/
    ├── config/                 # MongoDB, Cloudinary, env
    ├── controllers/            # authController, postController, claimController
    ├── models/                 # User, Post, Claim
    ├── routes/                 # authRoutes, postRoutes, claimRoutes
    ├── middleware/             # Auth, validation, upload, claim auth
    └── utils/                  # Categories, claim statuses, Cloudinary upload
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
| GET | `/api/posts/:id` | Optional | Get single post (JWT adds `userClaim`, `isOwner`, timeline) |
| POST | `/api/posts` | Yes | Create post (multipart/form-data) |
| PUT | `/api/posts/:id` | Yes (owner) | Update post |
| DELETE | `/api/posts/:id` | Yes (owner) | Delete post |

### Claims

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/claims` | Yes | Submit a claim on a Found post |
| GET | `/api/claims/my` | Yes | Claims submitted by the logged-in user |
| GET | `/api/claims/received` | Yes | Claims on posts owned by the logged-in user |
| GET | `/api/claims/post/:postId` | Yes | User's claim for a specific post |
| PATCH | `/api/claims/:id/approve` | Yes (post owner) | Approve claim; marks Found post as Returned |
| PATCH | `/api/claims/:id/reject` | Yes (post owner) | Reject claim |
| DELETE | `/api/claims/:id` | Yes (claimer) | Cancel a pending claim |

**Claim rules:**
- Only authenticated users can create claims
- Users cannot claim their own posts
- Only the Found post owner can approve or reject
- One pending claim per user per post
- On approve: claim → Approved, post → Returned, other pending claims → Rejected

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
| `linkedLostPost` | No | MongoDB ID of a Lost post (Found posts only) |

### Create claim (JSON body)

| Field | Required | Notes |
|-------|----------|-------|
| `postId` | Yes | Found post ID |
| `answers.describeItem` | Yes | Describe the item |
| `answers.location` | Yes | Where it was lost/found |
| `answers.identifyingMarks` | No | Distinguishing features |
| `answers.additionalInfo` | No | Any other proof of ownership |

## Post Categories

```
Electronics · Wallet · Keys · ID Card · Books · Clothing
Helmet · Bag · Jewelry · Water Bottle · Others
```

## Post Statuses

`Open` · `Claim Pending` · `Returned` · `Closed`

## Claim Statuses

`Pending` · `Approved` · `Rejected` · `Cancelled`

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
| `/posts/:id` | Public | Post details (claim / I Found This Item on Found / Lost posts) |
| `/create-post` | Auth | Create new post |
| `/create-post?fromLost=:id` | Auth | Create Found post pre-filled from a Lost post |
| `/my-posts` | Auth | Manage your posts |
| `/my-claims` | Auth | Claims you have submitted |
| `/received-claims` | Auth | Claims on your posts (approve/reject) |
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
| Day 4 — Claims, Lost/Found linking, verification flow | ✅ Done |
| Notifications (email / in-app) | 🔜 Coming soon |

## Notes

- Do **not** commit `.env` files — only `.env.example`.
- Password reset codes are returned in the API response during development (no email service yet). In production, send via email.
- Restart the server after changing `.env` or adding new routes.

## Author

**Sanuthmi Bandara** — [GitHub](https://github.com/sanuthmibandara)
