'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChatWindow } from '@/components/chat/chat-window'
import type { Message } from '@/types/database'

interface Conversation {
  id: string
  agent_id: string
  title: string | null
  agents: { id: string; name: string; model_provider: string; model_name: string; system_prompt: string | null } | null
}

export default function ChatPage() {
  const params = useParams()
  const conversationId = params.conversationId as string
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const fetchData = async () => {
      const { data: conv, error: convError } = await supabase
        .from('conversations')
        .select('*, agents(*)')
        .eq('id', conversationId)
        .single()

      if (convError || !conv) {
        setError('Conversation not found')
        setLoading(false)
        return
      }
      setConversation(conv)

      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (msgs) setMessages(msgs)
      setLoading(false)
    }
    fetchData()
  }, [conversationId, supabase])

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content,
      metadata: {},
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, userMessage])
    setIsLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: savedMsg } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          user_id: user.id,
          role: 'user',
          content,
        })
        .select()
        .single()

      if (savedMsg) {
        setMessages(prev => prev.map(m => m.id.startsWith('temp-') ? savedMsg : m))
      }

      const token = (await supabase.auth.getSession()).data.session?.access_token
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
      const ws = new WebSocket(`${wsProtocol}//${window.location.host}/api/ws/chat/${conversationId}?token=${token}`)

      ws.onopen = () => {
        ws.send(JSON.stringify({ message: content }))
      }

      let assistantContent = ''
      const assistantId = `temp-ai-${Date.now()}`
      setMessages(prev => [...prev, { id: assistantId, conversation_id: conversationId, role: 'assistant', content: '', metadata: {}, created_at: new Date().toISOString() }])

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'chunk') {
          assistantContent += data.content
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m))
        } else if (data.type === 'done') {
          ws.close()
          saveAssistantMessage(assistantContent)
          setIsLoading(false)
        } else if (data.type === 'error') {
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: `Error: ${data.message}` } : m))
          ws.close()
          setIsLoading(false)
        }
      }

      ws.onerror = () => {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: 'Connection error. Please try again.' } : m))
        setIsLoading(false)
      }
    } catch (err) {
      console.error('Send message error:', err)
    }
  }

  const saveAssistantMessage = async (content: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !content.trim()) return

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: 'assistant',
      content,
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    )
  }

  if (error || !conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-400 mb-4">{error || 'Conversation not found'}</p>
        <button onClick={() => window.history.back()} className="text-indigo-400 hover:text-indigo-300">
          Go back
        </button>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <ChatWindow
        messages={messages}
        isLoading={isLoading}
        onSend={handleSendMessage}
      />
    </div>
  )
}