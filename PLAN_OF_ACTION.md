# Plan of Action

> **Status:** Phase 5 — Complete  
> **Last updated:** March 14, 2026

---

## 1. Overview

- **Project:** FlowBoard — Real-Time Collaborative Project Manager (Kanban)
- **Deploy target:** Vercel (SPA + Analytics MFE), Railway (Socket server)
- **Use case:** Portfolio project, code on GitHub
- **UI/UX goals:** Modern Linear-inspired design, WCAG 2.1 AA, Lighthouse > 90, 80%+ test coverage

---

## 2. Phases

| Phase | Description | Status |
|-------|-------------|--------|
| **Phase 1 — Foundation** | Vite + React 19 + TS, Tailwind 4, Firebase Auth/Firestore, routing, CI | ✅ Done |
| **Phase 2 — Core Board** | Kanban columns, task CRUD, dnd-kit, task detail modal, filter bar, RBAC sharing | ✅ Done |
| **Phase 3 — Real-Time** | Socket.io server (Railway), live cursors, presence bar, task sync, stale-closure fix | ✅ Done |
| **Phase 4 — Analytics MFE** | Webpack 5 Module Federation remote, Recharts dashboard, dark mode theme tokens | ✅ Done |
| **Phase 5 — Polish & Test** | Virtual scroll, command palette, dark mode, responsive layout, testing, docs, bundle | ✅ Done |

---

## 3. Phase 5 Deliverables — Final Status

| Item | BRD Target | Achieved |
|------|-----------|---------|
| Unit tests | 80%+ coverage | **94.48%** (96 tests, Vitest) |
| E2E tests | Auth + board + task CRUD | ✅ Playwright (auth.spec, board.spec) |
| Bundle size | < 150 kB gzip | **23.6 kB** main chunk; 106 kB critical path |
| Lighthouse setup | Score > 90 | `npm run lighthouse:run` script ready |
| Virtual scroll | 1 000+ tasks | ✅ TanStack Virtual (activates at > 15 tasks) |
| Command palette | Cmd/Ctrl+K | ✅ Full fuzzy-search palette |
| Dark mode | Full app coverage | ✅ All components, analytics MFE tokens |
| Responsive layout | All 5 columns visible | ✅ `flex-1 min-w-44` columns, `w-52` sidebar |
| Docs | PLAN, TECHNICAL, README | ✅ Updated |

---

## 4. Key Technical Decisions

| Decision | Rationale |
|----------|-----------|
| Firebase over Supabase | User preference; simpler SDK, no server needed for auth/DB |
| Socket.io on Railway | Free-tier persistent Node.js server; Vercel serverless can't hold WebSocket connections |
| Module Federation via script injection | `@originjs/vite-plugin-federation` doesn't work in Vite dev mode; script injection + explicit React sharing solves "Invalid Hook Call" |
| Zustand functional updaters for real-time | Prevents stale closure in Socket.io event handlers registered at mount time |
| Manual Vite chunks | Firebase SDK (109 kB gzip) separated so main app chunk is only 23.6 kB; each chunk cached independently |
| `flex-1 min-w-44` columns | All 5 Kanban columns fit on screen without scrolling, grow to fill available space |
| `@custom-variant dark` in index.css | Required for Tailwind v4 class-based dark mode — not auto-enabled like v3 |

---

## 5. Deployment URLs

| Service | Purpose |
|---------|---------|
| Vercel — main app | `https://flow-board-<hash>.vercel.app` |
| Vercel — analytics MFE | Separate Vercel project, URL stored in `VITE_ANALYTICS_REMOTE_URL` |
| Railway — socket server | URL stored in `VITE_SOCKET_URL` |

---

## 6. Running the Full Stack Locally

```bash
# Terminal 1 — Main SPA
npm run dev                      # http://localhost:5173

# Terminal 2 — Socket server
cd server && npm run dev         # http://localhost:3001

# Terminal 3 — Analytics MFE
cd analytics-remote && npm start # http://localhost:3002
```

Set `.env`:
```
VITE_SOCKET_URL=http://localhost:3001
VITE_ANALYTICS_REMOTE_URL=http://localhost:3002
```

---

## 7. What's Not Yet Done (Nice-to-Have)

| Item | Notes |
|------|-------|
| GitHub Actions Lighthouse CI | Requires deployed preview URL in CI; can add `lhci autorun` step |
| axe-playwright WCAG audit | One additional Playwright test file; `@axe-core/playwright` package |
| Notification system | Toast for real-time conflict resolution already in place; push notifications not implemented |
| Offline support | Service worker / PWA not implemented |
