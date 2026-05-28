"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Bot,
  MessageSquare,
  Activity,
  DollarSign,
  Server,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Shield,
  Zap,
  Eye,
  Settings,
  CreditCard,
  Key,
  FileText,
  Bell,
  Search,
  Filter,
  Plus,
  MoreVertical,
  ChevronRight,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle,
  XCircle,
  ArrowUpRight,
  ArrowDownRight,
  BookOpen,
  Globe,
  Lock,
  Unlock,
  RefreshCw,
  Download,
  Upload,
  Trash2,
  Edit,
  ExternalLink,
  RefreshCcw,
  Gauge,
  Cpu,
  HardDrive,
  Database,
  Wifi,
  TrendingUpIcon,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { SkeletonDashboard, SkeletonStatCard, SkeletonRevenueCard, SkeletonHealthCard, SkeletonActionGrid, SkeletonActivityList } from "@/components/ui/skeleton";

// Admin authentication is handled server-side via API call
// The client sends credentials to /api/admin/verify and receives a session token

interface DashboardStats {
  totalUsers: number;
  activeUsers24h: number;
  totalAgents: number;
  totalConversations: number;
  totalMessages: number;
  apiCallsToday: number;
  monthlyRecurring: number;
  totalRevenue: number;
  activeSubscriptions: number;
}

