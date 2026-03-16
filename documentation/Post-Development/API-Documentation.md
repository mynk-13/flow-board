# API Documentation
## FlowBoard — Real-Time Collaborative Project Manager

**Version:** 1.0  
**Date:** March 2026  

This document is the runtime reference for all APIs consumed and exposed by FlowBoard.

---

## 1. Firebase Auth API

All auth operations use the Firebase Web SDK v9+ (modular imports).

### Sign Up
```typescript
import { createUserWithEmailAndPassword } from 'firebase/auth'

const { user } = await createUserWithEmailAndPassword(auth, email, password)
// Returns: UserCredential
// Throws: FirebaseError
//   auth/email-already-in-use
//   auth/weak-password
//   auth/invalid-email
```

### Sign In
```typescript
import { signInWithEmailAndPassword } from 'firebase/auth'

const { user } = await signInWithEmailAndPassword(auth, email, password)
// Returns: UserCredential
// Throws: FirebaseError
//   auth/user-not-found
//   auth/wrong-password
//   auth/invalid-credential
```

### Sign Out
```typescript
import { signOut } from 'firebase/auth'
await signOut(auth)
```

### Auth State Observer
```typescript
import { onAuthStateChanged } from 'firebase/auth'

const unsubscribe = onAuthStateChanged(auth, (user) => {
  // user: FirebaseUser | null
  // Called once on mount, then on every auth state change
})
// Cleanup: unsubscribe() in useEffect return
```

### Current User
```typescript
auth.currentUser  // FirebaseUser | null — synchronous, from SDK cache
```

---

## 2. Firestore API

### SDK Setup (`src/lib/firebase.ts`)
```typescript
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

const app = initializeApp({
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
})

export const db   = getFirestore(app)
export const auth = getAuth(app)
```

---

### User APIs

#### `saveUserProfile`
```typescript
/**
 * Creates or updates a user profile in Firestore on every login.
 * Uses merge to avoid overwriting existing data.
 */
async function saveUserProfile(
  uid: string,
  email: string | null,
  displayName?: string | null
): Promise<void>

// Example
await saveUserProfile('abc123', 'arjun@example.com', 'Arjun')
```

#### `getUserByEmail`
```typescript
/**
 * Looks up a user by email address (used in Share Modal).
 * Returns null if no user with this email has registered.
 */
async function getUserByEmail(email: string): Promise<UserProfile | null>

// Example
const user = await getUserByEmail('priya@example.com')
if (!user) throw new Error('User not found')
```

---

### Project APIs

#### `getOwnedProjects`
```typescript
/**
 * Returns all projects created by this user, newest first.
 * Requires composite index: createdBy ASC + createdAt DESC
 */
async function getOwnedProjects(uid: string): Promise<Project[]>
```

#### `getSharedProjects`
```typescript
/**
 * Returns all projects the user is a member of but did not create.
 * Requires composite index: memberIds + createdBy + createdAt
 */
async function getSharedProjects(uid: string): Promise<Project[]>
```

#### `createProject`
```typescript
/**
 * Creates a new project. Creator is automatically set as admin.
 * Returns the new project's Firestore ID.
 */
async function createProject(data: {
  name: string
  workspaceId: string  // = creator's uid
  uid: string          // creator uid
  email: string        // creator email
}): Promise<string>

// Example
const projectId = await createProject({
  name: 'Sprint Alpha',
  workspaceId: user.uid,
  uid: user.uid,
  email: user.email,
})
navigate(`/board/${projectId}`)
```

#### `shareProject`
```typescript
/**
 * Grants a user access to a project with the specified role.
 * Adds to both members{} map and memberIds[] array.
 */
async function shareProject(
  projectId: string,
  targetUid: string,
  role: ProjectRole,
  email: string
): Promise<void>
```

#### `updateMemberRole`
```typescript
async function updateMemberRole(
  projectId: string,
  uid: string,
  role: ProjectRole
): Promise<void>
```

#### `removeMember`
```typescript
/**
 * Removes a member from a project.
 * Deletes from members{} map and removes from memberIds[] array.
 */
async function removeMember(projectId: string, uid: string): Promise<void>
```

---

### Task APIs

#### `getTasks`
```typescript
/**
 * Returns all tasks for a project, sorted by position ascending.
 * Requires composite index: projectId ASC + position ASC
 */
async function getTasks(projectId: string): Promise<Task[]>
```

#### `createTask`
```typescript
/**
 * Creates a new task. Returns the new task's Firestore ID.
 */
async function createTask(data: {
  title: string
  columnId: ColumnId
  projectId: string
  workspaceId: string
  position: number
}): Promise<string>
```

