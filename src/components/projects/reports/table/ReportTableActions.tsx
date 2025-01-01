import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { ExportButton } from "@/components/admin/ExportButton";

interface ReportTableActionsProps {
  report: ProjectActivityReport;
  onDelete: () => void;
}

export const ReportTableActions = ({ report, onDelete }: ReportTableActionsProps) => {
  // Prepare data for export
  const exportData = [{
    "اسم التقرير": report.report_name,
    "اسم البرنامج": report.program_name || '',
    "نص التقرير": report.report_text,
    "الوصف التفصيلي": report.detailed_description || '',
    "مدة النشاط": report.activity_duration || '',
    "عدد الحضور": report.attendees_count || '',
    "أهداف النشاط": report.activity_objectives || '',
    "الأثر على المشاركين": report.impact_on_participants || '',
    "تاريخ الإنشاء": new Date(report.created_at).toLocaleDateString('ar')
  }];

  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      <ExportButton 
        data={exportData}
        filename={`تقرير-${report.report_name}`}
      />
    </div>
  );
};