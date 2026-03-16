# Architecture Decision Records (ADR)
## FlowBoard — Real-Time Collaborative Project Manager

**Format:** Each ADR documents a significant architectural decision — the context, the options considered, the decision made, and the consequences.

---

## ADR-001: Firebase over Supabase for Auth and Database

**Date:** Early Phase 1  
**Status:** Accepted  

### Context
The project required a serverless backend for authentication and data persistence. Two main options were evaluated: Supabase (PostgreSQL + GoTrue auth) and Firebase (Firestore + Firebase Auth).

### Decision
**Firebase (Auth + Firestore)** was chosen.

### Options Considered
| Factor | Firebase | Supabase |
|--------|----------|---------|
| Auth setup | Zero-config SDK | Requires PostgreSQL row security |
| Real-time | Firestore listeners built-in | Postgres LISTEN/NOTIFY + websocket |
| Free tier | 50k reads/day, 20k writes/day | 500 MB DB, unlimited reads |
| SDK size | ~109 kB gzip | ~40 kB (smaller) |
| TypeScript | Full SDK types | Generated types from schema |
| NoSQL flexibility | ✅ Schema-less | ❌ Requires migrations |
| Team preference | Requested explicitly | — |

### Consequences
- **Positive:** Zero infrastructure management; generous free tier; real-time Firestore listeners; Firebase Auth handles JWT rotation automatically
- **Negative:** Firestore NoSQL means no joins; complex queries require composite indexes; Firebase SDK adds ~109 kB to bundle (mitigated by chunking)
- **Mitigation:** Firebase chunk isolated via Vite `manualChunks`; cached after first load

---

## ADR-002: Socket.io for Real-Time over Firestore Listeners

**Date:** Phase 3  
**Status:** Accepted  

### Context
FlowBoard needed two categories of real-time updates:
1. **Task sync** — task moved, updated, or deleted
2. **Cursor positions and presence** — requires < 100 ms latency, 30 fps updates

### Decision
**Socket.io** used for cursors, presence, and task sync. Firestore listeners retained as the source of truth and fallback.

### Options Considered
| Feature | Firestore Listeners | Socket.io |
|---------|--------------------|---------| 
| Latency | ~1-2 s | < 100 ms |
| Cursor 30fps | ❌ Would cost ~$$$$ in writes | ✅ In-memory only |
| Persistence | ✅ Built-in | ❌ Stateless (no persistence needed) |
| Cost at scale | High (per-write billing) | Low (one server instance) |
| Offline support | ✅ SDK handles | ❌ Connection-dependent |

### Consequences
- **Positive:** Sub-100ms cursor updates; presence without Firestore writes; task sync without polling
- **Negative:** Additional Railway deployment to manage; Socket server is a single point of failure for real-time features
- **Mitigation:** Graceful degradation — board shows "Offline" badge if Socket fails; tasks still accessible via Firestore

---

## ADR-003: Zustand over Redux for Client State

**Date:** Phase 1  
**Status:** Accepted  

### Context
The app needed global client state for: sidebar state, active filters, task list mirror for real-time updates, dark mode, and command palette visibility.

### Decision
**Zustand 5** was chosen over Redux Toolkit.

### Options Considered
| Factor | Zustand | Redux Toolkit |
|--------|---------|--------------|
| Boilerplate | Minimal (no reducers/actions) | Moderate |
| Bundle size | ~1 kB | ~40 kB |
| Functional updaters | ✅ `set((s) => ...)` | ✅ Immer-based |
| DevTools | ✅ Via middleware | ✅ Built-in |
| TypeScript | ✅ Inferred | ✅ Full types |
| Learning curve | Low | Medium |
| Use case fit | Simple UI state slices | Complex reducers with side effects |

### Consequences
- **Positive:** Tiny bundle, zero boilerplate, functional updaters perfectly solved the stale closure problem in Socket.io handlers
- **Negative:** No time-travel debugging out of the box (can add Redux DevTools middleware)
- **Key insight:** Zustand's `set((s) => s.tasks.map(...))` pattern was critical for real-time correctness

---

## ADR-004: Vite Manual Chunks for Bundle Splitting

**Date:** Phase 5  
**Status:** Accepted  

### Context
The initial build produced a single 927 kB (248 kB gzip) bundle. The BRD required < 150 kB main app chunk. Firebase SDK (461 kB raw) was the primary offender.

### Decision
Implemented `manualChunks` in `vite.config.ts` to split Firebase, React, Socket.io, dnd-kit, router, Lucide, and TanStack into separate lazy-loaded chunks.

