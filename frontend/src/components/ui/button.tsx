import { cn } from "@/lib/utils";
import { forwardRef, ButtonHTMLAttributes } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, icon, iconPosition = "left", children, disabled, ...props }, ref) => {
    const variants = {
      primary: "bg-gradient-to-r from-primary to-primary-hover text-white shadow-glow-sm hover:shadow-glow-md hover:scale-[1.02] active:scale-[0.98]",
      secondary: "bg-surface-elevated text-white border border-border hover:border-primary/50 hover:bg-surface-elevated/80",
      ghost: "bg-transparent text-text-secondary hover:text-white hover:bg-surface-elevated/50",
      danger: "bg-gradient-to-r from-error to-red-600 text-white shadow-glow-sm hover:shadow-glow-md",
      outline: "bg-transparent text-primary border border-primary/50 hover:bg-primary/10 hover:border-primary",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5 rounded-lg",
      md: "h-10 px-4 text-sm gap-2 rounded-xl",
      lg: "h-12 px-6 text-base gap-2 rounded-xl",
      xl: "h-14 px-8 text-base gap-3 rounded-2xl",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center font-semibold transition-all duration-300",
          "disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed",
          "hover:translate-y-[-1px] active:translate-y-[0px]",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="spinner w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : (
          <>
            {icon && iconPosition === "left" && <span className="flex-shrink-0">{icon}</span>}
            {children}
            {icon && iconPosition === "right" && <span className="flex-shrink-0">{icon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };