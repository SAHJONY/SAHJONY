"use client";

import Link from "next/link";
import { useSession } from "@/components/providers";
import { Bot, LogOut, Settings, User, Sparkles, Brain, ChevronDown, Bell, Search } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function TopNav() {
  const { user, profile, signOut, isLoading } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav 
      className={`
        h-16 border-b transition-all duration-500 fixed top-0 left-0 right-0 z-50
        ${scrolled 
          ? 'bg-black/90 backdrop-blur-xl border-bordersubtle/50' 
          : 'bg-transparent border-transparent'
        }
      `}
    >
      <div className="h-full max-w-[1600px] mx-auto px-6 flex items-center justify-between">
        {/* Logo & Brand */}
        <div className="flex items-center gap-10">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-md group-hover:scale-105 transition-transform duration-300">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <Sparkles className="w-4 h-4 text-accent absolute -top-1.5 -right-1.5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg tracking-tight text-white group-hover:text-primary transition-colors">
                SAHJONY
              </span>
              <span className="text-[10px] text-text-tertiary tracking-widest uppercase">AI Agent</span>
            </div>
          </Link>
          
          {/* Navigation Links */}
          <div className="hidden lg:flex items-center gap-1">
            <NavLink href="/dashboard" icon={<Bot className="w-4 h-4" />}>Dashboard</NavLink>
            <NavLink href="/dashboard/conversations" icon={<Search className="w-4 h-4" />}>Conversations</NavLink>
            <NavLink href="/dashboard/agents" icon={<Sparkles className="w-4 h-4" />}>Agents</NavLink>
          </div>
        </div>

        {/* Center - AI Badge */}
        <div className="hidden md:flex items-center">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 backdrop-blur-sm">
            <div className="relative">
              <Brain className="w-4 h-4 text-primary animate-pulse" />
              <div className="absolute inset-0 bg-primary/50 rounded-full blur-sm animate-ping" />
            </div>
            <span className="text-xs font-medium text-white">Powered by Hermes AI</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Search Button */}
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className="p-2.5 rounded-xl bg-surface-elevated/50 border border-border/50 text-text-secondary hover:text-white hover:border-primary/30 transition-all duration-300"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button className="relative p-2.5 rounded-xl bg-surface-elevated/50 border border-border/50 text-text-secondary hover:text-white hover:border-primary/30 transition-all duration-300">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
          </button>

          {/* User Menu */}
          {isLoading ? (
            <div className="w-9 h-9 rounded-xl bg-surface-elevated animate-shimmer" />
          ) : user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-xl bg-surface-elevated/50 border border-border/50 hover:border-primary/30 transition-all duration-300 group"
              >
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-sm">
                  <User className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm text-text-secondary group-hover:text-white transition-colors hidden sm:block">
                  {profile?.display_name?.split(' ')[0] || user.email?.split('@')[0]}
                </span>
                <ChevronDown className={`w-4 h-4 text-text-tertiary transition-transform duration-300 ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              <div 
                className={`
                  absolute right-0 mt-3 w-72 rounded-2xl bg-surface-elevated/95 backdrop-blur-xl 
                  border border-border/50 shadow-2xl overflow-hidden
                  transition-all duration-300 origin-top-right
                  ${showUserMenu 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                  }
                `}
              >
                {/* User Info Header */}
                <div className="px-5 py-4 border-b border-border/50 bg-gradient-to-r from-primary/5 to-transparent">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-glow-sm">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{profile?.display_name || 'User'}</p>
                      <p className="text-sm text-text-tertiary">{user.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="py-2">
                  <MenuItem href="/settings" icon={<Settings className="w-4 h-4" />} label="Settings" />
                  <MenuItem href="/dashboard/billing" icon={<Bot className="w-4 h-4" />} label="Billing" />
                  <MenuItem href="/api-keys" icon={<Sparkles className="w-4 h-4" />} label="API Keys" />
                </div>

                {/* Sign Out */}
                <div className="px-2 py-2 border-t border-border/50">
                  <button
                    onClick={() => { signOut(); setShowUserMenu(false); }}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-text-secondary hover:text-error hover:bg-error/10 transition-all duration-300"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign out</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link href="/login">
              <button className="btn-primary">
                Sign in
              </button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, children, icon }: { href: string; children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-text-secondary hover:text-white hover:bg-surface-elevated/50 transition-all duration-300"
    >
      {icon}
      {children}
    </Link>
  );
}

function MenuItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link 
      href={href} 
      className="flex items-center gap-3 mx-2 px-4 py-3 rounded-xl text-text-secondary hover:text-white hover:bg-surface transition-all duration-300"
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </Link>
  );
}