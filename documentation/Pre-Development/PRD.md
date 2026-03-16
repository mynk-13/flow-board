# Product Requirements Document (PRD)
## FlowBoard — Real-Time Collaborative Project Manager

**Version:** 1.0  
**Date:** March 2026  
**Status:** Final  

---

## 1. Product Overview

### 1.1 Vision
FlowBoard is a modern, real-time collaborative project management application that enables software teams to plan, track, and ship work efficiently. Inspired by Linear, Jira, and Trello, FlowBoard combines a clean Kanban-style interface with live collaboration features, making team coordination seamless and visual.

### 1.2 Mission Statement
> *"Give every team a single, fast, beautiful place to manage their work — where collaboration happens in real time, not through stale page refreshes."*

### 1.3 Product Goals
| Goal | Description |
|------|-------------|
| **Real-time Collaboration** | Multiple users work on the same board simultaneously without conflicts |
| **Modern UX** | Linear-inspired clean interface with dark mode, animations, and keyboard shortcuts |
| **Role-Based Access** | Granular permissions — Admin, Writer, Reader — enforced client and server side |
| **Analytics Insight** | Visual breakdowns of task status, priority, labels, and team workload |
| **Portfolio Grade** | Production-ready code quality: 94%+ test coverage, WCAG 2.1 AA, < 150 kB bundle |

---

## 2. Target Users

### 2.1 Primary Personas

#### Persona 1 — The Team Lead (Admin)
- **Name:** Arjun, Senior Software Engineer
- **Age:** 28–35
- **Context:** Manages a team of 4–8 developers; runs sprint planning and tracking
- **Goals:** Create projects, assign tasks, track progress, share boards with teammates
- **Pain Points:** Existing tools are bloated; page refreshes miss live updates; can't see what teammates are doing
- **Needs from FlowBoard:** Project creation, sharing with role assignment, live cursor awareness, board analytics

#### Persona 2 — The Developer (Writer)
- **Name:** Priya, Full-Stack Developer
- **Age:** 22–30
- **Context:** Works on assigned tasks; moves cards as work progresses
- **Goals:** See current sprint tasks, update status, add notes to task details, comment on progress
- **Pain Points:** Forgetting to update tickets; not knowing if a task was recently moved by someone else
- **Needs from FlowBoard:** Drag-to-update columns, task detail editing, real-time sync awareness

#### Persona 3 — The Stakeholder (Reader)
- **Name:** Rahul, Product Manager
- **Age:** 30–45
- **Context:** Monitors project progress without managing tasks
- **Goals:** View board state, check analytics dashboards, understand sprint health
- **Pain Points:** Developers blocking him from production DB; wants view-only boards
- **Needs from FlowBoard:** Read-only board access, analytics dashboard

---

## 3. User Stories

### 3.1 Authentication

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-01 | Visitor | Create an account with email & password | I can access my workspace |
| US-02 | User | Sign in with my credentials | I can access my projects |
| US-03 | User | See password strength requirements dynamically | I create a secure password |
| US-04 | User | Toggle password visibility | I can verify what I'm typing |
| US-05 | User | Be redirected to login if unauthenticated | My data stays private |
| US-06 | User | Sign out from an avatar dropdown | I can securely end my session |

### 3.2 Workspace & Projects

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-07 | User | See my workspace dashboard on login | I have an overview of all my projects |
| US-08 | Admin | Create a new project from the sidebar | I can start organizing work |
| US-09 | Admin | Share a project with teammates by email | They can collaborate on the board |
| US-10 | Admin | Assign roles (Admin / Writer / Reader) when sharing | Access is appropriately restricted |
| US-11 | Admin | Remove a member from a project | Access can be revoked |
| US-12 | User | See "Created by Me" and "Shared with Me" sections | Projects are clearly organised |
| US-13 | User | See my role badge on a shared project | I know my permissions level |

### 3.3 Kanban Board

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-14 | Writer | See tasks organized in 5 columns | I understand current sprint status |
| US-15 | Writer | Drag a task card to another column | I update task status visually |
| US-16 | Writer | Create a task inline in any column | I quickly capture new work |
| US-17 | Writer | Click a task card to open detail view | I can edit full task information |
| US-18 | Writer | Assign priority, due date, and labels to tasks | Tasks have rich metadata |
| US-19 | Writer | Filter tasks by priority, label, and search text | I focus on relevant tasks |
| US-20 | Reader | View the board without edit capabilities | I have visibility without risk of changes |

### 3.4 Real-Time Collaboration

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-21 | User | See a "Live" badge when collaborators are present | I know who is on the board |
| US-22 | Admin/Writer | See other users' cursors on the board | I have spatial awareness of teammates |
| US-23 | User | See task changes from other users instantly | I don't need to refresh the page |
| US-24 | User | See cursors disappear after 10 s of inactivity | The UI stays clean |

### 3.5 Analytics

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-25 | User | See task breakdown by status (pie chart) | I understand sprint completion |
| US-26 | User | See task breakdown by priority | I identify urgent work |
| US-27 | User | See task completion trend over time | I can track velocity |
| US-28 | User | See task distribution by label and team member | I understand workload balance |

### 3.6 UI / UX

| ID | As a... | I want to... | So that... |
|----|---------|--------------|------------|
| US-29 | User | Toggle dark / light mode | I work comfortably in any environment |
| US-30 | User | Open a command palette with Ctrl/Cmd+K | I navigate fast without the mouse |
| US-31 | User | Collapse the sidebar | I get more space for the board |
| US-32 | User | See a loading screen during auth resolution | The experience feels polished |

---

## 4. Feature Prioritization (MoSCoW)

| Feature | Priority |
|---------|----------|
| Email/password auth | **Must Have** |
| Kanban board with 5 columns | **Must Have** |
| Task CRUD | **Must Have** |
| Drag and drop | **Must Have** |
| Real-time task sync | **Must Have** |
| Role-based sharing | **Must Have** |
| Dark mode | **Must Have** |
| Analytics dashboard (MFE) | **Should Have** |
| Live cursors and presence | **Should Have** |
| Command palette | **Should Have** |
| Virtual scroll (1 000+ tasks) | **Should Have** |
| WCAG 2.1 AA compliance | **Should Have** |
| Playwright E2E tests | **Should Have** |
| Push notifications | **Could Have** |
| Offline/PWA support | **Could Have** |
| OAuth (Google, GitHub) | **Won't Have** (v1) |

---

## 5. Success Metrics

| Metric | Target |
|--------|--------|
| Lighthouse Performance | ≥ 90 |
| Lighthouse Accessibility | ≥ 90 |
| Unit test statement coverage | ≥ 80% (achieved: 94%) |
| Main bundle gzip size | < 150 kB (achieved: 23.6 kB) |
| LCP (Largest Contentful Paint) | < 2 s |
| INP (Interaction to Next Paint) | < 100 ms |
| CLS (Cumulative Layout Shift) | < 0.1 |
| Real-time latency (task sync) | < 300 ms over LAN |
| E2E test scenarios covered | Auth + Board + Task CRUD |

---

## 6. Constraints & Assumptions

| Constraint | Detail |
|------------|--------|
| **Authentication** | Email/password only (v1); Firebase Auth |
| **Database** | Firestore (NoSQL); no relational joins |
| **Real-time server** | Node.js on Railway free tier; 500 ms cold start possible |
| **Analytics MFE** | Deployed separately; loaded at runtime — outage degrades gracefully |
| **Browsers** | Latest Chrome, Firefox, Edge, Safari only |
| **Mobile** | Responsive layout; not optimized for touch drag-drop |
| **Offline** | No offline support in v1 |

---

## 7. Out of Scope (v1)

- Mobile native app (iOS / Android)
- OAuth / SSO login
- File attachments on tasks
- Comments / activity feed per task
- Notifications (email, push)
- Time tracking
- Sprint planning / backlog grooming automation
- Custom board columns
