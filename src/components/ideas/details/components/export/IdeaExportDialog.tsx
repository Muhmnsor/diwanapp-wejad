
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { exportIdea } from "./ideaExporter";
import { ExportOptions } from "./ExportOptions";
import { ExportFormats } from "./ExportFormats";
import { ExportDialogFooter } from "./ExportDialogFooter";
import { toast } from "sonner";
import { IdeaExportDialogProps } from "./types";
import { exportOptions, exportFormats } from "./constants";

export const IdeaExportDialog = ({
  open,
  onOpenChange,
  ideaId,
  ideaTitle,
}: IdeaExportDialogProps) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    exportOptions
      .filter((option) => option.default || option.required)
      .map((option) => option.id)
  );
  
  const [selectedFormat, setSelectedFormat] = useState<string>(
    exportFormats.find((format) => format.default)?.id || exportFormats[0].id
  );
  
  const [isExporting, setIsExporting] = useState(false);

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions([...selectedOptions, optionId]);
    } else {
      setSelectedOptions(selectedOptions.filter((id) => id !== optionId));
    }
  };

  const handleFormatChange = (formatId: string, checked: boolean) => {
    if (checked) {
      setSelectedFormat(formatId);
    }
  };

  const handleExport = async () => {
    console.log("=== بدء عملية التصدير ===");
    console.log("معرف الفكرة:", ideaId);
    console.log("عنوان الفكرة:", ideaTitle);
    console.log("الخيارات المحددة:", selectedOptions);
    console.log("التنسيق المحدد:", selectedFormat);
    
    setIsExporting(true);
    
    try {
      console.log("بدء التصدير...");
      
      if (!ideaId) {
        throw new Error("معرف الفكرة غير محدد");
      }
      
      if (!ideaTitle) {
        console.warn("عنوان الفكرة غير محدد، سيتم استخدام عنوان افتراضي");
      }
      
      await exportIdea({
        ideaId,
        ideaTitle: ideaTitle || "فكرة",
        exportOptions: selectedOptions,
        exportFormat: selectedFormat,
      });
      
      toast.success("تم تصدير الفكرة بنجاح");
      console.log("=== اكتملت عملية التصدير بنجاح ===");
      
      // إغلاق النافذة بعد 1 ثانية للسماح للمستخدم برؤية رسالة النجاح
      setTimeout(() => {
        onOpenChange(false);
      }, 1000);
    } catch (error) {
      console.error("خطأ أثناء تصدير الفكرة:", error);
      
      let errorMessage = "حدث خطأ أثناء تصدير الفكرة";
      
      if (error instanceof Error) {
        errorMessage += `: ${error.message}`;
        console.error("تفاصيل الخطأ:", error.stack);
      } else {
        errorMessage += ": خطأ غير معروف";
        console.error("خطأ غير معروف:", error);
      }
      
      toast.error(errorMessage);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" dir="rtl">
        <DialogHeader>
          <DialogTitle>تصدير الفكرة</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 max-h-[70vh] overflow-y-auto p-1">
          <ExportOptions
            selectedOptions={selectedOptions}
            handleOptionChange={handleOptionChange}
            exportOptions={exportOptions}
          />
          
          <ExportFormats
            selectedFormat={selectedFormat}
            handleFormatChange={handleFormatChange}
            exportFormats={exportFormats}
          />
        </div>
        
        <ExportDialogFooter
          isExporting={isExporting}
          onCancel={() => onOpenChange(false)}
          onExport={handleExport}
        />
      </DialogContent>
    </Dialog>
  );
};