#### `updateTask`
```typescript
/**
 * Partially updates a task. Always sets updatedAt to Date.now().
 */
async function updateTask(id: string, diff: Partial<Task>): Promise<void>

// Example — update title and priority
await updateTask(taskId, { title: 'New title', priority: 'high' })
```

#### `moveTask`
```typescript
/**
 * Updates a task's column and position after a drag-and-drop.
 */
async function moveTask(
  id: string,
  columnId: ColumnId,
  position: number
): Promise<void>
```

#### `deleteTask`
```typescript
async function deleteTask(id: string): Promise<void>
```

---

## 3. Socket.io Client API

### Connect / Disconnect
```typescript
import { getSocket } from '@/lib/socket'

// Connect (called in BoardPage useEffect)
const socket = getSocket()
socket.connect()

// Disconnect (called in cleanup)
socket.disconnect()
```

### Emitting Events

```typescript
// Join board room
socket.emit('board:join', {
  projectId: 'proj_abc',
  userId: 'user_xyz',
  userName: 'Arjun',
  role: 'admin',
})

// Broadcast task move
socket.emit('task:move', {
  id: 'task_123',
  columnId: 'done',
  position: 3000,
  projectId: 'proj_abc',
  userId: 'user_xyz',
})

// Broadcast task update
socket.emit('task:update', {
  id: 'task_123',
  diff: { title: 'Updated title', priority: 'urgent' },
  projectId: 'proj_abc',
  userId: 'user_xyz',
})

// Broadcast task deletion
socket.emit('task:delete', {
  id: 'task_123',
  projectId: 'proj_abc',
  userId: 'user_xyz',
})

// Cursor position (throttled 30fps)
socket.emit('cursor:move', {
  x: 45.2,   // % of viewport width
  y: 62.8,   // % of viewport height
  projectId: 'proj_abc',
  userId: 'user_xyz',
})
```

### Listening to Events

```typescript
// Incoming task events (from other users)
socket.on('task:moved',   (payload) => applyRemoteMove(payload.id, payload.columnId, payload.position))
socket.on('task:updated', (payload) => applyRemotePatch(payload.id, payload.diff))
socket.on('task:deleted', (payload) => removeTask(payload.id))

// Presence events
socket.on('board:sync',    (data) => setPresence(data.presenceUsers))
socket.on('presence:join', (user) => setPresence([...presence, user]))
socket.on('presence:leave',(data) => setPresence(presence.filter(u => u.userId !== data.userId)))

// Cursor events
socket.on('cursor:update', (data) => {
  setCursors(prev =>
    [...prev.filter(c => c.userId !== data.userId), data]
  )
})

// Cleanup — ALWAYS remove listeners on component unmount
return () => {
  socket.off('task:moved')
  socket.off('task:updated')
  socket.off('task:deleted')
  socket.off('board:sync')
  socket.off('presence:join')
  socket.off('presence:leave')
  socket.off('cursor:update')
  socket.disconnect()
}
```

---

## 4. Analytics MFE API (Module Federation)

### Loading the Remote
```typescript
// AnalyticsPage.tsx — runtime script injection
function loadAnalyticsRemote(): Promise<AnalyticsDashboardComponent> {
  return new Promise((resolve, reject) => {
    if (window.analytics_remote) {
      return initAndGet()
    }
    const script = document.createElement('script')
    script.src = `${import.meta.env.VITE_ANALYTICS_REMOTE_URL}/remoteEntry.js`
    script.onload  = () => initAndGet().then(resolve).catch(reject)
    script.onerror = reject
    document.head.appendChild(script)
  })
}
```

### Props Interface
```typescript
interface AnalyticsDashboardProps {
  tasks:    Task[]       // All tasks across ALL user's projects
  projects: Project[]    // All projects (owned + shared)
  userId:   string       // Current Firebase uid
  isDark?:  boolean      // Dark mode flag from host UIStore
}

// Usage
<RemoteDashboard
  tasks={allTasks}
  projects={allProjects}
  userId={user.uid}
  isDark={isDark}
/>
```

---

## 5. Environment Variables Reference

| Variable | Required | Description |
|---------|---------|-------------|
| `VITE_FIREBASE_API_KEY` | ✅ | Firebase project API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | ✅ | Firebase Auth domain |
| `VITE_FIREBASE_PROJECT_ID` | ✅ | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | ✅ | Firebase Storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | ✅ | FCM sender ID |
| `VITE_FIREBASE_APP_ID` | ✅ | Firebase app ID |
| `VITE_SOCKET_URL` | ✅ | Socket.io server base URL |
| `VITE_ANALYTICS_REMOTE_URL` | ✅ | Analytics MFE base URL |

All variables prefixed `VITE_` are embedded into the JS bundle at build time by Vite. They must be set in Vercel Dashboard for production builds.
