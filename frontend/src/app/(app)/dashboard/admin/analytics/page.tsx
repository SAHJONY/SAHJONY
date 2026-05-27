'use client'

import { useEffect, useState } from 'react'
import {
  BarChart3,
  TrendingUp,
  Activity,
  Users,
  Bot,
  Zap,
  Clock,
  ArrowUpRight,
  Calendar,
  Download,
  Filter
} from 'lucide-react'

interface PlatformMetrics {
  apiRequests: { total: number; successful: number; failed: number; avgLatency: number }
  users: { active: number; newSignups: number; churned: number }
  agents: { totalInvocations: number; avgResponseTime: number; successRate: number }
  tokens: { used: number; cost: number }
}

interface TimeSeriesPoint {
  timestamp: string
  requests: number
  users: number
}

interface ProviderAnalytics {
  provider: string
  model: string
  totalRequests: number
  totalTokens: number
  totalCost: number
  avgLatency: number
  errorRate: number
}

export default function AdminAnalyticsPage() {
  const [metrics, setMetrics] = useState<PlatformMetrics>({
    apiRequests: { total: 4523, successful: 4489, failed: 34, avgLatency: 145 },
    users: { active: 43, newSignups: 8, churned: 2 },
    agents: { totalInvocations: 8934, avgResponseTime: 234, successRate: 98.2 },
    tokens: { used: 234567890, cost: 1245.67 }
  })
  const [timeSeries, setTimeSeries] = useState<TimeSeriesPoint[]>([
    { timestamp: '2025-01-26T00:00:00Z', requests: 523, users: 12 },
    { timestamp: '2025-01-26T04:00:00Z', requests: 234, users: 8 },
    { timestamp: '2025-01-26T08:00:00Z', requests: 1245, users: 35 },
    { timestamp: '2025-01-26T12:00:00Z', requests: 1567, users: 42 },
    { timestamp: '2025-01-26T16:00:00Z', requests: 954, users: 38 }
  ])
  const [providers, setProviders] = useState<ProviderAnalytics[]>([
    { provider: 'Anthropic', model: 'claude-3-5-sonnet-20241022', totalRequests: 5678, totalTokens: 123456789, totalCost: 3456.78, avgLatency: 234, errorRate: 0.5 },
    { provider: 'OpenAI', model: 'gpt-4o', totalRequests: 3456, totalTokens: 98765432, totalCost: 2345.67, avgLatency: 189, errorRate: 0.3 },
    { provider: 'Google', model: 'gemini-pro', totalRequests: 1234, totalTokens: 45678901, totalCost: 1234.56, avgLatency: 156, errorRate: 0.8 }
  ])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7d')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    setLoading(true)
    await new Promise(resolve => setTimeout(resolve, 300))
    setLoading(false)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Platform Analytics</h1>
          <p className="text-slate-400 mt-1">Deep insights into platform performance and usage</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total API Requests"
          value={formatNumber(metrics.apiRequests.total)}
          change="+15.3%"
          icon={Zap}
          color="indigo"
        />
        <MetricCard
          title="Active Users"
          value={metrics.users.active.toString()}
          change="+8.2%"
          icon={Users}
          color="green"
        />
        <MetricCard
          title="Agent Invocations"
          value={formatNumber(metrics.agents.totalInvocations)}
          change="+23.5%"
          icon={Bot}
          color="purple"
        />
        <MetricCard
          title="Tokens Used"
          value={formatNumber(metrics.tokens.used)}
          change="+18.7%"
          icon={Activity}
          color="cyan"
        />
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* API Performance */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            API Performance
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Success Rate</p>
                <p className="text-3xl font-bold text-green-400">
                  {((metrics.apiRequests.successful / metrics.apiRequests.total) * 100).toFixed(1)}%
                </p>
              </div>
              <div className="w-32 h-32 relative">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#1e293b" strokeWidth="12" />
                  <circle
                    cx="64" cy="64" r="56" fill="none"
                    stroke="#22c55e" strokeWidth="12"
                    strokeDasharray={`${((metrics.apiRequests.successful / metrics.apiRequests.total) * 351.86)} 351.86`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                <p className="text-2xl font-bold text-white">{formatNumber(metrics.apiRequests.successful)}</p>
                <p className="text-green-400 text-sm">Successful</p>
              </div>
              <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                <p className="text-2xl font-bold text-white">{formatNumber(metrics.apiRequests.failed)}</p>
                <p className="text-rose-400 text-sm">Failed</p>
              </div>
              <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                <p className="text-2xl font-bold text-white">{metrics.apiRequests.avgLatency}ms</p>
                <p className="text-amber-400 text-sm">Avg Latency</p>
              </div>
            </div>
          </div>
        </div>

        {/* Agent Performance */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
            <Bot className="w-5 h-5 text-purple-400" />
            Agent Performance
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Success Rate</p>
                <p className="text-3xl font-bold text-green-400">{metrics.agents.successRate}%</p>
              </div>
              <div className="w-32 h-32 relative">
                <svg className="w-full h-full -rotate-90">
                  <circle cx="64" cy="64" r="56" fill="none" stroke="#1e293b" strokeWidth="12" />
                  <circle
                    cx="64" cy="64" r="56" fill="none"
                    stroke="#a855f7" strokeWidth="12"
                    strokeDasharray={`${(metrics.agents.successRate / 100) * 351.86} 351.86`}
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                <p className="text-2xl font-bold text-white">{formatNumber(metrics.agents.totalInvocations)}</p>
                <p className="text-purple-400 text-sm">Total Invocations</p>
              </div>
              <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                <p className="text-2xl font-bold text-white">{metrics.agents.avgResponseTime}ms</p>
                <p className="text-amber-400 text-sm">Avg Response Time</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Series Chart */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-400" />
          Activity Over Time
        </h3>
        <div className="h-64 flex items-end gap-2">
          {timeSeries.map((point, i) => {
            const maxRequests = Math.max(...timeSeries.map(p => p.requests))
            const height = (point.requests / maxRequests) * 100
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-indigo-500 to-purple-500 rounded-t-lg transition-all hover:from-indigo-400 hover:to-purple-400"
                  style={{ height: `${height}%`, minHeight: '20px' }}
                />
                <span className="text-slate-400 text-xs">
                  {new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )
          })}
        </div>
        <div className="flex items-center justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-indigo-500 rounded" />
            <span className="text-slate-400 text-sm">API Requests</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded" />
            <span className="text-slate-400 text-sm">Active Users</span>
          </div>
        </div>
      </div>

      {/* AI Provider Breakdown */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-cyan-400" />
          AI Provider Performance
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Provider</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Model</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Requests</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Tokens</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Cost</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Latency</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Error Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {providers.map((provider, i) => (
                <tr key={i} className="hover:bg-slate-700/30">
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded text-sm font-medium">
                      {provider.provider}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-slate-400 text-sm">{provider.model}</td>
                  <td className="px-4 py-4 text-white font-medium text-right">{formatNumber(provider.totalRequests)}</td>
                  <td className="px-4 py-4 text-white font-medium text-right">{formatNumber(provider.totalTokens)}</td>
                  <td className="px-4 py-4 text-green-400 font-medium text-right">${provider.totalCost.toFixed(2)}</td>
                  <td className="px-4 py-4 text-amber-400 font-medium text-right">{provider.avgLatency}ms</td>
                  <td className="px-4 py-4 text-right">
                    <span className={`px-2 py-1 rounded text-sm ${
                      provider.errorRate < 1 ? 'bg-green-500/20 text-green-400' :
                      provider.errorRate < 2 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-rose-500/20 text-rose-400'
                    }`}>
                      {provider.errorRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  change,
  icon: Icon,
  color
}: {
  title: string
  value: string
  change: string
  icon: any
  color: string
}) {
  const colors = {
    indigo: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/20',
    green: 'from-green-500/10 to-green-600/5 border-green-500/20',
    purple: 'from-purple-500/10 to-purple-600/5 border-purple-500/20',
    cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20'
  }
  const iconColors = {
    indigo: 'text-indigo-400',
    green: 'text-green-400',
    purple: 'text-purple-400',
    cyan: 'text-cyan-400'
  }

  return (
    <div className={`bg-gradient-to-br ${colors[color as keyof typeof colors]} border rounded-xl p-6`}>
      <div className="flex items-center justify-between mb-4">
        <Icon className={`w-6 h-6 ${iconColors[color as keyof typeof iconColors]}`} />
        <span className="flex items-center gap-1 text-green-400 text-sm">
          <ArrowUpRight className="w-4 h-4" />
          {change}
        </span>
      </div>
      <h3 className="text-slate-400 text-sm">{title}</h3>
      <p className="text-3xl font-bold text-white mt-1">{value}</p>
    </div>
  )
}