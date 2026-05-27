'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const plans = [
  {
    name: 'Free',
    description: 'Perfect for getting started',
    price: '$0',
    period: '/month',
    features: [
      '5 agents included',
      '100 conversations/month',
      'Basic model access (GPT-3.5)',
      'Community support',
      '1 workspace',
    ],
    notIncluded: [
      'Custom model fine-tuning',
      'Priority support',
      'Advanced analytics',
    ],
    cta: 'Get Started',
    popular: false,
  },
  {
    name: 'Pro',
    description: 'Best for professionals and teams',
    price: '$29',
    period: '/month',
    features: [
      '25 agents included',
      'Unlimited conversations',
      'Premium model access (GPT-4, Claude)',
      'Priority email support',
      '5 workspaces',
      'Usage analytics',
      'API access',
    ],
    notIncluded: [
      'Custom model fine-tuning',
    ],
    cta: 'Start Free Trial',
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    price: '$99',
    period: '/month',
    features: [
      'Unlimited agents',
      'Unlimited conversations',
      'All models + fine-tuning',
      '24/7 dedicated support',
      'Unlimited workspaces',
      'Advanced analytics & reporting',
      'Full API access',
      'Custom integrations',
      'SLA guarantee',
    ],
    notIncluded: [],
    cta: 'Contact Sales',
    popular: false,
  },
]

export default function PricingPage() {
  const [annual, setAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-white">
            SAHJONY
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
              Sign in
            </Link>
            <Link href="/signup">
              <Button variant="secondary" size="sm" className="border border-indigo-500 text-indigo-400 hover:bg-indigo-500/10">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Pricing Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-8">
            Choose the plan that fits your needs. All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${!annual ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                annual ? 'bg-indigo-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
                  annual ? 'translate-x-7' : ''
                }`}
              />
            </button>
            <span className={`text-sm ${annual ? 'text-white' : 'text-slate-400'}`}>
              Annual <span className="text-green-400 text-xs">(Save 20%)</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border ${
                plan.popular
                  ? 'bg-gradient-to-b from-indigo-500/10 to-slate-800/50 border-indigo-500/50 shadow-xl shadow-indigo-500/10'
                  : 'bg-slate-800/30 border-slate-700/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-indigo-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-sm text-slate-400">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  {annual ? plan.price.replace('$', '$') : plan.price}
                </span>
                <span className="text-slate-400">{plan.period}</span>
                {annual && (
                  <p className="text-xs text-green-400 mt-1">Billed annually</p>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm text-slate-300">{feature}</span>
                  </li>
                ))}
                {plan.notIncluded.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 opacity-50">
                    <svg
                      className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-sm text-slate-500">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? 'primary' : 'secondary'}
                className="w-full"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-white font-medium mb-2">Can I change plans later?</h3>
              <p className="text-slate-400 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-white font-medium mb-2">What happens when I hit my conversation limit?</h3>
              <p className="text-slate-400 text-sm">
                You'll receive a notification and can upgrade to continue using SAHJONY without interruption.
              </p>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-white font-medium mb-2">Is there a free trial?</h3>
              <p className="text-slate-400 text-sm">
                Yes! All paid plans come with a 14-day free trial. No credit card required to start.
              </p>
            </div>
            <div className="bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
              <h3 className="text-white font-medium mb-2">What payment methods do you accept?</h3>
              <p className="text-slate-400 text-sm">
                We accept all major credit cards, PayPal, and wire transfers for Enterprise plans.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 rounded-2xl p-12 border border-indigo-500/20">
          <h2 className="text-2xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-slate-400 mb-8 max-w-md mx-auto">
            Join thousands of teams using SAHJONY to automate their workflows.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button variant="primary" size="lg" className="bg-indigo-500 hover:bg-indigo-600">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg" className="border border-slate-600 text-white hover:bg-slate-800">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              © 2025 SAHJONY. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-sm text-slate-400 hover:text-white transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}