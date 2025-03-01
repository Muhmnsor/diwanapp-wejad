
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { exportIdea } from "./ideaExporter";
import { ExportOptions } from "./ExportOptions";
import { ExportFormats } from "./ExportFormats";
import { ExportDialogFooter } from "./ExportDialogFooter";
import { IdeaExportDialogProps } from "./types";
import { getExportFormats, getExportOptions } from "./constants";

export const IdeaExportDialog = ({
  open,
  onOpenChange,
  ideaId,
  ideaTitle,
}: IdeaExportDialogProps) => {
  const exportOptions = getExportOptions();
  const exportFormats = getExportFormats();

  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    exportOptions.filter((option) => option.default).map((option) => option.id)
  );

  const [selectedFormat, setSelectedFormat] = useState<string>(
    exportFormats.find((format) => format.default)?.id || "text"
  );

  const [isExporting, setIsExporting] = useState(false);

  const handleOptionChange = (optionId: string, checked: boolean) => {
    if (checked) {
      setSelectedOptions([...selectedOptions, optionId]);
    } else {
      if (!exportOptions.find((o) => o.id === optionId)?.required) {
        setSelectedOptions(selectedOptions.filter((id) => id !== optionId));
      }
    }
  };

  const handleFormatChange = (formatId: string, checked: boolean) => {
    if (checked) {
      setSelectedFormat(formatId);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportIdea({
        ideaId,
        ideaTitle,
        exportOptions: selectedOptions,
        exportFormat: selectedFormat,
      });
      toast.success("تم تصدير الفكرة بنجاح");
      onOpenChange(false);
    } catch (error) {
      console.error("Error exporting idea:", error);
      toast.error(`حدث خطأ أثناء تصدير الفكرة: ${error.message || "خطأ غير معروف"}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-3xl mx-auto p-6 h-auto overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-xl">تصدير الفكرة</DialogTitle>
          <DialogDescription>
            حدد العناصر التي ترغب بتضمينها في ملف التصدير
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
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
