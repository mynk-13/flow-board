# API Design Document
## FlowBoard — Real-Time Collaborative Project Manager

**Version:** 1.0  
**Date:** March 2026  

FlowBoard has two internal APIs:
1. **Socket.io Bidirectional API** — real-time events between browser and Node.js server
2. **Firestore Helper API** — TypeScript functions wrapping Firebase SDK calls

---

## Part 1: Socket.io Event API

### Base URL
```
Development:  ws://localhost:3001
Production:   wss://<railway-app>.up.railway.app
```

### Connection
```typescript
// Client connection options
io(SOCKET_URL, {
  transports: ['websocket'],  // skip polling for performance
  autoConnect: false,         // manual connect on board load
})
```

---

### Client → Server Events

#### `board:join`
Join a project board room. Must be emitted before any other board events.

```typescript
// Payload
{
  projectId: string    // Firestore project ID
  userId: string       // Firebase uid
  userName: string     // User display name (first name or email prefix)
  role: 'admin' | 'writer' | 'reader'
}

// Server side effect:
// - socket.join(`board:${projectId}`)
// - Broadcasts presence:join to room
// - Emits board:sync back to this client
```

---

#### `task:move`
User dragged a task card to a different column or position.

```typescript
// Payload
{
  id: string           // Task Firestore ID
  columnId: ColumnId   // 'backlog' | 'todo' | 'inprogress' | 'inreview' | 'done'
  position: number     // New floating-point sort position
  projectId: string    // Room identifier
  userId: string       // Sender (excluded from broadcast)
}

// Server side effect:
// - socket.to(`board:${projectId}`).emit('task:moved', payload)
```

---

#### `task:update`
User edited task fields (title, description, priority, labels, dueDate).

```typescript
// Payload
{
  id: string
  diff: Partial<{
    title: string
    description: string
    priority: Priority
    labels: string[]
    dueDate: number | null
    assigneeId: string | null
  }>
  projectId: string
  userId: string
}

// Server side effect:
// - socket.to(`board:${projectId}`).emit('task:updated', payload)
```

---

#### `task:delete`
User deleted a task.

```typescript
// Payload
{
  id: string
  projectId: string
  userId: string
}

// Server side effect:
// - socket.to(`board:${projectId}`).emit('task:deleted', { id })
```

---

#### `cursor:move`
Mouse cursor moved on the board canvas. **Throttled to 30 fps on client.**

```typescript
// Payload
{
  x: number       // Percentage of viewport width (0–100)
  y: number       // Percentage of viewport height (0–100)
  projectId: string
  userId: string
}

// Server side effect:
// - Resets idle timer for this user
// - socket.to(`board:${projectId}`).emit('cursor:update', { userId, x, y })
```

---

#### `presence:update`
Periodic heartbeat to update online status (sent every 5s).

```typescript
// Payload
{
  projectId: string
  userId: string
  status: 'active' | 'idle'
}
```

---

### Server → Client Events

#### `board:sync`
Sent to a newly joined client with current room state.

```typescript
// Payload
{
  presenceUsers: Array<{
    userId: string
    userName: string
    role: ProjectRole
    color: string      // Assigned cursor color (deterministic by userId hash)
  }>
}
```

---

#### `task:moved`
Broadcast to all room members except the mover.

```typescript
// Payload (same as task:move)
{
  id: string
  columnId: ColumnId
  position: number
  userId: string
}

// Client handler:
// applyRemoteMove(id, columnId, position)  → Zustand functional updater
```

---

#### `task:updated`
Broadcast to all room members except the updater.

```typescript
// Payload
{
  id: string
  diff: Partial<Task>
  userId: string
}

// Client handler:
// applyRemotePatch(id, diff)  → Zustand functional updater
```

---

#### `task:deleted`
Broadcast to all room members except the deleter.

```typescript
// Payload
{
  id: string
}

// Client handler:
// removeTask(id)  → Zustand
```

---

#### `cursor:update`
Broadcast cursor position from one user to all others.

```typescript
// Payload
{
  userId: string
  userName: string
  x: number        // 0–100
  y: number        // 0–100
  color: string    // CSS color assigned to this user
}

// Client: updates cursors[] in Zustand
// CursorOverlay renders based on cursors state
```

---

#### `presence:join`
Sent to all room members when a new user joins.

```typescript
// Payload
{
  userId: string
  userName: string
  role: ProjectRole
  color: string
}
```

---

#### `presence:leave`
Sent to remaining room members when a user disconnects or leaves.

```typescript
// Payload
{
  userId: string
}

// Client: removes from presence[] and cursors[]
```

---

## Part 2: Firestore Helper API

### Base Collection: `src/lib/firestore.ts`

---

### User Operations

#### `saveUserProfile(uid, email, displayName?)`
```typescript
// Writes with merge to avoid overwriting existing data
setDoc(doc(db, 'users', uid), {
  uid, email,
  displayName: displayName ?? email.split('@')[0],
  updatedAt: serverTimestamp(),
}, { merge: true })
```

#### `getUserByEmail(email): Promise<UserProfile | null>`
```typescript
// Returns first match; null if not registered
const q = query(collection(db, 'users'), where('email', '==', email))
const snap = await getDocs(q)
return snap.empty ? null : { id: snap.docs[0].id, ...snap.docs[0].data() }
```

---

### Project Operations

#### `getOwnedProjects(uid): Promise<Project[]>`
```typescript
const q = query(
  collection(db, 'projects'),
  where('createdBy', '==', uid),
  orderBy('createdAt', 'desc')
)
// Requires composite index: createdBy ASC + createdAt DESC
```

#### `getSharedProjects(uid): Promise<Project[]>`
```typescript
const q = query(
  collection(db, 'projects'),
  where('memberIds', 'array-contains', uid),
  where('createdBy', '!=', uid),
  orderBy('createdBy'),
  orderBy('createdAt', 'desc')
)
// Requires composite index: memberIds + createdBy + createdAt
```

#### `createProject(data): Promise<string>` (returns projectId)
```typescript
const projectRef = await addDoc(collection(db, 'projects'), {
  name: data.name,
  workspaceId: data.workspaceId,
  createdBy: data.uid,
  createdAt: serverTimestamp(),
  members: {
    [data.uid]: { role: 'admin', joinedAt: Date.now(), email: data.email }
  },
  memberIds: [data.uid],
})
return projectRef.id
```

#### `shareProject(projectId, targetUid, role, email)`
```typescript
updateDoc(projectRef, {
  [`members.${targetUid}`]: { role, joinedAt: Date.now(), email },
  memberIds: arrayUnion(targetUid),
})
```

#### `updateMemberRole(projectId, uid, role)`
```typescript
updateDoc(projectRef, { [`members.${uid}.role`]: role })
```

#### `removeMember(projectId, uid)`
```typescript
updateDoc(projectRef, {
  [`members.${uid}`]: deleteField(),
  memberIds: arrayRemove(uid),
})
```

---

### Task Operations

#### `getTasks(projectId): Promise<Task[]>`
```typescript
const q = query(
  collection(db, 'tasks'),
  where('projectId', '==', projectId),
  orderBy('position', 'asc')
)
// Requires composite index: projectId ASC + position ASC
```

#### `createTask(data): Promise<string>` (returns taskId)
```typescript
addDoc(collection(db, 'tasks'), {
  title: data.title,
  description: '',
  columnId: data.columnId,
  priority: 'none',
  labels: [],
  position: data.position,
  projectId: data.projectId,
  workspaceId: data.workspaceId,
  dueDate: null,
  assigneeId: null,
  createdAt: Date.now(),
  updatedAt: Date.now(),
})
```

#### `updateTask(id, diff): Promise<void>`
```typescript
updateDoc(doc(db, 'tasks', id), {
  ...diff,
  updatedAt: Date.now(),
})
```

#### `moveTask(id, columnId, position): Promise<void>`
```typescript
updateDoc(doc(db, 'tasks', id), {
  columnId,
  position,
  updatedAt: Date.now(),
})
```

#### `deleteTask(id): Promise<void>`
```typescript
deleteDoc(doc(db, 'tasks', id))
```

---

## Part 3: Firestore Security Rules API

Security rules act as a server-side authorization layer. They define who can read/write each collection.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users — anyone authenticated can read; only self can write
    match /users/{uid} {
      allow read:  if request.auth != null;
      allow write: if request.auth.uid == uid;
    }

    // Projects — only project members can read; admin/writer can write
    match /projects/{projectId} {
      allow read:   if request.auth.uid in resource.data.memberIds
                    || resource.data.createdBy == request.auth.uid;
      allow create: if request.auth != null;
      allow update: if request.auth.uid in resource.data.memberIds
                    && resource.data.members[request.auth.uid].role in ['admin', 'writer'];
      allow delete: if resource.data.createdBy == request.auth.uid
                    || resource.data.members[request.auth.uid].role == 'admin';
    }

    // Tasks — same membership rules as parent project
    match /tasks/{taskId} {
      allow read:   if request.auth != null;  // simplified; ideally check project membership
      allow write:  if request.auth != null;
    }
  }
}
```

---

## Error Handling

| Scenario | Handling |
|---------|---------|
| Firebase auth error | Error message displayed in alert below form |
| Firestore permission denied | Toast: "You don't have permission to perform this action" |
| User not found (share modal) | Inline error: "No user found with this email" |
| Socket.io disconnection | Auto-reconnect with exponential backoff; "Offline" badge shown |
| Analytics MFE load failure | Error boundary catches; "Failed to load analytics" with retry button |
| Network timeout | React Query retries 3× with exponential backoff |
