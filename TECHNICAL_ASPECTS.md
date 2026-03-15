# FlowBoard — Technical Aspects

> **Purpose:** High-level technical reference — architecture, flows, state, testing, and deployment.  
> **Last updated:** March 14, 2026 (Phase 5 complete)

---

## 1. Architecture Overview

- **Type:** Single-page application (SPA) with real-time WebSocket layer and an Analytics micro-frontend.
- **Frontend:** React 19 + TypeScript 5.x, Vite 6 (dev / host), feature-sliced structure.
- **Backend / Auth / DB:** Firebase Auth + Firestore (serverless). Node.js + Express + Socket.io (Railway.app) for real-time events.
- **Analytics MFE:** Webpack 5 Module Federation remote, deployed separately on Vercel.
- **Hosting:** Main SPA → Vercel; Socket server → Railway.app; Analytics MFE → Vercel.

---

## 2. Tech Stack

| Layer | Choice | Notes |
|-------|--------|-------|
| Framework | React 19 | TypeScript 5.x, strict mode |
| Build (host) | Vite 6 | HMR, ESBuild, manual chunks |
| Build (MFE remote) | Webpack 5 | Module Federation, exposes `./AnalyticsDashboard` |
| State (server) | TanStack Query v5 | Tasks, projects, members — cached, optimistic updates |
| State (client) | Zustand 5 | Sidebar, filters, task detail, dark mode, command palette |
| State (real-time) | Zustand + Socket.io | Cursors, presence, live task sync |
| Auth | Firebase Auth | Email/password; `AuthProvider` wraps app |
| Database | Firestore | Projects, tasks, user profiles, role-based rules |
| Real-time | Socket.io 4 | Rooms per board; events for tasks, cursors, presence |
| Drag & drop | dnd-kit | Accessible, pointer-event based, full-card dragging |
| Styling | Tailwind CSS 4 + CSS custom variants | Class-based dark mode via `@custom-variant dark` |
| Routing | React Router v7 | Protected routes, `AuthGate`, `ProtectedRoute` |
| Virtual list | TanStack Virtual v3 | Activates at > 15 tasks per column |
| Forms | React Hook Form + custom validation | Zod ready; email validation in `shared/validation.ts` |
| Charts | Recharts | Analytics MFE only |
| Icons | Lucide React | Tree-shaken to ~3.6 KB gzip |
| Testing (unit) | Vitest 3 + Testing Library | 96 tests, 94.48% statement coverage |
| Testing (E2E) | Playwright | Auth, board, task CRUD flows |
| Lint / format | ESLint 9 (flat) + Prettier + Husky | Pre-commit lint-staged hooks |

---

## 3. Feature-Sliced Directory Structure

