import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "glass" | "gradient";
  padding?: "none" | "sm" | "md" | "lg" | "xl";
  hover?: boolean;
  onClick?: () => void;
}

export function Card({ 
  children, 
  className, 
  variant = "default", 
  padding = "md",
  hover = false,
  onClick 
}: CardProps) {
  const variants = {
    default: "bg-surface border-border",
    elevated: "bg-surface-elevated border-border/50 shadow-card",
    glass: "bg-surface-glass/80 backdrop-blur-xl border-border/50",
    gradient: "bg-gradient-to-br from-surface-elevated to-surface border-border/50",
  };

  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
    xl: "p-10",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl border transition-all duration-400",
        variants[variant],
        paddings[padding],
        hover && "cursor-pointer hover:border-primary/30 hover:shadow-card-hover hover:translate-y-[-2px] active:translate-y-[0px]",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: "up" | "down" | "neutral";
  icon?: ReactNode;
  iconColor?: string;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  change, 
  trend = "neutral", 
  icon, 
  iconColor = "text-primary",
  className 
}: StatCardProps) {
  const trendColors = {
    up: "text-success",
    down: "text-error",
    neutral: "text-text-tertiary",
  };

  return (
    <Card variant="elevated" padding="lg" hover className={cn("group", className)}>
      <div className="flex items-start justify-between mb-4">
        {icon && (
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center",
            "bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20",
            "group-hover:scale-110 transition-transform duration-300"
          )}>
            <span className={iconColor}>{icon}</span>
          </div>
        )}
        {change && (
          <span className={cn(
            "text-xs font-semibold px-2.5 py-1 rounded-full",
            trend === "up" && "bg-success/10 text-success",
            trend === "down" && "bg-error/10 text-error",
            trend === "neutral" && "bg-surface-elevated text-text-tertiary"
          )}>
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-text-tertiary text-sm mb-1">{title}</p>
        <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </Card>
  );
}

interface MetricCardProps {
  label: string;
  value: string;
  status?: "good" | "warning" | "critical";
  progress?: number;
  className?: string;
}

export function MetricCard({ 
  label, 
  value, 
  status = "good",
  progress,
  className 
}: MetricCardProps) {
  const statusColors = {
    good: "text-success",
    warning: "text-warning",
    critical: "text-error",
  };

  return (
    <div className={cn("text-center p-4 rounded-xl bg-surface-elevated/50 border border-border/30", className)}>
      <p className={cn("text-2xl font-bold mb-1", statusColors[status])}>{value}</p>
      <p className="text-text-tertiary text-sm mb-2">{label}</p>
      {progress !== undefined && (
        <div className="progress-bar">
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}