
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { exportPersonalReport, PersonalReportData } from "@/utils/reports/exportPersonalReport";

interface ExportButtonProps {
  data: PersonalReportData;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
}

export const ExportButton = ({ data, variant = "outline", size = "sm" }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (isExporting) return;
    
    setIsExporting(true);
    try {
      await exportPersonalReport(data);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleExport}
      disabled={isExporting}
    >
      {isExporting ? (
        <span className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          جاري التصدير...
        </span>
      ) : (
        <>
          <Download className="ml-2 h-4 w-4" />
          تصدير كملف PDF
        </>
      )}
    </Button>
  );
};
