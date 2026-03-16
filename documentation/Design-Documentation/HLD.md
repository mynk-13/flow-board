# High Level Design (HLD)
## FlowBoard — Real-Time Collaborative Project Manager

**Version:** 1.0  
**Date:** March 2026  
**Status:** Final  

---

## 1. System Overview

FlowBoard is a three-tier web application:

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                          │
│                                                                   │
│   ┌──────────────────────┐    ┌──────────────────────────────┐  │
│   │  Main SPA (Vite)     │    │  Analytics MFE (Webpack 5)   │  │
│   │  React 19 + TS       │    │  Loaded at runtime via       │  │
│   │  Deployed: Vercel    │◄───│  Module Federation           │  │
│   └──────────┬───────────┘    └──────────────────────────────┘  │
│              │                                                    │
└──────────────┼────────────────────────────────────────────────────┘
               │
       ┌───────┴──────────────────────────────────┐
       │                                           │
       ▼                                           ▼
┌──────────────────┐                   ┌──────────────────────┐
│   Firebase       │                   │  Socket.io Server    │
│  ─────────────── │                   │  ─────────────────── │
│  Auth            │                   │  Node.js + Express   │
│  Firestore       │                   │  Deployed: Railway   │
│  (Google Cloud)  │                   │                      │
└──────────────────┘                   └──────────────────────┘
```

---

## 2. Component Architecture

### 2.1 Layer Breakdown

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│                                                          │
│  Pages           App Shell          Shared UI            │
│  ─────────────   ──────────────     ──────────────────── │
│  LoginPage       AppLayout          ThemeToggle           │
│  SignupPage      Sidebar            CommandPalette        │
│  DashboardPage   UserMenu           FilterDropdown        │
│  BoardPage                          SelectDropdown        │
│  AnalyticsPage                      LabelPicker           │
│                                     PasswordInput         │
│                                     LoadingScreen         │
└─────────────────────────────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────────────┐
│                    FEATURE LAYER                          │
│                                                          │
│  board/              tasks/           auth/              │
│  ─────────────────   ─────────────    ──────────────     │
│  BoardColumn         TaskCard         AuthProvider       │
│  ShareModal          TaskDetailModal  useAuth            │
│  PresenceBar                          AuthGate           │
│  CursorOverlay                        ProtectedRoute     │
└─────────────────────────────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────────────┐
│                    STATE / DATA LAYER                     │
│                                                          │
│  Zustand (UIStore)    TanStack Query    Firebase         │
│  ─────────────────    ─────────────     ──────────────── │
│  isDark               Project queries   Auth SDK         │
│  sidebarOpen          Task queries      Firestore SDK    │
│  filters              Mutations         Security Rules   │
│  tasks (RT)           Cache             Composite Indexes│
│  presence                                                │
│  cursors                                                 │
└─────────────────────────────────────────────────────────┘
               │
┌──────────────▼───────────────────────────────────────────┐
│                  INFRASTRUCTURE LAYER                     │
│                                                          │
│  Vite 6 (build)     Socket.io client   Analytics MFE     │
│  Tailwind CSS 4     WebSocket          Module Federation │
│  React Router v7    Event emitter      Webpack 5 remote  │
└─────────────────────────────────────────────────────────┘
```

---

## 3. Technology Choices

| Concern | Choice | Rationale |
|---------|--------|-----------|
| **Frontend framework** | React 19 + TypeScript | Concurrent features, strong ecosystem, portfolio value |
| **Build tool** | Vite 6 | Sub-second HMR, ESBuild transformer, manual chunk support |
| **Styling** | Tailwind CSS 4 | Utility-first, dark mode via class, no runtime CSS-in-JS |
| **Client state** | Zustand 5 | Zero-boilerplate, functional updaters for RT safety, tiny bundle |
| **Server state** | TanStack Query v5 | Caching, background refetch, optimistic updates built-in |
| **Auth + DB** | Firebase Auth + Firestore | Serverless, real-time capable, generous free tier, zero ops |
| **Real-time** | Socket.io 4 on Railway | Cursor/presence need sub-100ms; Firestore listeners have ~1-2s delay |
| **Drag and drop** | dnd-kit | Pointer-event based, accessible, no DOM hacks, React 19 compatible |
| **MFE** | Webpack 5 Module Federation | Industry standard; Vite plugin had dev-mode bugs so script injection used |
| **Charts** | Recharts | React-native, responsive, good dark mode support |
| **Icons** | Lucide React | Tree-shaken, consistent design language |
| **Routing** | React Router v7 | Type-safe, nested layouts, future-ready with `createBrowserRouter` |
| **Virtual scroll** | TanStack Virtual v3 | Works alongside dnd-kit with conditional activation |

---

## 4. Data Flow Overview

