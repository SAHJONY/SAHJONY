"use client";

import Link from "next/link";
import { Bot, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";
import type { Agent } from "@/types/database";
import { useState } from "react";

interface AgentCardProps {
  agent: Agent;
  onDelete?: (id: string) => void;
}

export function AgentCard({ agent, onDelete }: AgentCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="group relative bg-surface border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start justify-between">
        <Link href={`/agents/${agent.id}`} className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-white truncate">{agent.name}</h3>
            <p className="text-sm text-zinc-500 truncate">
              {agent.description || "No description"}
            </p>
          </div>
        </Link>

        <div className="relative">
          <button
            onClick={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
            className="p-1 text-zinc-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-surface border border-border rounded-lg shadow-lg py-1 z-10">
              <Link
                href={`/agents/${agent.id}/edit`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 hover:bg-border hover:text-white"
                onClick={() => setShowMenu(false)}
              >
                <Pencil className="w-4 h-4" />
                Edit
              </Link>
              <button
                onClick={() => { onDelete?.(agent.id); setShowMenu(false); }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-error hover:bg-border"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-0.5 text-xs rounded-full",
            agent.is_active ? "bg-success/20 text-success" : "bg-zinc-700 text-zinc-400"
          )}>
            {agent.is_active ? "Active" : "Inactive"}
          </span>
          <span className="text-xs text-zinc-500">
            {agent.model_provider}/{agent.model_name}
          </span>
        </div>
        <span className="text-xs text-zinc-500">
          {formatDate(agent.updated_at)}
        </span>
      </div>
    </div>
  );
}