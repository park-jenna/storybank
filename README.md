# StoryBank

Save and organize behavioral interview stories. Create, edit, and refine your STAR-method responses (Situation/Task, Action, Result) for job interviews.

## Features

- **User accounts** — Sign up and log in with email; JWT-based authentication
- **Story management** — Create, read, update, and delete your own stories
- **STAR format** — Structure stories with Situation/Task, Action, and Result sections
- **Categories** — Tag stories with behavioral categories (Leadership, Teamwork, Problem Solving, etc.)
- **Dashboard** — View and manage all your stories in one place

## Live Demo & Test Account

- **Live demo**: [https://storybank-star.vercel.app](https://storybank-star.vercel.app)
- **Test account**:
  - **Email**: `test@test.com`
  - **Password**: `test1234`

## Screenshots

**Dashboard** — View and manage all your stories in one place.

<img src="img/dashboard.png" width="600" alt="Dashboard" />

**Add Story** — Create a new story with STAR format (Situation/Task, Action, Result).

<img src="img/addStory.png" width="500" alt="Add Story" />

## Tech Stack

| Layer      | Tech                         |
|-----------|------------------------------|
| Frontend  | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend   | Express.js, Node.js          |
| Database  | PostgreSQL, Prisma ORM       |
| Auth      | JWT, bcrypt                  |
| Validation| Zod                          |

## Project Structure

```
storybank/
├── frontend/          # Next.js app
│   ├── src/
│   │   ├── app/       # Pages (login, signup, dashboard, stories)
│   │   ├── constants/ # Categories and badges
│   │   └── lib/       # API client, auth helpers
│   └── ...
├── backend/           # Express API
│   ├── src/
│   │   ├── routes/    # auth, stories
│   │   ├── middleware/# auth middleware
│   │   ├── schemas/   # Zod validation
│   │   └── utils/     # JWT helpers
│   └── prisma/        # Schema and migrations
└── README.md
```

## Prerequisites

- Node.js (v18+)
- PostgreSQL database

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-secret-key"
PORT=4000
```

Run migrations:

```bash
npx prisma migrate dev
```

Start the server:

```bash
npm run dev
```

The API runs at `http://localhost:4000`.

### 2. Frontend

```bash
cd frontend
npm install
```

Create `frontend/.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
```

Start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## API Overview

| Method | Endpoint         | Auth | Description              |
|--------|------------------|------|--------------------------|
| GET    | `/health`        | No   | Health check             |
| POST   | `/auth/signup`   | No   | Register (email, password) |
| POST   | `/auth/login`    | No   | Login (email, password)  |
| GET    | `/stories`       | Yes  | List user's stories      |
| GET    | `/stories/:id`   | Yes  | Get single story         |
| POST   | `/stories`       | Yes  | Create story             |
| PATCH  | `/stories/:id`   | Yes  | Update story             |
| DELETE | `/stories/:id`   | Yes  | Delete story             |

Stories require: `title`, `categories`, `situation`, `action`, `result`.

## License

Demo project built for learning and portfolio purposes.
