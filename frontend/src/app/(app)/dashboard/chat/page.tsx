'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ChatWindow } from '@/components/chat/chat-window'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Bot, Settings, Database } from 'lucide-react'
import Link from 'next/link'
import { useSahjonyChat } from '@/hooks/use-sahjony-chat'
import { SahjonyAgentSelector, getConversationAgentType, updateConversationAgentType, type SahjonyAgentType } from '@/components/chat/sahjony-agent-selector'
import type { Message, Conversation, Agent } from '@/types/database'

export default function ChatPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = createClient()
  const conversationId = params.id as string

  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [streamingContent, setStreamingContent] = useState('')
  const [sahjonyAgentType, setSahjonyAgentType] = useState<SahjonyAgentType>('sahjony_core')

  // Use the SAHJONY chat hook - eliminates duplicate WebSocket code
  const { 
    sendMessage, 
    isConnected, 
    status: sahjonyStatus
  } = useSahjonyChat({
    conversationId,
    onMessageChunk: useCallback((chunk: string) => {
      setStreamingContent(prev => prev + chunk)
    }, []),
    onStatusChange: useCallback((newStatus: string) => {
      if (newStatus === 'done') {
        // Add completed message to history and reset streaming
        const finalContent = streamingContent
        if (finalContent) {
          const assistantMessage: Message = {
            id: `temp-${Date.now()}`,
            conversation_id: conversationId,
            role: 'assistant',
            content: finalContent,
            metadata: { agent_type: 'sahjony_core' },
            created_at: new Date().toISOString()
          }
          setMessages(prev => [...prev, assistantMessage])
          setStreamingContent('')
        }
      }
    }, [conversationId]),
    onError: useCallback((error: string) => {
      console.error('SAHJONY Chat error:', error)
    }, [])
  })

  // Fetch conversation, agent, and messages
  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get conversation
      const { data: conv } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .eq('user_id', user.id)
        .single()

      if (!conv) {
        setLoading(false)
        return
      }
      setConversation(conv)

      // Get SAHJONY agent type from conversation metadata
      if (conv.metadata) {
        setSahjonyAgentType(getConversationAgentType(conv))
      }

      // Get agent
      const { data: agentData } = await supabase
        .from('agents')
        .select('*')
        .eq('id', conv.agent_id)
        .eq('user_id', user.id)
        .single()

      if (agentData) {
        setAgent(agentData)
      }

      // Get messages
      const { data: msgs } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })

      if (msgs) {
        setMessages(msgs)
      }

      setLoading(false)
    }

    fetchData()
  }, [conversationId, supabase, router])

  // Handle sending messages
  const handleSend = useCallback(async (content: string) => {
    if (!content.trim()) return

    // Add user message immediately
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      conversation_id: conversationId,
      role: 'user',
      content,
      metadata: {},
      created_at: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    
    // Reset streaming content for new response
    setStreamingContent('')
    
    // Send via SAHJONY hook (handles WebSocket internally)
    sendMessage(content)
  }, [conversationId, sendMessage])

  // Handle retry - retry last user message
  const handleRetry = useCallback(() => {
    const lastUserMsg = messages.filter(m => m.role === 'user').pop()
    if (lastUserMsg) {
      handleSend(lastUserMsg.content)
    }
  }, [messages, handleSend])

  // Combine streaming content with existing messages for display
  const displayMessages = useCallback((): Message[] => {
    if (streamingContent) {
      const lastMsg = messages[messages.length - 1]
      if (lastMsg?.role === 'assistant') {
        // Update the last message with streaming content
        return [...messages.slice(0, -1), { ...lastMsg, content: lastMsg.content + streamingContent }]
      } else {
        // Show streaming as a new assistant message
        return [...messages, {
          id: 'streaming',
          conversation_id: conversationId,
          role: 'assistant' as const,
          content: streamingContent,
          metadata: { isStreaming: true },
          created_at: new Date().toISOString()
        }]
      }
    }
    return messages
  }, [messages, streamingContent, conversationId])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-3.5rem)] text-center">
        <Bot className="w-16 h-16 text-zinc-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Conversation not found</h2>
        <p className="text-zinc-400 mb-6">This conversation doesn't exist or you don't have access to it.</p>
        <Link href="/dashboard/conversations">
          <Button variant="secondary">Back to Conversations</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)]">
      {/* Chat Header with SAHJONY branding */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-surface/50">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/conversations">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-white">
                {agent?.name || 'SAHJONY Agent'}
              </h1>
              <div className="flex items-center gap-2 text-xs">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-zinc-400">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-zinc-400 flex items-center gap-1">
                  <Database className="w-3 h-3" />
                  SAHJONY Brain
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* SAHJONY Agent Type Selector */}
          <SahjonyAgentSelector
            currentAgentType={sahjonyAgentType}
            conversationId={conversationId}
            onSelectAgentType={async (agentType) => {
              setSahjonyAgentType(agentType)
              await updateConversationAgentType(supabase, conversationId, agentType)
            }}
            compact
          />

          {/* SAHJONY Status Indicator */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-border">
            <div className={`w-2 h-2 rounded-full ${
              sahjonyStatus === 'connected' || sahjonyStatus === 'done' ? 'bg-green-500' :
              sahjonyStatus === 'thinking' ? 'bg-yellow-500 animate-pulse' :
              sahjonyStatus === 'error' ? 'bg-red-500' :
              'bg-gray-500'
            }`} />
            <span className="text-xs text-zinc-400 capitalize">{sahjonyStatus}</span>
          </div>
          <Link href={`/dashboard/agents/${agent?.id}/settings`}>
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>

      {/* SAHJONY Brain Info Banner */}
      <div className="px-6 py-2 bg-gradient-to-r from-indigo-900/50 to-purple-900/50 border-b border-indigo-500/20">
        <p className="text-xs text-indigo-300 flex items-center gap-2">
          <Bot className="w-3 h-3" />
          Powered by SAHJONY Brain (Freebuff Multi-Agent + Hermes Persistent Memory)
        </p>
      </div>

      {/* Chat Window */}
      <div className="flex-1 overflow-hidden">
        <ChatWindow
          messages={displayMessages()}
          isLoading={sahjonyStatus === 'thinking'}
          onSend={handleSend}
          onRetry={handleRetry}
        />
      </div>
    </div>
  )
}