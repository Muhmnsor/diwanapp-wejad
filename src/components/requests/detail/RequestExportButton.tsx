
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, FileImage, FileText } from "lucide-react";
import { exportRequestWithEnhancedData } from '../utils/requestExportUtils';
import { toast } from 'sonner';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { exportRequestToImage } from '../utils/requestImageExporter';
import { fetchRequestExportData } from '../utils/requestExportUtils';

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
  
  const handleExportPdf = async () => {
    if (!requestId) {
      toast.error("معرف الطلب غير متوفر");
      return;
    }
    
    try {
      setIsExporting(true);
      await exportRequestWithEnhancedData(requestId);
    } catch (error) {
      console.error("Error exporting request to PDF:", error);
      // Toast error is already handled in the export function
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleExportImage = async () => {
    if (!requestId) {
      toast.error("معرف الطلب غير متوفر");
      return;
    }
    
    try {
      setIsExporting(true);
      
      // Get the data for export
      const data = await fetchRequestExportData(requestId);
      
      // Export to image
      await exportRequestToImage(data);
    } catch (error) {
      console.error("Error exporting request to image:", error);
      toast.error(`حدث خطأ أثناء تصدير وثيقة الطلب: ${error.message || "خطأ غير معروف"}`);
    } finally {
      setIsExporting(false);
    }
  };
  
  // Disable export for pending requests or if explicitly disabled
  const canExport = isEnabled && 
    status && 
    ['completed', 'approved', 'executed', 'implementation_complete'].includes(status);
  
  if (!canExport) return null;
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm"
          disabled={isExporting}
          className="gap-1"
        >
          <FileDown className="h-4 w-4" />
          {isExporting ? "جاري التصدير..." : "تصدير"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPdf} disabled={isExporting}>
          <FileText className="h-4 w-4 mr-2" />
          تصدير PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportImage} disabled={isExporting}>
          <FileImage className="h-4 w-4 mr-2" />
          تصدير كوثيقة
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
