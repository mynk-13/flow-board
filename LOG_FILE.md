# Log File — Steps, Errors & Fixes

> **Purpose:** Record of major steps, errors, and fixes.  
> **Last updated:** March 14, 2026

---

## Format

- **Step:** What was done  
- **Errors (if any):** Message or symptom  
- **Fix:** What was changed to resolve it  

---

## Entries

### 2026-03-14 — BRD extraction and doc creation

- **Step:** User attached FlowBoard_BRD.docx. Read tool does not support binary .docx.
- **Fix:** Copied .docx to .zip, expanded with PowerShell `Expand-Archive`, read `word/document.xml`. Extracted all `<w:t>` text nodes via PowerShell + Select-Xml and saved to `BRD.txt` (UTF-8).

- **Step:** Created/updated five documents from full BRD analysis: PLAN_OF_ACTION, REQUIREMENTS_FROM_ME, TECHNICAL_ASPECTS, LOG_FILE, AGENT_REFERENCE_LOG; and README with upload instructions.

- **Step:** BRD analyzed line-by-line; plan and requirements derived. Phase 1 (Foundation) marked in progress; next: scaffold Vite + React 19 + TypeScript project.

- **Errors:** None.

---

### 2026-03-14 — Project scaffolding (Phase 1)

- **Step:** Create Vite + React 19 + TypeScript app. `npm create vite@latest` with `--template react-ts` produced vanilla TS template twice (create-vite argument order).
- **Fix:** Removed temp folder; created app manually: `package.json` (React 19, Vite 6, TypeScript, ESLint, Prettier), `vite.config.ts` (React plugin, Tailwind plugin, `@` alias), `tsconfig*.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/vite-env.d.ts`, `public/favicon.svg`, `.gitignore`.

- **Step:** Installed dependencies (`npm install`). Build succeeded (`npm run build`).

- **Step:** Added ESLint 9 flat config (`eslint.config.js`), Prettier (`.prettierrc`), Tailwind CSS 4 (`tailwindcss`, `@tailwindcss/vite`), updated `vite.config.ts` and `src/index.css` with `@import 'tailwindcss'`.

- **Step:** Created feature-sliced structure: `src/app/`, `src/features/` (board, tasks, auth, workspace, analytics), `src/shared/`, `src/lib/`, `src/pages/` with placeholder index files.

- **Step:** Added Husky + lint-staged for pre-commit (ESLint + Prettier). `husky init` reported ".git can't be found" (repo not initialized yet); `.husky/pre-commit` set to `npx lint-staged`.

- **Step:** Added `.env.example`, updated `README.md` with quick start and doc links.

- **Step:** Ran ESLint; failed with: file not found in project (src\\main.tsx vs project include).
- **Fix:** Removed `parserOptions.project` / `tsconfigRootDir` so ESLint runs without type-aware rules (avoids Windows path mismatch). Lint passes. Type-aware rules can be re-enabled later with a path-normalized config if desired.

- **Errors:** None after fix. Build and lint pass.

---

### 2026-03-14 — Switch to Firebase (Auth + Firestore)

- **Step:** User confirmed push done; requested Firebase instead of Supabase.
- **Step:** Installed `firebase` SDK. Added `src/lib/firebase.ts` (initializeApp, getAuth, getFirestore) using `VITE_FIREBASE_*` env vars. Added `src/features/auth/AuthProvider.tsx` (onAuthStateChanged, useAuth, signOut) and wired `AuthProvider` in `main.tsx`.
- **Step:** Replaced `.env.example` with six Firebase config vars. Wrote **FIREBASE_SETUP.md** with step-by-step: create project, register web app, enable Auth + Firestore, add env locally and on Vercel/Netlify. Updated **REQUIREMENTS_FROM_ME.md** (Firebase checklist, GitHub done), **TECHNICAL_ASPECTS.md** (Firebase for Auth/DB, env section), **README.md** (Firebase in stack, link to FIREBASE_SETUP).
- **Errors:** None.

---

### 2026-03-14 — Auth UI, React Router, protected layout

- **Step:** User asked to proceed with next steps after adding Vercel domain to Firebase. Implemented Phase 2 auth and routing.
- **Step:** Installed `react-router-dom`. Created `src/pages/LoginPage.tsx` (email/password, signInWithEmailAndPassword, error state, link to signup), `src/pages/SignupPage.tsx` (email, password, confirm password, createUserWithEmailAndPassword, validation, link to login), `src/pages/DashboardPage.tsx` (welcome + sign out). Created `src/app/ProtectedLayout.tsx` (redirect to /login if not authenticated, header + Outlet), `src/app/AuthRedirect.tsx` (redirect to / if already logged in, for login/signup). Wired `App.tsx` with BrowserRouter, Routes: /login, /signup, / (ProtectedLayout with index DashboardPage), * -> Navigate to /. AuthGuard wraps routes to show loading until auth state is ready.
- **Fix:** Removed unused `user` from AuthGuard to satisfy TS6133.
- **Errors:** None after fix. Build passes.

---

### 2026-03-14 — Phase 2: Core Board implementation

- **Step:** Installed `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`, `zustand`, `@tanstack/react-query`, `lucide-react`.
- **Step:** Created `src/lib/types.ts` (Workspace, Project, Task, ColumnId, Priority, COLUMN_IDS, COLUMN_LABELS), `src/lib/firestore.ts` (getOrCreateWorkspace, getProjects, createProject, deleteProject, getTasks, createTask, updateTask, moveTask, deleteTask, getColumnTasks, getNextPosition), `src/lib/store.ts` (Zustand: sidebarOpen, activeProject, taskDetailId, filterPriority, filterSearch, tasks, upsertTask, removeTask).
- **Step:** Built `src/app/Sidebar.tsx` (collapsible 240px/64px, workspace logo, project links, sign out), `src/app/AppLayout.tsx` (sidebar + header + Outlet + create project modal, getOrCreateWorkspace on mount), replaced ProtectedLayout with AppLayout.
- **Step:** Rewrote `DashboardPage` (project cards grid with delete on hover, empty state CTA).
- **Step:** Built `src/features/tasks/TaskCard.tsx` (sortable, drag handle, priority dot, labels, due date), `src/features/board/BoardColumn.tsx` (droppable, SortableContext, inline add textarea with Cmd+Enter, Add/Cancel), `src/features/tasks/TaskDetailModal.tsx` (slide-in panel, edit title/status/priority/labels/due date/description, delete, save).
- **Step:** Built `src/pages/BoardPage.tsx` (DndContext, DragOverlay, onDragStart/Over/End for cross-column and reorder, filter bar with search + priority filter, loads tasks from Firestore on mount).
- **Step:** Updated `App.tsx` (AppLayout wraps / and /board/:projectId routes). Added slide-in CSS animation.
- **Errors:** TS6196 `Task` unused, TS6133 `Plus` unused after removing Plus from DashboardPage.
- **Fix:** Removed unused imports. Build passes.

---

*Continue appending new entries as work progresses.*
