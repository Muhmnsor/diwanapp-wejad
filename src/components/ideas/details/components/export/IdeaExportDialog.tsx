
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@radix-ui/react-label";
import { FileDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { exportIdea } from "./ideaExporter";

interface IdeaExportOption {
  id: string;
  label: string;
  description: string;
  required?: boolean;
  default?: boolean;
}

interface IdeaExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideaId: string;
  ideaTitle: string;
}

export const IdeaExportDialog = ({
  open,
  onOpenChange,
  ideaId,
  ideaTitle,
}: IdeaExportDialogProps) => {
  const exportOptions: IdeaExportOption[] = [
    {
      id: "basic",
      label: "معلومات الفكرة الأساسية",
      description: "عنوان الفكرة، الوصف، المشكلة، الفرصة، الفوائد المتوقعة، إلخ",
      required: true,
      default: true,
    },
    {
      id: "comments",
      label: "التعليقات والمناقشات",
      description: "جميع التعليقات والمناقشات المتعلقة بالفكرة",
      default: true,
    },
    {
      id: "votes",
      label: "التصويتات والإحصاءات",
      description: "إحصاءات التصويت على الفكرة",
      default: true,
    },
    {
      id: "decision",
      label: "القرار المتخذ",
      description: "القرار النهائي وتفاصيله إذا كان متوفراً",
      default: true,
    },
    {
      id: "files_links",
      label: "روابط الملفات الداعمة",
      description: "روابط الملفات الداعمة للفكرة (بدون تنزيل الملفات)",
      default: true,
    },
    {
      id: "attachment_links",
      label: "روابط مرفقات التعليقات",
      description: "روابط الملفات المرفقة بالتعليقات (بدون تنزيل الملفات)",
      default: true,
    },
    {
      id: "download_files",
      label: "تنزيل الملفات المرفقة",
      description: "تنزيل الملفات الداعمة ومرفقات التعليقات كجزء من التصدير",
      default: false,
    },
  ];

  const exportFormats = [
    {
      id: "pdf",
      label: "PDF",
      description: "تصدير بصيغة PDF (مستند للقراءة)",
    },
    {
      id: "text",
      label: "نص عادي",
      description: "تصدير بصيغة نص عادي",
      default: true,
    },
    {
      id: "zip",
      label: "ملف مضغوط",
      description: "تصدير جميع المعلومات كملفات نصية في ملف مضغوط ZIP",
    },
  ];

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
          <div className="space-y-4">
            <h3 className="font-medium text-lg">محتويات التصدير</h3>
            <div className="grid gap-4">
              {exportOptions.map((option) => (
                <div key={option.id} className="flex items-start space-x-2 space-x-reverse">
                  <Checkbox
                    id={`option-${option.id}`}
                    checked={selectedOptions.includes(option.id)}
                    onCheckedChange={(checked) => handleOptionChange(option.id, !!checked)}
                    disabled={option.required}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor={`option-${option.id}`}
                      className={`font-medium ${option.required ? "text-muted-foreground" : ""}`}
                    >
                      {option.label}
                      {option.required && <span className="text-sm text-red-500"> (إلزامي)</span>}
                    </label>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-lg">تنسيق التصدير</h3>
            <div className="grid gap-4">
              {exportFormats.map((format) => (
                <div key={format.id} className="flex items-start space-x-2 space-x-reverse">
                  <Checkbox
                    id={`format-${format.id}`}
                    checked={selectedFormat === format.id}
                    onCheckedChange={(checked) => handleFormatChange(format.id, !!checked)}
                    className="mt-1"
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label htmlFor={`format-${format.id}`} className="font-medium">
                      {format.label}
                    </label>
                    <p className="text-sm text-muted-foreground">{format.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isExporting}
          >
            إلغاء
          </Button>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري التصدير...
              </>
            ) : (
              <>
                <FileDown className="mr-2 h-4 w-4" />
                تصدير
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
