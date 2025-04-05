
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from 'xlsx';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";

interface ExportButtonProps {
  data: any;
  filename: string;
}

export const ExportButton = ({ data, filename }: ExportButtonProps) => {
  const handleExport = () => {
    // Deep clone the data to avoid modifying the original
    const processedData = JSON.parse(JSON.stringify(data));
    
    // Helper function to convert complex data to a flat structure
    const flattenData = (data: any) => {
      // If data is an array of simple objects, keep it as is
      if (Array.isArray(data)) {
        return data.map(item => {
          // For each object in the array, flatten any nested objects
          const flatItem: any = {};
          
          for (const key in item) {
            if (typeof item[key] === 'object' && item[key] !== null && !Array.isArray(item[key])) {
              // Flatten nested objects with prefix
              for (const nestedKey in item[key]) {
                flatItem[`${key}_${nestedKey}`] = item[key][nestedKey];
              }
            } else if (!Array.isArray(item[key])) {
              // Keep non-array values
              flatItem[key] = item[key];
            } else {
              // For arrays, convert to string representation or skip
              flatItem[key] = JSON.stringify(item[key]);
            }
          }
          
          return flatItem;
        });
      }
      
      // For nested structures, try to convert to exportable format
      const result = [];
      
      // Special case for structures like Balance Sheet, Income Statement
      if (data.assets || data.liabilities || data.equity) {
        // Balance Sheet
        if (data.assets) result.push(...data.assets.map((a: any) => ({ ...a, section: 'الأصول' })));
        if (data.liabilities) result.push(...data.liabilities.map((l: any) => ({ ...l, section: 'الالتزامات' })));
        if (data.equity) result.push(...data.equity.map((e: any) => ({ ...e, section: 'حقوق الملكية' })));
      } else if (data.revenues || data.expenses) {
        // Income Statement
        if (data.revenues) result.push(...data.revenues.map((r: any) => ({ ...r, section: 'الإيرادات' })));
        if (data.expenses) result.push(...data.expenses.map((e: any) => ({ ...e, section: 'المصروفات' })));
      } else if (data.entries) {
        // Trial Balance
        return data.entries;
      } else if (data.operatingActivities || data.investingActivities || data.financingActivities) {
        // Cash Flow
        if (data.operatingActivities) result.push(...data.operatingActivities.map((a: any) => ({ ...a, section: 'أنشطة التشغيل' })));
        if (data.investingActivities) result.push(...data.investingActivities.map((a: any) => ({ ...a, section: 'أنشطة الاستثمار' })));
        if (data.financingActivities) result.push(...data.financingActivities.map((a: any) => ({ ...a, section: 'أنشطة التمويل' })));
      }
      
      // If we successfully extracted tabular data
      if (result.length > 0) return result;
      
      // Fallback: try to flatten the data structure
      return [data];
    };
    
    // Process the data for export
    const exportData = flattenData(processedData);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    
    // Create worksheet from data
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
    
    // Generate the file
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            <span className="hidden md:inline">تصدير إلى Excel</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>تصدير البيانات إلى ملف Excel</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
