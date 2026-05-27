'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Bot,
  MessageSquare,
  Activity,
  DollarSign,
  Server,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Globe,
  Zap,
  Eye,
  Settings,
  CreditCard,
  Key,
  FileText,
  Bell,
  Search,
  Filter,
  Plus,
  MoreVertical,
  ChevronRight,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen
} from 'lucide-react'

// SAHJONY Admin credentials
const ADMIN_EMAIL = 'sahjonycapitalllc@outlook.com'
const ADMIN_PASSWORD = 'Primelles208#'

interface DashboardStats {
  totalUsers: number
  activeUsers24h: number
  totalAgents: number
  totalConversations: number
  totalMessages: number
  apiCallsToday: number
  monthlyRecurring: number
  totalRevenue: number
  activeSubscriptions: number
}

interface SystemHealth {
  apiLatency: number
  databaseLatency: number
  memoryUsage: number
  cpuUsage: number
  diskUsage: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 127,
    activeUsers24h: 43,
    totalAgents: 284,
    totalConversations: 1523,
    totalMessages: 28457,
    apiCallsToday: 4523,
    monthlyRecurring: 2499.99,
    totalRevenue: 18499.92,
    activeSubscriptions: 12
  })
  const [health, setHealth] = useState<SystemHealth>({
    apiLatency: 45,
    databaseLatency: 12,
    memoryUsage: 67,
    cpuUsage: 23,
    diskUsage: 45
  })
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLogin, setShowLogin] = useState(true)

  useEffect(() => {
    // Check if already logged in as admin
    const adminSession = localStorage.getItem('sahjony_admin_session')
    if (adminSession === 'authenticated') {
      setIsAdmin(true)
      setShowLogin(false)
      fetchDashboardData()
    } else {
      setLoading(false)
    }
  }, [])

  const handleAdminLogin = async (email: string, password: string) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem('sahjony_admin_session', 'authenticated')
      setIsAdmin(true)
      setShowLogin(false)
      fetchDashboardData()
    } else {
      alert('Invalid admin credentials')
    }
  }

  const fetchDashboardData = async () => {
    try {
      // In production, this would call the actual API
      // const response = await fetch(`/api/admin/dashboard/overview?token=${ADMIN_EMAIL}`)
      // const data = await response.json()
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setStats({
        totalUsers: 127,
        activeUsers24h: 43,
        totalAgents: 284,
        totalConversations: 1523,
        totalMessages: 28457,
        apiCallsToday: 4523,
        monthlyRecurring: 2499.99,
        totalRevenue: 18499.92,
        activeSubscriptions: 12
      })
      setHealth({
        apiLatency: 45,
        databaseLatency: 12,
        memoryUsage: 67,
        cpuUsage: 23,
        diskUsage: 45
      })
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4" />
          <p className="text-slate-400">Loading SAHJONY Admin Dashboard...</p>
        </div>
      </div>
    )
  }

  if (showLogin || !isAdmin) {
    return <AdminLogin onLogin={handleAdminLogin} />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">SAHJONY Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Complete platform control center</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-green-400 text-sm font-medium">System Operational</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="text-indigo-400 text-sm">{ADMIN_EMAIL}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change="+12%"
          trend="up"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Users (24h)"
          value={stats.activeUsers24h.toString()}
          change="+8%"
          trend="up"
          icon={Activity}
          color="green"
        />
        <StatCard
          title="Total Agents"
          value={stats.totalAgents.toLocaleString()}
          change="+23"
          trend="up"
          icon={Bot}
          color="purple"
        />
        <StatCard
          title="API Calls Today"
          value={stats.apiCallsToday.toLocaleString()}
          change="+15%"
          trend="up"
          icon={Zap}
          color="amber"
        />
      </div>

      {/* Revenue & Conversations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Revenue Overview
            </h2>
            <button className="text-sm text-indigo-400 hover:text-indigo-300">View Reports</button>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
              <div>
                <p className="text-slate-400 text-sm">Monthly Recurring</p>
                <p className="text-2xl font-bold text-white">${stats.monthlyRecurring.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
              <div>
                <p className="text-slate-400 text-sm">Total Revenue</p>
                <p className="text-2xl font-bold text-white">${stats.totalRevenue.toLocaleString()}</p>
              </div>
              <BarChart3 className="w-6 h-6 text-indigo-400" />
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
              <div>
                <p className="text-slate-400 text-sm">Active Subscriptions</p>
                <p className="text-2xl font-bold text-white">{stats.activeSubscriptions}</p>
              </div>
              <CreditCard className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-400" />
              Conversations & Messages
            </h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
              <div>
                <p className="text-slate-400 text-sm">Total Conversations</p>
                <p className="text-2xl font-bold text-white">{stats.totalConversations.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-green-400 text-sm">+156 today</p>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
              <div>
                <p className="text-slate-400 text-sm">Total Messages</p>
                <p className="text-2xl font-bold text-white">{stats.totalMessages.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-indigo-400 text-sm">Avg 18/user</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Server className="w-5 h-5 text-cyan-400" />
            System Health
          </h2>
          <span className="text-xs text-slate-400">Last updated: just now</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <HealthMetric
            label="API Latency"
            value={`${health.apiLatency}ms`}
            status={health.apiLatency < 100 ? 'good' : 'warning'}
          />
          <HealthMetric
            label="Database"
            value={`${health.databaseLatency}ms`}
            status={health.databaseLatency < 50 ? 'good' : 'warning'}
          />
          <HealthMetric
            label="Memory"
            value={`${health.memoryUsage}%`}
            status={health.memoryUsage < 80 ? 'good' : 'critical'}
          />
          <HealthMetric
            label="CPU"
            value={`${health.cpuUsage}%`}
            status={health.cpuUsage < 70 ? 'good' : 'warning'}
          />
          <HealthMetric
            label="Disk"
            value={`${health.diskUsage}%`}
            status={health.diskUsage < 85 ? 'good' : 'critical'}
          />
        </div>
      </div>

      {/* Admin Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <AdminActionCard
          title="User Management"
          description="Manage all platform users"
          icon={Users}
          href="/dashboard/admin/users"
          color="blue"
        />
        <AdminActionCard
          title="Financial Reports"
          description="View billing & revenue"
          icon={DollarSign}
          href="/dashboard/admin/billing"
          color="green"
        />
        <AdminActionCard
          title="Platform Settings"
          description="Configure system settings"
          icon={Settings}
          href="/dashboard/admin/settings"
          color="purple"
        />
        <AdminActionCard
          title="System Analytics"
          description="View detailed metrics"
          icon={BarChart3}
          href="/dashboard/admin/analytics"
          color="amber"
        />
        <AdminActionCard
          title="API Keys"
          description="Manage platform API keys"
          icon={Key}
          href="/dashboard/admin/api-keys"
          color="cyan"
        />
        <AdminActionCard
          title="Audit Logs"
          description="Review admin actions"
          icon={FileText}
          href="/dashboard/admin/audit"
          color="slate"
        />
        <AdminActionCard
          title="Announcements"
          description="Send platform-wide notices"
          icon={Bell}
          href="/dashboard/admin/announcements"
          color="rose"
        />
        <AdminActionCard
          title="Support Tickets"
          description="View & manage tickets"
          icon={AlertTriangle}
          href="/dashboard/admin/support"
          color="orange"
        />
        <AdminActionCard
          title="Knowledge Base"
          description="Manage FAQ entries"
          icon={BookOpen}
          href="/dashboard/admin/knowledge-base"
          color="cyan"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Recent Activity
          </h2>
          <button className="text-sm text-indigo-400 hover:text-indigo-300">View All</button>
        </div>
        <div className="space-y-3">
          <ActivityItem
            action="New user registered"
            user="sarah.chen@techcorp.com"
            time="2 minutes ago"
            type="user"
          />
          <ActivityItem
            action="Subscription upgraded"
            user="marcus.johnson@enterprise.io"
            time="15 minutes ago"
            type="billing"
          />
          <ActivityItem
            action="New agent created"
            user="alex.rivera@startup.co"
            time="32 minutes ago"
            type="agent"
          />
          <ActivityItem
            action="API key generated"
            user="emma.wilson@agency.com"
            time="1 hour ago"
            type="api_key"
          />
          <ActivityItem
            action="Support ticket resolved"
            user="admin@sahjonycapitalllc@outlook.com"
            time="2 hours ago"
            type="support"
          />
        </div>
      </div>
    </div>
  )
}

// Login Component
function AdminLogin({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">SAHJONY Admin</h1>
          <p className="text-slate-400 mt-2">Sign in to access the admin dashboard</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sahjonycapitalllc@outlook.com"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <button
              onClick={() => onLogin(email, password)}
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all"
            >
              Sign In as Admin
            </button>
          </div>
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Full access to SAHJONY platform control
        </p>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color
}: {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: any
  color: string
}) {
  const colors = {
    blue: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    green: 'bg-green-500/10 text-green-400 border-green-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
  }

  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg border ${colors[color as keyof typeof colors]}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          {change}
        </div>
      </div>
      <h3 className="text-slate-400 text-sm">{title}</h3>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
    </div>
  )
}

// Health Metric Component
function HealthMetric({
  label,
  value,
  status
}: {
  label: string
  value: string
  status: 'good' | 'warning' | 'critical'
}) {
  const statusColors = {
    good: 'text-green-400',
    warning: 'text-amber-400',
    critical: 'text-red-400'
  }

  return (
    <div className="text-center p-4 bg-slate-900/50 rounded-lg">
      <p className={`text-2xl font-bold ${statusColors[status]}`}>{value}</p>
      <p className="text-slate-400 text-sm mt-1">{label}</p>
    </div>
  )
}

// Admin Action Card Component
function AdminActionCard({
  title,
  description,
  icon: Icon,
  href,
  color
}: {
  title: string
  description: string
  icon: any
  href: string
  color: string
}) {
  const colors = {
    blue: 'hover:bg-blue-500/10 border-blue-500/20 hover:border-blue-500/40',
    green: 'hover:bg-green-500/10 border-green-500/20 hover:border-green-500/40',
    purple: 'hover:bg-purple-500/10 border-purple-500/20 hover:border-purple-500/40',
    amber: 'hover:bg-amber-500/10 border-amber-500/20 hover:border-amber-500/40',
    cyan: 'hover:bg-cyan-500/10 border-cyan-500/20 hover:border-cyan-500/40',
    slate: 'hover:bg-slate-500/10 border-slate-500/20 hover:border-slate-500/40',
    rose: 'hover:bg-rose-500/10 border-rose-500/20 hover:border-rose-500/40',
    orange: 'hover:bg-orange-500/10 border-orange-500/20 hover:border-orange-500/40'
  }

  const iconColors = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    amber: 'text-amber-400',
    cyan: 'text-cyan-400',
    slate: 'text-slate-400',
    rose: 'text-rose-400',
    orange: 'text-orange-400'
  }

  return (
    <a
      href={href}
      className={`group bg-slate-800/50 border border-slate-700 rounded-xl p-5 transition-all ${colors[color as keyof typeof colors]}`}
    >
      <Icon className={`w-6 h-6 mb-3 ${iconColors[color as keyof typeof iconColors]}`} />
      <h3 className="font-semibold text-white group-hover:text-indigo-300 transition-colors">{title}</h3>
      <p className="text-slate-400 text-sm mt-1">{description}</p>
    </a>
  )
}

// Activity Item Component
function ActivityItem({
  action,
  user,
  time,
  type
}: {
  action: string
  user: string
  time: string
  type: string
}) {
  const typeColors: Record<string, string> = {
    user: 'bg-blue-500',
    billing: 'bg-green-500',
    agent: 'bg-purple-500',
    api_key: 'bg-cyan-500',
    support: 'bg-orange-500'
  }

  return (
    <div className="flex items-center gap-4 p-3 bg-slate-900/30 rounded-lg">
      <div className={`w-2 h-2 rounded-full ${typeColors[type] || 'bg-slate-500'}`} />
      <div className="flex-1">
        <p className="text-white text-sm">{action}</p>
        <p className="text-slate-400 text-xs">{user}</p>
      </div>
      <span className="text-slate-500 text-xs">{time}</span>
    </div>
  )
}