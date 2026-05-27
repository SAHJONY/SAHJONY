"use client";

import Link from "next/link";
import { useSession } from "@/components/providers";
import { Bot, LogOut, Settings, User, Sparkles, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function TopNav() {
  const { user, profile, signOut, isLoading } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <nav className="h-14 border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-primary transition-colors">
            <div className="relative">
              <Bot className="w-6 h-6 text-indigo-400" />
              <Sparkles className="w-3 h-3 text-purple-400 absolute -top-1 -right-1" />
            </div>
            <span className="font-bold text-lg bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              SAHJONY
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-6">
            <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Dashboard
            </Link>
            <Link href="/dashboard/conversations" className="text-sm text-zinc-400 hover:text-white transition-colors">
              Conversations
            </Link>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-950/50 border border-indigo-500/30">
              <Brain className="w-3 h-3 text-indigo-400" />
              <span className="text-xs text-indigo-300">Freebuff + Hermes</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {isLoading ? (
            <div className="w-8 h-8 rounded-full bg-surface animate-shimmer" />
          ) : user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-border transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-primary" />
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-surface border border-border rounded-lg shadow-lg py-1">
                  <div className="px-4 py-2 border-b border-border">
                    <p className="text-sm font-medium">{profile?.display_name || user.email}</p>
                    <p className="text-xs text-zinc-500">{user.email}</p>
                  </div>
                  <Link
                    href="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-zinc-300 hover:bg-border hover:text-white transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button
                    onClick={() => { signOut(); setShowUserMenu(false); }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-zinc-300 hover:bg-border hover:text-white transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button size="sm">Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}