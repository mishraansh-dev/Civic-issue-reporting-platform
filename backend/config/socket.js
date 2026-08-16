const { Server } = require('socket.io')

let io = null

/**
 * Initialize Socket.io on the given HTTP server.
 * Must be called once before getIO() is used.
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:5173',
      methods: ['GET', 'POST', 'PATCH'],
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    console.log(`⚡ Socket connected:  ${socket.id}`)
    socket.on('disconnect', () => {
      console.log(`⚡ Socket disconnected: ${socket.id}`)
    })
  })

  return io
}

/**
 * Returns the initialized Socket.io instance.
 * Throws if initSocket() hasn't been called yet.
 */
const getIO = () => {
  if (!io) throw new Error('Socket.io not initialized — call initSocket() first.')
  return io
}

module.exports = { initSocket, getIO }
