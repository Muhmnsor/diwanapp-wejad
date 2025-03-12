
import React, { useEffect, useRef } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { useMergeRefs } from "@/lib/mergeRefs";
import { cn } from "@/lib/utils";

interface IndeterminateCheckboxProps extends React.ComponentPropsWithoutRef<typeof Checkbox> {
  indeterminate?: boolean;
  wrapperClassName?: string;
}

export const IndeterminateCheckbox = React.forwardRef<
  React.ElementRef<typeof Checkbox>,
  IndeterminateCheckboxProps
>(({ indeterminate = false, className, wrapperClassName, ...props }, forwardedRef) => {
  const checkboxRef = useRef<HTMLButtonElement>(null);
  const mergedRef = useMergeRefs([checkboxRef, forwardedRef]);

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.dataset.state = indeterminate ? "indeterminate" : "unchecked";
      checkboxRef.current.ariaChecked = indeterminate ? "mixed" : props.checked ? "true" : "false";
    }
  }, [indeterminate, props.checked]);

  return (
    <Checkbox
      ref={mergedRef}
      className={cn(
        indeterminate && "data-[state=indeterminate]:bg-primary/50 data-[state=indeterminate]:text-primary-foreground",
        className
      )}
      {...props}
      data-state={indeterminate ? "indeterminate" : undefined}
    />
  );
});

IndeterminateCheckbox.displayName = "IndeterminateCheckbox";
