
import { toast } from "sonner";

/**
 * Displays a notification based on the idea status
 */
export const showStatusNotification = (status: string) => {
  if (status === "pending_decision") {
    toast.info("الفكرة الآن بانتظار القرار", { duration: 3000 });
  } else if (status === "approved") {
    toast.success("تمت الموافقة على الفكرة", { duration: 3000 });
  } else if (status === "rejected") {
    toast.error("تم رفض الفكرة", { duration: 3000 });
  } else if (status === "under_review" || status === "draft") {
    toast.info("الفكرة الآن قيد المناقشة", { duration: 3000 });
  }
};
