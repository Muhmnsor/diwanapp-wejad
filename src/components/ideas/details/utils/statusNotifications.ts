
import { toast } from "sonner";

export const showStatusNotification = (status: string) => {
  switch (status) {
    case 'draft':
    case 'under_review':
      toast.info("تم تحديث حالة الفكرة إلى: قيد المناقشة", { duration: 3000 });
      break;
    case 'pending_decision':
      toast.info("تم تحديث حالة الفكرة إلى: بانتظار القرار", { duration: 3000 });
      break;
    case 'approved':
      toast.success("تم تحديث حالة الفكرة إلى: تمت الموافقة", { duration: 3000 });
      break;
    case 'rejected':
      toast.error("تم تحديث حالة الفكرة إلى: مرفوض", { duration: 3000 });
      break;
    case 'needs_modification':
      toast.warning("تم تحديث حالة الفكرة إلى: يحتاج تعديل", { duration: 3000 });
      break;
  }
};
