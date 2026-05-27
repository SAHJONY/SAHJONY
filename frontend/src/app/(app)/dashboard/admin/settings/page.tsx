'use client'

import { useState } from 'react'
import {
  Settings,
  Globe,
  Shield,
  Key,
  Bell,
  Database,
  Server,
  Zap,
  Mail,
  Save,
  RotateCcw
} from 'lucide-react'

const ADMIN_EMAIL = 'sahjonycapitalllc@outlook.com'

interface PlatformSettings {
  maintenanceMode: boolean
  allowSignups: boolean
  maxAgentsPerUser: number
  maxConversationsPerUser: number
  defaultModel: string
  enabledProviders: string[]
  rateLimitPerMinute: number
  maxFileSizeMb: number
  sessionTimeoutHours: number
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<PlatformSettings>({
    maintenanceMode: false,
    allowSignups: true,
    maxAgentsPerUser: 10,
    maxConversationsPerUser: 100,
    defaultModel: 'claude-3-5-sonnet-20241022',
    enabledProviders: ['anthropic', 'openai', 'google'],
    rateLimitPerMinute: 60,
    maxFileSizeMb: 10,
    sessionTimeoutHours: 24
  })
  const [saved, setSaved] = useState(false)
  const [activeTab, setActiveTab] = useState<'general' | 'security' | 'api' | 'notifications'>('general')

  const handleSave = () => {
    // In production, this would call the API
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    setSettings({
      maintenanceMode: false,
      allowSignups: true,
      maxAgentsPerUser: 10,
      maxConversationsPerUser: 100,
      defaultModel: 'claude-3-5-sonnet-20241022',
      enabledProviders: ['anthropic', 'openai', 'google'],
      rateLimitPerMinute: 60,
      maxFileSizeMb: 10,
      sessionTimeoutHours: 24
    })
  }

