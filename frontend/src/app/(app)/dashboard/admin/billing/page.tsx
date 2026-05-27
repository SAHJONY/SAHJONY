'use client'

import { useEffect, useState } from 'react'
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Download,
  Search,
  Filter,
  Plus,
  ChevronDown,
  ArrowUpRight,
  PieChart,
  BarChart3,
  Calendar,
  Receipt,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface Transaction {
  id: string
  user_id: string
  user_email: string
  amount: number
  currency: string
  type: string
  description: string
  status: string
  created_at: string
}

interface BillingSummary {
  totalRevenue: number
  monthlyRecurring: number
  annualRecurring: number
  avgSubscriptionValue: number
  activeSubscriptions: number
  pastDueSubscriptions: number
  churnRate: number
}

export default function AdminBillingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [summary, setSummary] = useState<BillingSummary>({
    totalRevenue: 18499.92,
    monthlyRecurring: 2499.99,
    annualRecurring: 29999.88,
    avgSubscriptionValue: 154.17,
    activeSubscriptions: 12,
    pastDueSubscriptions: 1,
    churnRate: 2.5
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'subscriptions'>('overview')
  const [dateRange, setDateRange] = useState('30d')

  useEffect(() => {
    fetchBillingData()
  }, [dateRange])

  const fetchBillingData = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      const mockTransactions: Transaction[] = [
        { id: 'txn_001', user_id: 'user_001', user_email: 'sarah.chen@techcorp.com', amount: 99.99, currency: 'USD', type: 'subscription', description: 'Pro Plan - Monthly', status: 'completed', created_at: '2025-01-26T10:30:00Z' },
        { id: 'txn_002', user_id: 'user_002', user_email: 'marcus.johnson@enterprise.io', amount: 299.99, currency: 'USD', type: 'subscription', description: 'Enterprise Plan - Annual', status: 'completed', created_at: '2025-01-25T14:20:00Z' },
        { id: 'txn_003', user_id: 'user_001', user_email: 'sarah.chen@techcorp.com', amount: -25.00, currency: 'USD', type: 'refund', description: 'Refund - Unused time', status: 'completed', created_at: '2025-01-24T09:15:00Z' },
        { id: 'txn_004', user_id: 'user_003', user_email: 'alex.rivera@startup.co', amount: 49.99, currency: 'USD', type: 'subscription', description: 'Starter Plan - Monthly', status: 'completed', created_at: '2025-01-23T16:45:00Z' },
        { id: 'txn_005', user_id: 'user_004', user_email: 'emma.wilson@agency.com', amount: 0, currency: 'USD', type: 'topup', description: 'Free credits added', status: 'completed', created_at: '2025-01-22T11:00:00Z' },
        { id: 'txn_006', user_id: 'user_005', user_email: 'david.kim@consulting.net', amount: 149.99, currency: 'USD', type: 'subscription', description: 'Pro Plan - Monthly', status: 'pending', created_at: '2025-01-26T08:30:00Z' },
        { id: 'txn_007', user_id: 'user_006', user_email: 'lisa.martinez@design.io', amount: -50.00, currency: 'USD', type: 'adjustment', description: 'Promotional discount', status: 'completed', created_at: '2025-01-21T13:20:00Z' }
      ]
      
      setTransactions(mockTransactions)
    } catch (error) {
      console.error('Failed to fetch billing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Financial Management</h1>
          <p className="text-slate-400 mt-1">Monitor revenue, transactions, and subscriptions</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-500/20 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
            <span className="flex items-center gap-1 text-green-400 text-sm">
              <ArrowUpRight className="w-4 h-4" />
              +12.5%
            </span>
          </div>
          <h3 className="text-slate-400 text-sm">Total Revenue</h3>
          <p className="text-3xl font-bold text-white mt-1">{formatCurrency(summary.totalRevenue)}</p>
          <p className="text-slate-500 text-sm mt-1">All time</p>
        </div>
        <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-600/5 border border-indigo-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-indigo-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm">Monthly Recurring</h3>
          <p className="text-3xl font-bold text-white mt-1">{formatCurrency(summary.monthlyRecurring)}</p>
          <p className="text-slate-500 text-sm mt-1">MRR</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-500/20 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm">Active Subscriptions</h3>
          <p className="text-3xl font-bold text-white mt-1">{summary.activeSubscriptions}</p>
          <p className="text-slate-500 text-sm mt-1">{formatCurrency(summary.avgSubscriptionValue)} avg</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-amber-500/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-amber-400" />
            </div>
          </div>
          <h3 className="text-slate-400 text-sm">Past Due</h3>
          <p className="text-3xl font-bold text-white mt-1">{summary.pastDueSubscriptions}</p>
          <p className="text-slate-500 text-sm mt-1">{summary.churnRate}% churn rate</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'overview'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'transactions'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab('subscriptions')}
          className={`px-4 py-3 font-medium transition-colors ${
            activeTab === 'subscriptions'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Subscriptions
        </button>
      </div>

      {/* Content based on tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue by Plan */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-indigo-400" />
              Revenue by Plan
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                  <span className="text-white">Pro Plan</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">8 subscribers</p>
                  <p className="text-indigo-400 text-sm">{formatCurrency(799.92)}/mo</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-purple-500 rounded-full" />
                  <span className="text-white">Enterprise</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">4 subscribers</p>
                  <p className="text-purple-400 text-sm">{formatCurrency(1700.00)}/mo</p>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full" />
                  <span className="text-white">Starter</span>
                </div>
                <div className="text-right">
                  <p className="text-white font-medium">5 subscribers</p>
                  <p className="text-green-400 text-sm">{formatCurrency(0)}/mo</p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Provider Costs */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              AI Provider Costs
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">Anthropic</span>
                  <span className="text-cyan-400 font-medium">{formatCurrency(3456.78)}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-cyan-500 h-2 rounded-full" style={{ width: '45%' }} />
                </div>
                <p className="text-slate-500 text-sm mt-1">45.2% of total • 123.4M tokens</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">OpenAI</span>
                  <span className="text-indigo-400 font-medium">{formatCurrency(2345.67)}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '31%' }} />
                </div>
                <p className="text-slate-500 text-sm mt-1">30.7% of total • 98.7M tokens</p>
              </div>
              <div className="p-4 bg-slate-900/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white">Google</span>
                  <span className="text-purple-400 font-medium">{formatCurrency(1234.56)}</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: '16%' }} />
                </div>
                <p className="text-slate-500 text-sm mt-1">16.1% of total • 45.6M tokens</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Transaction</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {transactions.map((txn) => (
                <tr key={txn.id} className="hover:bg-slate-700/30">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-slate-400" />
                      <span className="text-white font-medium">{txn.id}</span>
                    </div>
                    <p className="text-slate-400 text-sm">{txn.description}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{txn.user_email}</td>
                  <td className={`px-6 py-4 font-medium ${txn.amount < 0 ? 'text-green-400' : 'text-white'}`}>
                    {txn.amount < 0 ? '-' : ''}{formatCurrency(Math.abs(txn.amount))}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      txn.type === 'subscription' ? 'bg-indigo-500/20 text-indigo-400' :
                      txn.type === 'refund' ? 'bg-green-500/20 text-green-400' :
                      txn.type === 'topup' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-2 ${
                      txn.status === 'completed' ? 'text-green-400' :
                      txn.status === 'pending' ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>
                      {txn.status === 'completed' ? <CheckCircle className="w-4 h-4" /> :
                       txn.status === 'pending' ? <Clock className="w-4 h-4" /> :
                       <XCircle className="w-4 h-4" />}
                      {txn.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-sm">
                    {new Date(txn.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'subscriptions' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Pro Plan</h3>
              <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-xs">8 active</span>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(99.99)}<span className="text-slate-400 text-sm font-normal">/mo</span></p>
            <p className="text-slate-500 text-sm mt-2">{formatCurrency(799.92)} MRR</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Enterprise</h3>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">4 active</span>
            </div>
            <p className="text-3xl font-bold text-white">{formatCurrency(299.99)}<span className="text-slate-400 text-sm font-normal">/mo</span></p>
            <p className="text-slate-500 text-sm mt-2">{formatCurrency(1700.00)} MRR</p>
          </div>
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Starter</h3>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">5 active</span>
            </div>
            <p className="text-3xl font-bold text-white">Free<span className="text-slate-400 text-sm font-normal">/mo</span></p>
            <p className="text-slate-500 text-sm mt-2">{formatCurrency(0)} MRR</p>
          </div>
        </div>
      )}
    </div>
  )
}