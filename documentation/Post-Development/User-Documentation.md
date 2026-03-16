# User Documentation
## FlowBoard — Real-Time Collaborative Project Manager

**Version:** 1.0  
**Date:** March 2026  
**Audience:** End users (all roles — Admin, Writer, Reader)

---

## 1. Getting Started

### 1.1 Creating Your Account

1. Navigate to the FlowBoard app URL (e.g., `https://flow-board.vercel.app`)
2. Click **"Don't have an account? Create one free"** on the login page
3. Enter your email address
4. Create a strong password — FlowBoard will show you a checklist:
   - ✅ At least 8 characters
   - ✅ One uppercase letter (A–Z)
   - ✅ One lowercase letter (a–z)
   - ✅ One number (0–9)
   - ✅ One special character (!@#$% etc.)
5. The **Create Account** button activates only when all requirements are met
6. Click **Create Account** — you'll be taken directly to your dashboard

> **Tip:** Click the eye icon (👁) in the password field to show or hide your password as you type.

### 1.2 Signing In

1. Enter your registered email address
2. Enter your password
3. Click **Sign in**

If you enter an incorrect password, an error message appears below the form.

### 1.3 Signing Out

Click your **avatar circle** (top-right of the header) → **Sign out**.

---

## 2. Your Dashboard

After signing in, you land on your personal dashboard showing all your projects.

```
┌─────────────────────────────────────────────────────────────┐
│  Sidebar                  │  Dashboard                      │
│  ─────────────────        │  ──────────────────────────── │
│  🏠 Home                  │                                 │
│  📊 Analytics             │  Created by Me                  │
│  ─────────────────        │  ┌──────────┐  ┌──────────┐   │
│  CREATED BY ME            │  │ Sprint α │  │ Website  │   │
│    Sprint Alpha           │  │ Admin    │  │ Admin    │   │
│    Website Redesign       │  └──────────┘  └──────────┘   │
│  ─────────────────        │                                 │
│  SHARED WITH ME           │  Shared with Me                 │
│    Backend API  (writer)  │  ┌──────────┐                  │
│                           │  │ Backend  │                  │
│                           │  │ Writer   │                  │
│                           │  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 Sections
- **Created by Me** — projects you own (you are always Admin)
- **Shared with Me** — projects others have invited you to, with your role shown

### 2.2 Project Cards
Each card shows:
- Project name
- Your role badge (Admin / Writer / Reader)
- Member count

Hover over a card to see it "lift" with a subtle 3D effect. Click to open the Kanban board.

---

## 3. Creating a Project

1. In the sidebar, click the **+** icon next to "Created by Me"
2. Type a project name in the popup
3. Click **Create**

You'll be taken directly to the new project's Kanban board.

---

## 4. The Kanban Board

```
┌──────────┬──────────┬─────────────┬───────────┬──────────┐
│ Backlog  │  To Do   │ In Progress │ In Review │   Done   │
│   (3)    │   (2)    │    (4)      │    (1)    │   (5)    │
├──────────┼──────────┼─────────────┼───────────┼──────────┤
│ ■ Bug fix│ ▲ Feature│ ▲ Refactor  │ ■ Testing │ ■ Setup  │
│ Due: ... │          │             │           │          │
│ 🐛 bug   │ ✨ feature│ 🔧 refactor │ 🧪 testing│          │
├──────────┤          │             │           │          │
│ + Add    │ + Add    │  + Add      │ + Add     │ + Add    │
└──────────┴──────────┴─────────────┴───────────┴──────────┘
```

### 4.1 Understanding Task Cards

Each task card shows:
- **Colored left strip** — priority color (red=Urgent, orange=High, yellow=Medium, green=Low, grey=None)
- **Task title** — main task name
- **Priority badge** — icon + priority label (top-right of card)
- **Due date** — below the title (e.g., "15-Mar-26")
- **Label chips** — colored pills (Bug, Feature, Infra, etc.)

### 4.2 Creating a Task (Writer / Admin)

1. Click **"Add task"** at the bottom of any column
2. Type the task title
3. Press **Enter** to save

The task appears instantly at the bottom of that column.

### 4.3 Moving Tasks (Writer / Admin)

Click and **hold anywhere** on a task card, then **drag** it to another column. Release to drop.

> **Note:** Dragging from label chips doesn't start a drag — click the card body or the priority strip.

### 4.4 Opening Task Details

**Click** (don't drag) on any task card to open the detail panel.

---

## 5. Task Details

The Task Detail modal gives you full control over a task's properties.

### Fields Available
| Field | Description |
|-------|-------------|
| **Title** | Edit the task name directly |
| **Description** | Multi-line text; explain the task in detail |
| **Priority** | None / Low / Medium / High / Urgent |
| **Labels** | Pick from 12 preset tags or add custom ones |
| **Due Date** | Set a deadline (shown as dd-MMM-yy on the card) |
| **Assignee** | Who is responsible for this task |

### Editing (Writer / Admin only)
- Click any field to edit; changes save automatically when you click elsewhere
- All changes sync to other users viewing the same board in real time

### Closing the Modal
Click the **✕** button or press **Escape**.

### Deleting a Task (Writer / Admin)
Click the **Delete** button in the footer. The task is removed from the board instantly.

> **Readers** see all fields but cannot edit or delete.

---

## 6. Filtering Tasks

The filter bar sits above the board columns:

```
[Priority ▼]  [Label ▼]  [ 🔍 Search tasks... ]
```

### Priority Filter
Click the dropdown → select Urgent / High / Medium / Low / None.  
Only tasks with that priority appear. Click **×** to clear.

### Label Filter
Click the dropdown → select a label (Bug, Feature, Infra, etc.).  
Only tasks with that label appear. Click **×** to clear.

### Search
Type in the search box to filter tasks by title (case-insensitive).  
Updates live as you type.

> All filters work together — applying Priority=High AND Label=Bug shows only high-priority bug tasks.

---

## 7. Sharing a Project (Admin only)

1. Open the project board
2. Click the **Share** button in the top-right area of the board bar
3. In the Share Modal:
   - Type the collaborator's **email address**
   - Select their **role** from the dropdown:
     - **Admin** — full access including sharing and deleting the project
     - **Writer** — can create, edit, and move tasks; cannot delete the project
     - **Reader** — view-only; cannot make any changes
   - Click **Add**
4. The person appears in the "Project Members" list

### Changing a Member's Role
In the Share Modal, find the member and select a new role from their dropdown.

### Removing a Member
Click the remove button (×) beside a member's name.

> The project appears in the collaborator's **"Shared with Me"** section on their dashboard.

---

## 8. Real-Time Collaboration

When multiple people have the same board open:

### Live Indicator
The **"Live"** green badge in the board top bar activates when at least one other user is viewing the same board.

### Presence Avatars
Colored avatar circles appear in the top bar — one per connected user. Each shows the user's initial.

### Live Cursors (Admin / Writer only)
You can see other users' mouse cursors as named colored pointers moving around the board canvas. Cursors disappear after **10 seconds of inactivity**.

### Real-Time Task Sync
Any task created, moved, or updated by another user appears on your board **instantly** — no refresh needed.

---

## 9. Analytics Dashboard

Click **📊 Analytics** in the sidebar to open the analytics view.

### Charts Available
| Chart | What it shows |
|-------|---------------|
| **Task Status Breakdown** | Pie chart — how many tasks are in each column |
| **Priority Distribution** | Bar chart — count of Urgent / High / Medium / Low tasks |
| **Completion Trend** | Line chart — tasks moved to Done over time |
| **Label Distribution** | Bar chart — which labels are most used |
| **Team Workload** | Bar chart — tasks assigned per team member |
| **Overview Cards** | Total tasks, completed, in-progress, overdue |

The dashboard shows data from **all your projects** (both owned and shared).

---

## 10. Command Palette

Press **Ctrl + K** (Windows / Linux) or **⌘ + K** (macOS) to open the command palette from anywhere in the app.

### What you can do:
- **Navigate** — jump to Dashboard or Analytics instantly
- **Open a project** — type the project name to find and navigate to it
- **Create a project** — "Create new project" action
- **Sign out** — from the Actions section

### Navigation
- Type to search/filter available commands
- Use **↑ / ↓ arrow keys** to navigate the list
- Press **Enter** to execute the selected command
- Press **Escape** to close

---

## 11. Dark Mode

Click the **sun/moon icon** (🌙 / ☀️) in the top-right header to toggle between light and dark mode. Your preference is saved across sessions.

---

## 12. Sidebar

The sidebar on the left shows your navigation and projects.

### Collapsing the Sidebar
Click the **← [ ]** button at the bottom of the sidebar to collapse it (shows only icons).  
Click **[ ] →** to expand it again.

This gives more horizontal space to your Kanban board — especially useful on smaller screens.

---

## 13. Role Summary

| Feature | Admin | Writer | Reader |
|---------|-------|--------|--------|
| View board | ✅ | ✅ | ✅ |
| Create tasks | ✅ | ✅ | ❌ |
| Edit tasks | ✅ | ✅ | ❌ |
| Delete tasks | ✅ | ✅ | ❌ |
| Drag tasks | ✅ | ✅ | ❌ |
| Share project | ✅ | ❌ | ❌ |
| Change member roles | ✅ | ❌ | ❌ |
| Delete project | ✅ | ❌ | ❌ |
| See live cursors | ✅ | ✅ | ❌ |
| View analytics | ✅ | ✅ | ✅ |

---

## 14. Tips & Shortcuts

| Action | How |
|--------|-----|
| Open command palette | `Ctrl/⌘ + K` |
| Close any modal | `Escape` |
| Save inline task | `Enter` |
| Cancel inline task | `Escape` |
| Show password | Click eye icon in password field |
| Collapse sidebar | Click `←[` button at bottom of sidebar |

---

## 15. Troubleshooting

| Issue | Solution |
|-------|---------|
| Board shows "Offline" badge | Socket server temporarily unavailable; data still loads; try refreshing |
| Analytics dashboard doesn't load | Check internet connection; click "Retry" if available |
| Task changes not appearing for others | Check if Socket server is online; Firestore data always syncs on refresh |
| "User not found" when sharing | The email must belong to a registered FlowBoard account |
| Can't drag tasks | Verify you have Writer or Admin role on this project |
| Password button disabled on signup | Check all 5 password requirements show green ticks |
