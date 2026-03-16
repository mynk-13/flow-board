# Non-Functional Requirements Document (NFR)
## FlowBoard — Real-Time Collaborative Project Manager

**Version:** 1.0  
**Date:** March 2026  
**Status:** Final  

---

## 1. Introduction

This document defines the non-functional requirements (quality attributes) for FlowBoard — the standards the system must meet beyond specific behaviors. These span performance, scalability, security, reliability, accessibility, maintainability, and compatibility.

---

## 2. Performance

### NFR-PERF-01: Core Web Vitals
| Metric | Threshold | Measurement |
|--------|-----------|-------------|
| LCP (Largest Contentful Paint) | < 2.0 s | Lighthouse, PageSpeed |
| INP (Interaction to Next Paint) | < 100 ms | Chrome DevTools |
| CLS (Cumulative Layout Shift) | < 0.1 | Lighthouse |
| FCP (First Contentful Paint) | < 1.2 s | Lighthouse |
| TTFB (Time to First Byte) | < 600 ms | Vercel Edge Network |

### NFR-PERF-02: Bundle Size
| Chunk | Gzip Target | Achieved |
|-------|-------------|---------|
| Main app chunk | < 150 kB | 23.6 kB ✅ |
| Critical path (react + router + app + css) | < 200 kB | ~106 kB ✅ |
| Total gzip | No hard limit (chunked) | ~252 kB |

- Firebase SDK (~109 kB) and React (~59 kB) are separated via Vite `manualChunks` and cached independently after first load.

### NFR-PERF-03: Rendering Performance
- Task boards with up to 15 tasks per column: all cards rendered directly (no virtualization overhead)
- Task boards with > 15 tasks per column: TanStack Virtual activates for windowed rendering; target 60 fps scrolling
- Drag-and-drop: pointer event processing completes within one frame (16 ms) for smooth visual response

### NFR-PERF-04: Real-Time Latency
| Operation | Target |
|-----------|--------|
| Task move visible to other users | < 300 ms on LAN |
| Task update visible to other users | < 300 ms on LAN |
| Cursor position update rate | 30 fps (throttled) |
| Presence join/leave notification | < 500 ms |

### NFR-PERF-05: Image and Asset Optimisation
- SVG used for logo (zero byte overhead for raster)
- Google Fonts loaded with `display=swap` to avoid render-blocking
- No unoptimised raster images in v1

---

## 3. Scalability

### NFR-SCALE-01: Concurrent Users
- Board rooms support up to **50 concurrent users** per board (Socket.io room limit)
- Total concurrent users across all boards: determined by Railway.app tier (free: ~100 connections)
- Firestore handles unlimited concurrent reads; write throughput limited to 1 write/second per document (batched by column position)

### NFR-SCALE-02: Task Volume
- Virtual scroll handles **1 000+ tasks** per column without frame drops
- Firestore queries paginate at 100 tasks per fetch if needed

### NFR-SCALE-03: Project Volume
- No hard limit on projects per workspace in v1
- Dashboard efficiently renders up to 50 project cards with skeleton loading

### NFR-SCALE-04: Horizontal Scaling
- The Vite SPA has no server-side state; scales infinitely via Vercel CDN
- Socket.io server is stateless per room; can be horizontally scaled with Redis adapter in future
- Analytics MFE is a separate Vercel deployment; independently scalable

---

## 4. Security

### NFR-SEC-01: Authentication
- All authentication handled by Firebase Auth (SOC 2 Type II certified)
- Passwords hashed by Firebase (bcrypt); never transmitted or stored in plaintext by the app
- Session tokens are JWTs managed by Firebase; auto-refreshed before expiry
- No credentials stored in application code

### NFR-SEC-02: Authorization
- Firestore Security Rules enforce RBAC at the database level:
  - Only authenticated users can read/write their own data
  - Project read access restricted to `memberIds` array members
  - Project write access restricted to `admin` and `writer` role members
  - Project delete access restricted to `admin` only
- Client-side role enforcement for UI (buttons hidden, inputs disabled) is defence-in-depth; server rules are authoritative

### NFR-SEC-03: Environment Variables
- All Firebase config values stored as `VITE_*` environment variables
- `.env` file gitignored; Vercel environment variables used in production
- No secrets committed to the repository

### NFR-SEC-04: Transport Security
- All communication over HTTPS (Vercel enforces TLS 1.2+)
- Socket.io server on Railway with WSS (WebSocket Secure)
- Firebase SDK communicates only over HTTPS

### NFR-SEC-05: Cross-Origin Resource Sharing (CORS)
- Analytics MFE `vercel.json` sets `Access-Control-Allow-Origin` headers
- Socket.io server CORS configured to allow only the Vercel app origin in production

### NFR-SEC-06: Input Sanitisation
- All text inputs (task title, description, project name) are stored as plain text in Firestore; no HTML rendered via `dangerouslySetInnerHTML`
- React's default JSX escaping prevents XSS

---

## 5. Reliability & Availability

