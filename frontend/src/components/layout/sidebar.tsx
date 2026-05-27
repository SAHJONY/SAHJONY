"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Bot, MessageSquare, Plus, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Agent } from "@/types/database";

interface SidebarProps {
  agents: Agent[];
}

export function Sidebar({ agents }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-border bg-surface/50 h-[calc(100vh-3.5rem)] sticky top-14 overflow-y-auto">
      <div className="p-4">
        <Link href="/agents/new">
          <Button className="w-full" size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Agent
          </Button>
        </Link>
      </div>

      <nav className="px-2 pb-4">
        <div className="space-y-1">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === "/" ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-border hover:text-white"
            )}
          >
            <Bot className="w-4 h-4" />
            Dashboard
          </Link>
          
          <Link
            href="/conversations"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === "/conversations" ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-border hover:text-white"
            )}
          >
            <MessageSquare className="w-4 h-4" />
            Conversations
          </Link>
          
          <Link
            href="/pricing"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
              pathname === "/pricing" ? "bg-primary/10 text-primary" : "text-zinc-400 hover:bg-border hover:text-white"
            )}
          >
            <CreditCard className="w-4 h-4" />
            Pricing
          </Link>
        </div>

        <div className="mt-6">
          <h3 className="px-3 text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
            Your Agents
          </h3>
          <div className="space-y-1">
            {agents.map((agent) => (
              <Link
                key={agent.id}
                href={`/agents/${agent.id}`}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                  pathname === `/agents/${agent.id}` 
                    ? "bg-primary/10 text-primary" 
                    : "text-zinc-400 hover:bg-border hover:text-white"
                )}
              >
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  agent.is_active ? "bg-success" : "bg-zinc-600"
                )} />
                {agent.name}
              </Link>
            ))}
            {agents.length === 0 && (
              <p className="px-3 py-2 text-sm text-zinc-500">No agents yet</p>
            )}
          </div>
        </div>
      </nav>
    </aside>
  );
}