
import { DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DialogHeaderProps {
  reportType: string | null;
}

export const ExportDialogHeader: React.FC<DialogHeaderProps> = ({ reportType }) => {
  const getDialogTitle = () => {
    if (!reportType) return "تصدير تقرير";
    
    switch (reportType) {
      case "summary":
        return "تصدير الملخص المالي";
      case "resources":
        return "تصدير تقرير الموارد المالية";
      case "expenses":
        return "تصدير تقرير المصروفات";
      case "comparison":
        return "تصدير تقرير مقارنة المستهدفات";
      case "budget-distribution":
        return "تصدير تقرير توزيع الإنفاق على البنود";
      case "comprehensive":
        return "تصدير التقرير المالي الشامل";
      default:
        return "تصدير تقرير";
    }
  };

  return (
    <DialogHeader>
      <DialogTitle className="text-right">{getDialogTitle()}</DialogTitle>
    </DialogHeader>
  );
};