```
flow-board/
├── e2e/                     # Playwright E2E tests
│   ├── helpers.ts
│   ├── auth.spec.ts         # Login, signup, password toggle, validation
│   └── board.spec.ts        # Dashboard, board, task CRUD
├── src/
│   ├── app/
│   │   ├── AppLayout.tsx    # Shell: sidebar, header, UserMenu, CommandPalette
│   │   └── Sidebar.tsx      # Nav: "Created by me" / "Shared with me" / Analytics
│   ├── features/
│   │   ├── auth/            # AuthProvider, useAuth, AuthGate
│   │   ├── board/           # BoardColumn, ShareModal, PresenceBar, CursorOverlay
│   │   ├── tasks/           # TaskCard, TaskDetailModal
│   │   └── workspace/       # Workspace creation utilities
│   ├── lib/
│   │   ├── firebase.ts      # Firebase app initialisation
│   │   ├── firestore.ts     # CRUD helpers: projects, tasks, users, sharing
│   │   ├── labels.ts        # PRESET_LABELS, getLabelDef() — tested
│   │   ├── socket.ts        # Socket.io client singleton + event typings
│   │   ├── store.ts         # Zustand UIStore — tested (100% stmts)
│   │   └── types.ts         # Task, Project, Column, Role, OutletCtx interfaces
│   ├── pages/
│   │   ├── LoginPage.tsx    # Modern auth card, email validation, password toggle
│   │   ├── SignupPage.tsx   # Password rule checklist, animated feedback
│   │   ├── DashboardPage.tsx# TiltCard grid, owned / shared sections, skeletons
│   │   ├── BoardPage.tsx    # Kanban + real-time + filter bar + role enforcement
│   │   └── AnalyticsPage.tsx# Module Federation host loader, skeleton states
│   ├── shared/
│   │   ├── CommandPalette.tsx  # ⌘K global palette — tested
│   │   ├── FilterDropdown.tsx  # Custom dropdown — tested
│   │   ├── FlowBoardLogo.tsx   # SVG brand mark — tested
│   │   ├── LabelPicker.tsx     # Preset + custom tag picker — tested
│   │   ├── LoadingScreen.tsx   # Full-page spinner — tested
│   │   ├── PasswordInput.tsx   # Eye toggle, state variants — tested
│   │   ├── SelectDropdown.tsx  # Role / option select — tested
│   │   ├── ThemeToggle.tsx     # Sun/Moon with localStorage — tested
│   │   └── validation.ts       # isValidEmail, getEmailValidationMessage — tested
│   ├── test/
│   │   └── setup.ts         # jest-dom matchers, localStorage mock, scrollIntoView mock
│   ├── App.tsx              # Router + AuthGate + ProtectedRoute
│   └── index.css            # Tailwind 4 base, dark variant, dot-grid, fonts
├── analytics-remote/        # Webpack 5 MFE
│   ├── src/
│   │   ├── AnalyticsDashboard.tsx  # Exposed component
│   │   ├── theme.ts                # lightTheme / darkTheme token objects
│   │   └── components/             # StatusChart, PriorityChart, etc.
│   └── webpack.config.js
├── server/                  # Node.js Socket.io server (Railway)
│   └── src/index.ts
├── scripts/
│   ├── bundle-audit.mjs     # Reports gzip sizes per chunk
│   └── lighthouse.mjs       # Headless Lighthouse runner
├── playwright.config.ts
├── vitest.config.ts
└── vite.config.ts           # Manual chunks for Firebase, React, socket, dnd-kit…
```

---

## 4. State Management Deep-Dive

| State tier | Tool | Examples |
|------------|------|----------|
| **Server** | TanStack Query v5 | Projects list, task list — refetch on mutation |
| **Client UI** | Zustand (`UIStore`) | `sidebarOpen`, `isDark`, `taskDetailId`, `filterPriority`, `filterLabel`, `filterSearch`, `cmdPaletteOpen` |
| **Real-time** | Zustand + Socket.io | `tasks[]` updated via `applyRemoteMove` / `applyRemotePatch` (functional updaters — avoids stale closure) |
| **Form** | Controlled state + custom validation | React Hook Form ready; currently plain controlled inputs |
| **Auth** | Firebase Auth + React context | `AuthProvider` watches `onAuthStateChanged`; `useAuth()` returns user, loading, signOut |

### Stale Closure Fix (real-time)
Socket.io event handlers are registered once. If they close over `tasks` state directly, they see the initial snapshot forever. Solution: Zustand's `set((s) => ...)` functional updater reads **current** state at call time — handlers call `applyRemoteMove` / `applyRemotePatch` which use this pattern.

---

## 5. Role-Based Access Control (RBAC)

| Role | Create/Delete project | Edit tasks | View board | See cursors |
|------|-----------------------|------------|------------|-------------|
| `admin` | ✅ | ✅ | ✅ | ✅ |
| `writer` | ❌ | ✅ | ✅ | ✅ |
| `reader` | ❌ | ❌ | ✅ | ❌ |

