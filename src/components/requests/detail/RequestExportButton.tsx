
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { toast } from 'sonner';
import { exportRequest } from '../utils/requestImageExporter';

interface RequestExportButtonProps {
  requestId: string;
  status?: string;
  isEnabled?: boolean;
}

export const RequestExportButton = ({ 
  requestId,
  status,
  isEnabled = true 
}: RequestExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExport = async () => {
    if (!requestId) {
      toast.error("معرف الطلب غير متوفر");
      return;
    }
    
    if (isExporting) {
      // Prevent multiple clicks during processing
      toast.info("جاري تصدير الطلب، يرجى الانتظار...");
      return;
    }
    
    try {
      setIsExporting(true);
      
      // Add a timeout to ensure the UI updates before heavy processing
      setTimeout(async () => {
        try {
          await exportRequest(requestId);
        } catch (error) {
          console.error("Error during export:", error);
          toast.error(`فشل تصدير الطلب: ${error instanceof Error ? error.message : 'خطأ غير معروف'}`);
        } finally {
          // Small delay before resetting to prevent accidental double-clicks
          setTimeout(() => {
            setIsExporting(false);
          }, 1000);
        }
      }, 100);
    } catch (error) {
      console.error("Error initiating export process:", error);
      toast.error("حدث خطأ أثناء بدء عملية التصدير");
      setIsExporting(false);
    }
  };
  
  // Show export for all statuses except draft
  const canExport = isEnabled && status && status !== 'draft';
  
  if (!canExport) return null;
  
  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleExport}
      disabled={isExporting}
      className="gap-1 hover:bg-slate-100"
    >
      <FileDown className="h-4 w-4" />
      {isExporting ? "جاري التصدير..." : "تصدير"}
    </Button>
  );
};
