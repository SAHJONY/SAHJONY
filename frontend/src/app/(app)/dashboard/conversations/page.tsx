'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'
import type { Conversation } from '@/types/database'
import { SAHJONY_AGENT_TYPES } from '@/components/chat/sahjony-agent-selector'

interface ConversationWithAgent extends Conversation {
  agents: { name: string } | null
}

// Helper to get agent type info - outside component to avoid recreation on every render
function getAgentTypeInfo(metadata: unknown) {
  const agentType = typeof metadata === 'object' && metadata !== null 
    ? (metadata as Record<string, unknown>).sahjony_agent_type as string | undefined 
    : undefined
  return SAHJONY_AGENT_TYPES.find(a => a.id === agentType) || SAHJONY_AGENT_TYPES[0]
}

export default function ConversationsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [conversations, setConversations] = useState<ConversationWithAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchConversations = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data, error } = await supabase
        .from('conversations')
        .select('*, agents(name)')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })

      if (error) {
        setError('Failed to load conversations')
      } else if (data) {
        setConversations(data)
      }
      setLoading(false)
    }
    fetchConversations()
  }, [supabase, router])

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm('Delete this conversation?')) return
    
    const { error } = await supabase.from('conversations').delete().eq('id', id)
    if (error) {
      setError('Failed to delete conversation')
      return
    }
    // Use functional update to avoid stale closure
    setConversations(prev => prev.filter(c => c.id !== id))
  }, [supabase])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Conversations</h1>
          <p className="text-slate-400 mt-1">Your chat history</p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-800/50 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-slate-700 rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-12 text-center border border-slate-700/50">
          <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">No conversations yet</h3>
          <p className="text-slate-400 mb-6">Start chatting with your agents</p>
          <Link href="/dashboard">
            <Button className="bg-indigo-600 hover:bg-indigo-700">Go to Agents</Button>
          </Link>
        </div>
      ) : conversations.length === 0 ? (
        <div className="bg-slate-800/50 rounded-xl p-12 text-center border border-slate-700/50">
          <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h3 className="text-xl font-semibold text-white mb-2">No conversations yet</h3>
          <p className="text-slate-400 mb-6">Start chatting with your agents</p>
          <Link href="/dashboard">
            <Button className="bg-indigo-600 hover:bg-indigo-700">Go to Agents</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {conversations.map((conv) => (
            <div key={conv.id} className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50 hover:border-slate-600/50 transition-colors group">
              <div className="flex items-center justify-between">
                <Link href={`/dashboard/chat/${conv.id}`} className="flex-1">
                  <h3 className="text-lg font-medium text-white hover:text-indigo-400 transition-colors">
                    {conv.title || 'Untitled conversation'}
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Agent: {conv.agents?.name || 'Unknown'} • {new Date(conv.updated_at).toLocaleDateString()}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gradient-to-r ${getAgentTypeInfo(conv.metadata).color} text-white`}>
                      <Sparkles className="w-3 h-3" />
                      {getAgentTypeInfo(conv.metadata).name}
                    </span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(conv.id)}
                  className="text-slate-400 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      {error && (
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">Dismiss</button>
        </div>
      )}
    </div>
  )
}