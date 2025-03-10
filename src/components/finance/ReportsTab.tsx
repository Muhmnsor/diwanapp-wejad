
import { useState } from "react";
import { ReportsHeader } from "./reports/ReportsHeader";
import { useFinancialData } from "./reports/hooks/useFinancialData";
import { formatCurrency } from "./reports/utils/formatters";
import { exportFinancialReport } from "./reports/utils/exportReport";
import { toast } from "sonner";
import { FinancialSummaryCard } from "./reports/FinancialSummaryCard";
import { TargetsComparisonChart } from "./reports/TargetsComparisonChart";
import { ExportReportDialog } from "./reports/ExportReportDialog";

export const ReportsTab = () => {
  const { financialData, loading, comparisonData } = useFinancialData();
  const [isExporting, setIsExporting] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [selectedReportType, setSelectedReportType] = useState<string | null>(null);

  const handleExportReport = async (reportType: string, options: any) => {
    setIsExporting(true);
    try {
      // Create a FinancialData object that matches the expected interface
      const exportData = {
        totalResources: financialData.totalResources,
        totalExpenses: financialData.totalExpenses,
        netBalance: financialData.totalResources - financialData.totalExpenses,
        resourcesData: options.includeResourceDetails ? (financialData.resourcesData || []) : undefined,
        expensesData: options.includeExpenseDetails ? (financialData.expensesData || []) : undefined,
        timePeriod: options.timePeriod,
        startDate: options.timePeriod === 'custom' ? options.startDate : undefined,
        endDate: options.timePeriod === 'custom' ? options.endDate : undefined
      };
      
      await exportFinancialReport(exportData, comparisonData, formatCurrency, reportType);
      toast.success(`تم تصدير تقرير ${options.reportTitle} بنجاح`);
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("حدث خطأ أثناء تصدير التقرير");
    } finally {
      setIsExporting(false);
      setIsExportDialogOpen(false);
    }
  };

  const openExportDialog = (reportType: string) => {
    setSelectedReportType(reportType);
    setIsExportDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <ReportsHeader 
        onExport={openExportDialog} 
        isExporting={isExporting} 
      />
      
      <div className="space-y-6">
        <FinancialSummaryCard
          financialData={financialData}
          loading={loading}
          formatCurrency={formatCurrency}
        />
        
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">مقارنة المستهدفات والمصروفات</h3>
          <TargetsComparisonChart data={comparisonData} loading={loading} />
        </div>
      </div>

      <ExportReportDialog 
        isOpen={isExportDialogOpen}
        onClose={() => setIsExportDialogOpen(false)}
        onExport={handleExportReport}
        reportType={selectedReportType}
        isExporting={isExporting}
      />
    </div>
  );
};