  const toggleProvider = (provider: string) => {
    setSettings(prev => ({
      ...prev,
      enabledProviders: prev.enabledProviders.includes(provider)
        ? prev.enabledProviders.filter(p => p !== provider)
        : [...prev.enabledProviders, provider]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Platform Settings</h1>
          <p className="text-slate-400 mt-1">Configure SAHJONY platform behavior and limits</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg transition-colors ${
              saved ? 'bg-green-500' : 'bg-indigo-500 hover:bg-indigo-600'
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? 'Saved!' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-700">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'general'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          General
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'security'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Shield className="w-4 h-4" />
          Security
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'api'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Key className="w-4 h-4" />
          API & Rate Limits
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-3 font-medium transition-colors flex items-center gap-2 ${
            activeTab === 'notifications'
              ? 'text-indigo-400 border-b-2 border-indigo-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Bell className="w-4 h-4" />
          Notifications
        </button>
      </div>

      {/* Content */}
      {activeTab === 'general' && (
        <div className="space-y-6">
          {/* Platform Status */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Platform Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">Maintenance Mode</p>
                  <p className="text-slate-400 text-sm">When enabled, users cannot access the platform</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, maintenanceMode: !prev.maintenanceMode }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.maintenanceMode ? 'bg-rose-500' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.maintenanceMode ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">Allow New Signups</p>
                  <p className="text-slate-400 text-sm">Control whether new users can register</p>
                </div>
                <button
                  onClick={() => setSettings(prev => ({ ...prev, allowSignups: !prev.allowSignups }))}
                  className={`w-12 h-6 rounded-full transition-colors ${
                    settings.allowSignups ? 'bg-green-500' : 'bg-slate-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    settings.allowSignups ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* User Limits */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">User Limits</h3>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">Max Agents per User</label>
                <input
                  type="number"
                  value={settings.maxAgentsPerUser}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxAgentsPerUser: parseInt(e.target.value) || 10 }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <p className="text-slate-500 text-sm mt-1">Maximum number of agents each user can create</p>
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Max Conversations per User</label>
                <input
                  type="number"
                  value={settings.maxConversationsPerUser}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxConversationsPerUser: parseInt(e.target.value) || 100 }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <p className="text-slate-500 text-sm mt-1">Maximum conversations a user can have</p>
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Session Timeout (hours)</label>
                <input
                  type="number"
                  value={settings.sessionTimeoutHours}
                  onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeoutHours: parseInt(e.target.value) || 24 }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <p className="text-slate-500 text-sm mt-1">Auto logout after this duration of inactivity</p>
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Max File Size (MB)</label>
                <input
                  type="number"
                  value={settings.maxFileSizeMb}
                  onChange={(e) => setSettings(prev => ({ ...prev, maxFileSizeMb: parseInt(e.target.value) || 10 }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <p className="text-slate-500 text-sm mt-1">Maximum upload file size</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">AI Providers</h3>
            <p className="text-slate-400 mb-4">Select which AI providers are available for users</p>
            <div className="space-y-3">
              {['anthropic', 'openai', 'google'].map(provider => (
                <div key={provider} className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      provider === 'anthropic' ? 'bg-rose-500/20' :
                      provider === 'openai' ? 'bg-green-500/20' : 'bg-blue-500/20'
                    }`}>
                      <Zap className={`w-5 h-5 ${
                        provider === 'anthropic' ? 'text-rose-400' :
                        provider === 'openai' ? 'text-green-400' : 'text-blue-400'
                      }`} />
                    </div>
                    <div>
                      <p className="text-white font-medium capitalize">{provider}</p>
                      <p className="text-slate-400 text-sm">
                        {provider === 'anthropic' ? 'Claude models' :
                         provider === 'openai' ? 'GPT-4, GPT-4o models' : 'Gemini models'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleProvider(provider)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      settings.enabledProviders.includes(provider) ? 'bg-green-500' : 'bg-slate-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      settings.enabledProviders.includes(provider) ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Default Model</h3>
            <select
              value={settings.defaultModel}
              onChange={(e) => setSettings(prev => ({ ...prev, defaultModel: e.target.value }))}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
            >
              <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
              <option value="claude-3-opus-20240229">Claude 3 Opus</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4-turbo">GPT-4 Turbo</option>
              <option value="gemini-pro">Gemini Pro</option>
            </select>
          </div>
        </div>
      )}

      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Rate Limiting</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-white font-medium mb-2">Requests per Minute</label>
                <input
                  type="number"
                  value={settings.rateLimitPerMinute}
                  onChange={(e) => setSettings(prev => ({ ...prev, rateLimitPerMinute: parseInt(e.target.value) || 60 }))}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
                <p className="text-slate-500 text-sm mt-1">Per-user rate limit for API requests</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Email Notifications</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">New User Signups</p>
                  <p className="text-slate-400 text-sm">Notify admin when a new user registers</p>
                </div>
                <button className="w-12 h-6 bg-green-500 rounded-full">
                  <div className="w-5 h-5 bg-white rounded-full translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">Payment Receipts</p>
                  <p className="text-slate-400 text-sm">Send receipt emails for transactions</p>
                </div>
                <button className="w-12 h-6 bg-green-500 rounded-full">
                  <div className="w-5 h-5 bg-white rounded-full translate-x-6" />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg">
                <div>
                  <p className="text-white font-medium">System Alerts</p>
                  <p className="text-slate-400 text-sm">Critical system notifications</p>
                </div>
                <button className="w-12 h-6 bg-green-500 rounded-full">
                  <div className="w-5 h-5 bg-white rounded-full translate-x-6" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Admin Info */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-400" />
          Admin Access
        </h3>
        <div className="flex items-center gap-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
          <div className="p-3 bg-indigo-500/20 rounded-lg">
            <Mail className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <p className="text-white font-medium">{ADMIN_EMAIL}</p>
            <p className="text-indigo-400 text-sm">Super Admin - Full platform access</p>
          </div>
        </div>
      </div>
    </div>
  )
}