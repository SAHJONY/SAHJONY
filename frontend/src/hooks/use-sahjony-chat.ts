'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface UseSahjonyChatOptions {
  conversationId: string
  onMessageChunk?: (chunk: string) => void
  onStatusChange?: (status: 'connecting' | 'connected' | 'thinking' | 'done' | 'error' | 'disconnected') => void
  onError?: (error: string) => void
}

interface UseSahjonyChatReturn {
  sendMessage: (content: string) => void
  isConnected: boolean
  status: 'connecting' | 'connected' | 'thinking' | 'done' | 'error' | 'disconnected'
  reconnect: () => void
  disconnect: () => void
}

export function useSahjonyChat({
  conversationId,
  onMessageChunk,
  onStatusChange,
  onError
}: UseSahjonyChatOptions): UseSahjonyChatReturn {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'thinking' | 'done' | 'error' | 'disconnected'>('connecting')
  const [isConnected, setIsConnected] = useState(false)
  const wsRef = useRef<WebSocket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const supabase = createClient()

  const connect = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      onError?.('Not authenticated')
      return
    }

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      onError?.('No session')
      return
    }

    setStatus('connecting')
    const wsUrl = process.env.NEXT_PUBLIC_API_URL || 'ws://localhost:8000'
    const ws = new WebSocket(`${wsUrl}/ws/chat/${conversationId}?token=${session.access_token}`)

    ws.onopen = () => {
      setIsConnected(true)
      setStatus('connected')
      onStatusChange?.('connected')
    }

    ws.onclose = () => {
      setIsConnected(false)
      setStatus('disconnected')
      onStatusChange?.('disconnected')
      // Auto-reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        setStatus('connecting')
        connect()
      }, 3000)
    }

    ws.onerror = () => {
      setStatus('error')
      onStatusChange?.('error')
      onError?.('WebSocket error')
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (data.type === 'chunk') {
          onMessageChunk?.(data.content)
        } else if (data.type === 'typing') {
          setStatus('thinking')
          onStatusChange?.('thinking')
        } else if (data.type === 'done') {
          setStatus('done')
          onStatusChange?.('done')
        } else if (data.type === 'error') {
          setStatus('error')
          onError?.(data.content)
        }
      } catch (e) {
        console.error('Failed to parse WebSocket message:', e)
      }
    }

    wsRef.current = ws
  }, [conversationId, supabase, onMessageChunk, onStatusChange, onError])

  useEffect(() => {
    connect()

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current)
      }
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [connect])

  const sendMessage = useCallback((content: string) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ content }))
      setStatus('thinking')
      onStatusChange?.('thinking')
    }
  }, [onStatusChange])

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
    }
    if (wsRef.current) {
      wsRef.current.close()
    }
  }, [])

  const reconnect = useCallback(() => {
    disconnect()
    setStatus('connecting')
    connect()
  }, [disconnect, connect])

  return {
    sendMessage,
    isConnected,
    status,
    reconnect,
    disconnect
  }
}