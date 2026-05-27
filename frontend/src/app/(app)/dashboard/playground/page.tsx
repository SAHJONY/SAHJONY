'use client'

import { useState } from 'react'
import { Sparkles, Terminal, FileCode, GitBranch, GitCommit, Search, Map, Wrench, Zap, Loader2, ChevronRight, CheckCircle2, XCircle } from 'lucide-react'

// SAHJONY Agent Types
const SAHJONY_AGENTS = [
  {
    id: 'claude_code',
    name: 'Claude Code',
    description: 'Terminal-centric autonomous coding with self-healing',
    icon: Terminal,
    color: 'from-orange-500 to-red-500',
    keywords: ['terminal', 'bash', 'execute', 'run', 'git'],
    capabilities: ['@bash commands', '@read files', '@write files', '@glob patterns', '@grep search', 'self-healing']
  },
  {
    id: 'cursor_composer',
    name: 'Cursor Composer',
    description: 'Multi-file editing across entire project',
    icon: FileCode,
    color: 'from-blue-500 to-cyan-500',
    keywords: ['create', 'add', 'new file', 'multiple files'],
    capabilities: ['multi-file creation', 'project orchestration', 'TypeScript templates', 'React components', 'API routes']
  },
  {
    id: 'copilot_agent',
    name: 'Copilot Agent',
    description: 'Workspace awareness with Git context',
    icon: GitBranch,
    color: 'from-purple-500 to-pink-500',
    keywords: ['workspace', 'github', 'autonomous', 'context'],
    capabilities: ['Git branch awareness', 'autonomous tasks', 'workspace context', 'multi-step execution']
  },
  {
    id: 'aider_agent',
    name: 'Aider Agent',
    description: 'Terminal-first with Git integration',
    icon: GitCommit,
    color: 'from-green-500 to-emerald-500',
    keywords: ['refactor', 'git commit', 'terminal first'],
    capabilities: ['Git auto-commits', 'terminal workflow', 'complex refactoring', 'session-based editing']
  },
  {
    id: 'cody_agent',
    name: 'Cody Agent',
    description: 'Repo-level codebase understanding',
    icon: Search,
    color: 'from-yellow-500 to-amber-500',
    keywords: ['search codebase', 'find everywhere', 'context'],
    capabilities: ['massive codebase search', 'cross-service analysis', 'context aggregation', 'dependency mapping']
  },
  {
    id: 'planning_agent',
    name: 'Planning Agent',
    description: 'Multi-step with self-healing',
    icon: Map,
    color: 'from-indigo-500 to-violet-500',
    keywords: ['complex', 'multi-step', 'plan', 'healing'],
    capabilities: ['plan-act-observe cycle', 'self-healing', 'iterative completion', 'failure recovery']
  },
  {
    id: 'tool_agent',
    name: 'Tool Agent',
    description: 'Direct tool execution via @mentions',
    icon: Wrench,
    color: 'from-slate-500 to-gray-600',
    keywords: ['@bash', '@read', '@write', '@glob', '@grep'],
    capabilities: ['@bash - shell commands', '@read - file contents', '@write - create/edit files', '@glob - pattern matching', '@grep - code search']
  },
  {
    id: 'sahjony_core',
    name: 'SAHJONY Core',
    description: 'Intelligent routing to best agent',
    icon: Sparkles,
    color: 'from-rose-500 to-pink-600',
    keywords: ['auto', 'smart routing', 'orchestrate'],
    capabilities: ['automatic agent routing', 'multi-agent orchestration', 'context-aware selection', 'unified brain']
  }
]

interface ToolResult {
  name: string
  args: Record<string, unknown>
  result?: unknown
  error?: string
  duration_ms?: number
}

interface ExecutionResult {
  agent_used: string
  result: string
  tools_used: string[]
  tool_calls: ToolResult[]
  confidence: number
}

// Task type to agent mapping


