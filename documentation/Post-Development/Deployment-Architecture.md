# Deployment Architecture Document
## FlowBoard — Real-Time Collaborative Project Manager

**Version:** 1.0  
**Date:** March 2026  

---

## 1. Infrastructure Overview

```
                         ┌──────────────────────────────┐
                         │         GitHub Repository     │
                         │   github.com/mynk-13/flow-board│
                         └──────────────┬───────────────┘
                                        │ git push
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   │
         ┌──────────────────┐  ┌───────────────────┐       │
         │  Vercel Project  │  │  Vercel Project   │       │
         │  (Main SPA)      │  │  (Analytics MFE)  │       │
         │                  │  │                   │       │
         │  flow-board.     │  │  analytics-       │       │
         │  vercel.app      │  │  remote.vercel.app│       │
         └──────────────────┘  └───────────────────┘       │
                    │                                       │
                    │ WebSocket (WSS)                       │
                    ▼                                       │
         ┌──────────────────┐                              │
         │  Railway.app     │                              │
         │  (Socket Server) │◄──────────── manual deploy  ─┘
         │                  │
         │  Node.js 18      │
         │  Express + Socket.io │
         └──────────────────┘
                    │
                    │ (Firebase SDKs — no direct connection from server)
                    ▼
         ┌──────────────────────────────────┐
         │         Google Firebase           │
         │                                  │
         │  Auth: Identity Platform          │
         │  Firestore: us-central1 (default) │
         │  Security Rules + Indexes        │
         └──────────────────────────────────┘
```

---

## 2. Service 1: Main SPA — Vercel

### 2.1 Configuration

| Setting | Value |
|---------|-------|
| Build Command | `npm run build` |
| Output Directory | `dist` |
| Install Command | `npm install` |
| Root Directory | `/` (repository root) |
| Node.js Version | 18.x |
| Framework Preset | Vite |

### 2.2 Environment Variables (set in Vercel Dashboard)

| Variable | Example Value |
|---------|---------------|
| `VITE_FIREBASE_API_KEY` | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `flow-board-xxx.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `flow-board-xxx` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `flow-board-xxx.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `293864554680` |
| `VITE_FIREBASE_APP_ID` | `1:xxx:web:xxx` |
| `VITE_SOCKET_URL` | `https://xxx.up.railway.app` |
| `VITE_ANALYTICS_REMOTE_URL` | `https://analytics.vercel.app` |

### 2.3 Build Output Chunks

After `npm run build`, Vercel serves:
```
dist/
  index.html            (0.62 kB gzip — entry point)
  assets/
    index-*.css         (10 kB gzip — Tailwind CSS)
    index-*.js          (23.6 kB gzip — app code)
    react-*.js          (59 kB gzip — React + ReactDOM)
    firebase-*.js       (109 kB gzip — Firebase SDK)
    router-*.js         (13 kB gzip — React Router)
    socket-*.js         (13 kB gzip — Socket.io client)
    dndkit-*.js         (16 kB gzip — dnd-kit)
    tanstack-*.js       (5 kB gzip — TanStack libs)
    lucide-*.js         (4 kB gzip — icons)
```

### 2.4 SPA Routing
Vercel auto-detects Vite; rewrites all paths to `index.html` (handled by Vite's `build.rollupOptions` and Vercel's framework preset).

### 2.5 Deployment Trigger
Automatic: every push to `main` branch triggers a new deployment. PR branches get preview deployments.

---

## 3. Service 2: Analytics MFE — Vercel (Separate Project)

### 3.1 Configuration

| Setting | Value |
|---------|-------|
| Build Command | `cd analytics-remote && npm install && npm run build` |
| Output Directory | `analytics-remote/dist` |
| Root Directory | `/` |

