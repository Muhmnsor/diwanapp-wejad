
import React, { forwardRef } from "react";
import { Input } from "./input";

interface TimeInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  onChange: (value: string) => void;
  value: string;
}

export const TimeInput = forwardRef<HTMLInputElement, TimeInputProps>(
  ({ onChange, value, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    return (
      <Input
        ref={ref}
        type="time"
        value={value}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

TimeInput.displayName = "TimeInput";