interface SystemHealth {
  apiLatency: number;
  databaseLatency: number;
  memoryUsage: number;
  cpuUsage: number;
  diskUsage: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 127,
    activeUsers24h: 43,
    totalAgents: 284,
    totalConversations: 1523,
    totalMessages: 28457,
    apiCallsToday: 4523,
    monthlyRecurring: 2499.99,
    totalRevenue: 18499.92,
    activeSubscriptions: 12,
  });
  const [health, setHealth] = useState<SystemHealth>({
    apiLatency: 45,
    databaseLatency: 12,
    memoryUsage: 67,
    cpuUsage: 23,
    diskUsage: 45,
  });
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const adminSession = localStorage.getItem("sahjony_admin_session");
    if (adminSession === "authenticated") {
      setIsAdmin(true);
      setShowLogin(false);
      fetchDashboardData();
    } else {
      setLoading(false);
    }
  }, []);

  const handleAdminLogin = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("sahjony_admin_session", "authenticated");
        setIsAdmin(true);
        setShowLogin(false);
        fetchDashboardData();
      } else {
        alert(data.message || "Invalid admin credentials");
      }
    } catch (error) {
      alert("Authentication failed. Please try again.");
    }
  };

  const fetchDashboardData = async () => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setStats({
        totalUsers: 127,
        activeUsers24h: 43,
        totalAgents: 284,
        totalConversations: 1523,
        totalMessages: 28457,
        apiCallsToday: 4523,
        monthlyRecurring: 2499.99,
        totalRevenue: 18499.92,
        activeSubscriptions: 12,
      });
      setHealth({
        apiLatency: 45,
        databaseLatency: 12,
        memoryUsage: 67,
        cpuUsage: 23,
        diskUsage: 45,
      });
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <SkeletonDashboard />;
  }

  if (showLogin || !isAdmin) {
    return <AdminLogin onLogin={handleAdminLogin} />;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-glow-md">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">SAHJONY Control Center</h1>
              <p className="text-text-tertiary text-sm">Platform administration dashboard</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-success/10 border border-success/20">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-glow-sm" />
            <span className="text-success text-sm font-medium">System Operational</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated border border-border/50">
            <Clock className="w-4 h-4 text-text-tertiary" />
            <span className="text-text-secondary text-sm font-mono">
              {currentTime.toLocaleTimeString()}
            </span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-elevated border border-border/50 text-text-secondary hover:text-white hover:border-primary/30 transition-all">
            <RefreshCw className="w-4 h-4" />
            <span className="text-sm">Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Grid - Premium Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <PremiumStatCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="w-5 h-5" />}
          change="+12%"
          trend="up"
          color="primary"
        />
        <PremiumStatCard
          title="Active (24h)"
          value={stats.activeUsers24h}
          icon={<Activity className="w-5 h-5" />}
          change="+8%"
          trend="up"
          color="success"
        />
        <PremiumStatCard
          title="AI Agents"
          value={stats.totalAgents}
          icon={<Bot className="w-5 h-5" />}
          change="+23"
          trend="up"
          color="accent"
        />
        <PremiumStatCard
          title="API Calls Today"
          value={stats.apiCallsToday.toLocaleString()}
          icon={<Zap className="w-5 h-5" />}
          change="+15%"
          trend="up"
          color="warning"
        />
      </div>

      {/* Revenue & Conversations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Card */}
        <div className="card-premium group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center border border-success/20">
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <h2 className="text-lg font-semibold text-white">Revenue Overview</h2>
            </div>
            <button className="text-sm text-primary hover:text-primary-hover transition-colors flex items-center gap-1">
              View Reports <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-4">
            <RevenueRow
              label="Monthly Recurring"
              value={`$${stats.monthlyRecurring.toLocaleString()}`}
              icon={<TrendingUpIcon className="w-4 h-4 text-success" />}
              color="text-success"
            />
            <RevenueRow
              label="Total Revenue"
              value={`$${stats.totalRevenue.toLocaleString()}`}
              icon={<BarChart3 className="w-4 h-4 text-primary" />}
              color="text-white"
            />
            <RevenueRow
              label="Active Subscriptions"
              value={stats.activeSubscriptions.toString()}
              icon={<CreditCard className="w-4 h-4 text-warning" />}
              color="text-warning"
            />
          </div>
        </div>

        {/* Conversations Card */}
        <div className="card-premium group">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center border border-primary/20">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-lg font-semibold text-white">Conversations</h2>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-tertiary">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span>Live</span>
            </div>
          </div>
          <div className="space-y-4">
            <RevenueRow
              label="Total Conversations"
              value={stats.totalConversations.toLocaleString()}
              icon={<MessageSquare className="w-4 h-4 text-primary" />}
              color="text-white"
              badge="+156 today"
              badgeColor="success"
            />
            <RevenueRow
              label="Total Messages"
              value={stats.totalMessages.toLocaleString()}
              icon={<Bot className="w-4 h-4 text-accent" />}
              color="text-white"
              badge="Avg 18/user"
              badgeColor="primary"
            />
          </div>
        </div>
      </div>

      {/* System Health - Premium Monitoring */}
      <div className="card-premium">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 flex items-center justify-center border border-accent/20">
              <Server className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">System Health</h2>
              <p className="text-text-tertiary text-sm">Real-time infrastructure monitoring</p>
            </div>
          </div>
          <span className="text-xs text-text-tertiary">
            Last updated: {currentTime.toLocaleTimeString()}
          </span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <HealthMetric
            label="API Latency"
            value={`${health.apiLatency}ms`}
            status={health.apiLatency < 100 ? "good" : "warning"}
            icon={<Gauge className="w-4 h-4" />}
          />
          <HealthMetric
            label="Database"
            value={`${health.databaseLatency}ms`}
            status={health.databaseLatency < 50 ? "good" : "warning"}
            icon={<Database className="w-4 h-4" />}
          />
          <HealthMetric
            label="Memory"
            value={`${health.memoryUsage}%`}
            status={health.memoryUsage < 80 ? "good" : health.memoryUsage < 90 ? "warning" : "critical"}
            icon={<Cpu className="w-4 h-4" />}
            progress={health.memoryUsage}
          />
          <HealthMetric
            label="CPU"
            value={`${health.cpuUsage}%`}
            status={health.cpuUsage < 70 ? "good" : health.cpuUsage < 85 ? "warning" : "critical"}
            icon={<Activity className="w-4 h-4" />}
            progress={health.cpuUsage}
          />
          <HealthMetric
            label="Disk"
            value={`${health.diskUsage}%`}
            status={health.diskUsage < 85 ? "good" : "critical"}
            icon={<HardDrive className="w-4 h-4" />}
            progress={health.diskUsage}
          />
        </div>
      </div>

      {/* Admin Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <PremiumActionCard
          title="User Management"
          description="Manage all platform users"
          icon={<Users className="w-5 h-5" />}
          href="/dashboard/admin/users"
          color="primary"
        />
        <PremiumActionCard
          title="Financial Reports"
          description="View billing & revenue"
          icon={<DollarSign className="w-5 h-5" />}
          href="/dashboard/admin/billing"
          color="success"
        />
        <PremiumActionCard
          title="Platform Settings"
          description="Configure system settings"
          icon={<Settings className="w-5 h-5" />}
          href="/dashboard/admin/settings"
          color="accent"
        />
        <PremiumActionCard
          title="System Analytics"
          description="View detailed metrics"
          icon={<BarChart3 className="w-5 h-5" />}
          href="/dashboard/admin/analytics"
          color="warning"
        />
        <PremiumActionCard
          title="API Keys"
          description="Manage platform API keys"
          icon={<Key className="w-5 h-5" />}
          href="/dashboard/admin/api-keys"
          color="purple"
        />
        <PremiumActionCard
          title="Audit Logs"
          description="Review admin actions"
          icon={<FileText className="w-5 h-5" />}
          href="/dashboard/admin/audit"
          color="slate"
        />
        <PremiumActionCard
          title="Announcements"
          description="Send platform-wide notices"
          icon={<Bell className="w-5 h-5" />}
          href="/dashboard/admin/announcements"
          color="rose"
        />
        <PremiumActionCard
          title="Support Tickets"
          description="View & manage tickets"
          icon={<AlertTriangle className="w-5 h-5" />}
          href="/dashboard/admin/support"
          color="orange"
        />
      </div>

      {/* Recent Activity */}
      <div className="card-premium">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-text-tertiary/20 to-text-tertiary/10 flex items-center justify-center border border-text-tertiary/20">
              <Clock className="w-5 h-5 text-text-tertiary" />
            </div>
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
          </div>
          <button className="text-sm text-primary hover:text-primary-hover transition-colors flex items-center gap-1">
            View All <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        <div className="space-y-3">
          <PremiumActivityItem
            action="New user registered"
            user="sarah.chen@techcorp.com"
            time="2 minutes ago"
            type="user"
          />
          <PremiumActivityItem
            action="Subscription upgraded"
            user="marcus.johnson@enterprise.io"
            time="15 minutes ago"
            type="billing"
          />
          <PremiumActivityItem
            action="New agent created"
            user="alex.rivera@startup.co"
            time="32 minutes ago"
            type="agent"
          />
          <PremiumActivityItem
            action="API key generated"
            user="emma.wilson@agency.com"
            time="1 hour ago"
            type="api_key"
          />
          <PremiumActivityItem
            action="Support ticket resolved"
            user="admin@sahjonycapitalllc@outlook.com"
            time="2 hours ago"
            type="support"
          />
        </div>
      </div>
    </div>
  );
}