### 4.1 Authentication Flow
```
Browser → Firebase Auth SDK → Google Identity Platform
    ↓ (onAuthStateChanged)
AuthProvider (React Context)
    ↓
AppLayout / ProtectedRoute
    ↓ (redirect if unauth)
LoginPage / Dashboard
```

### 4.2 Project Data Flow
```
AppLayout.mount()
    → getOwnedProjects(uid)   ─┐
    → getSharedProjects(uid)  ─┴→ Promise.all → Outlet context
                                                     ↓
                                              DashboardPage
                                              BoardPage
                                              AnalyticsPage
```

### 4.3 Real-Time Flow
```
BoardPage.mount()
    → socket.emit('board:join', { projectId })
    → Server adds to room board:<id>
    → Server emits 'board:sync' → client loads initial state

User drags task card
    → dnd-kit onDragEnd
    → updateTask(Firestore) [optimistic]
    → socket.emit('task:move', payload)
    → Server broadcasts to room (excluding sender)
    → Other clients: applyRemoteMove() via Zustand functional updater
```

### 4.4 Analytics Data Flow
```
AnalyticsPage.mount()
    → Inject <script src="{ANALYTICS_REMOTE_URL}/remoteEntry.js">
    → window.analytics_remote.init(sharedScope)  [shares React singleton]
    → const mod = analytics_remote.get('./AnalyticsDashboard')
    → Render <RemoteDashboard tasks={allTasks} projects={allProjects} isDark={isDark} />

Data fetch (independent of board state):
    → getAllProjects (owned + shared)
    → Promise.all(projects.map(p => getTasks(p.id)))
    → allTasks: Task[] passed as prop
```

---

## 5. Deployment Architecture

```
GitHub Repository
        │
        │ git push
        ▼
┌──────────────────────────────────────────────────────────────┐
│                     Vercel (Main SPA)                         │
│  ─────────────────────────────────────────────────────────── │
│  Build: npm run build                                         │
│  Output: dist/                                                │
│  CDN: Global edge network                                     │
│  Domain: flow-board-xxx.vercel.app                            │
│  Env: VITE_FIREBASE_*, VITE_SOCKET_URL, VITE_ANALYTICS_URL   │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              Vercel (Analytics MFE — separate project)        │
│  ─────────────────────────────────────────────────────────── │
│  Build: cd analytics-remote && npm run build                  │
│  Output: dist/ (includes remoteEntry.js)                      │
│  CORS: vercel.json allows main app origin                     │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│                 Railway.app (Socket Server)                    │
│  ─────────────────────────────────────────────────────────── │
│  Runtime: Node.js 18                                          │
│  Entry: server/src/index.ts (compiled)                        │
│  Port: 3001                                                   │
│  Env: PORT, CORS_ORIGIN                                       │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│              Google Firebase (Managed)                        │
│  ─────────────────────────────────────────────────────────── │
│  Firebase Auth: email/password                                │
│  Firestore: users, projects, tasks collections                │
│  Security Rules: custom RBAC rules                            │
│  Composite Indexes: for complex queries                       │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Security Architecture

```
Request flow with authorization:
                                                         
Browser Request                                          
    │                                                    
    ├─ Static assets → Vercel CDN (no auth needed)       
    │                                                    
    ├─ Firebase Auth → Google Identity Platform           
    │       ↓ JWT token (auto-refresh)                   
    ├─ Firestore reads/writes                            
    │       ↓ Firebase Security Rules evaluate JWT       
    │       ↓ Check: authenticated? member? role?        
    │       ↓ Allow or Deny                              
    │                                                    
    └─ Socket.io events                                  
            ↓ userId sent with each event                
            ↓ Server validates projectId membership      
            ↓ Server filters cursor visibility by role   
```

---

## 7. Module Federation Architecture

```
Host App (Vite — localhost:5173)
    │
    │  1. window.onload: inject <script src="remoteEntry.js">
    │  2. window.analytics_remote.init({ react, 'react-dom' })
    │     ← shares host's React instance to prevent duplicate
    │  3. const factory = await window.analytics_remote.get('./AnalyticsDashboard')
    │  4. const Component = factory().default
    │  5. render <Component tasks={...} projects={...} isDark={...} />
    │
    ▼
Analytics Remote (Webpack — localhost:3002)
    │  webpack.config.js: ModuleFederationPlugin
    │  name: 'analytics_remote'
    │  exposes: { './AnalyticsDashboard': './src/AnalyticsDashboard' }
    │  shared: { react: singleton, 'react-dom': singleton }
    ▼
AnalyticsDashboard.tsx
    ├── OverviewCards (theme)
    ├── StatusChart (theme, tasks)
    ├── PriorityChart (theme, tasks)
    ├── CompletionChart (theme, tasks)
    ├── LabelChart (theme, tasks)
    └── TeamChart (theme, tasks, projects)
```
