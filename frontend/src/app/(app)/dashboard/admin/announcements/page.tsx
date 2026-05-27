'use client'

import { useState } from 'react'
import {
  Bell,
  Plus,
  Edit,
  Trash2,
  Send,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Users,
  X
} from 'lucide-react'

interface Announcement {
  id: string
  title: string
  message: string
  priority: 'low' | 'normal' | 'high' | 'critical'
  target_audience: string
  created_at: string
  expires_at: string | null
  created_by: string
}

interface SupportTicket {
  id: string
  customer_id: string
  customer_email: string
  subject: string
  description: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high'
  created_at: string
  assigned_to: string | null
  resolved_at: string | null
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([
    { id: 'ann_001', title: 'Platform Update v2.0', message: 'SAHJONY now supports advanced agentic workflows including Claude Code, Copilot, and Cody integration.', priority: 'high', target_audience: 'all', created_at: '2025-01-26T10:00:00Z', expires_at: '2025-02-26T00:00:00Z', created_by: 'sahjonycapitalllc@outlook.com' },
    { id: 'ann_002', title: 'Scheduled Maintenance', message: 'System maintenance scheduled for Jan 28, 2025 at 2:00 AM UTC. Expected downtime: 30 minutes.', priority: 'normal', target_audience: 'all', created_at: '2025-01-25T14:00:00Z', expires_at: '2025-01-28T06:00:00Z', created_by: 'sahjonycapitalllc@outlook.com' },
    { id: 'ann_003', title: 'New Pricing Plans', message: 'Check out our new pricing tiers with more features and better value.', priority: 'low', target_audience: 'all', created_at: '2025-01-20T09:00:00Z', expires_at: null, created_by: 'sahjonycapitalllc@outlook.com' }
  ])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'announcements' | 'support'>('announcements')

  const [tickets] = useState<SupportTicket[]>([
    { id: 'TICKET-0001', customer_id: 'user_001', customer_email: 'sarah.chen@techcorp.com', subject: 'API rate limiting issue', description: 'Getting 429 errors when making API calls', status: 'open', priority: 'high', created_at: '2025-01-26T10:30:00Z', assigned_to: null, resolved_at: null },
    { id: 'TICKET-0002', customer_id: 'user_002', customer_email: 'marcus.johnson@enterprise.io', subject: 'Billing question', description: 'How do I upgrade my subscription?', status: 'resolved', priority: 'low', created_at: '2025-01-24T14:00:00Z', assigned_to: 'sahjonycapitalllc@outlook.com', resolved_at: '2025-01-25T09:00:00Z' },
    { id: 'TICKET-0003', customer_id: 'user_003', customer_email: 'alex.rivera@startup.co', subject: 'Agent not responding', description: 'My AI agent stopped responding to messages', status: 'in_progress', priority: 'medium', created_at: '2025-01-25T16:00:00Z', assigned_to: 'sahjonycapitalllc@outlook.com', resolved_at: null }
  ])

  const priorityColors = {
    low: 'bg-slate-500/20 text-slate-400',
    normal: 'bg-blue-500/20 text-blue-400',
    high: 'bg-amber-500/20 text-amber-400',
    critical: 'bg-rose-500/20 text-rose-400'
  }

  const statusColors = {
    open: 'bg-amber-500/20 text-amber-400',
    in_progress: 'bg-blue-500/20 text-blue-400',
    resolved: 'bg-green-500/20 text-green-400',
    closed: 'bg-slate-500/20 text-slate-400'
  }

  const handleDeleteAnnouncement = (id: string) => {
    if (confirm('Are you sure you want to delete this announcement?')) {
      setAnnouncements(prev => prev.filter(a => a.id !== id))
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Communications</h1>
          <p className="text-slate-400 mt-1">Manage announcements and support tickets</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Announcement
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'announcements'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          Announcements ({announcements.length})
        </button>
        <button
          onClick={() => setActiveTab('support')}
          className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'support'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Support Tickets ({tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length})
        </button>
      </div>

      {/* Content based on tab */}
      {activeTab === 'announcements' && (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <div key={ann.id} className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    ann.priority === 'critical' ? 'bg-rose-500/20' :
                    ann.priority === 'high' ? 'bg-amber-500/20' :
                    ann.priority === 'normal' ? 'bg-blue-500/20' :
                    'bg-slate-500/20'
                  }`}>
                    <Bell className={`w-5 h-5 ${
                      ann.priority === 'critical' ? 'text-rose-400' :
                      ann.priority === 'high' ? 'text-amber-400' :
                      ann.priority === 'normal' ? 'text-blue-400' :
                      'text-slate-400'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-white font-semibold">{ann.title}</h3>
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${priorityColors[ann.priority]}`}>
                        {ann.priority}
                      </span>
                    </div>
                    <p className="text-slate-400 mb-3">{ann.message}</p>
                    <div className="flex items-center gap-4 text-sm text-slate-500">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {ann.target_audience === 'all' ? 'All Users' : ann.target_audience}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {ann.expires_at ? `Expires ${new Date(ann.expires_at).toLocaleDateString()}` : 'No expiration'}
                      </span>
                      <span>Created by {ann.created_by}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                    className="p-2 hover:bg-rose-500/10 rounded-lg text-slate-400 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'support' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Ticket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Assigned To</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Created</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-slate-700/30">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{ticket.id}</p>
                      <p className="text-slate-400 text-sm">{ticket.subject}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{ticket.customer_email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit ${
                      statusColors[ticket.status]
                    }`}>
                      {ticket.status === 'resolved' ? <CheckCircle className="w-3 h-3" /> :
                       ticket.status === 'closed' ? <XCircle className="w-3 h-3" /> :
                       ticket.status === 'in_progress' ? <Clock className="w-3 h-3" /> : null}
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400">
                    {ticket.assigned_to || 'Unassigned'}
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(ticket.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="px-3 py-1 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-lg text-sm">
                        Respond
                      </button>
                      <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white">
                        <Edit className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-lg">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Create Announcement</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Title</label>
                <input
                  type="text"
                  placeholder="Announcement title"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Message</label>
                <textarea
                  rows={4}
                  placeholder="Announcement message"
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-white font-medium mb-2">Priority</label>
                  <select className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Target Audience</label>
                  <select className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white">
                    <option value="all">All Users</option>
                    <option value="admins">Admins Only</option>
                    <option value="users">Users Only</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex items-center justify-end gap-3">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg"
              >
                Cancel
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg">
                <Send className="w-4 h-4" />
                Send Announcement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}