- Projects store a `members: Record<userId, ProjectMemberInfo>` map.
- Firestore rules enforce read/write at the document level.
- Client uses `myRole` derived from `project.members[user.uid].role` to conditionally render/disable UI.

---

## 6. Real-Time Architecture

- **Pattern:** Pub/sub; one Socket.io room per project (`board:<projectId>`).
- **Events (client → server):** `board:join`, `task:move`, `task:update`, `task:delete`, `cursor:move` (throttled 30fps), `presence:update`.
- **Events (server → clients):** `board:sync`, `task:moved`, `task:updated`, `task:deleted`, `cursor:update`, `presence:join`, `presence:leave`.
- **Cursor visibility:** Only `admin` and `writer` roles; idle for > 10 s → cursor removed.

---

## 7. Module Federation (Analytics MFE)

- **Host (Vite):** Injects `<script src="{VITE_ANALYTICS_REMOTE_URL}/remoteEntry.js">` at runtime; calls `window.analytics_remote.init(sharedScope)` passing the host's own `React` and `ReactDOM` to ensure a single React instance (avoids "Invalid Hook Call").
- **Remote (Webpack 5):** Exposes `./AnalyticsDashboard`; accepts `tasks`, `projects`, `userId`, `isDark` props. Dark mode is handled via a `theme.ts` token object (`lightTheme` / `darkTheme`) passed to all charts.
- **Data flow:** `AnalyticsPage` fetches tasks for ALL projects (owned + shared) via `Promise.all(projects.map(getTasks))` — independent of the active board's Zustand state.

---

## 8. Bundle Strategy

After manual chunk splitting (`vite.config.ts`):

| Chunk | Gzip |
|-------|------|
| `index` (app code) | ~24 kB |
| `react` (React + ReactDOM) | ~59 kB |
| `firebase` | ~109 kB |
| `router` | ~13 kB |
| `socket` | ~13 kB |
| `dndkit` | ~16 kB |
| `tanstack` | ~5 kB |
| `lucide` | ~4 kB |
| CSS | ~10 kB |

**Critical path** (react + router + app + css): **~106 kB gzip** ✅  
Firebase, socket, dnd-kit, and lucide load lazily and are cached independently.

---

## 9. Testing Strategy

| Layer | Tool | Status |
|-------|------|--------|
| Unit tests | Vitest + Testing Library | 96 tests, **94.48% stmt coverage** ✅ |
| E2E tests | Playwright (Chromium) | auth flow, dashboard, board, task CRUD |
| Bundle audit | `scripts/bundle-audit.mjs` | Main chunk 23.58 kB gzip ✅ |
| Lighthouse | `scripts/lighthouse.mjs` | Target ≥ 90 on all categories |

Run commands:
```bash
npm run test              # unit tests (Vitest)
npm run test:coverage     # coverage report
npm run e2e               # Playwright E2E (needs dev server running)
npm run bundle:audit      # gzip size report (after npm run build)
npm run lighthouse:run    # Lighthouse audit (needs preview server)
```

---

## 10. Environment Variables

| Variable | Used by |
|----------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase init |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase init |
| `VITE_FIREBASE_PROJECT_ID` | Firebase init |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase init |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase init |
| `VITE_FIREBASE_APP_ID` | Firebase init |
| `VITE_SOCKET_URL` | Socket.io client |
| `VITE_ANALYTICS_REMOTE_URL` | Analytics MFE loader |

---

## 11. Elevator Pitch

**FlowBoard** is a real-time collaborative project management app (Kanban-style) built for portfolios. Teams can create projects, assign tasks, and collaborate in real time with live cursors and presence indicators. The stack is React 19 + TypeScript, Vite, Zustand + TanStack Query, Socket.io, and Firebase — with a separate Analytics micro-frontend loaded via Webpack 5 Module Federation. It features RBAC (admin / writer / reader), dark mode, a global command palette, virtual scroll for large boards, 94%+ unit test coverage, and a fully split bundle with a 24 kB main chunk.
