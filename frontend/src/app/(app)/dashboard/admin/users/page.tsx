'use client'

import { useEffect, useState } from 'react'
import {
  Users,
  Search,
  Filter,
  Plus,
  MoreVertical,
  ChevronRight,
  Mail,
  Shield,
  Trash2,
  Edit,
  Eye,
  Bot,
  MessageSquare,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ChevronLeft,
  X
} from 'lucide-react'

const ADMIN_EMAIL = 'sahjonycapitalllc@outlook.com'

interface User {
  id: string
  email: string
  display_name: string
  role: string
  is_active: boolean
  created_at: string
  agents_count: number
  conversations_count: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [currentPage, searchQuery, selectedRole])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mock users data
      const mockUsers: User[] = [
        { id: 'user_001', email: 'sarah.chen@techcorp.com', display_name: 'Sarah Chen', role: 'user', is_active: true, created_at: '2025-01-15T10:30:00Z', agents_count: 5, conversations_count: 34 },
        { id: 'user_002', email: 'marcus.johnson@enterprise.io', display_name: 'Marcus Johnson', role: 'admin', is_active: true, created_at: '2025-01-10T08:15:00Z', agents_count: 12, conversations_count: 156 },
        { id: 'user_003', email: 'alex.rivera@startup.co', display_name: 'Alex Rivera', role: 'user', is_active: true, created_at: '2025-01-20T14:45:00Z', agents_count: 3, conversations_count: 18 },
        { id: 'user_004', email: 'emma.wilson@agency.com', display_name: 'Emma Wilson', role: 'user', is_active: false, created_at: '2025-01-05T09:00:00Z', agents_count: 8, conversations_count: 67 },
        { id: 'user_005', email: 'david.kim@consulting.net', display_name: 'David Kim', role: 'moderator', is_active: true, created_at: '2025-01-12T11:20:00Z', agents_count: 6, conversations_count: 45 },
        { id: 'user_006', email: 'lisa.martinez@design.io', display_name: 'Lisa Martinez', role: 'user', is_active: true, created_at: '2025-01-18T16:30:00Z', agents_count: 2, conversations_count: 12 },
        { id: 'user_007', email: 'james.taylor@finance.com', display_name: 'James Taylor', role: 'user', is_active: true, created_at: '2025-01-22T13:00:00Z', agents_count: 4, conversations_count: 28 },
        { id: 'user_008', email: 'anna.brown@health.org', display_name: 'Anna Brown', role: 'user', is_active: true, created_at: '2025-01-08T07:45:00Z', agents_count: 7, conversations_count: 52 }
      ]
      
      setUsers(mockUsers)
      setTotalPages(3)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.display_name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === 'all' || user.role === selectedRole
    return matchesSearch && matchesRole
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">User Management</h1>
          <p className="text-slate-400 mt-1">Manage all platform users and permissions</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          Add User
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-white">127</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Admins</p>
              <p className="text-2xl font-bold text-white">3</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Active Today</p>
              <p className="text-2xl font-bold text-white">43</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <X className="w-5 h-5 text-rose-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Inactive</p>
              <p className="text-2xl font-bold text-white">12</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by email or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Roles</option>
          <option value="super_admin">Super Admin</option>
          <option value="admin">Admin</option>
          <option value="moderator">Moderator</option>
          <option value="user">User</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Agents</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Conversations</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto" />
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                  No users found matching your criteria.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {user.display_name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-white font-medium">{user.display_name}</p>
                        <p className="text-slate-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      user.role === 'super_admin' ? 'bg-rose-500/20 text-rose-400' :
                      user.role === 'admin' ? 'bg-purple-500/20 text-purple-400' :
                      user.role === 'moderator' ? 'bg-amber-500/20 text-amber-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {user.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 ${
                      user.is_active ? 'text-green-400' : 'text-slate-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-400' : 'bg-slate-500'}`} />
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{user.agents_count}</td>
                  <td className="px-6 py-4 text-slate-300">{user.conversations_count}</td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                        title="Edit User"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors text-slate-400 hover:text-rose-400"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-slate-400 text-sm">
          Showing {filteredUsers.length} of 127 users
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">User Details</h2>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-semibold">
                  {selectedUser.display_name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">{selectedUser.display_name}</h3>
                  <p className="text-slate-400">{selectedUser.email}</p>
                  <span className={`inline-flex items-center gap-2 px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                    selectedUser.is_active ? 'bg-green-500/20 text-green-400' : 'bg-slate-500/20 text-slate-400'
                  }`}>
                    <div className={`w-2 h-2 rounded-full ${selectedUser.is_active ? 'bg-green-400' : 'bg-slate-500'}`} />
                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-400 text-sm">Role</p>
                  <p className="text-white font-medium capitalize">{selectedUser.role.replace('_', ' ')}</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-400 text-sm">User ID</p>
                  <p className="text-white font-medium text-sm">{selectedUser.id}</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-400 text-sm">Created</p>
                  <p className="text-white font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
                <div className="p-4 bg-slate-900/50 rounded-lg">
                  <p className="text-slate-400 text-sm">Last Active</p>
                  <p className="text-white font-medium">Today at 2:34 PM</p>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3">Usage Statistics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <Bot className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{selectedUser.agents_count}</p>
                    <p className="text-slate-400 text-sm">Agents</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <MessageSquare className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">{selectedUser.conversations_count}</p>
                    <p className="text-slate-400 text-sm">Conversations</p>
                  </div>
                  <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <Calendar className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-white">23</p>
                    <p className="text-slate-400 text-sm">Days Active</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-white font-medium mb-3">Quick Actions</h4>
                <div className="flex gap-3">
                  <button className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors">
                    <Edit className="w-4 h-4" />
                    Edit User
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
                    <Mail className="w-4 h-4" />
                    Send Email
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}