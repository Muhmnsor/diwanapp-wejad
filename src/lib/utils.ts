
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDate } from "@/utils/formatters";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Re-export formatDate for backward compatibility
export { formatDate };
