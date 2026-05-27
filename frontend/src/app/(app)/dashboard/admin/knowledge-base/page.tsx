'use client'

import { useEffect, useState } from 'react'
import {
  BookOpen,
  Search,
  Plus,
  Edit,
  Trash2,
  X,
  Tag,
  ChevronLeft,
  ChevronRight,
  Filter,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  Eye,
  Save
} from 'lucide-react'

const ADMIN_EMAIL = 'sahjonycapitalllc@outlook.com'

interface FAQ {
  id: string
  question: string
  answer: string
  category: string
  tags: string[]
  language: string
  helpful_count: number
}

export default function AdminKnowledgeBasePage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [categories, setCategories] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null)
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    tags: ''
  })

  useEffect(() => {
    fetchFaqs()
  }, [currentPage, searchQuery, selectedCategory])

  const fetchFaqs = async () => {
    setLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 300))
      
      // Mock data - in production would call API
      const mockFaqs: FAQ[] = [
        { id: 'faq_001', question: 'How do I reset my password?', answer: 'To reset your password:\n1. Go to the login page\n2. Click "Forgot Password"\n3. Enter your email address\n4. Check your inbox for the reset link\n5. Create a new password', category: 'account', tags: ['password', 'reset', 'login'], language: 'en', helpful_count: 156 },
        { id: 'faq_002', question: 'How do I change my email address?', answer: 'To change your email:\n1. Go to Settings > Account\n2. Click "Change Email"\n3. Enter your new email address\n4. Verify by clicking the link sent to your new email', category: 'account', tags: ['email', 'change', 'settings'], language: 'en', helpful_count: 89 },
        { id: 'faq_003', question: 'How do I delete my account?', answer: 'To delete your account:\n1. Go to Settings > Account\n2. Scroll to "Danger Zone"\n3. Click "Delete Account"\n4. Confirm by typing "DELETE"', category: 'account', tags: ['delete', 'account', 'remove'], language: 'en', helpful_count: 45 },
        { id: 'faq_004', question: 'How do I update my payment method?', answer: 'To update your payment method:\n1. Go to Settings > Billing\n2. Click "Payment Methods"\n3. Click "Add New Method"\n4. Enter your card details', category: 'billing', tags: ['payment', 'card', 'billing'], language: 'en', helpful_count: 234 },
        { id: 'faq_005', question: 'Where can I view my invoices?', answer: 'To view your invoices:\n1. Go to Settings > Billing\n2. Click "Invoice History"\n3. Download available in PDF format', category: 'billing', tags: ['invoice', 'billing', 'receipt'], language: 'en', helpful_count: 178 },
        { id: 'faq_006', question: 'How do I cancel my subscription?', answer: 'To cancel your subscription:\n1. Go to Settings > Billing\n2. Click "Cancel Subscription"\n3. Choose your cancellation reason\n4. Confirm cancellation', category: 'billing', tags: ['cancel', 'subscription', 'refund'], language: 'en', helpful_count: 67 },
        { id: 'faq_007', question: 'The app is not loading properly', answer: 'If the app isn loading:\n1. Clear your browser cache\n2. Try a different browser\n3. Check your internet connection', category: 'technical', tags: ['loading', 'error', 'browser'], language: 'en', helpful_count: 312 },
        { id: 'faq_008', question: 'How do I enable two-factor authentication?', answer: 'To enable 2FA:\n1. Go to Settings > Security\n2. Click "Enable Two-Factor Authentication"\n3. Scan the QR code\n4. Enter the 6-digit code', category: 'account', tags: ['2fa', 'security', 'authentication'], language: 'en', helpful_count: 145 },
        { id: 'faq_009', question: 'My data is not syncing across devices', answer: 'For data sync issues:\n1. Ensure you are logged into the same account\n2. Check your internet connection\n3. Wait up to 5 minutes for sync', category: 'technical', tags: ['sync', 'data', 'devices'], language: 'en', helpful_count: 98 },
        { id: 'faq_010', question: 'How do I export my data?', answer: 'To export your data:\n1. Go to Settings > Data\n2. Click "Export Data"\n3. Choose export format\n4. Click "Generate Export"', category: 'general', tags: ['export', 'data', 'download'], language: 'en', helpful_count: 76 },
        { id: 'faq_011', question: 'How do I invite team members?', answer: 'To invite team members:\n1. Go to Settings > Team\n2. Click "Invite Members"\n3. Enter email addresses\n4. Select their role', category: 'general', tags: ['team', 'invite', 'collaboration'], language: 'en', helpful_count: 189 },
        { id: 'faq_012', question: 'What are the API rate limits?', answer: 'API rate limits by plan:\n- Free: 100 requests/minute\n- Startup: 1,000 requests/minute\n- Business: 10,000 requests/minute', category: 'technical', tags: ['api', 'rate-limit', 'limits'], language: 'en', helpful_count: 267 },
      ]
      
      let filtered = mockFaqs
      if (selectedCategory !== 'all') {
        filtered = mockFaqs.filter(f => f.category === selectedCategory)
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(f => 
          f.question.toLowerCase().includes(query) ||
          f.answer.toLowerCase().includes(query) ||
          f.tags.some(t => t.toLowerCase().includes(query))
        )
      }
      
      setFaqs(filtered)
      setCategories(['account', 'billing', 'technical', 'general'])
      setTotalPages(Math.ceil(filtered.length / 10) || 1)
    } catch (error) {
      console.error('Failed to fetch FAQs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenModal = (faq?: FAQ) => {
    if (faq) {
      setEditingFaq(faq)
      setFormData({
        question: faq.question,
        answer: faq.answer,
        category: faq.category,
        tags: faq.tags.join(', ')
      })
    } else {
      setEditingFaq(null)
      setFormData({ question: '', answer: '', category: 'general', tags: '' })
    }
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingFaq(null)
    setFormData({ question: '', answer: '', category: 'general', tags: '' })
  }

  const handleSave = async () => {
    if (!formData.question.trim() || !formData.answer.trim()) {
      alert('Question and Answer are required')
      return
    }

    const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean)

    if (editingFaq) {
      // Update existing FAQ
      const updatedFaq = {
        ...editingFaq,
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        tags: tagsArray
      }
      setFaqs(faqs.map(f => f.id === editingFaq.id ? updatedFaq : f))
    } else {
      // Create new FAQ
      const newFaq: FAQ = {
        id: `faq_${String(faqs.length + 1).padStart(3, '0')}`,
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        tags: tagsArray,
        language: 'en',
        helpful_count: 0
      }
      setFaqs([...faqs, newFaq])
    }

    handleCloseModal()
  }

  const handleDelete = async (faqId: string) => {
    if (confirm('Are you sure you want to delete this FAQ?')) {
      setFaqs(faqs.filter(f => f.id !== faqId))
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      account: 'bg-blue-500/20 text-blue-400',
      billing: 'bg-green-500/20 text-green-400',
      technical: 'bg-purple-500/20 text-purple-400',
      general: 'bg-slate-500/20 text-slate-400'
    }
    return colors[category] || colors.general
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Knowledge Base</h1>
          <p className="text-slate-400 mt-1">Manage FAQ entries for the support chatbot</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add FAQ
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total FAQs</p>
              <p className="text-2xl font-bold text-white">{faqs.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-500/10 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Categories</p>
              <p className="text-2xl font-bold text-white">{categories.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <MessageSquare className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Total Views</p>
              <p className="text-2xl font-bold text-white">
                {faqs.reduce((sum, f) => sum + f.helpful_count, 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-slate-400 text-sm">Avg. Helpful</p>
              <p className="text-2xl font-bold text-white">
                {faqs.length > 0 ? Math.round(faqs.reduce((sum, f) => sum + f.helpful_count, 0) / faqs.length) : 0}
              </p>
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
            placeholder="Search FAQs by question, answer, or tags..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}
          className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* FAQs Table */}
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">FAQ</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tags</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Helpful</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500 mx-auto" />
                </td>
              </tr>
            ) : faqs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  No FAQs found matching your criteria.
                </td>
              </tr>
            ) : (
              faqs.map((faq) => (
                <tr key={faq.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="max-w-md">
                      <p className="text-white font-medium line-clamp-1">{faq.question}</p>
                      <p className="text-slate-400 text-sm line-clamp-1 mt-1">{faq.answer}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(faq.category)}`}>
                      {faq.category.charAt(0).toUpperCase() + faq.category.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {faq.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-300">
                          {tag}
                        </span>
                      ))}
                      {faq.tags.length > 3 && (
                        <span className="px-2 py-0.5 bg-slate-700 rounded text-xs text-slate-400">
                          +{faq.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-slate-300">
                      <Eye className="w-4 h-4" />
                      {faq.helpful_count.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(faq)}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors text-slate-400 hover:text-white"
                        title="Edit FAQ"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="p-2 hover:bg-rose-500/10 rounded-lg transition-colors text-slate-400 hover:text-rose-400"
                        title="Delete FAQ"
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
          Showing {faqs.length} of {faqs.length} FAQs
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

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                {editingFaq ? 'Edit FAQ' : 'Create New FAQ'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Question *
                </label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  placeholder="Enter the FAQ question..."
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Answer *
                </label>
                <textarea
                  value={formData.answer}
                  onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                  placeholder="Enter the FAQ answer..."
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="account">Account</option>
                    <option value="billing">Billing</option>
                    <option value="technical">Technical</option>
                    <option value="general">General</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    placeholder="password, reset, login"
                    className="w-full px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-slate-700 flex items-center justify-end gap-3">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                {editingFaq ? 'Update FAQ' : 'Create FAQ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}