### Result
| Before | After |
|--------|-------|
| 1 chunk: 248 kB gzip | Main app: 23.6 kB gzip |
| Monolith cached as one | Each chunk cached independently |
| Firebase reload on any change | Firebase chunk never changes → infinite cache |

### Consequences
- **Positive:** Main app chunk 23.6 kB; critical path 106 kB; Firebase cached after first visit
- **Negative:** More HTTP requests on first load (9 chunks); mitigated by HTTP/2 multiplexing on Vercel CDN

---

## ADR-005: Module Federation via Script Injection (Not Vite Plugin)

**Date:** Phase 4  
**Status:** Accepted  

### Context
The analytics dashboard was designed as a Module Federation remote (Webpack 5). The natural approach was to use `@originjs/vite-plugin-federation` in the host Vite app.

### Problem
`@originjs/vite-plugin-federation` works in production builds but **fails in Vite dev mode** because Vite dev server uses native ESM which conflicts with the plugin's static import resolution. This caused `Failed to resolve import "analytics_remote/AnalyticsDashboard"` errors.

### Decision
**Script tag injection at runtime** with direct Webpack container API calls.

### Implementation
```typescript
// 1. Inject remoteEntry.js as a script tag
const script = document.createElement('script')
script.src = `${ANALYTICS_REMOTE_URL}/remoteEntry.js`
script.onload = async () => {
  // 2. Share host React instance (prevents "two copies of React" → Invalid Hook Call)
  await window.analytics_remote.init({
    react: { [reactVersion]: { get: () => Promise.resolve(() => require('react')) } },
    'react-dom': { ... }
  })
  // 3. Load the component factory
  const factory = await window.analytics_remote.get('./AnalyticsDashboard')
  setComponent(() => factory().default)
}
document.head.appendChild(script)
```

### Consequences
- **Positive:** Works in both dev and production; explicit React sharing prevents hook errors
- **Negative:** More verbose than the plugin approach; `window.analytics_remote` is untyped (solved with `Window` interface declaration)

---

## ADR-006: dnd-kit over react-beautiful-dnd

**Date:** Phase 2  
**Status:** Accepted  

### Decision
**dnd-kit** was chosen for drag-and-drop.

### Reasons
| Factor | dnd-kit | react-beautiful-dnd |
|--------|---------|---------------------|
| React 19 compat | ✅ | ❌ Not maintained for React 18+ |
| Pointer events | ✅ (accessible) | ❌ DOM-based |
| Bundle size | ~16 kB gzip | ~12 kB gzip |
| Virtual scroll compat | ✅ (with conditions) | ❌ Known issues |
| Maintenance | Active | Archived by Atlassian |
| Accessibility | ARIA, keyboard nav | ARIA |

### Consequences
- **Positive:** React 19 compatible; works with virtual scroll (conditional activation)
- **Negative:** API is lower-level; requires more configuration than rbd

---

## ADR-007: Tailwind CSS 4 with `@custom-variant dark`

**Date:** Phase 3  
**Status:** Accepted  

### Context
Dark mode was not applying correctly even though `html.dark` class was being toggled.

### Problem
Tailwind CSS v4 **does not automatically enable class-based dark mode** (unlike v3's `darkMode: 'class'` config). The `dark:` variant only activates for media query by default.

### Decision
Added `@custom-variant dark (&:where(.dark, .dark *));` to `src/index.css`.

```css
@import 'tailwindcss';
@custom-variant dark (&:where(.dark, .dark *));
```

### Consequences
- **Positive:** Class-based dark mode works correctly; all `dark:` Tailwind variants respond to `html.dark` class
- **Lesson:** Tailwind v4 is a major rewrite; many v3 assumptions no longer hold

---

## ADR-008: Feature-Sliced Architecture

**Date:** Phase 1  
**Status:** Accepted  

### Decision
Organized `src/` into `app/`, `features/`, `shared/`, `lib/`, and `pages/` following Feature-Sliced Design (FSD) principles.

### Rationale
| Layer | Contains | Depends on |
|-------|---------|------------|
| `pages/` | Route-level compositions | `features/`, `shared/`, `lib/` |
| `features/` | Domain-specific components | `shared/`, `lib/` |
| `shared/` | Generic, reusable UI | `lib/` only |
| `lib/` | State, types, Firebase, Socket | Nothing in `src/` |
| `app/` | Shell, layout, providers | All layers |

### Consequences
- **Positive:** Clear import direction prevents circular deps; easy to locate files; scalable to large teams
- **Negative:** More folders to navigate for a small project; some overhead in boilerplate
