# Major Project Technical Aspects

> **Purpose:** High-level technical summary to explain FlowBoard (architecture, flow, state management).  
> **Last updated:** March 14, 2026

---

## 1. Architecture Overview

- **Type:** SPA (single-page application) with real-time WebSocket layer and optional micro-frontend (analytics).
- **Frontend:** React 19 + TypeScript 5.x, Vite 6 (dev), feature-sliced structure. Production build deployable to Vercel/Netlify.
- **Backend/API:** Node.js + Express (REST) + Socket.io (WebSocket). Database: PostgreSQL via Prisma ORM, or Supabase (managed Postgres + Auth).
- **Hosting:** Frontend on Vercel or Netlify; backend elsewhere (Railway, Render, or serverless + external Socket server) unless using Supabase-only approach.
- **Repo:** GitHub; CI/CD via GitHub Actions (lint → test → build → deploy).

---

## 2. Tech Stack (from BRD §3)

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | React 19 | With TypeScript 5.x |
| Build (dev) | Vite 6 | HMR, fast dev |
| Build (MF) | Webpack 5 | Module Federation for analytics remote only |
| State (server) | TanStack Query v5 | Tasks, projects, members, cache, invalidation, optimistic updates |
| State (client) | Zustand | UI: sidebar, filters, view mode, command palette |
| State (real-time) | Zustand + Socket.io | Cursors, presence, incoming task events |
| Forms | React Hook Form + Zod | Validation and form state |
| URL state | React Router v7 | searchParams for filters, sort, selected task |
| Real-time | Socket.io | Rooms per board; events: task:move, cursor:move, presence, board:sync |
| Drag & drop | dnd-kit | Accessible, 60fps, reorder + cross-column |
| Styling | Tailwind CSS 4 + Shadcn UI | Radix primitives, design tokens |
| Routing | React Router v7 | Type-safe routes |
| Virtual list | TanStack Virtual | 1K+ tasks, 60fps |
| Testing | Vitest + RTL, Playwright | Unit + E2E; 80%+ coverage target |
| Lint/format | ESLint 9 (flat) + Prettier + Husky | Pre-commit hooks |
| Deploy | Vercel or Netlify | Preview on PR, production on main |

---

## 3. Data & State Management (BRD §7.2)

| State tier | Tool | Examples |
|------------|------|----------|
| **Server state** | TanStack Query v5 | Tasks, projects, workspaces, members, activity — cached, refetched on mutation |
| **Client state** | Zustand (slices) | Sidebar open/closed, active filters, view mode (Kanban/List/Table), command palette open |
| **Real-time state** | Zustand + Socket.io | Cursor positions, presence list, incoming task/create/update/delete from other users |
| **Form state** | React Hook Form + Zod | Task create/edit, workspace settings, profile |
| **URL state** | React Router v7 searchParams | Active filters, sort order, selected task ID — shareable |

State is normalized (flat entity maps) with selector memoization and shallow equality where applicable.

---

## 4. Key Flows

- **User flow:** Sign in (OAuth/Magic Link) → Workspace list → Select/Create project → Board view → Create/move/edit tasks; optional Analytics and Command Palette.
- **Auth flow:** Supabase Auth (or NextAuth) → JWT in httpOnly cookie → refresh before expiry; logout clears session and disconnects WebSocket.
- **Real-time flow:** User joins board → Socket.io `board:join` → server sends `board:sync`; on task move → client emits `task:move` and applies optimistic update → server broadcasts → other clients update; conflict → server arbitrates, losing client gets rollback + toast.
- **Deploy flow:** Git push → GitHub Actions (lint, test, build) → Vercel/Netlify build → preview (PR) or production (main).

---

## 5. Project Structure (BRD §7.1 — feature-sliced)

```
flow-board/
  src/
    app/          # App shell, routing, global providers (AppShell placeholder)
    features/     # board/, tasks/, analytics/, auth/, workspace/ (index placeholders)
    shared/       # Design system, utils, constants, types
    lib/          # Socket client, query client, Zod schemas
    pages/        # Route-level page compositions
    main.tsx      # Entry: React root + App
    App.tsx       # Root component
    index.css     # Tailwind + base styles
  public/         # favicon.svg, static assets
  .husky/         # pre-commit → lint-staged
  .env.example    # Env var template
analytics-remote/ # (Phase 4) Separate MFE app — Module Federation remote
```

---

## 6. Real-Time Architecture (BRD §7.3)

- **Pattern:** Pub/sub; one Socket.io room per board.
- **Events:** `board:join` (client), `board:sync` (server on join/reconnect), `task:move` / `task:create` / `task:update` / `task:delete` (bidirectional), `cursor:move` (throttled ~30fps), `presence:join` / `presence:leave` / `presence:update`.
- **Optimistic updates:** Local state updates immediately; server confirms or sends rollback; conflict resolution with toast and optional undo.

---

## 7. Module Federation (BRD §7.4)

- **Host:** Vite React app; lazy-loads analytics remote via dynamic import + Suspense (skeleton) and error boundary (retry).
- **Remote:** Analytics dashboard (Webpack 5 Module Federation); exposes single entry component.
- **Shared:** react, react-dom, zustand, recharts — singleton to avoid duplication. Version compatibility validated in CI.

---

## 8. Environment & Config

- **Frontend env:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (if Supabase). Set in Vercel/Netlify.
- **Backend env (if custom):** `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, GitHub OAuth client ID/secret, Socket.io CORS. Documented in `.env.example`; never committed.
- **CI:** GitHub Actions use repo secrets for deploy and any required env.

---

## 9. How to Explain This Project (elevator pitch)

**FlowBoard** is a real-time collaborative project management app (Kanban) for teams. Users create workspaces and projects, manage tasks on a board with drag-and-drop, and see live cursors and presence. The stack is React 19 and TypeScript with Vite, Zustand and TanStack Query for state, Socket.io for real-time sync, and an analytics panel loaded as a micro-frontend via Module Federation. It’s built as a portfolio-grade project with 80%+ test coverage, WCAG 2.1 AA, and Core Web Vitals optimized, deployed on Vercel/Netlify with a backend (e.g. Supabase or Node/Express + PostgreSQL).

---

*This file will be updated as implementation is finalized.*
