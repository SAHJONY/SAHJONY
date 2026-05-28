"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bot, MessageSquare, Plus, CreditCard, Settings, ChevronRight, Activity, Zap, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Agent } from "@/types/database";
import { useState } from "react";

interface SidebarProps {
  agents: Agent[];
}

export function Sidebar({ agents }: SidebarProps) {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <aside className="w-72 border-r border-border/50 h-[calc(100vh-4rem)] sticky top-16 overflow-hidden bg-gradient-to-b from-surface/50 to-transparent">
      <div className="h-full flex flex-col">
        {/* New Agent Button */}
        <div className="p-5">
          <Link href="/dashboard/agents/new" className="block">
            <button className="w-full btn-primary flex items-center justify-center gap-2 group">
              <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
              <span>New Agent</span>
            </button>
          </Link>
        </div>

        {/* Main Navigation */}
        <nav className="px-3 flex-1 overflow-y-auto">
          <div className="mb-6">
            <h3 className="px-4 text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.15em] mb-3">
              Navigation
            </h3>
            <div className="space-y-1">
              <SidebarItem 
                href="/" 
                icon={<Home className="w-4 h-4" />} 
                label="Home" 
                active={pathname === "/"}
                hovered={hoveredItem === 'home'}
                onHover={setHoveredItem}
              />
              <SidebarItem 
                href="/dashboard" 
                icon={<Bot className="w-4 h-4" />} 
                label="Dashboard" 
                active={pathname === "/dashboard"}
                hovered={hoveredItem === 'dashboard'}
                onHover={setHoveredItem}
              />
              <SidebarItem 
                href="/dashboard/conversations" 
                icon={<MessageSquare className="w-4 h-4" />} 
                label="Conversations" 
                active={pathname === "/conversations" || pathname.includes('/conversations')}
                hovered={hoveredItem === 'conversations'}
                onHover={setHoveredItem}
              />
              <SidebarItem 
                href="/dashboard/playground" 
                icon={<Zap className="w-4 h-4" />} 
                label="Playground" 
                active={pathname === "/playground"}
                hovered={hoveredItem === 'playground'}
                onHover={setHoveredItem}
              />
              <SidebarItem 
                href="/pricing" 
                icon={<CreditCard className="w-4 h-4" />} 
                label="Pricing" 
                active={pathname === "/pricing"}
                hovered={hoveredItem === 'pricing'}
                onHover={setHoveredItem}
              />
            </div>
          </div>

          {/* Your Agents Section */}
          <div className="mb-6">
            <h3 className="px-4 text-[10px] font-semibold text-text-tertiary uppercase tracking-[0.15em] mb-3 flex items-center justify-between">
              <span>Your Agents</span>
              <span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-[10px]">{agents.length}</span>
            </h3>
            <div className="space-y-1">
              {agents.slice(0, 5).map((agent) => (
                <Link
                  key={agent.id}
                  href={`/dashboard/agents/${agent.id}`}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all duration-300",
                    pathname === `/dashboard/agents/${agent.id}`
                      ? "bg-primary/10 text-primary border border-primary/20"
                      : "text-text-secondary hover:text-white hover:bg-surface-elevated/50"
                  )}
                >
                  <div className={cn(
                    "w-2 h-2 rounded-full transition-all duration-300",
                    agent.is_active ? "bg-success shadow-glow-sm" : "bg-text-tertiary"
                  )} />
                  <span className="flex-1 truncate">{agent.name}</span>
                  <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
              {agents.length === 0 && (
                <div className="px-4 py-6 text-center">
                  <div className="w-12 h-12 rounded-xl bg-surface-elevated mx-auto mb-3 flex items-center justify-center">
                    <Bot className="w-5 h-5 text-text-tertiary" />
                  </div>
                  <p className="text-text-tertiary text-sm">No agents yet</p>
                  <p className="text-text-tertiary/60 text-xs mt-1">Create your first agent</p>
                </div>
              )}
              {agents.length > 5 && (
                <Link 
                  href="/dashboard/agents"
                  className="flex items-center justify-center gap-2 px-4 py-2 text-xs text-primary hover:text-primary-hover transition-colors"
                >
                  View all {agents.length} agents
                  <ChevronRight className="w-3 h-3" />
                </Link>
              )}
            </div>
          </div>

          {/* System Status */}
          <div className="px-4 py-4 border-t border-border/50">
            <div className="bg-surface-elevated/30 rounded-xl p-4 border border-border/30">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-success" />
                <span className="text-xs font-medium text-text-secondary">System Status</span>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-tertiary">API Latency</span>
                  <span className="text-xs text-success font-medium">45ms</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-tertiary">Uptime</span>
                  <span className="text-xs text-white font-medium">99.9%</span>
                </div>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}

function SidebarItem({ 
  href, 
  icon, 
  label, 
  active, 
  hovered, 
  onHover 
}: { 
  href: string; 
  icon: React.ReactNode; 
  label: string; 
  active: boolean;
  hovered: boolean;
  onHover: (id: string | null) => void;
}) {
  return (
    <Link
      href={href}
      onMouseEnter={() => onHover(label.toLowerCase())}
      onMouseLeave={() => onHover(null)}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
        active 
          ? "bg-gradient-to-r from-primary/20 to-transparent text-white border border-primary/20 shadow-glow-sm" 
          : hovered 
            ? "bg-surface-elevated/50 text-white" 
            : "text-text-secondary hover:text-white"
      )}
    >
      <span className={cn(
        "transition-transform duration-300",
        hovered && !active ? "scale-110" : ""
      )}>
        {icon}
      </span>
      <span>{label}</span>
      {active && (
        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary shadow-glow-sm" />
      )}
    </Link>
  );
}