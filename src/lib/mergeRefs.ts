
import React from "react";

export function useMergeRefs<T = any>(
  refs: Array<React.MutableRefObject<T> | React.LegacyRef<T> | null | undefined>
): React.RefCallback<T> {
  return React.useCallback((value: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref != null) {
        (ref as React.MutableRefObject<T | null>).current = value;
      }
    });
  }, [refs]);
}
