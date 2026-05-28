"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Check, X, Minus } from "lucide-react";

interface Feature {
  name: string;
  starter: string | boolean;
  professional: string | boolean;
  enterprise: string | boolean;
  category?: string;
}

interface FeatureCategory {
  name: string;
  icon?: React.ReactNode;
  features: Feature[];
}

const featureCategories: FeatureCategory[] = [
  {
    name: "AI Agents",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    features: [
      { name: "AI agents included", starter: "5", professional: "25", enterprise: "Unlimited" },
      { name: "Agent templates", starter: true, professional: true, enterprise: true },
      { name: "Custom agent creation", starter: false, professional: true, enterprise: true },
      { name: "Agent memory & context", starter: "Basic", professional: "Advanced", enterprise: "Unlimited" },
      { name: "Multi-agent orchestration", starter: false, professional: true, enterprise: true },
      { name: "Fine-tuning capability", starter: false, professional: false, enterprise: true },
    ],
  },
  {
    name: "Conversations & Usage",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>,
    features: [
      { name: "Monthly conversations", starter: "100", professional: "Unlimited", enterprise: "Unlimited" },
      { name: "Conversation history", starter: "30 days", professional: "Unlimited", enterprise: "Unlimited" },
      { name: "Messages per conversation", starter: "50", professional: "Unlimited", enterprise: "Unlimited" },
      { name: "File attachments", starter: "5MB", professional: "50MB", enterprise: "500MB" },
      { name: "Image generation", starter: false, professional: "100/mo", enterprise: "Unlimited" },
    ],
  },
  {
    name: "AI Models",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>,
    features: [
      { name: "GPT-3.5 (Basic)", starter: true, professional: true, enterprise: true },
      { name: "GPT-4 (Premium)", starter: false, professional: true, enterprise: true },
      { name: "Claude 2/3", starter: false, professional: true, enterprise: true },
      { name: "Gemini Pro", starter: false, professional: true, enterprise: true },
      { name: "Llama 2/3", starter: false, professional: true, enterprise: true },
      { name: "Custom model integration", starter: false, professional: false, enterprise: true },
    ],
  },
  {
    name: "Analytics & Reporting",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
    features: [
      { name: "Usage analytics", starter: "Basic", professional: "Advanced", enterprise: "Custom" },
      { name: "Agent performance metrics", starter: false, professional: true, enterprise: true },
      { name: "Custom dashboards", starter: false, professional: true, enterprise: true },
      { name: "Export reports (CSV, PDF)", starter: false, professional: true, enterprise: true },
      { name: "Real-time monitoring", starter: false, professional: true, enterprise: true },
      { name: "API analytics", starter: false, professional: true, enterprise: true },
    ],
  },
  {
    name: "Integrations & API",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>,
    features: [
      { name: "REST API access", starter: false, professional: true, enterprise: true },
      { name: "Webhooks", starter: false, professional: true, enterprise: true },
      { name: "Native integrations", starter: "5", professional: "50+", enterprise: "Unlimited" },
      { name: "Zapier/Make support", starter: false, professional: true, enterprise: true },
      { name: "Custom integrations", starter: false, professional: false, enterprise: true },
      { name: "SSO/SAML integration", starter: false, professional: false, enterprise: true },
    ],
  },
  {
    name: "Team & Collaboration",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
    features: [
      { name: "Team members", starter: "1", professional: "10", enterprise: "Unlimited" },
      { name: "Workspaces", starter: "1", professional: "10", enterprise: "Unlimited" },
      { name: "Role-based access control", starter: false, professional: true, enterprise: true },
      { name: "Shared agent templates", starter: false, professional: true, enterprise: true },
      { name: "Activity logs", starter: false, professional: true, enterprise: true },
      { name: "Audit logs", starter: false, professional: false, enterprise: true },
    ],
  },
  {
    name: "Support & SLA",
    icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>,
    features: [
      { name: "Support channel", starter: "Community", professional: "Email", enterprise: "24/7 Dedicated" },
      { name: "Response time", starter: "48h", professional: "4h", enterprise: "1h" },
      { name: "Onboarding assistance", starter: false, professional: true, enterprise: true },
      { name: "Dedicated account manager", starter: false, professional: false, enterprise: true },
      { name: "SLA guarantee", starter: false, professional: false, enterprise: "99.9%" },
      { name: "Custom contract & billing", starter: false, professional: false, enterprise: true },
    ],
  },
];

// Feature value renderer
function FeatureValue({ value, highlight = false }: { value: string | boolean; highlight?: boolean }) {
  if (typeof value === "boolean") {
    if (value === true) {
      return <Check className="w-5 h-5 text-success mx-auto" />;
    }
    if (value === false) {
      return <X className="w-5 h-5 text-text-tertiary/50 mx-auto" />;
    }
  }
  
  return (
    <span className={cn(
      "text-sm font-medium",
      highlight ? "text-white" : "text-text-secondary"
    )}>
      {value}
    </span>
  );
}

