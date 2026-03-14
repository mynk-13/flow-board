# FlowBoard

**Real-time collaborative project manager** — Kanban boards, live cursors, optimistic updates, and a micro-frontend analytics panel. Built as a portfolio-grade React 19 + TypeScript app.

- **Deploy:** Vercel or Netlify  
- **Stack:** React 19, TypeScript, Vite 6, Tailwind CSS 4, **Firebase** (Auth + Firestore), Zustand, TanStack Query, Socket.io, dnd-kit (see [TECHNICAL_ASPECTS.md](./TECHNICAL_ASPECTS.md))

---

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

---

## Scripts

| Command       | Description                |
|---------------|----------------------------|
| `npm run dev` | Start dev server (Vite)    |
| `npm run build` | Production build          |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint                |
| `npm run format` | Format with Prettier     |

---

## Project documents

| Document | Purpose |
|----------|---------|
| [PLAN_OF_ACTION.md](./PLAN_OF_ACTION.md) | Phases, milestones, BRD summary |
| [REQUIREMENTS_FROM_ME.md](./REQUIREMENTS_FROM_ME.md) | What you need to provide (GitHub, Supabase, env, etc.) |
| [LOG_FILE.md](./LOG_FILE.md) | Steps, errors, and fixes |
| [TECHNICAL_ASPECTS.md](./TECHNICAL_ASPECTS.md) | Architecture, stack, state, flows — for explaining the project |
| [AGENT_REFERENCE_LOG.md](./AGENT_REFERENCE_LOG.md) | Internal agent log |

---

## Environment

Copy [.env.example](./.env.example) to `.env` and add your **Firebase** config (six `VITE_FIREBASE_*` vars). See **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** for step-by-step instructions and [REQUIREMENTS_FROM_ME.md](./REQUIREMENTS_FROM_ME.md) for the full checklist.

---

## BRD

Requirements are defined in the Business Requirements Document (see [BRD.txt](./BRD.txt) for the extracted text). FlowBoard implements Kanban, real-time sync, optimistic updates, Module Federation analytics, and targets Lighthouse > 90 and 80%+ test coverage.
