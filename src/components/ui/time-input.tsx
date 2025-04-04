
// src/components/ui/time-input.tsx
import React, { ChangeEvent, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface TimeInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (value: string) => void;
}

export const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, onChange, ...props }, ref) => {
    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
      onChange(event.target.value);
    };

    return (
      <input
        type="time"
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    );
  }
);
TimeInput.displayName = "TimeInput";
