
import { DiscussionPeriodDisplay } from "../types";

export const formatPeriodDisplay = (days: number, hours: number): string => {
  if (days === 0 && hours === 0) {
    return "غير محددة";
  }
  
  const parts = [];
  if (days > 0) {
    parts.push(`${days} يوم`);
  }
  if (hours > 0) {
    parts.push(`${hours} ساعة`);
  }
  
  return parts.join(" و ");
};
