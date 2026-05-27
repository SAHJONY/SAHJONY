'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { AgentForm } from '@/components/agents/agent-form'

export default function NewAgentPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (data: {
    name: string
    description: string
    model_provider: string
    model_name: string
    system_prompt: string
  }) => {
    if (!supabase) {
      setError('Supabase is not configured. Please add your Supabase credentials.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { error } = await supabase.from('agents').insert({
        name: data.name,
        description: data.description,
        model_provider: data.model_provider,
        model_name: data.model_name,
        system_prompt: data.system_prompt,
        user_id: user.id,
      })

      if (error) {
        setError(error.message)
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Failed to create agent')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Create New Agent</h1>
        <p className="text-slate-400 mt-1">Configure your AI agent</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      <AgentForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  )
}