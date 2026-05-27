'use client'

import { useState } from 'react'
import { Bot, ChevronDown, Check, Sparkles, Terminal, FileEdit, GitBranch, GitCommit, Search, ListChecks, Wrench } from 'lucide-react'
import type { Agent } from '@/types/database'

// SAHJONY Agent Types
export type SahjonyAgentType = 
  | 'claude_code' 
  | 'cursor_composer' 
  | 'copilot_agent' 
  | 'aider_agent' 
  | 'cody_agent' 
  | 'planning_agent' 
  | 'tool_agent'
  | 'sahjony_core'

export interface SahjonyAgentTypeInfo {
  id: SahjonyAgentType
  name: string
  description: string
  icon: React.ReactNode
  keywords: string[]
  color: string
}

export const SAHJONY_AGENT_TYPES: SahjonyAgentTypeInfo[] = [
  {
    id: 'sahjony_core',
    name: 'SAHJONY Core',
    description: 'Unified brain with intelligent routing',
    icon: <Sparkles className="w-4 h-4" />,
    keywords: ['default', 'smart', 'auto', 'routing'],
    color: 'from-indigo-500 to-purple-500'
  },
  {
    id: 'claude_code',
    name: 'Claude Code',
    description: 'Terminal-centric autonomous coding with self-healing',
    icon: <Terminal className="w-4 h-4" />,
    keywords: ['terminal', 'bash', 'execute', 'shell', 'run', 'command'],
    color: 'from-amber-500 to-orange-500'
  },
  {
    id: 'cursor_composer',
    name: 'Cursor Composer',
    description: 'Multi-file editing across entire project',
    icon: <FileEdit className="w-4 h-4" />,
    keywords: ['create', 'multiple files', 'edit many', 'add', 'new file'],
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'copilot_agent',
    name: 'Copilot Agent',
    description: 'Workspace awareness with Git context',
    icon: <GitBranch className="w-4 h-4" />,
    keywords: ['workspace', 'github', 'git flow', 'autonomous'],
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'aider_agent',
    name: 'Aider Agent',
    description: 'Terminal-first with Git integration',
    icon: <GitCommit className="w-4 h-4" />,
    keywords: ['refactor', 'git commit', 'terminal first'],
    color: 'from-pink-500 to-rose-500'
  },
  {
    id: 'cody_agent',
    name: 'Cody Agent',
    description: 'Repo-level codebase context understanding',
    icon: <Search className="w-4 h-4" />,
    keywords: ['search codebase', 'find everywhere', 'context', 'cross-repo'],
    color: 'from-violet-500 to-purple-500'
  },
  {
    id: 'planning_agent',
    name: 'Planning Agent',
    description: 'Multi-step execution with self-healing',
    icon: <ListChecks className="w-4 h-4" />,
    keywords: ['complex', 'multi-step', 'plan', 'healing', 'retry'],
    color: 'from-teal-500 to-cyan-500'
  },
  {
    id: 'tool_agent',
    name: 'Tool Agent',
    description: 'Direct tool execution (@bash, @read, @write)',
    icon: <Wrench className="w-4 h-4" />,
    keywords: ['@bash', '@read', '@write', '@glob', '@grep', 'tool'],
    color: 'from-gray-500 to-slate-500'
  }
]

interface SahjonyAgentSelectorProps {
  currentAgentType?: string
  conversationId: string
  onSelectAgentType: (agentType: SahjonyAgentType) => void
  compact?: boolean
}

export function SahjonyAgentSelector({ 
  currentAgentType = 'sahjony_core', 
  conversationId,
  onSelectAgentType,
  compact = false
}: SahjonyAgentSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)

  const currentAgent = SAHJONY_AGENT_TYPES.find(a => a.id === currentAgentType) || SAHJONY_AGENT_TYPES[0]

  const handleSelect = async (agentType: SahjonyAgentType) => {
    setIsSelecting(true)
    try {
      await onSelectAgentType(agentType)
      setIsOpen(false)
    } finally {
      setIsSelecting(false)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSelecting}
        className={`
          flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 
          hover:bg-slate-700/50 transition-all disabled:opacity-50
          ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'}
        `}
      >
        <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${currentAgent.color} flex items-center justify-center`}>
          {currentAgent.icon}
        </div>
        {!compact && (
          <div className="text-left">
            <p className="text-white font-medium">{currentAgent.name}</p>
            <p className="text-zinc-400 text-xs">{currentAgent.description}</p>
          </div>
        )}
        <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700 bg-gradient-to-r from-indigo-900/50 to-purple-900/50">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-indigo-400" />
                <p className="text-sm font-medium text-white">SAHJONY Agent Type</p>
              </div>
              <p className="text-xs text-indigo-300 mt-0.5">Choose how to process your conversation</p>
            </div>
            
            <div className="max-h-80 overflow-y-auto p-2">
              {SAHJONY_AGENT_TYPES.map((agent) => (
                <button
                  key={agent.id}
                  onClick={() => handleSelect(agent.id)}
                  disabled={isSelecting}
                  className={`
                    w-full p-3 rounded-lg text-left flex items-start gap-3 
                    hover:bg-slate-700/50 transition-colors disabled:opacity-50
                    ${agent.id === currentAgentType ? 'bg-indigo-600/20 border border-indigo-500/30' : ''}
                  `}
                >
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${agent.color} flex items-center justify-center flex-shrink-0`}>
                    {agent.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-white">{agent.name}</p>
                      {agent.id === currentAgentType && (
                        <Check className="w-4 h-4 text-indigo-400" />
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{agent.description}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {agent.keywords.slice(0, 3).map((kw) => (
                        <span key={kw} className="text-xs px-1.5 py-0.5 rounded bg-slate-700 text-zinc-400">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="px-4 py-3 border-t border-slate-700 bg-slate-800/50">
              <p className="text-xs text-zinc-500">
                Agent routing is automatic - SAHJONY Core routes to the best agent based on your message.
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

// Helper to get agent type from conversation metadata
export function getConversationAgentType(conversation: { metadata?: Record<string, unknown> }): SahjonyAgentType {
  const agentType = conversation.metadata?.sahjony_agent_type as string
  if (agentType && SAHJONY_AGENT_TYPES.some(a => a.id === agentType)) {
    return agentType as SahjonyAgentType
  }
  return 'sahjony_core'
}

// Helper to set agent type in conversation metadata
export async function updateConversationAgentType(
  supabase: ReturnType<typeof import('@/lib/supabase/client').createClient>,
  conversationId: string,
  agentType: SahjonyAgentType
): Promise<boolean> {
  if (!supabase) return false

  const { error } = await supabase
    .from('conversations')
    .update({ 
      metadata: { sahjony_agent_type: agentType }
    })
    .eq('id', conversationId)
  
  return !error
}