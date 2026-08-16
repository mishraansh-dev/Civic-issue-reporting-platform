import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'

/**
 * useSocket — connects to the backend Socket.io server and listens for
 * 'issue:updated' events. Pass a callback to react to status changes.
 */
export function useSocket(onIssueUpdate) {
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      transports: ['websocket'],
    })
    socketRef.current = socket

    socket.on('connect', () => console.log('🔗 Socket connected'))
    socket.on('issue:updated', (data) => {
      if (typeof onIssueUpdate === 'function') onIssueUpdate(data)
    })

    return () => {
      socket.disconnect()
    }
  }, []) // intentionally omit onIssueUpdate from deps to avoid re-connects

  return socketRef
}
