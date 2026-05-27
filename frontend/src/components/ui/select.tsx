import { cn } from "@/lib/utils";
import { forwardRef, SelectHTMLAttributes } from "react";

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, options, placeholder, ...props }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="text-sm font-medium text-zinc-300">
            {label}
          </label>
        )}
        <select
          ref={ref}
          className={cn(
            "w-full h-10 px-3 bg-surface border border-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors appearance-none cursor-pointer",
            error && "border-error focus:ring-error",
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" className="text-zinc-500">
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && (
          <p className="text-sm text-error">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };