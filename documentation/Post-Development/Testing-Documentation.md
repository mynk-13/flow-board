# Testing Documentation
## FlowBoard — Real-Time Collaborative Project Manager

**Version:** 1.0  
**Date:** March 2026  

---

## 1. Testing Strategy

FlowBoard follows a **testing pyramid** approach:

```
           ▲
          /E2E\          — 2 Playwright test files
         /──────\         — Full browser automation
        / Integr \        — Not separate; covered by Firebase + Vitest
       /───────────\
      /  Unit Tests  \    — 11 Vitest files, 96 tests
     /────────────────\
    /   Static Analysis \  — TypeScript + ESLint (compile time)
   /──────────────────────\
```

### Test Coverage Targets
| Layer | Tool | Target | Achieved |
|-------|------|--------|---------|
| Static types | TypeScript strict | 0 `any`, 0 errors | ✅ |
| Unit tests | Vitest + RTL | ≥ 80% stmt coverage | **94.48%** ✅ |
| E2E tests | Playwright | Auth + Board + CRUD flows | ✅ |
| Bundle audit | Custom script | Main chunk < 150 kB | **23.6 kB** ✅ |
| Performance | Lighthouse | Score ≥ 90 | Script ready |

---

## 2. Unit Tests (Vitest)

### 2.1 Setup

**Dependencies:**
```json
{
  "vitest": "^3.2.4",
  "@vitest/coverage-v8": "^3.2.4",
  "@testing-library/react": "^16.3.2",
  "@testing-library/user-event": "^14.6.1",
  "@testing-library/jest-dom": "^6.9.1",
  "jsdom": "^27.0.1"
}
```

**`vitest.config.ts`:**
```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        // Infrastructure + entry points — covered by E2E or not unit-testable
        'src/lib/firebase.ts', 'src/lib/firestore.ts', 'src/lib/socket.ts',
        'src/pages/**', 'src/app/**', 'src/features/**',
        'src/main.tsx', 'src/counter.ts', 'src/App.tsx',
        'src/**/index.ts',
      ],
    },
  },
})
```

**`src/test/setup.ts`:**
```typescript
import '@testing-library/jest-dom'

// localStorage mock for Zustand dark mode persistence
const localStorageMock = (() => {
  let store: Record<string, string> = {}
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value },
    removeItem: (key: string) => { delete store[key] },
    clear: () => { store = {} },
  }
})()
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// matchMedia mock for dark mode system preference detection
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false, media: query, onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
})

// scrollIntoView mock — not implemented in jsdom
window.HTMLElement.prototype.scrollIntoView = () => {}
```

---

### 2.2 Test Files Inventory

#### `src/lib/store.test.ts` — 16 tests
Tests the complete Zustand `UIStore`.

| Test | Description |
|------|-------------|
| toggles sidebarOpen | Toggle + direct set |
| opens and closes task detail | openTaskDetail / closeTaskDetail |
| sets and clears filterPriority | null and value |
| sets and clears filterLabel | null and value |
| sets filterSearch | string value |
| setTasks replaces array | Full replacement |
| upsertTask adds a new task | Append |
| upsertTask updates existing task | Merge by id |
| removeTask deletes by id | Splice by id |
| removeTask is no-op for unknown id | Defensive |
| applyRemoteMove updates columnId and position | RT functional updater |
| applyRemotePatch merges partial diff | RT functional updater |
| applyRemoteMove is no-op for unknown id | Defensive |
| toggleDark flips isDark and persists | localStorage write |
| command palette opens and closes | Two-state |

#### `src/lib/labels.test.ts` — 5 tests
Tests `getLabelDef` utility.

| Test | Description |
|------|-------------|
| returns correct def for known label | Exact match |
| is case-insensitive | 'BUG' → bug def |
| returns neutral fallback for unknown | Custom label |
| PRESET_LABELS has 12 items | Length check |
| all presets have required fields | Schema validation |

#### `src/shared/validation.test.ts` — 11 tests
Tests `isValidEmail` and `getEmailValidationMessage`.

| Test | Description |
|------|-------------|
| valid email returns true | Basic valid |
| email without @ returns false | Missing @ |
| empty string returns false | Empty input |
| whitespace-only returns false | Trim check |
| valid email returns empty message | No error |
| empty string returns empty message | No noise |
| missing @ returns message | Error shown |
| partial email (no TLD) returns message | Invalid domain |

#### `src/shared/FlowBoardLogo.test.tsx` — 7 tests
| Test | Description |
|------|-------------|
| renders an SVG element | Presence check |
| default dimensions 28×28 | Width + height attrs |
| accepts custom size | Prop override |
| applies custom className | CSS class |
| has accessible aria-label | Screen reader |
| contains gradient definition | SVG defs |
| background rect uses gradient fill | fill=url(#fbg) |

#### `src/shared/ThemeToggle.test.tsx` — 5 tests
| Test | Description |
|------|-------------|
| renders a button | Role check |
| shows "Switch to dark mode" in light mode | aria-label |
| shows "Switch to light mode" in dark mode | aria-label |
| calls toggleDark when clicked | Single click |
| calls toggleDark again on second click | Double click count |

#### `src/shared/PasswordInput.test.tsx` — 11 tests
| Test | Description |
|------|-------------|
| defaults to type="password" | Initial state |
| renders visibility toggle button | Button present |
| toggles to type="text" on click | Show password |
| hides password on second click | Hide password |
| calls onChange when typing | Event handler |
| calls onBlur when focus leaves | Event handler |
| applies leftIcon when provided | Slot rendering |
| applies error state class | border-red-300 |
| applies success state class | border-emerald-400 |
| passes placeholder to input | Attr forward |
| sets required attribute | required=true |

#### `src/shared/LoadingScreen.test.tsx` — 5 tests
| Test | Description |
|------|-------------|
| renders without crashing | Smoke test |
| shows FlowBoard brand name | Text check |
| shows a loading message | Text check |
| has dark background | className check |
| renders spinning SVG ring | SVG presence |

#### `src/shared/FilterDropdown.test.tsx` — 8 tests
| Test | Description |
|------|-------------|
| renders placeholder when no value | Empty state |
| shows selected label when value set | Selection state |
| opens dropdown panel on trigger click | Panel visibility |
| calls onChange with selected value | Callback |
| shows clear button when value selected | X button |
| clears selection on clear click | Deselect |
| closes on outside click | mousedown dismiss |
| checkmark next to selected option | Visual indicator |

#### `src/shared/SelectDropdown.test.tsx` — 9 tests
| Test | Description |
|------|-------------|
| renders currently selected label | Initial state |
| falls back to first option for unknown value | Graceful fallback |
| opens panel on trigger click | Panel visibility |
| calls onChange when option selected | Callback |
| closes panel after selection | Auto-close |
| disabled when disabled=true | Attr |
| does not open when disabled | Guard |
| closes on outside click | mousedown dismiss |
| checkmark next to selected option | Visual indicator |

#### `src/shared/LabelPicker.test.tsx` — 11 tests
| Test | Description |
|------|-------------|
| renders preset label buttons | Grid rendering |
| adds label on click | Select |
| removes already-selected label | Deselect |
| does nothing when disabled | Guard |
| shows Custom label button | + button |
| opens custom input on click | State toggle |
| adds custom label on Enter | Keyboard submit |
| rejects duplicate custom label | Dedup guard |
| shows custom labels as chips | Chip rendering |
| removes custom label chip via X | Remove button |

#### `src/shared/CommandPalette.test.tsx` — 8 tests
| Test | Description |
|------|-------------|
| renders search input when open | Input present |
| renders navigation items | Home, Analytics |
| renders Actions section items | Create project, Sign out |
| filters by query — non-matching hidden | Filter logic |
| shows "No results" when nothing matches | Empty state |
| calls closeCmdPalette on Escape | Keyboard handler |
| shows owned project in results | Dynamic items |
| shows shared project in results | Dynamic items |

---

### 2.3 Running Unit Tests

```bash
# Run all tests once
npm run test

# Watch mode (re-runs on file change)
npm run test:watch

# With coverage report
npm run test:coverage
# Opens coverage/index.html for detailed line-by-line view
```

### 2.4 Current Coverage Summary
```
All files          | 94.48% stmts | 88.58% branch | 74.6% funcs | 94.48% lines
 src/lib           | 91.66%
  labels.ts        | 100%
  store.ts         | 100%
 src/shared        | 96.57%
  CommandPalette   | 96.8%
  FilterDropdown   | 96.77%
  FlowBoardLogo    | 100%
  LabelPicker      | 100%
  LoadingScreen    | 100%
  PasswordInput    | 100%
  SelectDropdown   | 87.5%
  ThemeToggle      | 100%
  validation.ts    | 84.61%
```

---

## 3. E2E Tests (Playwright)

### 3.1 Setup

**Dependencies:**
```json
{
  "@playwright/test": "^1.51.x"
}
```

**`playwright.config.ts`:**
```typescript
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,   // Firebase auth can't handle parallel sessions
  retries: process.env.CI ? 2 : 0,
  timeout: 30_000,
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
})
```

### 3.2 Test Credentials Setup

Create `misc/.env.test` (gitignored):
```
PLAYWRIGHT_TEST_EMAIL=test@flowboard.dev
PLAYWRIGHT_TEST_PASSWORD=Test@1234!
```

This must be a **real Firebase account** registered in your project.

### 3.3 E2E Test Inventory

#### `e2e/auth.spec.ts` — 8 scenarios

| Test | What it verifies |
|------|-----------------|
| redirects unauthenticated users to /login | Route protection |
| login page shows FlowBoard branding | UI content |
| navigates to signup from login | Navigation link |
| navigates back to login from signup | Navigation link |
| email validation shows error for missing @ | Validation UX |
| shows error for invalid credentials | Auth error |
| password visibility toggle works | Eye icon toggle |
| signup enforces password rules before enabling button | Button disable |
| signs in and reaches dashboard | Full auth flow |
| user can sign out from avatar menu | Session end |

#### `e2e/board.spec.ts` — 12 scenarios

| Test | What it verifies |
|------|-----------------|
| shows workspace name in header | Layout |
| sidebar shows FlowBoard logo and nav items | Sidebar content |
| command palette opens with Ctrl+K | Keyboard shortcut |
| command palette closes with Escape | Keyboard shortcut |
| dark mode toggles the html.dark class | Theme toggle |
| avatar menu shows email and sign out | UserMenu dropdown |
| sidebar collapse toggle works | Sidebar interaction |
| can create a new project | Project creation flow |
| board shows 5 kanban columns | Board layout |
| inline task creation adds a card | Task creation |
| clicking task card opens detail modal | Task detail |
| task search filter narrows visible cards | Filter logic |

### 3.4 Running E2E Tests

```bash
# Prerequisites: dev server must be running (or webServer config starts it)
npm run dev   # in one terminal

# Run all E2E tests
npm run e2e

# Visual UI mode (see tests run in browser)
npm run e2e:ui

# View HTML report from last run
npm run e2e:report
```

### 3.5 CI Integration Note
To run E2E in CI, install browsers first:
```bash
npx playwright install --with-deps chromium
```
Then set `PLAYWRIGHT_TEST_EMAIL` and `PLAYWRIGHT_TEST_PASSWORD` as CI secrets.

---

## 4. Bundle Size Audit

### 4.1 Running the Audit

```bash
npm run build          # Build production bundle
npm run bundle:audit   # Print gzip size per chunk
```

### 4.2 Current Results

```
  File                       Raw         Gzip
  ---------------------------------------------------------
  dndkit-*.js             46.81 kB     15.63 kB
  firebase-*.js          461.92 kB    108.95 kB
  index-*.css             60.00 kB      9.96 kB
  index-*.js (app code)   96.56 kB     23.58 kB  ✅
  lucide-*.js             16.70 kB      3.60 kB
  react-*.js             189.75 kB     59.33 kB
  router-*.js             35.71 kB     12.86 kB
  socket-*.js             40.29 kB     12.61 kB
  tanstack-*.js           15.99 kB      5.04 kB
  ---------------------------------------------------------
  TOTAL                               251.54 kB
  Critical-path:                      105.73 kB  ✅
  Main app chunk:                      23.58 kB  ✅ (target: < 150 kB)
```

---

## 5. Lighthouse Audit

### 5.1 Running Lighthouse

```bash
npm run build     # Build
npm run preview   # Start preview server on http://localhost:4173

# In another terminal:
npm run lighthouse:run
# or against production:
AUDIT_URL=https://your-app.vercel.app npm run lighthouse:run
```

### 5.2 Report Location
Generated reports saved in `lighthouse-reports/` (gitignored).

### 5.3 Target Scores
| Category | Target |
|---------|--------|
| Performance | ≥ 90 |
| Accessibility | ≥ 90 |
| Best Practices | ≥ 90 |
| SEO | ≥ 90 |

---

## 6. Manual Testing Checklist

### Authentication
- [ ] New user can sign up with valid email + strong password
- [ ] Weak password keeps Sign Up button disabled
- [ ] Invalid email shows red validation message
- [ ] Existing email shows Firebase "already in use" error
- [ ] Sign in with correct credentials → dashboard
- [ ] Sign in with wrong password → error message
- [ ] Password eye toggle shows/hides password
- [ ] Logged-in user cannot access /login (redirected to /)
- [ ] Unauthenticated user on /board/xxx → redirected to /login

### Kanban Board
- [ ] All 5 columns visible without horizontal scroll (1280px+)
- [ ] Drag task card by clicking anywhere (not just grip icon)
- [ ] Drag to different column updates Firestore
- [ ] Other logged-in user sees the move within 300ms
- [ ] Inline task creation (click "Add task" → type → Enter)
- [ ] Task card shows priority strip color, priority badge, due date, labels
- [ ] Clicking card opens task detail modal
- [ ] Reader sees board but cannot drag or add tasks

### Real-Time
- [ ] "Live" badge appears when second user joins
- [ ] Presence avatars update when users join/leave
- [ ] Live cursor visible for Admin/Writer; hidden for Reader
- [ ] Cursor disappears after 10s of inactivity
- [ ] Task added by User A appears on User B's board without refresh

### Analytics
- [ ] /analytics route shows MFE dashboard
- [ ] All 5 charts render with real project data
- [ ] Dark mode applies correctly to all chart colors
- [ ] Switching to /board and back to /analytics shows updated data
