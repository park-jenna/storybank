# StoryBank

A full-stack web app for preparing behavioral interviews. Create and organize STAR-method stories (Situation/Task, Action, Result).

## Features

- **User accounts** — Sign up and log in with email; JWT-based authentication
- **Story management** — Create, read, update, and delete your own STAR stories
- **STAR format** — Structure each story with Situation/Task, Action, and Result
- **Categories** — Tag stories with behavioral categories (Leadership, Teamwork, Problem Solving, etc.)
- **Common questions** — Browse a curated list of interview questions with recommended categories; save any question to My Questions and link one or more stories as answers
- **My Questions** — Manage the questions you saved and their story mappings in one place
- **Dashboard** — Overview of story completion, My Questions progress, category breakdown, and a “stories to complete” list for quick follow-up
- **Interview tips** — STAR explained in plain language and how it maps to StoryBank’s workflow
- **About** — In-app product overview with screenshots

## Live Demo & Test Account

- **Live demo**: [https://storybank-star.vercel.app](https://storybank-star.vercel.app)
- **Test account**:
  - **Email**: `test@test.com`
  - **Password**: `test1234`

## Screenshots

**Dashboard** — Stories and My Questions at a glance, with completion progress and category breakdown.



**Stories** — List, create, and manage your STAR stories.



## Tech Stack


| Layer      | Tech                                           |
| ---------- | ---------------------------------------------- |
| Frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend    | Express 5, Node.js                             |
| Database   | PostgreSQL, Prisma ORM                         |
| Auth       | JWT, bcrypt                                    |
| Validation | Zod                                            |
| Testing    | Vitest, Supertest (API integration tests)      |


## Database Schema (Prisma)

- **User**
  - `id`, `email`, `password`, `createdAt`
  - Relations: `stories`, `questions`
- **Story**
  - `id`, `userId`, `title`, `categories[]`, `situation`, `action`, `result`, `createdAt`
  - Relations: `user`, `questionLinks` (QuestionStory)
- **Question**
  - `id`, `userId`, `content`, `recommendedCategories[]`, `createdAt`
  - User-owned; created when a user saves a question from the common list (or adds their own).
  - Relations: `user`, `stories` (via QuestionStory)
- **QuestionStory**
  - `id`, `questionId`, `storyId`, `createdAt`
  - Links a saved question (`Question`) to one or more stories the user plans to use as answers.

## Project Structure

```
storybank/
├── frontend/                 # Next.js app
│   ├── src/
│   │   ├── app/              # Routes & pages
│   │   │   ├── dashboard/    # Overview, progress, stories to complete
│   │   │   ├── common-questions/  # Browse & save questions, link stories
│   │   │   ├── saved-questions/   # User `Question` rows & story links (UI: My Questions)
│   │   │   ├── stories/      # List, new, edit, detail
│   │   │   ├── interview-tips/    # STAR guide
│   │   │   ├── about/        # In-app overview
│   │   │   ├── login/, signup/
│   │   │   ├── styles/       # CSS styles
│   │   │   └── page.tsx      # Landing
│   │   ├── components/       # UI components
│   │   ├── constants/        # Categories, interview/common question definitions
│   │   ├── contexts/         # Theme, etc.
│   │   └── lib/              # API client, auth, stories, user-questions
│   └── ...
├── backend/                  # Express API
│   ├── src/
│   │   ├── server.js         # Main server file
│   │   ├── prisma.js         # Prisma client instance
│   │   ├── routes/           # auth, stories, questions, user-questions
│   │   ├── middleware/       # auth (JWT)
│   │   ├── schemas/          # Zod validation
│   │   ├── constants/        # commonQuestions (content + recommendedCategories)
│   │   └── utils/            # JWT helpers
│   └── prisma/               # Schema & migrations
└── README.md
```

## Prerequisites

- Node.js (v18+)
- PostgreSQL

## Setup

### 1. Backend

```bash
cd backend
npm install
npx prisma generate
```

Create `backend/.env`:

```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
JWT_SECRET="your-secret-key"
PORT=4000
```

For **production**, set `NODE_ENV=production` and `**CORS_ORIGINS`** to a comma-separated list of allowed browser origins (for example your Vercel frontend URL). If `CORS_ORIGINS` is empty in production, cross-origin browser requests are denied. Local dev allows `localhost` / `127.0.0.1` without extra config.

The API uses **Helmet** for security headers and **rate limits** signup/login (skipped when `NODE_ENV=test`).

Run migrations:

```bash
npx prisma migrate dev
```

Start the server:

```bash
npm run dev
```

API base: `http://localhost:4000`.

### Backend tests

Create a dedicated test env file:

```bash
cp backend/.env.test.example backend/.env.test
```

Set `backend/.env.test` to a separate PostgreSQL database via `TEST_DATABASE_URL`. Tests will fail fast if this variable is missing so they do not silently use `backend/.env` or a shared Supabase database.

Then run:

```bash
cd backend
npm test
```

For a local default test database, this repo includes a Docker Compose Postgres setup on port `5433` and a matching `backend/.env.test`:

```bash
cd backend
npm run test:prepare
npm test
```

Or run the whole flow in one command:

```bash
cd backend
npm run test:local
```

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

App: `http://localhost:3000`.

## API Overview


| Method | Endpoint                         | Auth | Description                                                                   |
| ------ | -------------------------------- | ---- | ----------------------------------------------------------------------------- |
| GET    | `/health`                        | No   | Health check                                                                  |
| POST   | `/auth/signup`                   | No   | Register (email, password)                                                    |
| POST   | `/auth/login`                    | No   | Login (email, password)                                                       |
| GET    | `/stories`                       | Yes  | List current user's stories                                                   |
| GET    | `/stories/:id`                   | Yes  | Get one story                                                                 |
| POST   | `/stories`                       | Yes  | Create story                                                                  |
| PATCH  | `/stories/:id`                   | Yes  | Update story                                                                  |
| DELETE | `/stories/:id`                   | Yes  | Delete story                                                                  |
| GET    | `/questions/common`              | Yes  | List common questions (with `alreadySaved` per question)                      |
| GET    | `/questions/:id/recommendations` | Yes  | Recommended stories for a common question (by category)                       |
| GET    | `/user-questions`                | Yes  | List user's saved questions (`Question`) and linked stories                   |
| GET    | `/user-questions/:id`            | Yes  | Get one saved question and its linked stories                                 |
| POST   | `/user-questions`                | Yes  | Save a common question (by `commonQuestionId`) and optionally link `storyIds` |
| PATCH  | `/user-questions/:id`            | Yes  | Update a saved question (`content`, `recommendedCategories`, `storyIds`)      |
| DELETE | `/user-questions/:id`            | Yes  | Delete a saved question and its story links                                   |


Stories request body: `title`, `categories`, `situation`, `action`, `result`.  
Saved question (PATCH) body: `content?`, `recommendedCategories?`, `storyIds?`.

## License

Built for learning and portfolio use.