'use client'

import { useState } from 'react'
import {
  Key,
  Plus,
  Trash2,
  Copy,
  Eye,
  EyeOff,
  Search,
  Filter,
  MoreVertical,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface ApiKey {
  id: string
  user_id: string
  user_email: string
  name: string
  key_preview: string
  last_used_at: string
  expires_at: string | null
  created_at: string
}

export default function AdminApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([
    { id: 'key_001', user_id: 'user_001', user_email: 'sarah.chen@techcorp.com', name: 'Production API Key', key_preview: 'hsa_abc123...', last_used_at: '2025-01-26T14:30:00Z', expires_at: null, created_at: '2025-01-15T10:00:00Z' },
    { id: 'key_002', user_id: 'user_002', user_email: 'marcus.johnson@enterprise.io', name: 'Dev Key', key_preview: 'hsa_def456...', last_used_at: '2025-01-25T09:15:00Z', expires_at: '2025-03-15T00:00:00Z', created_at: '2025-01-10T08:00:00Z' },
    { id: 'key_003', user_id: 'user_003', user_email: 'alex.rivera@startup.co', name: 'Testing Key', key_preview: 'hsa_ghi789...', last_used_at: '2025-01-20T16:45:00Z', expires_at: '2025-02-01T00:00:00Z', created_at: '2025-01-18T14:00:00Z' },
    { id: 'key_004', user_id: 'user_001', user_email: 'sarah.chen@techcorp.com', name: 'Legacy Key', key_preview: 'hsa_jkl012...', last_used_at: null, expires_at: '2025-01-01T00:00:00Z', created_at: '2024-12-01T12:00:00Z' }
  ])
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)

  const filteredKeys = keys.filter(key =>
    key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.user_email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleRevoke = (keyId: string) => {
    if (confirm('Are you sure you want to revoke this API key?')) {
      setKeys(prev => prev.filter(k => k.id !== keyId))
    }
  }

  const handleCopy = (keyPreview: string) => {
    navigator.clipboard.writeText(keyPreview)
    alert('Key preview copied to clipboard')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">API Key Management</h1>
          <p className="text-slate-400 mt-1">View and manage all platform API keys</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Generate New Key
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Total Keys</p>
          <p className="text-2xl font-bold text-white mt-1">{keys.length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Active Keys</p>
          <p className="text-2xl font-bold text-green-400 mt-1">{keys.filter(k => !k.expires_at || new Date(k.expires_at) > new Date()).length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Expired Keys</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{keys.filter(k => k.expires_at && new Date(k.expires_at) < new Date()).length}</p>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <p className="text-slate-400 text-sm">Used Today</p>
          <p className="text-2xl font-bold text-indigo-400 mt-1">{keys.filter(k => k.last_used_at && new Date(k.last_used_at).toDateString() === new Date().toDateString()).length}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search API keys..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Keys Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Key Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Owner</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Preview</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Last Used</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Expires</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {filteredKeys.map((key) => {
              const isExpired = key.expires_at && new Date(key.expires_at) < new Date()
              const isActive = !isExpired
              return (
                <tr key={key.id} className="hover:bg-slate-700/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Key className="w-4 h-4 text-slate-400" />
                      <span className="text-white font-medium">{key.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{key.user_email}</td>
                  <td className="px-6 py-4">
                    <code className="text-sm bg-slate-900 px-2 py-1 rounded text-slate-400">{key.key_preview}</code>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 ${isActive ? 'text-green-400' : 'text-slate-400'}`}>
                      {isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      {isActive ? 'Active' : 'Expired'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {key.expires_at ? new Date(key.expires_at).toLocaleDateString() : 'Never'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleCopy(key.key_preview)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                        title="Copy Preview"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleRevoke(key.id)}
                        className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors text-slate-400 hover:text-rose-400"
                        title="Revoke Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}