### 3.2 CORS Configuration (`analytics-remote/vercel.json`)
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "https://flow-board.vercel.app" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, OPTIONS" }
      ]
    }
  ]
}
```

### 3.3 Key Output File
`dist/remoteEntry.js` — the Module Federation entry point loaded by the host app at runtime.

---

## 4. Service 3: Socket.io Server — Railway.app

### 4.1 Configuration

| Setting | Value |
|---------|-------|
| Runtime | Node.js 18 |
| Start Command | `node dist/index.js` |
| Build Command | `npm install && npm run build` |
| Root Directory | `server/` |
| Port | `$PORT` (Railway injects this) |

### 4.2 Environment Variables (set in Railway Dashboard)

| Variable | Value |
|---------|-------|
| `PORT` | Auto-injected by Railway |
| `CORS_ORIGIN` | `https://flow-board.vercel.app` |

### 4.3 Server Entry (`server/src/index.ts`)
```typescript
const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN ?? '*',
    methods: ['GET', 'POST'],
  },
})

httpServer.listen(process.env.PORT ?? 3001)
```

### 4.4 Room Management
```typescript
// In-memory room tracking (cleared on restart)
const rooms = new Map<string, Set<string>>()  // projectId → Set<userId>

io.on('connection', (socket) => {
  socket.on('board:join', ({ projectId, userId, userName, role }) => {
    socket.join(`board:${projectId}`)
    // Track presence, broadcast join
  })
  socket.on('disconnect', () => {
    // Remove from all rooms, broadcast leave
  })
})
```

---

## 5. Service 4: Firebase (Managed — Google Cloud)

### 5.1 Auth Configuration
- Provider: Email/Password (enabled in Firebase Console)
- Session: Persistent localStorage-based (Firebase SDK default)
- JWT auto-refresh: Handled by Firebase SDK

### 5.2 Firestore Configuration
- Location: `us-central1` (default)
- Mode: Native mode
- Rules: Custom RBAC rules (deployed via `firestore.rules`)
- Indexes: 3 composite indexes (deployed via `firestore.indexes.json`)

### 5.3 Deployment (one-time setup, then Firebase Console)
```bash
# If Firebase CLI is authenticated:
firebase deploy --only firestore:rules
firebase deploy --only firestore:indexes
```

---

## 6. Network Topology

```
User Browser
     │
     ├── HTTPS  → Vercel CDN (Global Edge) → dist/index.html + static chunks
     │
     ├── HTTPS  → Google Firebase Auth (auth.googleapis.com)
     │
     ├── HTTPS  → Firestore (firestore.googleapis.com)
     │
     ├── WSS    → Railway Socket.io server (persistent WebSocket)
     │
     └── HTTPS  → Vercel CDN → Analytics MFE (remoteEntry.js + chunks)
                  (only when /analytics route visited)
```

---

## 7. Deployment Checklist

### First-Time Setup
- [x] Create Firebase project; enable Email/Password auth
- [x] Deploy Firestore security rules and composite indexes
- [x] Create Vercel project; connect GitHub repo; set all `VITE_*` env vars
- [x] Create Railway project; connect server/ directory; set `CORS_ORIGIN`
- [x] Create separate Vercel project for Analytics MFE
- [x] Set `VITE_ANALYTICS_REMOTE_URL` in main Vercel project to MFE URL
- [x] Set `VITE_SOCKET_URL` to Railway URL

### Ongoing Deployments
- Push to `main` → Vercel auto-deploys both projects
- Socket server: push changes to `server/` and Railway redeploys (or trigger manual redeploy)

---

## 8. Monitoring & Observability

| Service | Monitoring |
|---------|-----------|
| Vercel SPA | Vercel Analytics dashboard (Web Vitals, edge latency) |
| Firebase | Firebase Console (auth failures, Firestore read/write counts) |
| Railway | Railway metrics (CPU, memory, request count) |
| Client errors | Browser console (dev); future: Sentry integration |
| Bundle size | `npm run bundle:audit` (post-build) |
| Lighthouse | `npm run lighthouse:run` (against preview URL) |