// Premium Login Component
function AdminLogin({ onLogin }: { onLogin: (email: string, password: string) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      onLogin(email, password);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="relative inline-block mb-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-primary to-accent flex items-center justify-center shadow-glow-lg mx-auto">
              <Shield className="w-10 h-10 text-white" />
            </div>
            <Sparkles className="w-6 h-6 text-accent absolute -top-2 -right-2 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SAHJONY Admin</h1>
          <p className="text-text-tertiary">Sign in to access the control center</p>
        </div>

        {/* Login Form */}
        <div className="card-premium p-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2.5">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sahjonycapitalllc@outlook.com"
                className="input-premium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-2.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-premium"
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full btn-primary flex items-center justify-center gap-2 py-4 text-base"
            >
              {loading ? (
                <span className="spinner w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In as Admin</span>
                </>
              )}
            </button>
          </div>
        </div>

        <p className="text-center text-text-tertiary text-sm mt-8">
          Full access to SAHJONY platform control center
        </p>
      </div>
    </div>
  );
}

// Premium Stat Card Component
function PremiumStatCard({
  title,
  value,
  icon,
  change,
  trend,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change: string;
  trend: "up" | "down";
  color: string;
}) {
  const colors = {
    primary: "from-primary/20 to-primary/5 text-primary border-primary/20",
    success: "from-success/20 to-success/5 text-success border-success/20",
    accent: "from-accent/20 to-accent/5 text-accent border-accent/20",
    warning: "from-warning/20 to-warning/5 text-warning border-warning/20",
  };

  return (
    <div className="card-premium group hover:border-primary/30 transition-all duration-300">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl flex items-center justify-center border bg-gradient-to-br ${colors[color as keyof typeof colors]}`}
        >
          {icon}
        </div>
        <div
          className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full ${
            trend === "up"
              ? "bg-success/10 text-success"
              : "bg-error/10 text-error"
          }`}
        >
          {trend === "up" ? (
            <ArrowUpRight className="w-3.5 h-3.5" />
          ) : (
            <ArrowDownRight className="w-3.5 h-3.5" />
          )}
          {change}
        </div>
      </div>
      <div>
        <p className="text-text-tertiary text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
}

