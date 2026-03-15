# StoryBank

A full-stack web app for preparing behavioral interviews. Create and organize STAR-method stories (Situation/Task, Action, Result).
## Features

- **User accounts** — Sign up and log in with email; JWT-based authentication
- **Story management** — Create, read, update, and delete your own STAR stories
- **STAR format** — Structure each story with Situation/Task, Action, and Result
- **Categories** — Tag stories with behavioral categories (Leadership, Teamwork, Problem Solving, etc.)
- **Common questions** — Browse a curated list of interview questions with recommended categories; save any question to your collection and link one or more stories as answers
- **Saved questions** — Manage your saved questions and their story mappings in one place
- **Dashboard** — Overview of story completion, saved questions progress, category breakdown, and a “stories to complete” list for quick follow-up

## Live Demo & Test Account

- **Live demo**: [https://storybank-star.vercel.app](https://storybank-star.vercel.app)
- **Test account**:
  - **Email**: `test@test.com`
  - **Password**: `test1234`

## Screenshots

**Dashboard** — Stories and saved questions at a glance, with completion progress and category breakdown.

<img src="img/dashboard.png" width="600" alt="Dashboard" />

**Add Story** — Create a new story with STAR format (Situation/Task, Action, Result).

<img src="img/addStory.png" width="500" alt="Add Story" />

## Tech Stack

| Layer       | Tech                                              |
|------------|----------------------------------------------------|
| Frontend   | Next.js 16, React 19, TypeScript, Tailwind CSS     |
| Backend    | Express.js, Node.js                               |
| Database   | PostgreSQL, Prisma ORM                            |
| Auth       | JWT, bcrypt                                       |
| Validation | Zod                                               |

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
  - Links a saved question to one or more stories the user plans to use as answers.

## Project Structure

```
storybank/
├── frontend/                 # Next.js app
│   ├── src/
│   │   ├── app/              # Routes & pages
│   │   │   ├── dashboard/    # Overview, progress, stories to complete
│   │   │   ├── common-questions/  # Browse & save questions, link stories
│   │   │   ├── saved-questions/   # My saved questions & story links
│   │   │   ├── stories/      # List, new, edit, detail
│   │   │   ├── login/, signup/
│   │   │   └── page.tsx      # Landing
│   │   ├── components/       # UI components
│   │   ├── constants/        # Categories, common question definitions
│   │   └── lib/              # API client, auth, stories, user-questions
│   └── ...
├── backend/                  # Express API
│   ├── src/
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

API base: `http://localhost:4000`.

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

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/health` | No | Health check |
| POST | `/auth/signup` | No | Register (email, password) |
| POST | `/auth/login` | No | Login (email, password) |
| GET | `/stories` | Yes | List current user's stories |
| GET | `/stories/:id` | Yes | Get one story |
| POST | `/stories` | Yes | Create story |
| PATCH | `/stories/:id` | Yes | Update story |
| DELETE | `/stories/:id` | Yes | Delete story |
| GET | `/questions/common` | Yes | List common questions (with `alreadySaved` per question) |
| GET | `/questions/:id/recommendations` | Yes | Recommended stories for a common question (by category) |
| GET | `/user-questions` | Yes | List user's saved questions and linked stories |
| GET | `/user-questions/:id` | Yes | Get one saved question and its linked stories |
| POST | `/user-questions` | Yes | Save a common question (by `commonQuestionId`) and optionally link `storyIds` |
| PATCH | `/user-questions/:id` | Yes | Update a saved question (`content`, `recommendedCategories`, `storyIds`) |
| DELETE | `/user-questions/:id` | Yes | Delete a saved question and its story links |

Stories request body: `title`, `categories`, `situation`, `action`, `result`.  
Saved question (PATCH) body: `content?`, `recommendedCategories?`, `storyIds?`.

## License

Built for learning and portfolio use.
