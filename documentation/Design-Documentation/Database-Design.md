# Database Design Document
## FlowBoard — Real-Time Collaborative Project Manager

**Version:** 1.0  
**Date:** March 2026  
**Database:** Google Cloud Firestore (NoSQL Document Database)

---

## 1. Overview

Firestore is a NoSQL document database organized into **collections** (equivalent to SQL tables) containing **documents** (equivalent to rows). Documents have flexible schemas and can contain nested maps and arrays.

### Design Principles
- **Denormalize for read performance** — role data embedded in project document to avoid extra reads
- **`memberIds` array** — maintained alongside `members` map to enable Firestore `array-contains` queries (Firestore cannot query map keys natively)
- **Unix timestamps** — stored as `number` (ms since epoch) for easy JS operations; `serverTimestamp()` used on write for consistency
- **Float positions** — tasks sorted by `position: float` using midpoint insertion (avoids expensive re-ordering of all records)

---

## 2. Collections

### 2.1 Collection: `users`

**Purpose:** Stores registered user profiles. Created/updated on every login.

**Document ID:** Firebase Auth UID (`uid`)

```
users/
  {uid}/
    uid:          string    // Firebase Auth UID
    email:        string    // User email address
    displayName:  string    // First name or email prefix
    createdAt:    Timestamp // Firebase serverTimestamp()
    updatedAt:    Timestamp // Firebase serverTimestamp()
```

**Example Document:**
```json
{
  "uid": "abc123xyz",
  "email": "arjun@example.com",
  "displayName": "Arjun",
  "createdAt": "2026-01-15T10:00:00Z",
  "updatedAt": "2026-03-14T18:30:00Z"
}
```

**Queries:**
- `getDoc(doc(db, 'users', uid))` — fetch own profile
- `where('email', '==', email)` — user lookup by email for project sharing

---

### 2.2 Collection: `projects`

**Purpose:** Stores project metadata and membership information.

**Document ID:** Auto-generated Firestore ID

```
projects/
  {projectId}/
    name:         string              // Project display name
    workspaceId:  string              // Always = createdBy uid in v1 (one workspace per user)
    createdBy:    string              // Owner Firebase uid
    createdAt:    number              // Unix ms timestamp
    memberIds:    string[]            // [uid1, uid2, ...] — for array-contains queries
    members:      {                   // Role map — uid as key
      {uid}: {
        role:     'admin' | 'writer' | 'reader'
        email:    string
        joinedAt: number             // Unix ms timestamp
      }
    }
```

**Example Document:**
```json
{
  "name": "Sprint Alpha",
  "workspaceId": "abc123xyz",
  "createdBy": "abc123xyz",
  "createdAt": 1710000000000,
  "memberIds": ["abc123xyz", "def456uvw"],
  "members": {
    "abc123xyz": {
      "role": "admin",
      "email": "arjun@example.com",
      "joinedAt": 1710000000000
    },
    "def456uvw": {
      "role": "writer",
      "email": "priya@example.com",
      "joinedAt": 1710500000000
    }
  }
}
```

**Queries:**
| Query | Filter | Order | Index Required |
|-------|--------|-------|----------------|
| Owned projects | `createdBy == uid` | `createdAt DESC` | Composite: createdBy + createdAt |
| Shared projects | `memberIds array-contains uid` AND `createdBy != uid` | `createdBy`, `createdAt DESC` | Composite: memberIds + createdBy + createdAt |

---

### 2.3 Collection: `tasks`

**Purpose:** Stores individual task items on Kanban boards.

**Document ID:** Auto-generated Firestore ID

```
tasks/
  {taskId}/
    title:        string              // Task display name (required)
    description:  string              // Rich text description (default: '')
    columnId:     string              // 'backlog'|'todo'|'inprogress'|'inreview'|'done'
    priority:     string              // 'urgent'|'high'|'medium'|'low'|'none'
    labels:       string[]            // ['bug', 'feature', ...] — preset or custom values
    position:     number              // Float for ordering; e.g. 1000, 1500, 1250
    projectId:    string              // Parent project Firestore ID
    workspaceId:  string              // Owner workspace uid
    dueDate:      number | null       // Unix ms timestamp; null if unset
    assigneeId:   string | null       // Firebase uid; null if unassigned
    createdAt:    number              // Unix ms timestamp
    updatedAt:    number              // Unix ms timestamp (updated on every edit)
```

**Example Document:**
```json
{
  "title": "Implement drag-and-drop for Kanban",
  "description": "Use dnd-kit for accessible drag and drop between columns",
  "columnId": "inprogress",
  "priority": "high",
  "labels": ["feature", "infra"],
  "position": 2000.5,
  "projectId": "proj_xyz789",
  "workspaceId": "abc123xyz",
  "dueDate": 1711000000000,
  "assigneeId": "abc123xyz",
  "createdAt": 1710100000000,
  "updatedAt": 1710800000000
}
```