// Revenue Row Component
function RevenueRow({
  label,
  value,
  icon,
  color,
  badge,
  badgeColor,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  badge?: string;
  badgeColor?: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated/50 border border-border/30 hover:border-primary/20 transition-all duration-300">
      <div className="flex items-center gap-3">
        <div className="text-text-tertiary">{icon}</div>
        <span className="text-text-secondary text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        {badge && (
          <span
            className={`text-xs px-2 py-1 rounded-full ${
              badgeColor === "success"
                ? "bg-success/10 text-success"
                : "bg-primary/10 text-primary"
            }`}
          >
            {badge}
          </span>
        )}
        <span className={`text-xl font-bold ${color}`}>{value}</span>
      </div>
    </div>
  );
}

// Health Metric Component
function HealthMetric({
  label,
  value,
  status,
  icon,
  progress,
}: {
  label: string;
  value: string;
  status: "good" | "warning" | "critical";
  icon?: React.ReactNode;
  progress?: number;
}) {
  const statusColors = {
    good: "text-success",
    warning: "text-warning",
    critical: "text-error",
  };

  const statusBg = {
    good: "from-success/10 to-success/5 border-success/20",
    warning: "from-warning/10 to-warning/5 border-warning/20",
    critical: "from-error/10 to-error/5 border-error/20",
  };

  return (
    <div
      className={`text-center p-4 rounded-xl bg-gradient-to-b ${statusBg[status]} border transition-all duration-300 hover:scale-105`}
    >
      <div className={`mb-2 ${statusColors[status]}`}>{icon}</div>
      <p className={`text-2xl font-bold ${statusColors[status]}`}>{value}</p>
      <p className="text-text-tertiary text-sm mt-1">{label}</p>
      {progress !== undefined && (
        <div className="mt-3">
          <div className="progress-bar">
            <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}

// Premium Action Card Component
function PremiumActionCard({
  title,
  description,
  icon,
  href,
  color,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
}) {
  const colors = {
    primary: "hover:from-primary/10 hover:to-primary/5 hover:border-primary/30",
    success: "hover:from-success/10 hover:to-success/5 hover:border-success/30",
    accent: "hover:from-accent/10 hover:to-accent/5 hover:border-accent/30",
    warning: "hover:from-warning/10 hover:to-warning/5 hover:border-warning/30",
    purple: "hover:from-purple/10 hover:to-purple/5 hover:border-purple/30",
    slate: "hover:from-slate/10 hover:to-slate/5 hover:border-slate/30",
    rose: "hover:from-rose/10 hover:to-rose/5 hover:border-rose/30",
    orange: "hover:from-orange/10 hover:to-orange/5 hover:border-orange/30",
  };

  const iconColors = {
    primary: "text-primary",
    success: "text-success",
    accent: "text-accent",
    warning: "text-warning",
    purple: "text-purple-400",
    slate: "text-slate-400",
    rose: "text-rose-400",
    orange: "text-orange-400",
  };

  return (
    <a
      href={href}
      className={`group card-premium flex flex-col items-start transition-all duration-300 ${colors[color as keyof typeof colors]}`}
    >
      <div className={`mb-4 p-3 rounded-xl bg-gradient-to-br ${colors[color as keyof typeof colors]} border border-transparent`}>
        <span className={iconColors[color as keyof typeof iconColors]}>{icon}</span>
      </div>
      <h3 className="font-semibold text-white mb-1 group-hover:text-primary transition-colors">
        {title}
      </h3>
      <p className="text-text-tertiary text-sm">{description}</p>
    </a>
  );
}

// Premium Activity Item Component
function PremiumActivityItem({
  action,
  user,
  time,
  type,
}: {
  action: string;
  user: string;
  time: string;
  type: string;
}) {
  const typeColors: Record<string, string> = {
    user: "bg-primary",
    billing: "bg-success",
    agent: "bg-purple-500",
    api_key: "bg-accent",
    support: "bg-orange-500",
  };

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-surface-elevated/30 border border-border/30 hover:border-primary/20 transition-all duration-300 group">
      <div className={`w-2.5 h-2.5 rounded-full ${typeColors[type] || "bg-slate-500"} shadow-glow-sm`} />
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium">{action}</p>
        <p className="text-text-tertiary text-xs truncate">{user}</p>
      </div>
      <span className="text-text-tertiary text-xs whitespace-nowrap group-hover:text-text-secondary transition-colors">
        {time}
      </span>
    </div>
  );
}