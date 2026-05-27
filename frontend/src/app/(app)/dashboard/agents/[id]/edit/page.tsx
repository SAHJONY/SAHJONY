'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AgentForm } from '@/components/agents/agent-form'
import type { Agent } from '@/types/database'

export default function EditAgentPage() {
  const [agent, setAgent] = useState<Agent | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const params = useParams()
  const supabase = createClient()
  const agentId = params.id as string

  useEffect(() => {
    if (!supabase) {
      // Mock data for demo when Supabase not configured
      setAgent({
        id: agentId,
        user_id: 'demo-user',
        name: 'Demo Agent',
        description: 'This is a demo agent',
        model_provider: 'openai',
        model_name: 'gpt-4o',
        system_prompt: 'You are a helpful assistant.',
        config: {},
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      setLoading(false)
      return
    }

    const fetchAgent = async () => {
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single()

      if (!error && data) {
        setAgent(data)
      } else {
        router.push('/dashboard')
      }
      setLoading(false)
    }
    fetchAgent()
  }, [agentId, router, supabase])

  const handleSubmit = async (data: {
    name: string
    description: string
    model_provider: string
    model_name: string
    system_prompt: string
  }) => {
    setSubmitting(true)
    setError('')

    if (!supabase) {
      alert('Supabase not configured')
      setSubmitting(false)
      return
    }

    try {
      const { error } = await supabase
        .from('agents')
        .update({
          name: data.name,
          description: data.description,
          model_provider: data.model_provider,
          model_name: data.model_name,
          system_prompt: data.system_prompt,
        })
        .eq('id', agentId)

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Failed to update agent')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    )
  }

  if (!agent) return null

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Edit Agent</h1>
        <p className="text-slate-400 mt-1">Update your AI agent configuration</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <AgentForm
        agent={agent}
        onSubmit={handleSubmit}
        isLoading={submitting}
      />
    </div>
  )
}