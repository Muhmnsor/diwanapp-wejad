
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { ExportDialogHeader } from "./export-dialog/DialogHeader";
import { TimePeriodSelector } from "./export-dialog/TimePeriodSelector";
import { DateRangePicker } from "./export-dialog/DateRangePicker";
import { ReportTitleField } from "./export-dialog/ReportTitleField";
import { OptionCheckboxes } from "./export-dialog/OptionCheckboxes";
import { ExportDialogFooter } from "./export-dialog/DialogFooter";
import { ExportDialogProps, ExportOptions } from "./export-dialog/types";

export const ExportReportDialog: React.FC<ExportDialogProps> = ({
  isOpen,
  onClose,
  onExport,
  reportType,
  isExporting
}) => {
  const [options, setOptions] = useState<ExportOptions>({
    reportTitle: "",
    timePeriod: "current-year",
    startDate: new Date(),
    endDate: new Date(),
    includeResourceDetails: false,
    includeExpenseDetails: false,
    includeBudgetItems: false,
    includeCharts: true,
  });

  // Get report title based on report type
  useEffect(() => {
    if (reportType) {
      let title = "";
      switch (reportType) {
        case "summary":
          title = "الملخص المالي";
          break;
        case "resources":
          title = "تقرير الموارد المالية";
          break;
        case "expenses":
          title = "تقرير المصروفات";
          break;
        case "comparison":
          title = "تقرير مقارنة المستهدفات";
          break;
        case "budget-distribution":
          title = "توزيع الإنفاق على البنود";
          break;
        case "comprehensive":
          title = "التقرير المالي الشامل";
          break;
        default:
          title = "تقرير مالي";
      }
      setOptions({...options, reportTitle: title});
    }
  }, [reportType]);

  const handleExport = () => {
    if (reportType) {
      onExport(reportType, options);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <ExportDialogHeader reportType={reportType} />
        
        <div className="grid gap-4 py-4">
          <ReportTitleField 
            reportTitle={options.reportTitle}
            onReportTitleChange={(value) => setOptions({...options, reportTitle: value})}
          />

          <TimePeriodSelector 
            timePeriod={options.timePeriod}
            onTimePeriodChange={(value) => setOptions({...options, timePeriod: value})}
          />

          {options.timePeriod === "custom" && (
            <DateRangePicker 
              startDate={options.startDate}
              endDate={options.endDate}
              onStartDateChange={(date) => setOptions({...options, startDate: date})}
              onEndDateChange={(date) => setOptions({...options, endDate: date})}
            />
          )}

          <OptionCheckboxes 
            options={[
              {
                id: "includeResourceDetails",
                label: "تضمين تفاصيل الموارد",
                checked: options.includeResourceDetails,
                onChange: (checked) => setOptions({...options, includeResourceDetails: checked}),
                showIf: reportType === "resources" || reportType === "comprehensive"
              },
              {
                id: "includeExpenseDetails",
                label: "تضمين تفاصيل المصروفات",
                checked: options.includeExpenseDetails,
                onChange: (checked) => setOptions({...options, includeExpenseDetails: checked}),
                showIf: reportType === "expenses" || reportType === "comprehensive"
              },
              {
                id: "includeBudgetItems",
                label: "تضمين بنود الميزانية",
                checked: options.includeBudgetItems,
                onChange: (checked) => setOptions({...options, includeBudgetItems: checked}),
                showIf: reportType === "budget-distribution" || reportType === "comprehensive"
              },
              {
                id: "includeCharts",
                label: "تضمين الرسوم البيانية",
                checked: options.includeCharts,
                onChange: (checked) => setOptions({...options, includeCharts: checked})
              }
            ]}
          />
        </div>

        <ExportDialogFooter
          onClose={onClose}
          onExport={handleExport}
          isExporting={isExporting}
        />
      </DialogContent>
    </Dialog>
  );
};
