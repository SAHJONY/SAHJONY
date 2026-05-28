"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PremiumNav,
  PremiumFooter,
  PremiumPricingCard
} from "@/components/ui/premium-sections";
import { PremiumComparisonTable } from "@/components/ui/comparison-table";
import { 
  CheckCircle,
  Sparkles,
  ArrowRight,
  Zap,
  Shield,
  Users,
  HeadphonesIcon
} from "lucide-react";

const plans = [
  {
    name: "Starter",
    description: "Perfect for individuals and small teams getting started",
    price: "$0",
    period: "/month",
    features: [
      "5 AI agents included",
      "100 conversations/month",
      "Basic model access (GPT-3.5)",
      "Community support",
      "1 workspace",
      "Basic analytics",
    ],
    notIncluded: [
      "Advanced model access",
      "Priority support",
      "Custom integrations",
    ],
    cta: "Get Started Free",
    popular: false,
  },
  {
    name: "Professional",
    description: "For professionals and growing teams",
    price: "$29",
    period: "/month",
    features: [
      "25 AI agents included",
      "Unlimited conversations",
      "Premium model access (GPT-4, Claude)",
      "Priority email support",
      "10 workspaces",
      "Advanced analytics",
      "API access",
      "Custom integrations",
      "Team collaboration",
    ],
    notIncluded: [],
    cta: "Start 14-Day Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For large organizations with advanced needs",
    price: "$99",
    period: "/month",
    features: [
      "Unlimited AI agents",
      "Unlimited conversations",
      "All models + fine-tuning",
      "24/7 dedicated support",
      "Unlimited workspaces",
      "Advanced analytics & reporting",
      "Full API access",
      "Custom integrations",
      "SLA guarantee",
      "Dedicated account manager",
      "Custom contract & billing",
    ],
    notIncluded: [],
    cta: "Contact Sales",
    popular: false,
  },
];

const faqItems = [
  {
    question: "Can I switch plans at any time?",
    answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any payments accordingly.",
  },
  {
    question: "What happens when I hit my conversation limit?",
    answer: "You'll receive a notification when you're approaching your limit. You can upgrade to continue using SAHJONY without interruption, or wait until the limit resets at the start of your next billing cycle.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer: "Yes! All paid plans come with a 14-day free trial. No credit card required to start - you'll only be charged if you decide to continue after the trial period.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and wire transfers for Enterprise plans. Annual subscriptions can also be invoiced.",
  },
  {
    question: "Do you offer discounts for non-profits or education?",
    answer: "Yes! We offer special pricing for non-profit organizations and educational institutions. Contact our sales team to learn more about our discount programs.",
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <PremiumNav
        logo={{ text: "SAHJONY", href: "/" }}
        links={[
          { label: "Features", href: "/landing#features" },
          { label: "Pricing", href: "/pricing" },
          { label: "Docs", href: "#" },
          { label: "Blog", href: "#" },
        ]}
        cta={{ label: "Get Started", href: "/signup" }}
      />

      {/* Hero Section */}
      <section className="pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[150px]" />
        </div>
        
        <div className="relative z-10 max-w-[900px] mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Simple, transparent pricing</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white tracking-tight mb-6">
            Choose your plan
          </h1>
          
          <p className="text-xl text-text-secondary mb-8 max-w-[600px] mx-auto">
            Start free, scale as you grow. All plans include a 14-day free trial with no credit card required.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-surface-elevated border border-border/50">
            <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-text-tertiary'}`}>Monthly</span>
            <button
              onClick={() => setAnnual(!annual)}
              className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
                annual ? 'bg-primary' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform duration-300 ${
                  annual ? 'translate-x-6' : ''
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-text-tertiary'}`}>
              Annual
            </span>
            <span className="ml-2 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium">
              Save 20%
            </span>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan, i) => (
              <PremiumPricingCard key={i} plan={plan} annual={annual} />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-24 bg-surface/50">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-4xl font-bold text-white text-center mb-6">Compare all features</h2>
          <p className="text-text-secondary text-center mb-16 max-w-[600px] mx-auto">See everything included in each plan to make the best decision for your needs</p>
          
          <PremiumComparisonTable />
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-24">
        <div className="max-w-[1000px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Instant Deployment</h3>
              <p className="text-text-tertiary text-sm">Go from idea to production in seconds with one-click deployments</p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-6 h-6 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Enterprise Security</h3>
              <p className="text-text-tertiary text-sm">SOC 2 compliance, encryption, and granular access controls</p>
            </div>
            
            <div className="text-center">
              <div className="w-14 h-14 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Team Collaboration</h3>
              <p className="text-text-tertiary text-sm">Built-in tools for your team to work together effectively</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24">
        <div className="max-w-[800px] mx-auto px-6">
          <h2 className="text-3xl font-bold text-white text-center mb-16">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {faqItems.map((item, i) => (
              <FAQItem key={i} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-accent/5 to-primary/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px]" />
        
        <div className="relative z-10 max-w-[700px] mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold text-white tracking-tight mb-6">Ready to get started?</h2>
          <p className="text-xl text-text-secondary mb-10">Start your 14-day free trial today. No credit card required.</p>
          
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup" className="btn-primary text-base px-8 py-4">
              Start Free Trial
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
            <Link href="#" className="btn-secondary text-base px-8 py-4">
              Talk to Sales
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <PremiumFooter
        columns={[
          {
            title: "Product",
            links: [
              { label: "Features", href: "#" },
              { label: "Pricing", href: "/pricing" },
              { label: "Changelog", href: "#" },
            ]
          },
          {
            title: "Resources",
            links: [
              { label: "Documentation", href: "#" },
              { label: "API Reference", href: "#" },
              { label: "Blog", href: "#" },
            ]
          },
          {
            title: "Company",
            links: [
              { label: "About", href: "#" },
              { label: "Careers", href: "#" },
              { label: "Contact", href: "#" },
            ]
          },
          {
            title: "Legal",
            links: [
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
              { label: "Security", href: "#" },
            ]
          },
        ]}
        bottom={{
          text: "© 2025 SAHJONY. All rights reserved.",
          links: [
            { label: "Privacy", href: "#" },
            { label: "Terms", href: "#" },
          ]
        }}
      />
    </div>
  );
}

// FAQ Accordion Item
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="card-premium overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 text-left"
      >
        <span className="font-semibold text-white pr-4">{question}</span>
        <svg 
          className={`w-5 h-5 text-text-tertiary transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          <p className="text-text-secondary leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  );
}