'use client'

import { useState } from 'react'
import { Check, X, Sparkles, Brain, Zap, Shield, Users, Code, Terminal, GitBranch, Search, Clock, Building, ArrowRight, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out SAHJONY and exploring AI assistance.',
    icon: Sparkles,
    gradient: 'from-zinc-500 to-zinc-600',
    features: [
      { name: '100 messages per month', included: true },
      { name: 'Basic SAHJONY Brain', included: true },
      { name: 'File Picker & Planner agents', included: true },
      { name: 'Session memory (24h)', included: true },
      { name: 'Web chat interface', included: true },
      { name: 'Community support', included: true },
      { name: 'Advanced agents (Claude Code, Cody, etc.)', included: false },
      { name: 'API access', included: false },
      { name: 'Persistent memory', included: false },
      { name: 'Custom agent configurations', included: false },
      { name: 'Priority support', included: false },
    ],
    cta: 'Get Started Free',
    popular: false,
  },
  {
    name: 'Startup',
    price: '$49',
    period: 'per month',
    description: 'For developers and small teams building with AI agents.',
    icon: Zap,
    gradient: 'from-indigo-500 to-purple-600',
    features: [
      { name: '5,000 messages per month', included: true },
      { name: 'Full SAHJONY Brain', included: true },
      { name: 'All core agents (6 agents)', included: true },
      { name: 'Session memory (7 days)', included: true },
      { name: 'Web + API access', included: true },
      { name: 'Email support', included: true },
      { name: 'Advanced agents (Claude Code, Cody, etc.)', included: false },
      { name: 'API access', included: true },
      { name: 'Persistent memory', included: true },
      { name: 'Custom agent configurations', included: false },
      { name: 'Priority support', included: false },
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Business',
    price: '$199',
    period: 'per month',
    description: 'For growing teams needing advanced agents and priority support.',
    icon: Shield,
    gradient: 'from-purple-500 to-pink-600',
    features: [
      { name: '25,000 messages per month', included: true },
      { name: 'Full SAHJONY Brain + Advanced', included: true },
      { name: 'All 7 advanced agents', included: true },
      { name: 'Persistent memory (30 days)', included: true },
      { name: 'Web + API + Webhooks', included: true },
      { name: 'Priority support', included: true },
      { name: 'Advanced agents (Claude Code, Cody, etc.)', included: true },
      { name: 'API access', included: true },
      { name: 'Persistent memory', included: true },
      { name: 'Custom agent configurations', included: true },
      { name: 'Priority support', included: true },
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For organizations needing unlimited usage and white-label solutions.',
    icon: Building,
    gradient: 'from-amber-500 to-orange-600',
    features: [
      { name: 'Unlimited messages', included: true },
      { name: 'Full SAHJONY Brain + Custom Agents', included: true },
      { name: 'All advanced agents + custom builds', included: true },
      { name: 'Permanent memory + FTS5 search', included: true },
      { name: 'Dedicated API endpoints', included: true },
      { name: '24/7 dedicated support', included: true },
      { name: 'Advanced agents (Claude Code, Cody, etc.)', included: true },
      { name: 'API access', included: true },
      { name: 'Persistent memory', included: true },
      { name: 'Custom agent configurations', included: true },
      { name: 'Priority support', included: true },
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

const agentCapabilities = [
  {
    category: 'Core Agents',
    icon: Brain,
    agents: [
      { name: 'File Picker', description: 'Analyzes codebase structure, finds relevant files', tier: 'free' },
      { name: 'Planner', description: 'Breaks down complex tasks into actionable steps', tier: 'free' },
      { name: 'Editor', description: 'Generates code from descriptions, templates', tier: 'free' },
      { name: 'Reviewer', description: 'Validates code, detects issues, suggests improvements', tier: 'free' },
      { name: 'Sahjony Core', description: 'Orchestrates all agents, routes requests intelligently', tier: 'free' },
    ],
  },
  {
    category: 'Advanced Agents',
    icon: Terminal,
    agents: [
      { name: 'Claude Code Agent', description: 'Terminal operations, self-healing, autonomous coding', tier: 'startup' },
      { name: 'Cursor Composer', description: 'Multi-file editing, project orchestration', tier: 'startup' },
      { name: 'Copilot Agent', description: 'Workspace awareness, Git context, autonomous tasks', tier: 'business' },
      { name: 'Aider Agent', description: 'Git integration, terminal-first refactoring', tier: 'business' },
      { name: 'Cody Agent', description: 'Repo-level context, massive codebase understanding', tier: 'business' },
      { name: 'Planning Agent', description: 'Multi-step tasks with self-healing and retry', tier: 'business' },
      { name: 'Tool Agent', description: 'Direct @bash, @read, @write, @grep operations', tier: 'startup' },
    ],
  },
]

const faqs = [
  {
    question: 'What counts as a "message"?',
    answer: 'A message is any user input sent to SAHJONY. This includes both the initial prompt and any follow-up clarifications. Responses from SAHJONY are not counted against your limit.',
  },
  {
    question: 'Can I switch plans anytime?',
    answer: 'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you get immediate access to new features. When downgrading, the change takes effect at the start of your next billing cycle.',
  },
  {
    question: 'What happens if I exceed my message limit?',
    answer: 'When you reach 80% of your limit, we will notify you via email. Once you exceed your limit, you can either wait until the next month or upgrade to a higher tier.',
  },
  {
    question: 'Do you offer discounts for startups or non-profits?',
    answer: 'Yes! We offer 50% off for verified startups (under 2 years old, < 10 employees) and non-profits. Contact us with verification and we will apply the discount.',
  },
  {
    question: 'What is persistent memory?',
    answer: 'Persistent memory allows SAHJONY to remember context from past conversations. The Free tier has 24-hour session memory, while paid tiers offer 7-30 days of persistent memory with full-text search across all your conversations.',
  },
  {
    question: 'Can I use SAHJONY via API?',
    answer: 'Startup and higher plans include API access. You can integrate SAHJONY Brain into your own applications, websites, or internal tools using our REST API with WebSocket support for real-time streaming.',
  },
]



export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isAnnual, setIsAnnual] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-b from-indigo-950/50 via-background to-background">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent" />
        <div className="relative max-w-7xl mx-auto px-6 py-16 lg:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-6">
              <Brain className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-indigo-300 font-medium">Powered by SAHJONY Brain</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-6">
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-8">
              Choose the perfect plan for your AI-powered workflow. All plans include our core multi-agent brain with Freebuff + Hermes memory.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center gap-4">
              <span className={cn("text-sm", !isAnnual ? "text-white" : "text-zinc-500")}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                aria-label="Toggle annual/monthly billing"
                className="relative w-14 h-7 bg-surface rounded-full border border-border hover:border-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <div className={cn(
                  "absolute top-1 w-5 h-5 bg-primary rounded-full transition-transform",
                  isAnnual ? "translate-x-8" : "translate-x-1"
                )} />
              </button>
              <span className={cn("text-sm flex items-center gap-1", isAnnual ? "text-white" : "text-zinc-500")}>
                Annual
                <span className="text-xs text-green-400 font-medium ml-1">Save 20%</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {tiers.map((tier) => {
            const Icon = tier.icon
            const monthlyPrice = isAnnual && tier.price !== 'Custom' 
              ? `$${Math.round(parseInt(tier.price.replace('$', '')) * 0.8)}`
              : tier.price
            
            return (
              <div 
                key={tier.name}
                className={cn(
                  "relative rounded-2xl border p-6 transition-all duration-300",
                  tier.popular 
                    ? "bg-gradient-to-b from-indigo-950/80 to-surface border-indigo-500/50 shadow-xl shadow-indigo-500/10 scale-105" 
                    : "bg-surface border-border hover:border-primary/50"
                )}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className={cn("w-12 h-12 rounded-xl bg-gradient-to-br mb-4 flex items-center justify-center", tier.gradient)}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">{tier.name}</h3>
                <p className="text-sm text-zinc-400 mb-4">{tier.description}</p>
                
                <div className="mb-6">
                  <span className="text-4xl font-bold text-white">{monthlyPrice}</span>
                  {tier.price !== 'Custom' && (
                    <span className="text-zinc-500 ml-2">/month</span>
                  )}
                  {isAnnual && tier.price !== 'Custom' && (
                    <div className="text-xs text-green-400 mt-1">billed annually</div>
                  )}
                </div>
                
                <Button 
                  variant={tier.popular ? "primary" : "secondary"} 
                  className="w-full mb-6"
                >
                  {tier.cta}
                </Button>
                
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      ) : (
                        <X className="w-4 h-4 text-zinc-600 mt-0.5 flex-shrink-0" />
                      )}
                      <span className={cn(
                        "text-sm",
                        feature.included ? "text-zinc-300" : "text-zinc-600"
                      )}>
                        {feature.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

      {/* Agent Capabilities Table */}
      <div className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-4">
            Agent Capabilities by Plan
          </h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">
            SAHJONY's power comes from its multi-agent system. Each agent specializes in different tasks, working together as one unified brain.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {agentCapabilities.map((category) => {
            const Icon = category.icon
            return (
              <div key={category.category} className="bg-surface rounded-2xl border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{category.category}</h3>
                </div>
                
                <div className="space-y-4">
                  {category.agents.map((agent) => (
                    <div key={agent.name} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                      <div>
                        <div className="text-sm font-medium text-white">{agent.name}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{agent.description}</div>
                      </div>
                      <div className={cn(
                        "px-2 py-1 rounded text-xs font-medium capitalize",
                        agent.tier === 'free' ? "bg-green-500/10 text-green-400" :
                        agent.tier === 'startup' ? "bg-indigo-500/10 text-indigo-400" :
                        "bg-purple-500/10 text-purple-400"
                      )}>
                        {agent.tier}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Full Feature Comparison</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-4 text-zinc-400 font-medium">Feature</th>
                <th className="text-center py-4 px-4 text-zinc-400 font-medium">Free</th>
                <th className="text-center py-4 px-4 text-zinc-400 font-medium">Startup</th>
                <th className="text-center py-4 px-4 text-zinc-400 font-medium">Business</th>
                <th className="text-center py-4 px-4 text-zinc-400 font-medium">Enterprise</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {[
                { feature: 'Messages per month', values: ['100', '5,000', '25,000', 'Unlimited'] },
                { feature: 'Core Agents (5)', values: ['✓', '✓', '✓', '✓'] },
                { feature: 'Advanced Agents (7)', values: ['-', '3 agents', 'All 7', 'All + Custom'] },
                { feature: 'Session Memory', values: ['24 hours', '7 days', '30 days', 'Permanent'] },
                { feature: 'Full-text Search', values: ['-', '✓', '✓', '✓'] },
                { feature: 'API Access', values: ['-', '✓', '✓', '✓'] },
                { feature: 'Webhooks', values: ['-', '-', '✓', '✓'] },
                { feature: 'Custom Agents', values: ['-', '-', '✓', '✓'] },
                { feature: 'White-label', values: ['-', '-', '-', '✓'] },
                { feature: 'Dedicated Support', values: ['-', '-', '-', '24/7'] },
                { feature: 'SLA', values: ['-', '-', '99.9%', '99.99%'] },
              ].map((row, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-4 px-4 text-zinc-300">{row.feature}</td>
                  {row.values.map((val, j) => (
                    <td key={j} className="py-4 px-4 text-center">
                      {val === '✓' && <Check className="w-4 h-4 text-green-400 mx-auto" />}
                      {val === '-' && <span className="text-zinc-600">—</span>}
                      {val !== '✓' && val !== '-' && (
                        <span className="text-white font-medium">{val}</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-6 py-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Frequently Asked Questions</h2>
          <p className="text-zinc-400">Can't find the answer you're looking for? Reach out to our team.</p>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="bg-surface rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left"
              >
                <span className="text-white font-medium">{faq.question}</span>
                <ChevronDown className={cn(
                  "w-5 h-5 text-zinc-400 transition-transform",
                  openFaq === i && "rotate-180"
                )} />
              </button>
              {openFaq === i && (
                <div className="px-5 pb-5 text-zinc-400 text-sm leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950/50 to-transparent" />
        <div className="max-w-4xl mx-auto px-6 py-20 text-center relative">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to power your workflow with SAHJONY?
          </h2>
          <p className="text-xl text-zinc-400 mb-8">
            Join thousands of developers using AI agents to build faster.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button size="lg" className="gap-2">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Button>
            <Button size="lg" variant="secondary">
              Talk to Sales
            </Button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold">SAHJONY</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
          <div className="text-sm text-zinc-500">
            © 2025 SAHJONY. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  )
}