// Collapsible category row
function CategoryRow({ category, isOpen, onClick }: { category: string; isOpen: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-4 px-6 bg-surface-elevated/50 hover:bg-surface-elevated transition-colors duration-300 border-y border-border/30"
    >
      <span className="font-semibold text-white">{category}</span>
      <svg 
        className={cn(
          "w-5 h-5 text-text-tertiary transition-transform duration-300",
          isOpen && "rotate-180"
        )}
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  );
}

// Feature row component
function FeatureRow({ feature }: { feature: Feature }) {
  return (
    <tr className="border-b border-border/30 hover:bg-surface/30 transition-colors duration-200">
      <td className="py-4 px-6 text-text-secondary text-sm">{feature.name}</td>
      <td className="py-4 px-6 text-center">
        <FeatureValue value={feature.starter} />
      </td>
      <td className="py-4 px-6 text-center bg-primary/5">
        <FeatureValue value={feature.professional} highlight />
      </td>
      <td className="py-4 px-6 text-center">
        <FeatureValue value={feature.enterprise} />
      </td>
    </tr>
  );
}

// Main comparison table component
export function PremiumComparisonTable() {
  const [openCategories, setOpenCategories] = useState<Set<string>>(new Set(["AI Agents", "AI Models", "Support & SLA"]));

  const toggleCategory = (categoryName: string) => {
    setOpenCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryName)) {
        next.delete(categoryName);
      } else {
        next.add(categoryName);
      }
      return next;
    });
  };

  return (
    <div className="w-full overflow-hidden">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[800px]">
          {/* Table Header */}
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-6 px-6 text-text-tertiary font-medium text-sm w-[40%]">Features</th>
              <th className="py-6 px-6 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-white font-semibold text-lg mb-1">Starter</span>
                  <span className="text-text-tertiary text-sm">Free</span>
                </div>
              </th>
              <th className="py-6 px-6 text-center bg-primary/10 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white text-xs font-semibold">
                  Most Popular
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-white font-semibold text-lg mb-1">Professional</span>
                  <span className="text-text-tertiary text-sm">$29/mo</span>
                </div>
              </th>
              <th className="py-6 px-6 text-center">
                <div className="flex flex-col items-center">
                  <span className="text-white font-semibold text-lg mb-1">Enterprise</span>
                  <span className="text-text-tertiary text-sm">$99/mo</span>
                </div>
              </th>
            </tr>
          </thead>
          
          {/* Table Body */}
          <tbody>
            {featureCategories.map((category) => (
              <React.Fragment key={category.name}>
                {/* Category Header Row */}
                <tr className="bg-surface-elevated/30">
                  <td colSpan={4} className="py-2 px-6">
                    <div className="flex items-center gap-3">
                      {category.icon && <span className="text-primary">{category.icon}</span>}
                      <span className="font-semibold text-white text-sm uppercase tracking-wide">{category.name}</span>
                    </div>
                  </td>
                </tr>
                {/* Feature Rows */}
                {category.features.map((feature, i) => (
                  <FeatureRow key={`${category.name}-${i}`} feature={feature} />
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Accordion View */}
      <div className="md:hidden space-y-4">
        {featureCategories.map((category) => (
          <div key={category.name} className="card-premium overflow-hidden">
            <CategoryRow 
              category={category.name} 
              isOpen={openCategories.has(category.name)}
              onClick={() => toggleCategory(category.name)}
            />
            
            <div className={cn(
              "overflow-hidden transition-all duration-500",
              openCategories.has(category.name) ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
            )}>
              <div className="p-4 space-y-3">
                {/* Mobile plan headers */}
                <div className="grid grid-cols-3 gap-2 mb-4 pb-4 border-b border-border/30">
                  <div className="text-center">
                    <span className="text-xs text-text-tertiary block">Starter</span>
                    <span className="text-xs text-text-tertiary">Free</span>
                  </div>
                  <div className="text-center bg-primary/10 -m-2 p-2 rounded-lg">
                    <span className="text-xs text-white block font-semibold">Professional</span>
                    <span className="text-xs text-primary">$29/mo</span>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-text-tertiary block">Enterprise</span>
                    <span className="text-xs text-text-tertiary">$99/mo</span>
                  </div>
                </div>
                
                {/* Feature rows for mobile */}
                {category.features.map((feature, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                    <span className="text-text-secondary text-sm flex-1">{feature.name}</span>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className="text-xs text-text-tertiary w-16 text-center">
                        {typeof feature.starter === 'boolean' 
                          ? (feature.starter ? <Check className="w-4 h-4 text-success mx-auto" /> : <X className="w-4 h-4 text-text-tertiary/50 mx-auto" />)
                          : feature.starter
                        }
                      </span>
                      <span className="text-xs text-white w-16 text-center bg-primary/10 py-1 rounded">
                        {typeof feature.professional === 'boolean' 
                          ? (feature.professional ? <Check className="w-4 h-4 text-success mx-auto" /> : <X className="w-4 h-4 text-text-tertiary/50 mx-auto" />)
                          : feature.professional
                        }
                      </span>
                      <span className="text-xs text-text-tertiary w-16 text-center">
                        {typeof feature.enterprise === 'boolean' 
                          ? (feature.enterprise ? <Check className="w-4 h-4 text-success mx-auto" /> : <X className="w-4 h-4 text-text-tertiary/50 mx-auto" />)
                          : feature.enterprise
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}