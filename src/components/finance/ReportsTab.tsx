
import { useState } from "react";
import { ReportsHeader } from "./reports/ReportsHeader";
import { ReportsTabs } from "./reports/ReportsTabs";
import { useFinancialData } from "./reports/hooks/useFinancialData";
import { formatCurrency } from "./reports/utils/formatters";
import { exportFinancialReport } from "./reports/utils/exportReport";
import { toast } from "sonner";

export const ReportsTab = () => {
  const [activeReportTab, setActiveReportTab] = useState("summary");
  const { financialData, loading, comparisonData } = useFinancialData();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      await exportFinancialReport(financialData, comparisonData, formatCurrency);
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("حدث خطأ أثناء تصدير التقرير");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <ReportsHeader 
        onExport={handleExportReport} 
        isExporting={isExporting} 
      />
      
      <ReportsTabs 
        activeReportTab={activeReportTab}
        setActiveReportTab={setActiveReportTab}
        financialData={financialData}
        loading={loading}
        comparisonData={comparisonData}
        formatCurrency={formatCurrency}
      />
    </div>
  );
};
