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
- A Firebase project (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))

### 1 — Clone and install

```bash
git clone https://github.com/<your-username>/flow-board.git
cd flow-board
npm install
```

### 2 — Configure environment

```bash
cp .env.example .env
# Fill in your Firebase config values in .env
```

| Variable | Where to find it |
|----------|-----------------|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project Settings → General |
| `VITE_FIREBASE_AUTH_DOMAIN` | same |
| `VITE_FIREBASE_PROJECT_ID` | same |
| `VITE_FIREBASE_STORAGE_BUCKET` | same |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | same |
| `VITE_FIREBASE_APP_ID` | same |
| `VITE_SOCKET_URL` | Your Railway.app URL (or `http://localhost:3001` locally) |
| `VITE_ANALYTICS_REMOTE_URL` | Analytics MFE Vercel URL (or `http://localhost:3002` locally) |

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

### Unit Tests (Vitest)

```bash
npm run test:coverage
```

- **96 tests** across 11 test files
- **94.48% statement coverage** on `src/lib/**` and `src/shared/**`
- Components tested: `ThemeToggle`, `PasswordInput`, `FlowBoardLogo`, `LoadingScreen`, `FilterDropdown`, `SelectDropdown`, `LabelPicker`, `CommandPalette`
- Store tested: full `UIStore` (sidebar, filters, tasks, real-time updaters, dark mode, command palette)

### E2E Tests (Playwright)

Create `.env.test` (copy from `.env.test.example`) with test Firebase credentials:

```bash
PLAYWRIGHT_TEST_EMAIL=test@flowboard.dev
PLAYWRIGHT_TEST_PASSWORD=Test@1234!
```

Then:

```bash
npm run dev            # start dev server in one terminal
npm run e2e            # run Playwright in another
npm run e2e:ui         # visual Playwright UI
```

**Covered flows:** login, signup, email validation, password toggle, sign-out, dashboard, dark mode toggle, command palette, sidebar collapse, project creation, board columns, inline task creation, task detail modal, task search filter.

---

## 📦 Bundle Analysis

After `npm run build`:

```bash
npm run bundle:audit
```

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
Firebase, Socket.io, dnd-kit, and icons are separate chunks loaded on demand and cached independently.

---

## 🔧 Architecture

See [TECHNICAL_ASPECTS.md](./TECHNICAL_ASPECTS.md) for the full deep-dive covering:
- Feature-sliced directory structure
- State management tiers (Zustand / TanStack Query / Socket.io)
- RBAC implementation
- Module Federation setup (host ↔ remote)
- Real-time stale closure fix
- Firestore security rules

---

## 📁 Project Documents

| Document | Purpose |
|----------|---------|
| [PLAN_OF_ACTION.md](./PLAN_OF_ACTION.md) | Phases, milestones, BRD summary |
| [TECHNICAL_ASPECTS.md](./TECHNICAL_ASPECTS.md) | Architecture, stack, state, flows |
| [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) | Firebase project setup guide |
| [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) | Socket server Railway deployment |
| [ANALYTICS_DEPLOY.md](./ANALYTICS_DEPLOY.md) | Analytics MFE Vercel deployment |
| [.env.example](./.env.example) | Environment variable template |
| [.env.test.example](./.env.test.example) | Playwright test credentials template |

---

## 🌐 Deployment

| Service | URL | Purpose |
|---------|-----|---------|
| Vercel | `your-app.vercel.app` | Main SPA |
| Railway | `your-server.railway.app` | Socket.io real-time server |
| Vercel (MFE) | `your-analytics.vercel.app` | Analytics micro-frontend |

For Vercel deployment, set all `VITE_*` environment variables in **Settings → Environment Variables**.

---

## 📄 License

MIT