### NFR-REL-01: Uptime Target
| Service | Target Uptime |
|---------|--------------|
| Vercel (SPA) | 99.99% (Vercel SLA) |
| Firebase (Auth + Firestore) | 99.95% (Google SLA) |
| Railway (Socket server) | 99.5% (Railway SLA) |
| Analytics MFE (Vercel) | 99.99% (Vercel SLA) |

### NFR-REL-02: Graceful Degradation
- If Socket.io server is unavailable: board loads in read-only mode; Firestore data still accessible; real-time features show "Offline" badge
- If Analytics MFE fails to load: error boundary catches the failure; a "Retry" message shown; main app unaffected
- If Firestore is temporarily unavailable: Firebase SDK returns cached data; UI shows stale data toast

### NFR-REL-03: Error Handling
- All async operations wrapped in try/catch; user-facing error messages shown as alerts
- Socket.io auto-reconnects with exponential backoff on disconnect

### NFR-REL-04: Data Consistency
- Firestore is the source of truth for all task and project data
- Socket.io events serve as a fast update notification layer, not the primary store
- On reconnect, `board:sync` event re-fetches current state from Firestore to resolve any missed events

---

## 6. Accessibility

### NFR-A11Y-01: WCAG 2.1 AA Compliance
| Criterion | Requirement |
|-----------|------------|
| Colour contrast | Text/background ratio ≥ 4.5:1 (normal text), 3:1 (large text) |
| Keyboard navigation | All interactive elements reachable and operable via keyboard |
| Focus indicators | Visible `outline: 2px solid #6366f1` on all focusable elements via `:focus-visible` |
| Screen reader | All images and icon-only buttons have `aria-label` or `aria-hidden` |
| Form labels | All inputs associated with visible labels or `aria-label` |
| Modal dialogs | `aria-modal="true"`, `role="dialog"`, focus trapped inside while open |

### NFR-A11Y-02: Semantic HTML
- Correct heading hierarchy (`h1` → `h2` → `h3`) on all pages
- Navigation wrapped in `<nav>` with `aria-label`
- Lists use `<ul>/<li>` where appropriate
- Buttons use `<button>`, not `<div onClick>`

### NFR-A11Y-03: Reduced Motion
- Animations respect `prefers-reduced-motion` media query; transitions disabled for users who opt out

---

## 7. Maintainability

### NFR-MAINT-01: Code Quality
- ESLint 9 (flat config) enforces React Hooks rules and import ordering
- Prettier formats all `.ts`, `.tsx`, `.css`, `.json` files consistently
- Husky pre-commit hook runs lint-staged; failing lint blocks commit

### NFR-MAINT-02: Test Coverage
| Layer | Tool | Target | Achieved |
|-------|------|--------|---------|
| Unit (lib + shared) | Vitest + RTL | ≥ 80% stmt | 94.48% ✅ |
| E2E (flows) | Playwright | Auth + Board + CRUD | ✅ |
| Bundle audit | Custom script | Main chunk < 150 kB | 23.6 kB ✅ |

### NFR-MAINT-03: TypeScript Strict Mode
- `tsconfig.app.json` with `strict: true`, `noUnusedLocals`, `noUnusedParameters`
- All components, hooks, and utilities fully typed; no `any` in production code

### NFR-MAINT-04: Documentation
- `README.md` with quick-start, all scripts, and architecture overview
- `docs/TECHNICAL_ASPECTS.md` with deep-dive architecture documentation
- `docs/PLAN_OF_ACTION.md` with phase status and decisions
- `documentation/` folder with full PRD, FRD, NFR, HLD, LLD, ADR, DFD, API, DB, Deployment, Testing, User docs

### NFR-MAINT-05: Dependency Management
- All dependencies pinned to exact versions in `package-lock.json`
- No deprecated or unmaintained packages in production dependencies

---

## 8. Compatibility

### NFR-COMPAT-01: Browser Support
| Browser | Version | Support |
|---------|---------|---------|
| Google Chrome | Latest 2 | Full |
| Mozilla Firefox | Latest 2 | Full |
| Microsoft Edge | Latest 2 | Full |
| Apple Safari | Latest 2 | Full |
| Mobile Chrome (Android) | Latest | Layout only (drag-drop limited) |
| Mobile Safari (iOS) | Latest | Layout only (drag-drop limited) |

### NFR-COMPAT-02: Screen Resolutions
- Minimum supported: 1280 × 720 (HD)
- Optimal: 1440 × 900 and above
- All 5 Kanban columns fit within 1280px width without horizontal scrolling
- Dashboard uses responsive grid (1–3 columns depending on viewport)

### NFR-COMPAT-03: JavaScript Requirements
- Requires ES2020+ (target: `esnext` in Vite build)
- No IE 11 support

---

## 9. Internationalisation (i18n)

### NFR-I18N-01: Language
- v1: English only
- All user-facing strings are hardcoded in English; no i18n framework
- Future: React-i18next integration possible without architectural changes

---

## 10. Compliance

| Standard | Status |
|---------|--------|
| GDPR (data minimisation) | Only email stored in Firestore; no tracking cookies |
| WCAG 2.1 AA | Targeted; axe-playwright scan pending |
| Firebase Terms of Service | ✅ Compliant |
| Vercel Terms of Service | ✅ Compliant |
