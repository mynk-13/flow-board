import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserPresence {
  userId: string
  email: string
  color: string
  socketId: string
}

interface CursorData {
  userId: string
  email: string
  color: string
  x: number
  y: number
}

// ─── In-memory state ─────────────────────────────────────────────────────────

const USER_COLORS = [
  '#6366f1', // indigo
  '#ec4899', // pink
  '#f59e0b', // amber
  '#10b981', // emerald
  '#3b82f6', // blue
  '#ef4444', // red
  '#8b5cf6', // violet
  '#14b8a6', // teal
  '#f97316', // orange
  '#06b6d4', // cyan
]

/** boardId → Map<userId, UserPresence> */
const rooms = new Map<string, Map<string, UserPresence>>()
/** boardId → Map<userId, CursorData> */
const cursors = new Map<string, Map<string, CursorData>>()

function getColor(boardId: string, userId: string): string {
  const room = rooms.get(boardId)
  if (room?.has(userId)) return room.get(userId)!.color
  const idx = (room?.size ?? 0) % USER_COLORS.length
  return USER_COLORS[idx]
}

function broadcastPresence(io: Server, boardId: string) {
  const users = [...(rooms.get(boardId)?.values() ?? [])]
  io.to(boardId).emit('presence:updated', { users })
}

// ─── Express ──────────────────────────────────────────────────────────────────

const app = express()
const corsOrigin = process.env.CORS_ORIGIN ?? '*'

app.use(cors({ origin: corsOrigin, credentials: true }))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true, rooms: rooms.size })
})

// ─── Socket.io ────────────────────────────────────────────────────────────────

const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: { origin: corsOrigin, methods: ['GET', 'POST'], credentials: true },
  transports: ['websocket', 'polling'],
})

io.on('connection', (socket) => {
  // ── board:join ──────────────────────────────────────────────────────────────
  socket.on('board:join', ({ boardId, userId, email }: { boardId: string; userId: string; email: string }) => {
    socket.join(boardId)

    if (!rooms.has(boardId)) rooms.set(boardId, new Map())
    if (!cursors.has(boardId)) cursors.set(boardId, new Map())

    const color = getColor(boardId, userId)
    const user: UserPresence = { userId, email, color, socketId: socket.id }
    rooms.get(boardId)!.set(userId, user)

    socket.data.boardId = boardId
    socket.data.userId = userId

    // Send current cursors snapshot to just-joined user
    socket.emit('cursors:snapshot', {
      cursors: [...(cursors.get(boardId)?.values() ?? [])],
    })

    broadcastPresence(io, boardId)
  })

  // ── board:leave ─────────────────────────────────────────────────────────────
  socket.on('board:leave', ({ boardId, userId }: { boardId: string; userId: string }) => {
    socket.leave(boardId)
    rooms.get(boardId)?.delete(userId)
    cursors.get(boardId)?.delete(userId)
    broadcastPresence(io, boardId)
    socket.to(boardId).emit('cursors:updated', {
      cursors: [...(cursors.get(boardId)?.values() ?? [])],
    })
  })

  // ── task events (broadcast to everyone else in the room) ────────────────────
  socket.on('task:move', (payload: { boardId: string; taskId: string; columnId: string; position: number; movedBy: string }) => {
    const { boardId, ...data } = payload
    socket.to(boardId).emit('task:moved', data)
  })

  socket.on('task:create', (payload: { boardId: string; task: unknown; createdBy: string }) => {
    const { boardId, ...data } = payload
    socket.to(boardId).emit('task:created', data)
  })

  socket.on('task:update', (payload: { boardId: string; taskId: string; diff: unknown; updatedBy: string }) => {
    const { boardId, ...data } = payload
    socket.to(boardId).emit('task:updated', data)
  })

  socket.on('task:delete', (payload: { boardId: string; taskId: string; deletedBy: string }) => {
    const { boardId, ...data } = payload
    socket.to(boardId).emit('task:deleted', data)
  })

  // ── cursor:move (throttled on client to ~30fps) ──────────────────────────────
  socket.on('cursor:move', (payload: { boardId: string; userId: string; email: string; color: string; x: number; y: number }) => {
    const { boardId, ...cursor } = payload
    if (!cursors.has(boardId)) cursors.set(boardId, new Map())
    cursors.get(boardId)!.set(payload.userId, cursor)
    socket.to(boardId).emit('cursors:updated', {
      cursors: [...(cursors.get(boardId)?.values() ?? [])],
    })
  })

  // ── disconnect ───────────────────────────────────────────────────────────────
  socket.on('disconnect', () => {
    const { boardId, userId } = socket.data as { boardId?: string; userId?: string }
    if (!boardId || !userId) return

    rooms.get(boardId)?.delete(userId)
    cursors.get(boardId)?.delete(userId)
    broadcastPresence(io, boardId)
    socket.to(boardId).emit('cursors:updated', {
      cursors: [...(cursors.get(boardId)?.values() ?? [])],
    })
  })
})

// ─── Start ────────────────────────────────────────────────────────────────────

const PORT = Number(process.env.PORT ?? 3001)
httpServer.listen(PORT, () => {
  console.log(`FlowBoard Socket server running on :${PORT}`)
})