export default function PlaygroundPage() {
  const [selectedAgent, setSelectedAgent] = useState<string>('sahjony_core')
  const [taskInput, setTaskInput] = useState('')
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showCapabilities, setShowCapabilities] = useState(false)

  const agent = SAHJONY_AGENTS.find(a => a.id === selectedAgent) || SAHJONY_AGENTS[7]
  const AgentIcon = agent.icon

  // Get API endpoint for selected agent
  const getEndpoint = () => {
    switch (selectedAgent) {
      case 'claude_code': return { endpoint: '/api/sahjony/agents/claude-code/execute', body: { task: taskInput } }
      case 'cursor_composer': return { endpoint: '/api/sahjony/agents/cursor/composer', body: { task: taskInput } }
      case 'copilot_agent': return { endpoint: '/api/sahjony/agents/copilot/execute', body: { task: taskInput } }
      case 'aider_agent': return { endpoint: '/api/sahjony/agents/aider/execute', body: { task: taskInput } }
      case 'cody_agent': return { endpoint: '/api/sahjony/agents/cody/search', body: { query: taskInput } }
      case 'planning_agent': return { endpoint: '/api/sahjony/agents/planning/execute', body: { task: taskInput } }
      case 'tool_agent': return { endpoint: '/api/sahjony/agents/tool/execute', body: { command: taskInput } }
      default: return { endpoint: '/api/sahjony/agents/execute', body: { task: taskInput, task_type: selectedAgent } }
    }
  }

  const handleExecute = async () => {
    if (!taskInput.trim()) return

    setIsExecuting(true)
    setResult(null)
    setError(null)

    try {
      // Get auth token from localStorage
      const token = localStorage.getItem('sb-access-token')
      if (!token) {
        setError('Please log in to use the Agent Playground')
        setIsExecuting(false)
        return
      }

      const { endpoint, body } = getEndpoint()

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Request failed: ${response.status}`)
      }

      const data = await response.json()
      setResult(data.result || data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute task')
    } finally {
      setIsExecuting(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleExecute()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-rose-500 to-pink-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SAHJONY Agent Playground</h1>
              <p className="text-sm text-slate-400">Interact with advanced AI coding agents</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Agent Selector Panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4">
                Select Agent
              </h2>
              <div className="space-y-2">
                {SAHJONY_AGENTS.map((a) => {
                  const Icon = a.icon
                  return (
                    <button
                      key={a.id}
                      onClick={() => setSelectedAgent(a.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                        selectedAgent === a.id
                          ? 'bg-slate-700/70 ring-1 ring-slate-500/50'
                          : 'hover:bg-slate-700/30'
                      }`}
                    >
                      <div className={`p-2 rounded-lg bg-gradient-to-br ${a.color}`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-medium text-slate-200">{a.name}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Capabilities Toggle */}
            <button
              onClick={() => setShowCapabilities(!showCapabilities)}
              className="w-full flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 hover:border-slate-600/50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-300">Agent Capabilities</span>
              <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${showCapabilities ? 'rotate-90' : ''}`} />
            </button>

            {showCapabilities && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-br ${agent.color}`}>
                    <AgentIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{agent.name}</h3>
                    <p className="text-xs text-slate-400">{agent.description}</p>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-2">Keywords</p>
                  <div className="flex flex-wrap gap-1">
                    {agent.keywords.map(kw => (
                      <span key={kw} className="px-2 py-0.5 bg-slate-700/50 rounded text-xs text-slate-300">{kw}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-400 mb-2">Capabilities</p>
                  <ul className="space-y-1">
                    {agent.capabilities.map(cap => (
                      <li key={cap} className="text-xs text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3 h-3 text-green-400" />
                        {cap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Main Workspace */}
          <div className="lg:col-span-3 space-y-6">
            {/* Task Input */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${agent.color}`}>
                  <AgentIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">{agent.name}</h2>
                  <p className="text-sm text-slate-400">{agent.description}</p>
                </div>
              </div>

              <div className="relative">
                <textarea
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={`Describe your task for ${agent.name}...`}
                  className="w-full h-32 bg-slate-900/50 border border-slate-600/50 rounded-lg p-4 text-white placeholder-slate-500 resize-none focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500/50 transition-all"
                />
                <div className="absolute bottom-3 right-3 flex items-center gap-2">
                  <span className="text-xs text-slate-500">{taskInput.length} chars</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Press <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 bg-slate-700 rounded text-slate-300">Enter</kbd> to execute
                </p>
                <button
                  onClick={handleExecute}
                  disabled={isExecuting || !taskInput.trim()}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-medium rounded-lg hover:from-rose-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg shadow-rose-500/25"
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Executing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Execute Task
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-5 flex items-start gap-4">
                <XCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-300">Execution Error</h3>
                  <p className="text-sm text-red-200/70 mt-1">{error}</p>
                </div>
              </div>
            )}

            {/* Results Display */}
            {result && (
              <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    Execution Result
                  </h3>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-slate-400">
                      Agent: <span className="text-slate-300">{result.agent_used}</span>
                    </span>
                    <span className="text-slate-400">
                      Confidence: <span className="text-green-400">{Math.round(result.confidence * 100)}%</span>
                    </span>
                  </div>
                </div>

                {/* Response Content */}
                <div className="bg-slate-900/50 rounded-lg p-5 border border-slate-700/30">
                  <pre className="text-sm text-slate-300 whitespace-pre-wrap font-mono leading-relaxed">
                    {result.result}
                  </pre>
                </div>

                {/* Tools Used */}
                {result.tools_used && result.tools_used.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-3">Tools Used</h4>
                    <div className="flex flex-wrap gap-2">
                      {result.tools_used.map((tool, i) => (
                        <span key={i} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-xs text-blue-300">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tool Calls Detail */}
                {result.tool_calls && result.tool_calls.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-3">Tool Executions</h4>
                    <div className="space-y-3">
                      {result.tool_calls.map((tc, i) => {
                        const argsStr = JSON.stringify(tc.args)
                        return (
                        <div key={i} className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/30">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-mono text-sm text-cyan-400">{tc.name}</span>
                            {tc.duration_ms && (
                              <span className="text-xs text-slate-500">{tc.duration_ms.toFixed(1)}ms</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mb-2">
                            Args: <span className="text-slate-300 font-mono">{argsStr}</span>
                          </div>
                          {tc.error ? (
                            <div className="text-xs text-red-400">Error: {String(tc.error)}</div>
                          ) : (
                            <div className="text-xs text-green-400">Success</div>
                          )}
                        </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!result && !error && !isExecuting && (
              <div className="bg-slate-800/30 rounded-xl border border-slate-700/30 p-12 text-center">
                <div className="inline-flex p-4 bg-slate-700/30 rounded-full mb-4">
                  <Sparkles className="w-8 h-8 text-slate-500" />
                </div>
                <h3 className="text-lg font-medium text-slate-400 mb-2">Ready to execute</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto">
                  Select an agent, describe your task, and click Execute to see the power of SAHJONY's advanced agents.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}