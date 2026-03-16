# Functional Requirements Document (FRD)
## FlowBoard — Real-Time Collaborative Project Manager

**Version:** 1.0  
**Date:** March 2026  
**Status:** Final  

---

## 1. Introduction

### 1.1 Purpose
This document specifies the detailed functional requirements for FlowBoard. It defines exactly what each module of the system must do — inputs, processing, outputs, and expected behavior for every user-facing feature.

### 1.2 Scope
Covers all functional requirements for:
- Authentication & session management
- Workspace and project management
- Kanban board and task operations
- Real-time collaboration (Socket.io)
- Role-based access control
- Analytics micro-frontend
- UI features (dark mode, command palette, filters)

### 1.3 Definitions
| Term | Definition |
|------|------------|
| **Workspace** | Auto-created container for a user's projects (one per user) |
| **Project** | A named collection of tasks organized on a Kanban board |
| **Task** | A unit of work with title, description, priority, labels, due date, and column |
| **Column** | One of 5 Kanban states: Backlog, To Do, In Progress, In Review, Done |
| **Member** | A user who has been granted access to a project |
| **Role** | Permission level: Admin, Writer, or Reader |
| **MFE** | Micro-Frontend — the Analytics dashboard loaded via Module Federation |

---

## 2. Module 1: Authentication

### FR-AUTH-01: User Registration
- **Input:** Email address, password (min 8 chars)
- **Processing:**
  - Validate email format (must contain `@` and valid domain)
  - Enforce password rules: min 1 uppercase, 1 lowercase, 1 digit, 1 special character
  - Display green tick per satisfied rule, dynamically as user types
  - Disable "Create Account" button until all password rules are met and email is valid
  - Call Firebase `createUserWithEmailAndPassword`
  - On success, call `saveUserProfile` to store `{ uid, email, displayName }` in Firestore `users` collection
- **Output:** Authenticated session; redirect to `/` (dashboard)
- **Error:** Display Firebase error message (e.g., "Email already in use")

### FR-AUTH-02: User Sign-In
- **Input:** Email address, password
- **Processing:**
  - Validate email format before enabling submit button
  - Call Firebase `signInWithEmailAndPassword`
  - On success, resolve auth state via `onAuthStateChanged`
- **Output:** Authenticated session; redirect to `/` (dashboard)
- **Error:** Display "Invalid credentials" error alert below the form

### FR-AUTH-03: Password Visibility Toggle
- **Input:** Click on eye icon inside password field
- **Processing:** Toggle input `type` between `password` and `text`
- **Output:** Password characters visible (open-eye icon shown) or hidden (crossed-eye icon shown)

### FR-AUTH-04: Email Validation Feedback
- **Input:** User types in the email field
- **Processing:** After first interaction (`onBlur`), check `isValidEmail()` regex in real time
- **Output:** Red validation message shown below the field if invalid; disappears when valid

### FR-AUTH-05: Session Persistence
- **Processing:** Firebase SDK automatically persists session in `localStorage`
- **Output:** User remains signed in across page refreshes and browser restarts until explicit sign-out

### FR-AUTH-06: Route Protection
- **Processing:** `ProtectedRoute` component checks auth state; `AuthGate` shows `LoadingScreen` while Firebase resolves auth state (prevents flash of login page)
- **Output:** Unauthenticated users redirected to `/login`; authenticated users redirected away from `/login` and `/signup`

### FR-AUTH-07: Sign Out
- **Input:** Click "Sign out" in the avatar dropdown menu
- **Processing:** Call Firebase `signOut`; disconnect Socket.io; clear Zustand state
- **Output:** Session cleared; redirect to `/login`

---

## 3. Module 2: Workspace & Dashboard

### FR-DASH-01: Dashboard Loading
- **Processing:** On mount, fetch owned projects (`getOwnedProjects`) and shared projects (`getSharedProjects`) in parallel via `Promise.all`
- **Output:** Dashboard shows "Created by Me" section and "Shared with Me" section; skeleton cards shown during loading

### FR-DASH-02: Project Card Display
- Each card shows: project name, member count, your role badge, creation date
- Cards use a 3D tilt hover effect

### FR-DASH-03: Empty State
- If no projects exist, show empty state with a "Create your first project" call-to-action button

### FR-DASH-04: Workspace Background
- Light mode: violet-tinted background with dot-grid pattern
- Dark mode: dark slate background with dark violet dots

---

## 4. Module 3: Project Management

### FR-PROJ-01: Create Project
- **Input:** Click "+" beside "Created by Me" in sidebar; enter project name in modal
- **Processing:**
  - Call `createProject({ name, workspaceId, createdBy: uid })`
  - Firestore writes: new `projects` document; `members` map initialized with creator as `admin`
- **Output:** Modal closes; sidebar updates; browser navigates to `/board/<projectId>`

