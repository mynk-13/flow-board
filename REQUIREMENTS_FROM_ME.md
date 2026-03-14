# Requirements From You

> **Purpose:** Items you need to provide or decide so FlowBoard can be built and deployed.  
> **Last updated:** March 14, 2026

---

## 1. BRD & Scope

- [x] **BRD document** — Received and analyzed (FlowBoard_BRD.docx).
- [ ] **Scope confirmation** — BRD MoSCoW is fixed; confirm you’re OK with “Must Have” only for MVP if we need to cut scope to meet portfolio deadline.

---

## 2. Accounts & Access

- [ ] **GitHub** — Create a repo (e.g. `flow-board` or `FlowBoard`) and share the URL. Ensure you have push access for the project codebase.
- [ ] **Deploy** — Choose **Vercel** (primary per BRD) or **Netlify**. You’ll need an account and to connect the GitHub repo for auto-deploy.
- [ ] **Backend hosting** — The BRD requires a Node.js + Express + Socket.io server and a database. You must choose one of:
  - **Supabase** (recommended): Auth (OAuth + Magic Link), PostgreSQL, and optional Realtime. Backend can be minimal (Vercel serverless or a small Node server elsewhere).
  - **Custom backend:** You (or we) host Node + Express + Socket.io + PostgreSQL (e.g. Railway, Render, Fly.io). You provide the production URL and env vars.

---

## 3. Authentication

- [ ] **Supabase** (if using): Create a project at [supabase.com](https://supabase.com). Provide (via env, not in chat):
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
- [ ] **GitHub OAuth** (for “Sign in with GitHub”): In GitHub → Settings → Developer settings → OAuth Apps, create an app. Add the callback URL Supabase gives you. Supabase dashboard will need the Client ID and Secret (stored as env vars on backend).
- [ ] **Magic Link** (optional): Supabase supports it out of the box; confirm if you want it enabled.

---

## 4. Design & Content

- [ ] **Branding** — Logo and favicon (or we use “FlowBoard” text + placeholder favicon).
- [ ] **Content** — Placeholder copy is OK unless you want specific taglines or legal pages.
- [ ] **Design** — BRD specifies Linear-inspired, light/dark mode, Inter + JetBrains Mono. Tell us if you want a different accent color or theme.

---

## 5. Technical / Environment

- [ ] **Environment variables** — You’ll need to set these in Vercel/Netlify (and in backend host if separate):
  - Frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (if Supabase).
  - Backend (if custom): `DATABASE_URL`, `JWT_SECRET`, `CORS_ORIGIN`, GitHub OAuth client ID/secret, etc. (exact list will be in `.env.example` and TECHNICAL_ASPECTS.md).
- [ ] **Domain** — Optional custom domain (e.g. `flowboard.app`). Configure in Vercel/Netlify after connect.
- [ ] **Analytics remote** — If we ship the analytics panel as a separate deploy (Module Federation remote), you may need a second Vercel/Netlify project or subpath; we’ll document when we get there.

---

## 6. From BRD — Your Responsibilities (Summary)

| Item | What you do |
|------|-------------|
| GitHub repo | Create and push; connect to Vercel/Netlify |
| Vercel or Netlify | Sign up, connect repo, add env vars |
| Supabase (or backend) | Create project; add Auth providers (e.g. GitHub); provide URL + anon key |
| OAuth app | GitHub OAuth app with callback URL for Supabase |
| Secrets | Never commit; only set in Vercel/Netlify (and backend host) |
| Review | Review PLAN_OF_ACTION, TECHNICAL_ASPECTS, and LOG_FILE as we go |

---

## 7. Review & Sign-off

- [ ] Review **PLAN_OF_ACTION.md** and **TECHNICAL_ASPECTS.md** when ready.
- [ ] Confirm when you consider the project **portfolio ready** (per BRD §13 success criteria).

---

*Check off items as you provide them. This file will be updated as new requirements are identified.*