**Queries:**
| Query | Filter | Order | Index Required |
|-------|--------|-------|----------------|
| Board tasks | `projectId == id` | `position ASC` | Composite: projectId + position |

---

## 3. Entity Relationship Diagram

```
┌───────────────┐       1        ┌────────────────────────┐
│    users      │ ──────────────► │       projects          │
│               │  (createdBy)    │                        │
│  uid (PK)     │                 │  id (PK)               │
│  email        │ ◄────────────── │  createdBy (FK→users)  │
│  displayName  │  N (memberIds)  │  members{}             │
│  createdAt    │                 │  memberIds[]           │
│  updatedAt    │                 │  workspaceId           │
└───────────────┘                 │  createdAt             │
                                  └────────────┬───────────┘
                                               │ 1
                                               │
                                               ▼ N
                                  ┌────────────────────────┐
                                  │        tasks            │
                                  │                        │
                                  │  id (PK)               │
                                  │  projectId (FK→projects)│
                                  │  title                 │
                                  │  columnId              │
                                  │  priority              │
                                  │  labels[]              │
                                  │  position              │
                                  │  dueDate               │
                                  │  assigneeId (FK→users) │
                                  │  createdAt             │
                                  │  updatedAt             │
                                  └────────────────────────┘
```

---

## 4. Composite Indexes

Firestore requires composite indexes for queries combining `where` + `orderBy` on different fields.

| Collection | Fields | Order | Purpose |
|------------|--------|-------|---------|
| `projects` | `createdBy`, `createdAt` | ASC, DESC | `getOwnedProjects` |
| `projects` | `memberIds`, `createdBy`, `createdAt` | ASC, ASC, DESC | `getSharedProjects` |
| `tasks` | `projectId`, `position` | ASC, ASC | `getTasks` |

**`firestore.indexes.json`** (deployed to Firebase):
```json
{
  "indexes": [
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "createdBy", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "projects",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "memberIds", "arrayConfig": "CONTAINS" },
        { "fieldPath": "createdBy", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "tasks",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "projectId", "order": "ASCENDING" },
        { "fieldPath": "position", "order": "ASCENDING" }
      ]
    }
  ]
}
```

---

## 5. Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper function — is the requesting user a member?
    function isMember(projectData) {
      return request.auth.uid in projectData.memberIds
          || projectData.createdBy == request.auth.uid;
    }

    // Helper function — get the user's role in this project
    function getRole(projectData) {
      return projectData.members[request.auth.uid].role;
    }

    // ── Users ─────────────────────────────────────────
    match /users/{uid} {
      allow read:  if request.auth != null;
      allow write: if request.auth.uid == uid;
    }

    // ── Projects ──────────────────────────────────────
    match /projects/{projectId} {
      allow read:   if request.auth != null && isMember(resource.data);
      allow create: if request.auth != null
                    && request.resource.data.createdBy == request.auth.uid;
      allow update: if request.auth != null
                    && isMember(resource.data)
                    && getRole(resource.data) in ['admin', 'writer'];
      allow delete: if request.auth != null
                    && (resource.data.createdBy == request.auth.uid
                        || getRole(resource.data) == 'admin');
    }

    // ── Tasks ─────────────────────────────────────────
    match /tasks/{taskId} {
      allow read:   if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
      // Note: production should verify project membership here too
    }
  }
}
```

---

## 6. Data Lifecycle

| Event | Collections Affected | Operation |
|-------|---------------------|-----------|
| User signs up | `users` | setDoc with merge |
| User signs in | `users` | setDoc with merge (updates updatedAt) |
| Create project | `projects` | addDoc; owner added to members |
| Share project | `projects` | updateDoc: add to members{} + memberIds[] |
| Remove member | `projects` | updateDoc: deleteField from members{} + arrayRemove from memberIds[] |
| Create task | `tasks` | addDoc |
| Move task (drag) | `tasks` | updateDoc: columnId + position + updatedAt |
| Edit task | `tasks` | updateDoc: changed fields + updatedAt |
| Delete task | `tasks` | deleteDoc |
| Delete project | `projects` + `tasks` | deleteDoc project + batch delete all tasks |

---

## 7. Position Algorithm (Task Ordering)

Tasks within a column are ordered by a floating-point `position` field:

```
Initial tasks:  position 1000, 2000, 3000, 4000
Insert between 1000 and 2000:  (1000 + 2000) / 2 = 1500
Insert at start:  0 + 1000 / 2 = 500  (or just existing_min - 1000)
Insert at end:   last_position + 1000

After many insertions, positions converge toward float precision limit.
Rebalancing: periodically reset positions to [1000, 2000, 3000, ...] in a batch write.
```

This avoids updating all subsequent tasks' positions on every drag (unlike integer ordering).