### FR-PROJ-02: Navigate to Project
- **Input:** Click project name in sidebar or dashboard card
- **Output:** Board view loaded for selected project

### FR-PROJ-03: Share Project (Admin only)
- **Input:** Click "Share" button on board page (visible to admins only)
- **Processing (Add member):**
  - Admin enters email address; selects role (Admin / Writer / Reader) from dropdown
  - `getUserByEmail` looks up uid from Firestore `users` collection
  - `shareProject` writes member entry to `project.members`
  - `project.memberIds` array updated for Firestore query filtering
- **Output:** New member appears in "Project Members" list with their role
- **Error:** "User not found" if email not registered

### FR-PROJ-04: Change Member Role (Admin only)
- **Input:** Select new role from dropdown beside existing member in Share Modal
- **Processing:** Call `updateMemberRole`; updates Firestore `project.members[uid].role`
- **Output:** Role tag updates immediately

### FR-PROJ-05: Remove Member (Admin only)
- **Input:** Click remove button beside member
- **Processing:** Call `removeMember`; removes uid from `project.members` and `project.memberIds`
- **Output:** Member removed from list; their access revoked on next request

### FR-PROJ-06: Delete Project (Admin only)
- Admin can delete a project from the board page (button visible only to Admin role)
- Deletes Firestore project document and all associated tasks

---

## 5. Module 4: Kanban Board

### FR-BOARD-01: Board Loading
- **Processing:** Fetch project document; fetch tasks filtered by `projectId`; subscribe to Firestore tasks collection for live updates; connect Socket.io room
- **Output:** 5 columns rendered with tasks sorted by `position` field; loading skeleton shown during fetch

### FR-BOARD-02: Column Display
- Five fixed columns in order: `backlog`, `todo`, `inprogress`, `inreview`, `done`
- Each column shows: column title, task count badge, list of task cards, "Add task" button (hidden for Reader)

### FR-BOARD-03: Inline Task Creation (Writer/Admin)
- **Input:** Click "Add task" in any column → input appears → type title → press Enter
- **Processing:** Call `createTask({ title, columnId, projectId, position: getNextPosition() })`
- **Output:** New task card appears at the bottom of the column; input cleared; ready for next entry

### FR-BOARD-04: Drag and Drop (Writer/Admin)
- **Input:** Click and hold anywhere on a task card (except label chips); drag to a new column or position
- **Processing:**
  - `onDragEnd` handler calls `moveTask` to update Firestore
  - Emits `task:move` via Socket.io to broadcast to other users
  - Position field recalculated using average of adjacent tasks (LexoRank-like)
- **Output:** Card animates to new position; other connected clients update in real time

### FR-BOARD-05: Task Card Display
- Each card shows:
  - Left color strip matching priority color (~5% card width); grip icon appears on hover
  - Task title
  - Due date (dd-MMM-yy format) if set
  - Priority badge with icon (top-right, beside title)
  - Label chips with color-coded pills

### FR-BOARD-06: Filter Bar
- **Priority filter:** Dropdown — Urgent / High / Medium / Low / None
- **Label filter:** Dropdown — any of the 12 preset labels
- **Search filter:** Text input — filters by task title (case-insensitive contains)
- Filters are combined (AND logic); clearing a filter shows all tasks

### FR-BOARD-07: Virtual Scroll
- Columns with > 15 tasks activate TanStack Virtual for windowed rendering
- Columns with ≤ 15 tasks render all cards directly (avoids dnd-kit + virtual scroll conflicts)

### FR-BOARD-08: Role Badge Display
- The project role (Admin / Writer / Reader) is shown as a colored tag in the board top bar beside the project name

---

## 6. Module 5: Task Management

### FR-TASK-01: Task Detail Modal
- **Input:** Click anywhere on a task card (not on labels)
- **Output:** Modal opens showing full task details

### FR-TASK-02: Edit Task Title & Description
- **Input:** Click on title or description field; type new content
- **Processing:** Changes saved on blur via `updateTask` (Firestore); `task:update` event emitted via Socket.io
- **Restriction:** Input fields are read-only for Reader role

### FR-TASK-03: Change Task Priority
- **Input:** Select priority from custom `SelectDropdown` in task detail
- **Options:** None / Low / Medium / High / Urgent
- Each option has an icon; color strip on card updates to match

### FR-TASK-04: Set Due Date
- **Input:** Date picker in task detail modal
- **Output:** Due date stored; displayed in `dd-MMM-yy` format on task card

### FR-TASK-05: Manage Labels
- **Input:** `LabelPicker` component in task detail modal
- **Processing:** 12 preset labels (Bug, Feature, Infra, Design, Docs, Security, Performance, Testing, Chore, Hotfix, Research, Refactor) + custom labels
- **Output:** Selected labels shown as colored pills on the task card

