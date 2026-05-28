import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "card";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ 
  className, 
  variant = "rectangular",
  width,
  height 
}: SkeletonProps) {
  const variants = {
    text: "h-4 rounded",
    circular: "rounded-full",
    rectangular: "rounded-xl",
    card: "rounded-2xl",
  };

  return (
    <div
      className={cn(
        "animate-shimmer bg-gradient-to-r from-surface via-surface-elevated to-surface bg-[length:200%_100%]",
        variants[variant],
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
}

// Preset Skeleton Layouts for Dashboard
export function SkeletonStatCard({ className }: { className?: string }) {
  return (
    <div className={cn("card-premium p-6 space-y-4", className)}>
      <div className="flex items-start justify-between">
        <Skeleton variant="rectangular" width={48} height={48} className="rounded-xl" />
        <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton variant="text" width="60%" height={14} />
        <Skeleton variant="rectangular" width="80%" height={32} className="rounded-lg" />
      </div>
    </div>
  );
}

export function SkeletonRevenueCard({ className }: { className?: string }) {
  return (
    <div className={cn("card-premium p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton variant="rectangular" width={40} height={40} className="rounded-xl" />
          <Skeleton variant="text" width={120} height={20} />
        </div>
        <Skeleton variant="text" width={80} height={16} />
      </div>
      <div className="space-y-3">
        <SkeletonRow />
        <SkeletonRow />
        <SkeletonRow />
      </div>
    </div>
  );
}

export function SkeletonHealthCard({ className }: { className?: string }) {
  return (
    <div className={cn("card-premium p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton variant="rectangular" width={40} height={40} className="rounded-xl" />
          <div className="space-y-2">
            <Skeleton variant="text" width={120} height={20} />
            <Skeleton variant="text" width={180} height={14} />
          </div>
        </div>
        <Skeleton variant="text" width={80} height={14} />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton variant="rectangular" key={i} width="100%" height={80} className="rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function SkeletonActionGrid({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="card-premium p-5 space-y-3">
          <Skeleton variant="rectangular" width={40} height={40} className="rounded-xl" />
          <Skeleton variant="text" width="70%" height={18} />
          <Skeleton variant="text" width="50%" height={14} />
        </div>
      ))}
    </div>
  );
}

export function SkeletonActivityList({ className }: { className?: string }) {
  return (
    <div className={cn("card-premium p-6 space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton variant="rectangular" width={40} height={40} className="rounded-xl" />
          <Skeleton variant="text" width={140} height={20} />
        </div>
        <Skeleton variant="text" width={60} height={16} />
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-surface-elevated/30 border border-border/30">
            <Skeleton variant="circular" width={10} height={10} />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" width="60%" height={16} />
              <Skeleton variant="text" width="40%" height={12} />
            </div>
            <Skeleton variant="text" width={80} height={12} />
          </div>
        ))}
      </div>
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-surface-elevated/50 border border-border/30">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={20} height={20} />
        <Skeleton variant="text" width={120} height={14} />
      </div>
      <div className="flex items-center gap-3">
        <Skeleton variant="rectangular" width={60} height={24} className="rounded-full" />
        <Skeleton variant="text" width={80} height={24} />
      </div>
    </div>
  );
}

// Full Dashboard Skeleton
export function SkeletonDashboard({ className }: { className?: string }) {
  return (
    <div className={cn("space-y-8 animate-fade-in", className)}>
      {/* Header Skeleton */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <Skeleton variant="rectangular" width={48} height={48} className="rounded-2xl" />
          <div className="space-y-2">
            <Skeleton variant="text" width={220} height={32} />
            <Skeleton variant="text" width={180} height={16} />
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Skeleton variant="rectangular" width={160} height={40} className="rounded-xl" />
          <Skeleton variant="rectangular" width={100} height={40} className="rounded-xl" />
          <Skeleton variant="rectangular" width={100} height={40} className="rounded-xl" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
        <SkeletonStatCard />
      </div>

      {/* Revenue & Conversations Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkeletonRevenueCard />
        <SkeletonRevenueCard />
      </div>

      {/* Health Card */}
      <SkeletonHealthCard />

      {/* Action Grid */}
      <SkeletonActionGrid />

      {/* Activity List */}
      <SkeletonActivityList />
    </div>
  );
}