import { cn } from "@/lib/utils";
import { forwardRef, InputHTMLAttributes, ReactNode, TextareaHTMLAttributes } from "react";
import { AlertCircle } from "lucide-react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  variant?: "default" | "filled" | "ghost";
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, iconPosition = "left", variant = "default", type, ...props }, ref) => {
    const variants = {
      default: "bg-surface border-border focus:border-primary focus:shadow-glow-sm",
      filled: "bg-surface-elevated/50 border-border/50 focus:bg-surface-elevated focus:border-primary",
      ghost: "bg-transparent border-transparent focus:border-primary/50",
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && iconPosition === "left" && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            type={type}
            className={cn(
              "w-full px-4 py-3.5 rounded-xl text-white text-sm transition-all duration-300",
              "placeholder:text-text-tertiary",
              "focus:outline-none focus:ring-2 focus:ring-primary/30",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              icon && iconPosition === "left" && "pl-12",
              icon && iconPosition === "right" && "pr-12",
              variants[variant],
              error && "border-error focus:border-error focus:ring-error/30",
              className
            )}
            {...props}
          />
          {icon && iconPosition === "right" && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-text-tertiary">
              {icon}
            </div>
          )}
        </div>
        {error && (
          <div className="flex items-center gap-2 mt-2 text-error text-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  variant?: "default" | "filled" | "ghost";
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, variant = "default", ...props }, ref) => {
    const variants = {
      default: "bg-surface border-border focus:border-primary focus:shadow-glow-sm",
      filled: "bg-surface-elevated/50 border-border/50 focus:bg-surface-elevated focus:border-primary",
      ghost: "bg-transparent border-transparent focus:border-primary/50",
    };

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          className={cn(
            "w-full px-4 py-3.5 rounded-xl text-white text-sm transition-all duration-300 resize-none",
            "placeholder:text-text-tertiary",
            "focus:outline-none focus:ring-2 focus:ring-primary/30",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            variants[variant],
            error && "border-error focus:border-error focus:ring-error/30",
            className
          )}
          {...props}
        />
        {error && (
          <div className="flex items-center gap-2 mt-2 text-error text-xs">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export { Input, Textarea };