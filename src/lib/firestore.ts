import {
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  setDoc,
  arrayUnion,
} from 'firebase/firestore'
import { db } from './firebase'
import type { Workspace, Project, Task, ColumnId, Priority, ProjectRole } from './types'
import { COLUMN_IDS } from './types'

// ─── User Profiles ──────────────────────────────────────────────────────────
// Stored in users/{uid} so we can look up uid by email for sharing

export async function saveUserProfile(uid: string, email: string): Promise<void> {
  await setDoc(doc(db, 'users', uid), { uid, email }, { merge: true })
}

export async function getUserByEmail(email: string): Promise<{ uid: string; email: string } | null> {
  const q = query(collection(db, 'users'), where('email', '==', email.trim().toLowerCase()))
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return d.data() as { uid: string; email: string }
}

// ─── Workspace ─────────────────────────────────────────────────────────────

export async function getOrCreateWorkspace(uid: string, email: string): Promise<Workspace> {
  const ref = doc(db, 'workspaces', uid)
  const snap = await getDoc(ref)
  if (snap.exists()) {
    return { id: snap.id, ...(snap.data() as Omit<Workspace, 'id'>) }
  }
  const ws: Omit<Workspace, 'id'> = {
    name: `${email.split('@')[0]}'s workspace`,
    ownerId: uid,
    createdAt: Date.now(),
  }
  await setDoc(ref, ws)
  return { id: uid, ...ws }
}

// ─── Projects ──────────────────────────────────────────────────────────────

export async function getOwnedProjects(userId: string): Promise<Project[]> {
  const q = query(
    collection(db, 'projects'),
    where('workspaceId', '==', userId),
    orderBy('createdAt', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Project, 'id'>) }))
}

export async function getSharedProjects(userId: string): Promise<Project[]> {
  const q = query(
    collection(db, 'projects'),
    where('memberIds', 'array-contains', userId)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Project, 'id'>) }))
}

export async function getProject(projectId: string): Promise<Project | null> {
  const snap = await getDoc(doc(db, 'projects', projectId))
  if (!snap.exists()) return null
  return { id: snap.id, ...(snap.data() as Omit<Project, 'id'>) }
}

export async function createProject(
  workspaceId: string,
  ownerEmail: string,
  name: string
): Promise<Project> {
  const data: Omit<Project, 'id'> = {
    name,
    workspaceId,
    createdAt: Date.now(),
    members: {
      [workspaceId]: { email: ownerEmail, role: 'admin' },
    },
    memberIds: [], // non-owner members only
  }
  const ref = await addDoc(collection(db, 'projects'), data)
  return { id: ref.id, ...data }
}

export async function shareProject(
  projectId: string,
  ownerUid: string,
  ownerEmail: string,
  invites: Array<{ uid: string; email: string; role: ProjectRole }>
): Promise<void> {
  if (!invites.length) return
  const memberUpdates: Record<string, { email: string; role: ProjectRole }> = {}
  const newMemberIds: string[] = []

  // Always write the owner into the members map — migrates legacy projects
  memberUpdates[`members.${ownerUid}`] = { email: ownerEmail, role: 'admin' }

  for (const invite of invites) {
    memberUpdates[`members.${invite.uid}`] = { email: invite.email, role: invite.role }
    newMemberIds.push(invite.uid)
  }
  await updateDoc(doc(db, 'projects', projectId), {
    ...memberUpdates,
    memberIds: arrayUnion(...newMemberIds),
  })
}

export async function updateMemberRole(
  projectId: string,
  memberId: string,
  role: ProjectRole
): Promise<void> {
  await updateDoc(doc(db, 'projects', projectId), {
    [`members.${memberId}.role`]: role,
  })
}

export async function removeMember(projectId: string, memberId: string): Promise<void> {
  // We can't use arrayRemove with dynamic keys easily; fetch + rewrite memberIds
  const snap = await getDoc(doc(db, 'projects', projectId))
  if (!snap.exists()) return
  const data = snap.data() as Project
  const newMemberIds = (data.memberIds ?? []).filter((id) => id !== memberId)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const newMembers: Record<string, any> = { ...data.members }
  delete newMembers[memberId]
  await updateDoc(doc(db, 'projects', projectId), {
    memberIds: newMemberIds,
    members: newMembers,
  })
}

export async function deleteProject(projectId: string): Promise<void> {
  await deleteDoc(doc(db, 'projects', projectId))
}

// ─── Tasks ─────────────────────────────────────────────────────────────────

export async function getTasks(projectId: string): Promise<Task[]> {
  const q = query(
    collection(db, 'tasks'),
    where('projectId', '==', projectId),
    orderBy('position', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Task, 'id'>) }))
}

export async function createTask(
  projectId: string,
  workspaceId: string,
  columnId: ColumnId,
  title: string,
  position: number
): Promise<Task> {
  const data: Omit<Task, 'id'> = {
    title,
    description: '',
    columnId,
    priority: 'none',
    projectId,
    workspaceId,
    position,
    labels: [],
    dueDate: null,
    assigneeId: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
  const ref = await addDoc(collection(db, 'tasks'), data)
  return { id: ref.id, ...data }
}

export async function updateTask(taskId: string, patch: Partial<Omit<Task, 'id'>>): Promise<void> {
  await updateDoc(doc(db, 'tasks', taskId), { ...patch, updatedAt: Date.now() })
}

export async function moveTask(
  taskId: string,
  columnId: ColumnId,
  position: number
): Promise<void> {
  await updateDoc(doc(db, 'tasks', taskId), { columnId, position, updatedAt: Date.now() })
}

export async function deleteTask(taskId: string): Promise<void> {
  await deleteDoc(doc(db, 'tasks', taskId))
}

// ─── Helpers ───────────────────────────────────────────────────────────────

export function getColumnTasks(tasks: Task[], columnId: ColumnId): Task[] {
  return tasks
    .filter((t) => t.columnId === columnId)
    .sort((a, b) => a.position - b.position)
}

export function getNextPosition(tasks: Task[], columnId: ColumnId): number {
  const col = getColumnTasks(tasks, columnId)
  return col.length === 0 ? 1000 : col[col.length - 1].position + 1000
}

export const PRIORITY_ORDER: Record<Priority, number> = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
  none: 4,
}

export { COLUMN_IDS }
