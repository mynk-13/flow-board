# Plan of Action

> **Status:** In progress — BRD analyzed; Phase 1 started  
> **Last updated:** March 14, 2026

---

## 1. Overview

- **Project:** FlowBoard — Real-Time Collaborative Project Manager (Kanban)
- **Deploy target:** Vercel (primary) or Netlify (fallback); preview deploys on PR
- **Use case:** Portfolio project, open source, code on GitHub
- **UI/UX goals:** Modern, Linear-inspired, seamless UX; WCAG 2.1 AA; LCP < 2s, INP < 100ms, CLS < 0.1; Lighthouse > 90

---

## 2. Phases (from BRD §12 Development Roadmap)

| Phase | Duration | Description | Status |
|-------|----------|-------------|--------|
| **Phase 1: Foundation** | Week 1–2 | Scaffolding (Vite + React 19 + TS), design system (Tailwind), auth (Firebase), routing, CI pipeline | **Done** |
| **Phase 2: Core Board** | Week 3–4 | Kanban columns, task CRUD, dnd-kit drag-drop, task detail modal, inline creation, filter bar | **Done** |
| **Phase 3: Real-Time** | Week 5–6 | Socket.io, live cursors, presence, optimistic updates + reconciliation, conflict resolution | Pending |
| **Phase 4: Analytics MFE** | Week 7–8 | Module Federation, analytics dashboard (Recharts), independent build/deploy for remote | Pending |
| **Phase 5: Polish & Test** | Week 9–10 | Virtual scrolling, command palette, responsive audit, Playwright E2E, Lighthouse, dark mode, docs | Pending |

---

## 3. Milestones

- [x] BRD fully analyzed and requirements documented
- [ ] Requirements from you provided (GitHub repo, Supabase/Vercel, env vars — see REQUIREMENTS_FROM_ME.md)
- [ ] Project scaffold created (Vite, React 19, TypeScript, Tailwind, Shadcn, ESLint, Prettier, Husky)
- [x] Auth flow (Firebase Email/Password) working — login, signup, protected routes
- [x] Kanban board with columns and task CRUD
- [x] Drag-and-drop (dnd-kit) — cross-column and reorder (real-time sync: Phase 3)
- [ ] Analytics micro-frontend (Module Federation) integrated
- [ ] 80%+ test coverage, Playwright E2E, Lighthouse > 90
- [ ] Live deployment and GitHub repo updated

---

## 4. Dependencies & Blockers

- **From you:** GitHub repo URL, Vercel/Netlify account, Supabase project (or NextAuth config), OAuth app (e.g. GitHub) for auth. See REQUIREMENTS_FROM_ME.md.
- **External:** Backend + WebSocket server must be hosted (e.g. Railway, Render, or Vercel serverless + external Socket.io); Supabase for Auth + DB reduces backend work.

---

## 5. BRD Summary (Line-by-Line Takeaways)

- **§1:** Portfolio-grade collaborative Kanban; React 19, TypeScript, real-time, Module Federation, 80%+ coverage, Lighthouse > 90.
- **§2:** In scope: Kanban, dnd-kit, Socket.io, optimistic updates, Module Federation analytics, virtual scrolling, OAuth/Magic Link, responsive, Vitest + Playwright, CI/CD. Out of scope: native mobile, payments, third-party integrations, advanced RBAC, offline.
- **§3:** Stack fixed: React 19, TS 5.x, Vite 6 (dev), Webpack 5 (MF), Zustand + TanStack Query, Socket.io, dnd-kit, Tailwind 4 + Shadcn, React Router v7, RHF + Zod, TanStack Virtual, Vitest + Playwright, GitHub Actions, Vercel/Netlify, Node/Express + Socket.io backend, PostgreSQL (Prisma) or Supabase, Supabase Auth or NextAuth.
- **§4–4.6:** All FRs captured in REQUIREMENTS_FROM_ME and TECHNICAL_ASPECTS (auth, workspace, project, board, tasks, real-time, analytics MFE, command palette).
- **§5:** NFRs: performance (LCP, INP, CLS, bundle < 150 KB gzip), 50+ concurrent WS, 1K tasks virtualized, WCAG 2.1 AA, 80% coverage, security (JWT httpOnly, Zod, CSP, rate limit).
- **§6:** Design: Linear-inspired, Inter + JetBrains Mono, 4px grid, Framer Motion, dark mode, sidebar 240px/64px collapsed, top bar 56px, responsive breakpoints (1440/1024/768/<768).
- **§7:** Feature-sliced frontend (app, features, shared, lib, pages); state tiers (TanStack Query / Zustand / RHF / URL); Socket.io room-based real-time; Module Federation for analytics remote.
- **§8–9:** Data model (User, Workspace, Project, Task, Column, Activity, Label); REST + WebSocket API contract defined in BRD.
- **§10–11:** Testing pyramid (Vitest, MSW, Playwright, Lighthouse CI); CI stages: lint → test → build → preview/production deploy.
- **§13:** Success = Lighthouse > 90, coverage > 80%, E2E pass, bundle < 150 KB, real-time < 200ms p95, Core Web Vitals, WCAG AA, live URL.

---

*This file will be updated as the project progresses.*
