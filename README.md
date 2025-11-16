# Lintelligent

AI-powered code review assistant that combines the Model Context Protocol (MCP), Anthropic Claude, and Supabase to deliver fast, context-aware feedback on JavaScript and TypeScript code.

## Overview

Lintelligent is a thesis project that demonstrates how MCP can enrich AI models with project-specific rules, standards, and files. Users can paste code directly or fetch source files from their GitHub repositories after authenticating with OAuth. The backend analyses code with Claude 3 Haiku, augmented by MCP tooling and repository context, and stores the feedback in Supabase along with thumbs-up/down ratings.

## Key Features

- Paste arbitrary code and receive structured feedback with prioritized suggestions.
- GitHub integration that lets users browse repos, branches, and filtered file trees.
- Dedicated MCP servers that supply coding standards and repository context to the AI.
- Feedback view grouped by severity, including inline fix suggestions.
- Rating system (thumbs up/down) to track feedback quality and persist statistics in Supabase.
- Secure session handling with signed cookies and strict CORS configuration.

## Architecture

Monorepo managed with Yarn workspaces and separate packages for the frontend, backend, and MCP servers.

```
Lintelligent/
├── backend/           # Express API, MCP integration, Supabase client
├── frontend/          # React 19 app with Tailwind-inspired UI components
├── mcp-servers/       # Standalone MCP servers (code standards + repo context)
└── docs/              # Project documentation (AI usage, architecture notes, etc.)
```

The backend launches the MCP servers via `npx tsx`, collects context, and injects it into the prompt sent to Claude. Supabase provides persistent storage for reviews and user feedback.

## Tech Stack

- **Frontend:** React 19, TypeScript, react-simple-code-editor, PrismJS, Tailwind-style theming.
- **Backend:** Node.js (ESM), Express, Helmet, CORS, cookie-parser, Supabase, MCP SDK.
- **AI & MCP:** Anthropic Claude 3 Haiku plus two TypeScript MCP servers (`code-standards`, `repo-context`).
- **Tooling:** Yarn workspaces, TSX for development runs, `concurrently` for combined dev startup.

## Getting Started

### Prerequisites

- Node.js 20 or later.
- Yarn (classic v1) installed globally.
- Accounts and credentials for Anthropic, GitHub OAuth, and Supabase.

### Installation

1. Clone the repository and switch to the project root.
2. Install all workspace dependencies:
   ```bash
   yarn install
   ```

### Environment Variables

Create `/Users/Dev/Projects/Lintelligent/backend/.env` and populate:

```
PORT=3001
SESSION_SECRET=change-me
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...
GITHUB_REDIRECT_URI=http://localhost:3001/api/auth/github/callback
ANTHROPIC_API_KEY=sk-...
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_ANON_KEY=...
```

`PORT` and `GITHUB_REDIRECT_URI` can stay at their defaults for local development. Set `NODE_ENV=production` in production to enable secure cookies.

### Run the Development Environment

- Start frontend and backend together:
  ```bash
  yarn dev
  ```
- Or run them separately:
  ```bash
  yarn start:backend
  yarn start:frontend
  ```

The frontend runs on `http://localhost:3000` and the backend on `http://localhost:3001`.

### Production Builds

- Backend:
  ```bash
  yarn workspace backend build
  yarn workspace backend start
  ```
- Frontend:
  ```bash
  yarn workspace frontend build
  ```

### Tests

Frontend tests use React Testing Library:

```bash
yarn workspace frontend test
```

## API Overview

Primary backend endpoints:

- `GET /` – health check.
- `GET /api/auth/github/login` & `GET /api/auth/github/callback` – GitHub OAuth flow.
- `GET /api/auth/me` & `POST /api/auth/logout` – session status.
- `GET /api/github/repos`, `/branches`, `/tree`, `/contents` – proxied GitHub API calls (requires login).
- `POST /api/review` – sends code to Claude through MCP and returns structured feedback.
- `PATCH /api/review/:id/rating` – stores thumbs-up/down for a review.

Refer to `backend/src/index.ts` for the full implementation.

## MCP Servers

Two MCP servers live under `mcp-servers/`:

- `code-standards`: returns high-priority coding standards and security rules for the selected language.
- `repo-context`: gathers repository context (package.json, tsconfig, related files) to provide project awareness to the AI.

The backend launches them automatically via `npx tsx src/index.ts` during a review and compresses their responses into concise hints that accompany the prompt.

## Supabase Database

Reviews and ratings are stored in the `code_reviews` table. Create it with:

```sql
create table if not exists code_reviews (
  id uuid primary key,
  created_at timestamptz default now(),
  code text not null,
  language text not null,
  review_type text not null,
  ai_feedback jsonb not null,
  ai_model text not null,
  user_rating integer,
  rated_at timestamptz
);
```

## Documentation

Additional background and guidelines:

- `docs/CLAUDE.md` – detailed project plan and requirements.
- `docs/README.md` – supplementary architecture details.

## Troubleshooting

- **GitHub login fails:** verify `GITHUB_CLIENT_ID/SECRET` and that the redirect URL matches your GitHub OAuth app settings.
- **No AI response:** ensure `ANTHROPIC_API_KEY` is valid and the account has access to Claude 3 Haiku.
- **Supabase errors:** double-check `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and that the `code_reviews` table exists.

## License

Distributed under the MIT License. See `LICENSE` for details.
