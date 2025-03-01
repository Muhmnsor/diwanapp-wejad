
import { toast } from "sonner";
import { exportToText } from "./exportText";

/**
 * Export idea data as a PDF file (currently falls back to text)
 */
export const exportToPdf = async (data: any, ideaTitle: string, exportOptions: string[]) => {
  // Future feature - currently using text export as fallback
  toast.error("عذراً، التصدير بصيغة PDF غير متاح حالياً. جاري استخدام التصدير النصي بدلاً من ذلك.");
  exportToText(data, ideaTitle);
};
