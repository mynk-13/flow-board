# Data Flow Diagram (DFD)
## FlowBoard — Real-Time Collaborative Project Manager

**Version:** 1.0  
**Date:** March 2026  
**Notation:** Text-based DFD (Level 0 → Level 1 → Level 2)

---

## Level 0 — Context Diagram

Shows FlowBoard as a single system with external entities.

```
                    ┌─────────────────┐
                    │                 │
     ─────────────► │   FlowBoard     │ ◄─────────────────
    │  credentials   │                 │  task updates (RT)  │
    │  board actions │    System       │  presence events    │
    │                │                 │                     │
    │  ◄─────────── │                 │ ──────────────────► │
    │  board state   │                 │  cursor positions   │
    │  auth session  └────────┬────────┘  sync commands      │
    │                         │                              │
 ┌──┴────┐             read/write DB             ┌───────────┴──┐
 │ User  │                    │                  │  Other Users  │
 │(Browser)│          ┌───────▼────────┐         │  (Browsers)   │
 └───────┘           │    Firebase    │          └──────────────┘
                      │  Auth+Firestore│
                      └───────────────┘
```

---

## Level 1 — Main Processes

### Process 1: Authentication Flow

```
┌──────────┐     email + password      ┌─────────────────────────┐
│          │ ──────────────────────►   │  P1: Authenticate User  │
│          │                           │                         │
│  User    │ ◄──────────────────────   │  1.1 Validate email fmt │
│          │    JWT session token       │  1.2 Validate pw rules  │
│          │    or error message        │  1.3 Call Firebase Auth │
└──────────┘                           │  1.4 Save user profile  │
                                       └─────────────┬───────────┘
                                                      │ user record
                                                      ▼
                                             ┌────────────────┐
                                             │  D1: Firestore │
                                             │  users/{uid}   │
                                             └────────────────┘
```

### Process 2: Project Management Flow

```
┌──────────┐  create/share/delete req  ┌─────────────────────────┐
│          │ ──────────────────────►   │  P2: Manage Projects    │
│  Admin   │                           │                         │
│  User    │ ◄──────────────────────   │  2.1 Auth check         │
│          │    project list / error    │  2.2 Role check         │
└──────────┘                           │  2.3 Write to Firestore │
                                       │  2.4 Return updated list│
                                       └─────────────┬───────────┘
                                                      │
                    ┌─────────────────────────────────┤
                    ▼                                 ▼
           ┌────────────────┐               ┌────────────────┐
           │  D2: projects  │               │  D3: users     │
           │  collection    │               │  (email lookup)│
           └────────────────┘               └────────────────┘
```

### Process 3: Kanban Board Flow

```
┌──────────┐  fetch project + tasks   ┌──────────────────────────┐
│          │ ─────────────────────►   │  P3: Load Board           │
│  User    │                          │                           │
│ (Writer/ │ ◄─────────────────────   │  3.1 getTasks(projectId) │
│  Admin)  │  rendered board state    │  3.2 Sort by position    │
└─────┬────┘                          │  3.3 Connect Socket room │
      │                               └───────────┬──────────────┘
      │ drag card / edit task                      │
      ▼                                            ▼
┌──────────────────┐               ┌───────────────────────────┐
│  P4: Update Task │               │   D4: tasks collection    │
│                  │               │   where projectId == id   │
│  4.1 Optimistic  │               └───────────────────────────┘
│      UI update   │
│  4.2 Firestore   │
│      write       │
│  4.3 Socket.io   │
│      broadcast   │
└────────┬─────────┘
         │  task:move / task:update
         ▼
┌──────────────────┐
│  P5: Broadcast   │
│  to Room         │
│                  │
│  5.1 Server      │
│      receives    │
│  5.2 Broadcasts  │
│      to all      │
│      room members│
│      except sender│
└────────┬─────────┘
         │ task:moved / task:updated
         ▼
┌──────────────────┐
│ Other Connected  │
│ Users            │
│ applyRemoteMove()│
└──────────────────┘
```

### Process 4: Real-Time Collaboration Flow

