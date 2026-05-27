'use client'

import { useState } from 'react'
import {
  FileText,
  Search,
  Filter,
  Download,
  ChevronDown,
  User,
  Bot,
  CreditCard,
  Settings,
  Trash2,
  Edit,
  Plus,
  Key,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface AuditLog {
  id: string
  timestamp: string
  user_id: string
  user_email: string
  action: string
  resource: string
  details: Record<string, any>
  ip_address: string
}

const actionIcons: Record<string, any> = {
  'user': User,
  'agent': Bot,
  'billing': CreditCard,
  'settings': Settings,
  'api_key': Key,
  'delete': Trash2,
  'create': Plus,
  'update': Edit
}

const actionColors: Record<string, string> = {
  'user.created': 'bg-green-500',
  'user.deleted': 'bg-rose-500',
  'agent.created': 'bg-indigo-500',
  'agent.deleted': 'bg-purple-500',
  'settings.updated': 'bg-amber-500',
  'billing.transaction': 'bg-cyan-500',
  'default': 'bg-slate-500'
}

export default function AdminAuditPage() {
  const [logs] = useState<AuditLog[]>([
    { id: 'log_001', timestamp: '2025-01-26T14:32:00Z', user_id: 'user_001', user_email: 'sarah.chen@techcorp.com', action: 'agent.created', resource: 'agent_abc123', details: { agent_name: 'Code Assistant' }, ip_address: '192.168.1.100' },
    { id: 'log_002', timestamp: '2025-01-26T12:15:00Z', user_id: 'user_002', user_email: 'marcus.johnson@enterprise.io', action: 'settings.updated', resource: 'platform', details: { setting: 'max_agents_per_user', old_value: 5, new_value: 10 }, ip_address: '192.168.1.101' },
    { id: 'log_003', timestamp: '2025-01-26T10:30:00Z', user_id: 'user_003', user_email: 'alex.rivera@startup.co', action: 'billing.transaction', resource: 'txn_xyz789', details: { amount: 99.99, type: 'subscription' }, ip_address: '192.168.1.102' },
    { id: 'log_004', timestamp: '2025-01-25T16:45:00Z', user_id: 'user_001', user_email: 'sarah.chen@techcorp.com', action: 'user.updated', resource: 'user_001', details: { field: 'display_name', old_value: 'Sarah', new_value: 'Sarah Chen' }, ip_address: '192.168.1.100' },
    { id: 'log_005', timestamp: '2025-01-25T14:20:00Z', user_id: 'user_004', user_email: 'emma.wilson@agency.com', action: 'api_key.created', resource: 'key_def456', details: { key_name: 'Production Key' }, ip_address: '192.168.1.103' },
    { id: 'log_006', timestamp: '2025-01-25T11:00:00Z', user_id: 'user_002', user_email: 'marcus.johnson@enterprise.io', action: 'agent.deleted', resource: 'agent_old123', details: { agent_name: 'Deprecated Bot' }, ip_address: '192.168.1.101' },
    { id: 'log_007', timestamp: '2025-01-24T09:15:00Z', user_id: 'admin', user_email: 'sahjonycapitalllc@outlook.com', action: 'settings.updated', resource: 'platform', details: { setting: 'maintenance_mode', old_value: false, new_value: true }, ip_address: '192.168.1.1' },
    { id: 'log_008', timestamp: '2025-01-23T15:30:00Z', user_id: 'user_005', user_email: 'david.kim@consulting.net', action: 'billing.transaction', resource: 'txn_abc123', details: { amount: -25.00, type: 'refund' }, ip_address: '192.168.1.104' }
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [expandedLog, setExpandedLog] = useState<string | null>(null)

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter)
    return matchesSearch && matchesAction
  })

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  const getActionColor = (action: string) => {
    for (const [key, color] of Object.entries(actionColors)) {
      if (action.includes(key)) return color
    }
    return actionColors['default']
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Audit Logs</h1>
          <p className="text-slate-400 mt-1">Track all admin actions and user activities</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          Export Logs
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by user or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Actions</option>
          <option value="user">User Actions</option>
          <option value="agent">Agent Actions</option>
          <option value="billing">Billing</option>
          <option value="settings">Settings</option>
          <option value="api_key">API Keys</option>
        </select>
      </div>

      {/* Logs List */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <div className="divide-y divide-slate-700">
          {filteredLogs.map((log) => {
            const IconComponent = Object.entries(actionIcons).find(([key]) => log.action.includes(key))?.[1] || FileText
            const color = getActionColor(log.action)
            const isExpanded = expandedLog === log.id

            return (
              <div key={log.id} className="p-4 hover:bg-slate-700/30 transition-colors">
                <div
                  className="flex items-center gap-4 cursor-pointer"
                  onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                >
                  <div className={`w-2 h-2 rounded-full ${color}`} />
                  <div className="w-10 h-10 bg-slate-700 rounded-full flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{log.action}</span>
                      <span className="text-slate-500 text-sm">on</span>
                      <code className="text-indigo-400 text-sm bg-slate-900 px-2 py-0.5 rounded">{log.resource}</code>
                    </div>
                    <p className="text-slate-400 text-sm">{log.user_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">{formatTimestamp(log.timestamp)}</p>
                    <p className="text-slate-500 text-xs">{log.ip_address}</p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </div>

                {isExpanded && (
                  <div className="mt-4 ml-14 p-4 bg-slate-900/50 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Details</h4>
                    <pre className="text-slate-400 text-sm overflow-x-auto">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-700">
                      <div>
                        <p className="text-slate-500 text-xs">User ID</p>
                        <p className="text-white text-sm">{log.user_id}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">Log ID</p>
                        <p className="text-white text-sm">{log.id}</p>
                      </div>
                      <div>
                        <p className="text-slate-500 text-xs">IP Address</p>
                        <p className="text-white text-sm">{log.ip_address}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {filteredLogs.length === 0 && (
        <div className="text-center py-12 text-slate-400">
          No audit logs found matching your criteria.
        </div>
      )}
    </div>
  )
}