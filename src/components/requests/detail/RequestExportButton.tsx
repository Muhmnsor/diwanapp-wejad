
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { exportRequestWithEnhancedData } from '../utils/requestExportUtils';
import { toast } from 'sonner';

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
    
    try {
      setIsExporting(true);
      await exportRequestWithEnhancedData(requestId);
    } catch (error) {
      console.error("Error exporting request:", error);
      // Toast error is already handled in the export function
    } finally {
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
      {isExporting ? "جاري التصدير..." : "تصدير PDF"}
    </Button>
  );
};
