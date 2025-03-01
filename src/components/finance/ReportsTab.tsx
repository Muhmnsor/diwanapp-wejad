
import { useState } from "react";
import { ReportsHeader } from "./reports/ReportsHeader";
import { ReportsTabs } from "./reports/ReportsTabs";
import { useFinancialData } from "./reports/hooks/useFinancialData";
import { formatCurrency } from "./reports/utils/formatters";

export const ReportsTab = () => {
  const [activeReportTab, setActiveReportTab] = useState("summary");
  const { financialData, loading, comparisonData } = useFinancialData();

  const handleExportReport = () => {
    // Future implementation for report export
    console.log("Exporting report...");
  };

  return (
    <div className="space-y-6">
      <ReportsHeader onExport={handleExportReport} />
      
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