### FR-TASK-06: Delete Task (Writer/Admin)
- **Input:** Click delete button in task detail footer
- **Processing:** `deleteTask` called; `task:delete` emitted via Socket.io
- **Output:** Task removed from board; modal closes; other clients remove card in real time

### FR-TASK-07: Assignee
- Task detail shows assignee field (stored in Firestore); UI for assignment exists but auto-populates based on creator in v1

---

## 7. Module 6: Real-Time Collaboration

### FR-RT-01: Board Room Join
- **Trigger:** User navigates to a board page
- **Processing:** Socket.io client emits `board:join` with `{ projectId, userId, userName, role }`
- **Server:** Adds user to room `board:<projectId>`; broadcasts `presence:join` to others in room; sends back `board:sync` with current state

### FR-RT-02: Presence Bar
- Shows avatar bubbles for all users currently in the same board room
- "Live" green badge appears when at least one other user is in the room; "Offline" badge otherwise

### FR-RT-03: Live Cursors
- **Trigger:** Mouse moves on board canvas
- **Processing:** `cursor:move` event emitted max 30 fps (throttled); carries `{ x, y }` as percentage of viewport
- **Display:** Other users' cursors rendered as named colored pointers via `CursorOverlay` component
- **Visibility:** Cursors only shown to Admin and Writer roles; Reader sees no cursors
- **Idle timeout:** Cursor removed from overlay after 10 seconds of inactivity

### FR-RT-04: Real-Time Task Sync
- When a task is moved (drag): `task:move` emitted → other clients call `applyRemoteMove`
- When a task is updated (detail edit): `task:update` emitted → other clients call `applyRemotePatch`
- When a task is deleted: `task:delete` emitted → other clients call `removeTask`
- Zustand functional updaters (`set((s) => ...)`) prevent stale closure bugs

### FR-RT-05: Disconnect Handling
- **Trigger:** User navigates away from board or closes tab
- **Processing:** Socket.io `disconnect` event → server broadcasts `presence:leave`; cursor removed from overlay

---

## 8. Module 7: Analytics Dashboard (MFE)

### FR-ANALYTICS-01: Loading the MFE
- Loaded at runtime via script tag injection from `VITE_ANALYTICS_REMOTE_URL/remoteEntry.js`
- Host passes its own React/ReactDOM instances to prevent "two copies of React"
- Suspense skeleton shown during load; error boundary catches MFE failures gracefully

### FR-ANALYTICS-02: Data Fetching
- `AnalyticsPage` fetches tasks for ALL projects (owned + shared) independently using `Promise.all`
- Does not rely on the active board's Zustand state (prevents stale data)

### FR-ANALYTICS-03: Charts
| Chart | Type | Data |
|-------|------|------|
| Task Status Breakdown | Pie chart | Count per column |
| Priority Distribution | Bar chart | Count per priority |
| Completion Trend | Line chart | Tasks moved to Done over time |
| Label Distribution | Bar chart | Count per label |
| Team Workload | Bar chart | Tasks per assignee |
| Overview Cards | Stat cards | Total tasks, completed, in-progress, overdue |

### FR-ANALYTICS-04: Dark Mode
- `isDark` prop passed from host → MFE selects `lightTheme` / `darkTheme` token objects
- All chart colors, card backgrounds, tooltip text adapt to the selected theme

---

## 9. Module 8: UI Features

### FR-UI-01: Dark Mode
- Toggle via sun/moon button in the header
- Persisted to `localStorage`; system preference detected on first visit
- `html.dark` class toggled; all Tailwind `dark:` variants apply

### FR-UI-02: Command Palette
- **Trigger:** `Ctrl/Cmd + K` or dedicated button
- **Content:** Navigation items (Dashboard, Analytics), all owned + shared projects, actions (New project, Sign out)
- **Interaction:** Type to fuzzy-filter items; `↑/↓` to navigate; `Enter` to execute; `Escape` to close
- **Highlight:** Matching characters highlighted with `<mark>` element

### FR-UI-03: Sidebar
- Collapsible via toggle button at the bottom (shows `<-[` icon when open, `[->` when collapsed)
- Open width: `w-52`; collapsed shows only icons
- Sections: Home (dashboard), Analytics, "Created by Me" projects, "Shared with Me" projects

### FR-UI-04: Avatar Dropdown
- Clicking avatar (top-right) opens dropdown showing: user email, "Account email" link, "Settings" link, "Sign out" button
- Closes on outside click

### FR-UI-05: Loading Screen
- Full-page dark screen with animated spinning ring and FlowBoard logo
- Shown while Firebase resolves initial auth state

### FR-UI-06: Skeleton Loaders
- Dashboard: skeleton project cards during data fetch
- Board: skeleton columns with animated shimmer during board load
- Analytics: skeleton chart cards during MFE data fetch
- All skeletons have correct dark mode colors (no white bleed-through)