```
┌──────────┐  cursor:move (throttled)  ┌─────────────────────────┐
│  User A  │ ──────────────────────►   │  P6: Socket.io Server   │
│ (Admin/  │                           │                         │
│  Writer) │  presence:join            │  6.1 Manage room        │
│          │ ──────────────────────►   │  6.2 Validate userId    │
└──────────┘                           │  6.3 Broadcast to room  │
                                       │  6.4 Track idle timers  │
                                       └─────────────┬───────────┘
                                                      │ cursor:update
                                                      │ presence:join/leave
                                                      ▼
                                             ┌────────────────┐
                                             │  User B, C, D  │
                                             │  (other board  │
                                             │  participants) │
                                             └────────────────┘
```

### Process 5: Analytics Flow

```
┌──────────┐  navigate to /analytics   ┌─────────────────────────┐
│          │ ──────────────────────►   │  P7: Load Analytics MFE │
│  User    │                           │                         │
│          │ ◄──────────────────────   │  7.1 Inject script tag  │
│          │  rendered dashboard        │  7.2 Init MFE with React│
└──────────┘                           │  7.3 Fetch all tasks    │
                                       │  7.4 Render charts      │
                                       └─────────────┬───────────┘
                                                      │ getTasks per project
                                                      ▼
                                             ┌────────────────┐
                                             │  D4: tasks     │
                                             │  (all projects)│
                                             └────────────────┘
```

---

## Level 2 — Detailed: Task Update Flow

```
User edits task title in TaskDetailModal
            │
            ▼
┌─────────────────────────────────────────────────────────────┐
│                  P4.1: Local State Update                    │
│  upsertTask({ ...task, title: newTitle })                    │
│  → Zustand tasks[] updated immediately (optimistic)          │
│  → TaskCard re-renders with new title                        │
└────────────────────────┬────────────────────────────────────┘
                         │ async
            ┌────────────┴──────────────┐
            ▼                           ▼
┌─────────────────────┐    ┌───────────────────────────────┐
│  P4.2: Firestore    │    │  P4.3: Socket.io Broadcast    │
│  Write              │    │                               │
│                     │    │  socket.emit('task:update', { │
│  updateDoc(         │    │    id, diff: { title },       │
│    taskRef,         │    │    projectId, userId          │
│    { title,         │    │  })                           │
│      updatedAt }    │    │                               │
│  )                  │    │  → Server receives            │
│                     │    │  → Server broadcasts          │
│  → Firestore        │    │    to room (excl. sender)     │
│    confirms write   │    │                               │
└─────────────────────┘    └──────────────┬────────────────┘
                                          │ task:updated
                                          ▼
                              ┌─────────────────────────┐
                              │  P4.4: Remote Client    │
                              │  applyRemotePatch(      │
                              │    id,                  │
                              │    { title }            │
                              │  )                      │
                              │                         │
                              │  Zustand functional set:│
                              │  tasks.map(t =>         │
                              │    t.id === id          │
                              │      ? {...t, ...diff}  │
                              │      : t                │
                              │  )                      │
                              └─────────────────────────┘
```

---

## Level 2 — Detailed: Authentication State Flow

```
App starts
    │
    ▼
Firebase SDK initialises
    │
    ▼
onAuthStateChanged fires
    │
    ├── user is null → loading = false → redirect /login
    │
    └── user exists
            │
            ▼
       saveUserProfile(uid, email)
            │
            ▼
       loading = false
            │
            ▼
       Render AppLayout
            │
            ▼
       getOwnedProjects(uid) ──┐
       getSharedProjects(uid) ─┴──► Promise.all
                                        │
                                        ▼
                                Outlet context provided
                                (projects, tasks, loading)
```

---

## Data Store Summary

| Store ID | Name | Type | Contents |
|----------|------|------|----------|
| D1 | Firestore `users` | Document | uid, email, displayName, createdAt |
| D2 | Firestore `projects` | Document | name, workspaceId, createdBy, members{}, memberIds[], createdAt |
| D3 | Firestore `tasks` | Document | title, description, columnId, priority, labels[], position, projectId, dueDate, assigneeId, createdAt, updatedAt |
| D4 | Zustand UIStore | In-memory | tasks[], filters, sidebarOpen, isDark, presence[], cursors[], cmdPaletteOpen |
| D5 | Socket.io rooms | In-memory (server) | board:projectId → Set\<socketId\> |
| D6 | localStorage | Browser | theme: 'dark'\|'light' |
