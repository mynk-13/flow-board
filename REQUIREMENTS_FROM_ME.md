# Requirements From You

> **Purpose:** Items you need to provide or decide so FlowBoard can be built and deployed.  
> **Last updated:** March 14, 2026

---

## 1. BRD & Scope

- [x] **BRD document** — Received and analyzed (FlowBoard_BRD.docx).
- [ ] **Scope confirmation** — BRD MoSCoW is fixed; confirm you’re OK with “Must Have” only for MVP if we need to cut scope to meet portfolio deadline.

---

## 2. Accounts & Access

- [x] **GitHub** — Repo created and push done.
- [ ] **Deploy** — Choose **Vercel** (primary per BRD) or **Netlify**. Connect the GitHub repo and add env vars (see below).
- [ ] **Backend / real-time** — We use **Firebase** (Auth + Firestore). For real-time collaboration (live cursors, presence, task sync) the BRD expects a Node.js + Socket.io server; that can be added later (e.g. Railway, Render) or we use Firestore real-time listeners where possible.

---

## 3. Firebase (Auth + Firestore)

- [ ] **Firebase project** — Create at [Firebase Console](https://console.firebase.google.com/). See **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** for step-by-step instructions.
- [ ] **Web app** — Register a web app in the project and copy the config (apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId).
- [ ] **Authentication** — Enable at least one sign-in method (Email/Password and/or Google) in Authentication → Sign-in method.
- [ ] **Firestore** — Create a Firestore database (test mode for dev is OK; we’ll add rules later).
- [ ] **Env vars** — Put the six Firebase config values into `.env` as `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID`, `VITE_FIREBASE_APP_ID`. Never commit `.env`.
- [ ] **Vercel/Netlify** — Add the same six `VITE_FIREBASE_*` variables in the project’s Environment variables so production build works.

---

## 4. Design & Content

- [ ] **Branding** — Logo and favicon (or we use “FlowBoard” text + placeholder favicon).
- [ ] **Content** — Placeholder copy is OK unless you want specific taglines or legal pages.
- [ ] **Design** — BRD specifies Linear-inspired, light/dark mode, Inter + JetBrains Mono. Tell us if you want a different accent color or theme.

---

## 5. Technical / Environment

- [ ] **Environment variables** — You need:
  - **Firebase (required):** All six `VITE_FIREBASE_*` (see .env.example and FIREBASE_SETUP.md).
  - **Backend (later):** If we add a custom Node + Socket.io server: `VITE_API_URL`, and on the server `DATABASE_URL`, `CORS_ORIGIN`, etc.
- [ ] **Domain** — Optional custom domain; configure in Vercel/Netlify after connect.
- [ ] **Analytics remote** — If we ship the analytics panel as a separate deploy (Module Federation), you may need a second Vercel/Netlify project; we’ll document when we get there.

---

## 6. From BRD — Your Responsibilities (Summary)

| Item | What you do |
|------|-------------|
| GitHub repo | Done (push completed). |
| Vercel or Netlify | Sign up, connect repo, add the six Firebase env vars. |
| Firebase | Create project, register web app, enable Auth + Firestore, copy config into .env and into Vercel/Netlify env. See **FIREBASE_SETUP.md**. |
| Secrets | Never commit .env; only set in Vercel/Netlify (and in any backend host later). |
| Review | Review PLAN_OF_ACTION, TECHNICAL_ASPECTS, and LOG_FILE as we go. |

---

## 7. Review & Sign-off

- [ ] Review **PLAN_OF_ACTION.md** and **TECHNICAL_ASPECTS.md** when ready.
- [ ] Confirm when you consider the project **portfolio ready** (per BRD §13 success criteria).

---

*Check off items as you provide them. This file will be updated as new requirements are identified.*
