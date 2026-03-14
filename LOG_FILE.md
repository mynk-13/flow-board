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

*Continue appending new entries as work progresses.*
