# Khaata

Khaata is a full-stack bill-splitting app that helps friends track shared expenses, see balances, and settle up quickly. The project has a Node.js/Express API, Mongo database and a Next.js frontend.

## Features

- Email/password authentication with JWT
- Friend discovery and requests (send, accept, reject)
- Create, update, and delete expenses
- Multiple split methods: equal, unequal, percentage, and shares
- Per-friend balances and settle-up flow
- Admin panel for user role/status management
- Export of user data, expenses, and settlements

## Tech Stack

- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- Frontend: Next.js, React, TypeScript, Tailwind CSS, Radix UI

## Project Structure

- backend: Express API, MongoDB models, routes, middleware
- frontend: Next.js app router, UI components, auth context

## Setup

### Prerequisites

- Node.js 18+ (recommended)
- MongoDB running locally or a MongoDB Atlas URI

### Backend

1. Install dependencies:

```
cd backend
npm install
```

2. Create a .env file in backend (example):

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/khaata
JWT_SECRET=replace-with-strong-secret
FRONTEND_ORIGIN=http://localhost:3000
```

3. Start the API:

```
npm run dev
```

The API will be available at http://localhost:5000.

### Frontend

1. Install dependencies:

```
cd frontend
npm install
```

2. Update the API base URL in frontend/lib/api.ts for local development:

```
const API_URL = "http://localhost:5000/api";
```

3. Start the frontend:

```
npm run dev
```

The app will be available at http://localhost:3000.

## Useful Scripts

### Backend

- npm run dev: Start the API with nodemon
- npm start: Start the API

### Frontend

- npm run dev: Start the Next.js dev server
- npm run build: Build the app
- npm start: Run the production server
- npm run lint: Lint the project

## API Overview

Base URL: /api

- Auth: /auth/signup, /auth/login, /auth/profile, /auth/password, /auth/export
- Friends: /friends, /friends/search, /friends/request/:userId, /friends/requests/pending
- Expenses: /expenses (create), /expenses/user (list), /expenses/:id (update/delete)
- Balances: /balances/friends, /balances/settle
- Admin: /admin/users, /admin/users/:id/role, /admin/users/:id/status

## Notes

- The first user to sign up becomes an admin.
- For production, set a strong JWT secret and restrict CORS origins.
