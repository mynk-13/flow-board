# FlowBoard

> **Real-time collaborative project management** — Kanban boards, live cursors, role-based sharing, optimistic updates, and a micro-frontend analytics panel.

Built as a portfolio-grade application, FlowBoard is a full-stack, production-ready SPA inspired by Linear, Jira, and Trello.

[![Tests](https://img.shields.io/badge/tests-96%20passing-brightgreen)]()
[![Coverage](https://img.shields.io/badge/coverage-94%25-brightgreen)]()
[![Bundle](https://img.shields.io/badge/main%20chunk-23.6%20kB%20gzip-blue)]()

---

## ✨ Features

| Feature | Details |
|---------|---------|
| **Kanban board** | 5 columns — Backlog, To Do, In Progress, In Review, Done |
| **Full-card drag & drop** | Drag tasks between columns via dnd-kit; grip icon on priority strip |
| **Real-time sync** | Socket.io — task moves/edits broadcast to all users in the same board |
| **Live cursors & presence** | See collaborators' cursors in real time; auto-removes after 10 s idle |
| **Role-based access** | Admin / Writer / Reader roles with Firestore rules enforcement |
| **Share modal** | Invite by email, assign role, manage members |
| **Command palette** | `Ctrl/Cmd + K` — jump to any project, action, or page |
| **Dark mode** | System-preference detection + manual toggle, `localStorage` persisted |
| **Analytics MFE** | Separate Webpack 5 Module Federation remote — status, priority, label, team charts |
| **Virtual scroll** | Handles 1 000+ tasks per column (TanStack Virtual) |
| **Color-coded labels** | 12 preset tags (Bug, Feature, Infra, Security…) + custom labels |
| **Inline task creation** | Click "Add task" in any column and press Enter |
| **Modern auth cards** | Password strength checker, eye toggle, dynamic email validation |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 19 + TypeScript 5 |
| Build | Vite 6 (host), Webpack 5 (MFE remote) |
| Styling | Tailwind CSS 4, Plus Jakarta Sans font |
| Client state | Zustand 5 |
| Server state | TanStack Query v5 |
| Auth + DB | Firebase Auth + Firestore |
| Real-time | Socket.io 4 (Railway.app server) |
| Drag & drop | dnd-kit |
| Charts | Recharts (analytics MFE) |
| Unit tests | Vitest 3 + Testing Library |
| E2E tests | Playwright |
| Deployment | Vercel (SPA + MFE), Railway (socket server) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- A Firebase project — follow the setup in [`documentation/Post-Development/Deployment-Architecture.md`](./documentation/Post-Development/Deployment-Architecture.md)

### 1 — Clone and install

```bash
git clone https://github.com/<your-username>/flow-board.git
cd flow-board
npm install
```

### 2 — Configure environment

Create a `.env` file in the project root with your Firebase and service URLs:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_SOCKET_URL=http://localhost:3001
VITE_ANALYTICS_REMOTE_URL=http://localhost:3002
```

All values come from **Firebase Console → Project Settings → General**.

### 3 — Run locally

```bash
# Main app
npm run dev              # → http://localhost:5173

# Socket server (real-time)
cd server && npm install && npm run dev    # → http://localhost:3001

# Analytics MFE
cd analytics-remote && npm install && npm start  # → http://localhost:3002
```

---

## 📋 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build (with manual chunk splitting) |
| `npm run preview` | Preview production build |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:coverage` | Coverage report (target: 80%+, current: 94%) |
| `npm run e2e` | Playwright E2E tests |
| `npm run e2e:ui` | Playwright UI mode |
| `npm run lint` | ESLint 9 |
| `npm run format` | Prettier |
| `npm run bundle:audit` | Gzip size report per chunk |
| `npm run lighthouse:run` | Lighthouse audit (needs `npm run preview` running) |

---

## 🧪 Testing

### Unit Tests — 96 tests, 94% coverage

```bash
npm run test:coverage
```

See [`documentation/Post-Development/Testing-Documentation.md`](./documentation/Post-Development/Testing-Documentation.md) for the full test inventory, coverage breakdown, and manual testing checklist.

### E2E Tests — Playwright

```bash
npm run dev        # terminal 1
npm run e2e        # terminal 2
```

**Covered flows:** auth (login, signup, validation, sign-out), dashboard, dark mode, command palette, project creation, board CRUD, task creation, task detail, search filter.

---

## 📦 Bundle

| Chunk | Gzip |
|-------|------|
| App code (`index`) | **23.6 kB** |
| React + ReactDOM | 59 kB |
| Firebase SDK | 109 kB |
| dnd-kit | 16 kB |
| Socket.io | 13 kB |
| Router | 13 kB |
| Lucide icons | 4 kB |
| TanStack | 5 kB |
| CSS | 10 kB |

**Critical-path (react + router + app + css): ~106 kB gzip.**  
All other chunks are lazy-loaded and cached independently.

---

## 📂 Documentation

Full project documentation lives in [`documentation/`](./documentation/):

### Pre-Development
| Document | Description |
|----------|-------------|
| [`PRD.md`](./documentation/Pre-Development/PRD.md) | Product Requirements — vision, personas, user stories, MoSCoW prioritization |
| [`FRD.md`](./documentation/Pre-Development/FRD.md) | Functional Requirements — detailed module-by-module behavior specs |
| [`NFR.md`](./documentation/Pre-Development/NFR.md) | Non-Functional Requirements — performance, security, accessibility, scalability |

### Design Documentation
| Document | Description |
|----------|-------------|
| [`HLD.md`](./documentation/Design-Documentation/HLD.md) | High Level Design — system architecture, layer breakdown, deployment overview |
| [`LLD.md`](./documentation/Design-Documentation/LLD.md) | Low Level Design — component hierarchy, Zustand store, type definitions, algorithms |
| [`ADR.md`](./documentation/Design-Documentation/ADR.md) | Architecture Decision Records — Firebase, Socket.io, Zustand, MFE, Tailwind v4 decisions |
| [`DFD.md`](./documentation/Design-Documentation/DFD.md) | Data Flow Diagrams — Level 0 context, Level 1 process flows, Level 2 task update detail |
| [`API-Design.md`](./documentation/Design-Documentation/API-Design.md) | API Design — Socket.io event protocol, Firestore helper API, security rules |
| [`Database-Design.md`](./documentation/Design-Documentation/Database-Design.md) | Database Design — Firestore schema, indexes, security rules, position algorithm |

### Post-Development
| Document | Description |
|----------|-------------|
| [`Deployment-Architecture.md`](./documentation/Post-Development/Deployment-Architecture.md) | Deployment setup — Vercel, Railway, Firebase, environment variables, checklist |
| [`API-Documentation.md`](./documentation/Post-Development/API-Documentation.md) | API reference — Firebase Auth, Firestore helpers, Socket.io events, MFE props |
| [`Testing-Documentation.md`](./documentation/Post-Development/Testing-Documentation.md) | Testing guide — unit test inventory, E2E scenarios, coverage report, Lighthouse |
| [`User-Documentation.md`](./documentation/Post-Development/User-Documentation.md) | User guide — getting started, board usage, sharing, real-time, analytics, shortcuts |

---

## 🔧 Architecture Overview

See [`documentation/Design-Documentation/HLD.md`](./documentation/Design-Documentation/HLD.md) and [`documentation/Design-Documentation/LLD.md`](./documentation/Design-Documentation/LLD.md) for the full deep-dive.

Key design decisions documented in [`documentation/Design-Documentation/ADR.md`](./documentation/Design-Documentation/ADR.md):
- Why Firebase over Supabase
- Why Socket.io for real-time (not Firestore listeners alone)
- Why Zustand (and how it solved the stale-closure real-time bug)
- Why Module Federation via script injection instead of the Vite plugin
- How Tailwind v4 dark mode works differently from v3

---

## 🌐 Deployment

| Service | Purpose |
|---------|---------|
| Vercel | Main SPA |
| Railway | Socket.io real-time server |
| Vercel (separate project) | Analytics micro-frontend |

Full deployment walkthrough: [`documentation/Post-Development/Deployment-Architecture.md`](./documentation/Post-Development/Deployment-Architecture.md)

---

## 📄 License

MIT
