"use client";

import React from "react";
import Link from "next/link";
import {
  PremiumHero,
  PremiumFeatures,
  PremiumCTA,
  PremiumStats,
  PremiumFAQ,
  PremiumNav,
  PremiumFooter,
  PremiumLogoCloud,
  PremiumTestimonial
} from "@/components/ui/premium-sections";
import { 
  Bot, 
  Sparkles, 
  Zap, 
  Shield, 
  LineChart, 
  Users, 
  Globe, 
  Lock,
  ArrowRight,
  CheckCircle
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <PremiumNav
        logo={{ text: "SAHJONY", href: "/" }}
        links={[
          { label: "Features", href: "#features" },
          { label: "Pricing", href: "/pricing" },
          { label: "Docs", href: "#" },
          { label: "Blog", href: "#" },
        ]}
        cta={{ label: "Get Started", href: "/signup" }}
      />

      {/* Hero Section */}
      <PremiumHero
        title="Build AI Agents"
        subtitle="That Work For You"
        description="SAHJONY is the multi-agent AI platform that automates workflows, scales operations, and delivers results. Powered by Hermes AI."
        primaryCTA={{ label: "Start Free Trial", href: "/signup" }}
        secondaryCTA={{ label: "Watch Demo", href: "#" }}
        badge={{ text: "Powered by Hermes AI", icon: <Sparkles className="w-4 h-4" /> }}
        stats={[
          { value: "10K+", label: "Active Users" },
          { value: "50M+", label: "Conversations" },
          { value: "99.9%", label: "Uptime" },
        ]}
      />

      {/* Logo Cloud */}
      <PremiumLogoCloud
        title="Trusted by industry leaders"
        logos={[
          { name: "TechCorp" },
          { name: "StartupX" },
          { name: "DataFlow" },
          { name: "CloudNine" },
          { name: "AIVenture" },
        ]}
      />

      {/* Features Section */}
      <PremiumFeatures
        title="Everything you need to build AI agents"
        subtitle="Powerful tools and integrations to deploy intelligent agents at scale"
        features={[
          {
            icon: <Bot className="w-6 h-6" />,
            title: "Multi-Agent Orchestration",
            description: "Deploy and coordinate multiple AI agents that work together to solve complex problems autonomously."
          },
          {
            icon: <Zap className="w-6 h-6" />,
            title: "Instant Deployment",
            description: "Go from idea to production in seconds. Our one-click deployment gets your agents live immediately."
          },
          {
            icon: <Shield className="w-6 h-6" />,
            title: "Enterprise Security",
            description: "Bank-grade encryption, SOC 2 compliance, and granular access controls keep your data safe."
          },
          {
            icon: <LineChart className="w-6 h-6" />,
            title: "Advanced Analytics",
            description: "Track performance, optimize workflows, and gain insights with real-time dashboards and reporting."
          },
          {
            icon: <Globe className="w-6 h-6" />,
            title: "Global Infrastructure",
            description: "Deploy across multiple regions worldwide for low-latency responses and high availability."
          },
          {
            icon: <Lock className="w-6 h-6" />,
            title: "API-First Design",
            description: "Full REST and GraphQL APIs let you integrate AI agents into any existing system or workflow."
          },
        ]}
      />

      {/* Stats Section */}
      <PremiumStats
        stats={[
          { value: "50M+", label: "API Calls Handled", icon: <Zap className="w-5 h-5" /> },
          { value: "99.99%", label: "SLA Uptime", icon: <Shield className="w-5 h-5" /> },
          { value: "<45ms", label: "Avg Response Time", icon: <Globe className="w-5 h-5" /> },
          { value: "24/7", label: "Expert Support", icon: <Users className="w-5 h-5" /> },
        ]}
      />

      {/* Testimonials */}
      <section className="py-24 bg-surface/50">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white tracking-tight mb-4">Loved by teams worldwide</h2>
            <p className="text-xl text-text-secondary">See what our customers are saying about SAHJONY</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <PremiumTestimonial
              name="Sarah Chen"
              role="CTO"
              company="TechCorp"
              quote="SAHJONY transformed how we handle customer support. Our AI agents now resolve 70% of tickets automatically."
              rating={5}
            />
            <PremiumTestimonial
              name="Marcus Johnson"
              role="Head of Operations"
              company="ScaleUp Inc"
              quote="The multi-agent orchestration is incredible. We deployed 12 specialized agents in just one week."
              rating={5}
            />
            <PremiumTestimonial
              name="Emma Wilson"
              role="AI Lead"
              company="DataFlow"
              quote="Finally, an AI platform that scales with our needs. The enterprise features are rock solid."
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <PremiumFAQ
        items={[
          {
            question: "How quickly can I get started with SAHJONY?",
            answer: "You can have your first AI agent running in less than 5 minutes. Our intuitive dashboard and pre-built templates make it easy to deploy agents without any coding knowledge."
          },
          {
            question: "What models does SAHJONY support?",
            answer: "SAHJONY supports all major AI models including GPT-4, Claude, Gemini, and open-source models. You can easily switch between providers and even use multiple models in a single agent."
          },
          {
            question: "Is SAHJONY secure for enterprise use?",
            answer: "Absolutely. We maintain SOC 2 Type II compliance, use end-to-end encryption, offer granular access controls, and provide comprehensive audit logging. We also support private cloud deployments."
          },
          {
            question: "Can I integrate SAHJONY with my existing tools?",
            answer: "Yes! SAHJONY offers native integrations with 50+ popular tools including Slack, Salesforce, HubSpot, and more. Plus, our REST and GraphQL APIs let you connect to any system."
          },
          {
            question: "How does pricing work?",
            answer: "We offer flexible pricing plans starting at $0 for the free tier. Paid plans start at $29/month and include more agents, conversations, and advanced features. Enterprise plans are available for larger teams."
          },
        ]}
      />

      {/* CTA Section */}
      <PremiumCTA
        title="Ready to transform your operations?"
        description="Join thousands of teams already using SAHJONY to automate workflows and scale their AI capabilities."
        primaryCTA={{ label: "Start Free Trial", href: "/signup" }}
        secondaryCTA={{ label: "Talk to Sales", href: "#" }}
      />

      {/* Footer */}
      <PremiumFooter
        columns={[
          {
            title: "Product",
            links: [
              { label: "Features", href: "#" },
              { label: "Pricing", href: "/pricing" },
              { label: "Changelog", href: "#" },
              { label: "Roadmap", href: "#" },
            ]
          },
          {
            title: "Resources",
            links: [
              { label: "Documentation", href: "#" },
              { label: "API Reference", href: "#" },
              { label: "Blog", href: "#" },
              { label: "Community", href: "#" },
            ]
          },
          {
            title: "Company",
            links: [
              { label: "About", href: "#" },
              { label: "Careers", href: "#" },
              { label: "Contact", href: "#" },
              { label: "Press", href: "#" },
            ]
          },
          {
            title: "Legal",
            links: [
              { label: "Privacy", href: "#" },
              { label: "Terms", href: "#" },
              { label: "Security", href: "#" },
              { label: "GDPR", href: "#" },
            ]
          },
        ]}
        bottom={{
          text: "© 2025 SAHJONY. All rights reserved.",
          links: [
            { label: "Privacy", href: "#" },
            { label: "Terms", href: "#" },
            { label: "Status", href: "#" },
          ]
        }}
      />
    </div>
  );
}