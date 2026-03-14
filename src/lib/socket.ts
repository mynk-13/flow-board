import { io, type Socket } from 'socket.io-client'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PresenceUser {
  userId: string
  email: string
  color: string
  socketId: string
}

export interface CursorData {
  userId: string
  email: string
  color: string
  x: number // viewport clientX
  y: number // viewport clientY
  lastSeen: number // Date.now() — used to auto-hide after 10 s of inactivity
}

export interface TaskMovedPayload {
  taskId: string
  columnId: string
  position: number
  movedBy: string
}

export interface TaskCreatedPayload {
  task: unknown
  createdBy: string
}

export interface TaskUpdatedPayload {
  taskId: string
  diff: Record<string, unknown>
  updatedBy: string
}

export interface TaskDeletedPayload {
  taskId: string
  deletedBy: string
}

// ─── Singleton ────────────────────────────────────────────────────────────────

let _socket: Socket | null = null

export function getSocket(): Socket {
  if (!_socket) {
    const url = import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:3001'
    _socket = io(url, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 8,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 8000,
    })
  }
  return _socket
}

export function connectSocket() {
  getSocket().connect()
}

export function disconnectSocket() {
  _socket?.disconnect()
}
