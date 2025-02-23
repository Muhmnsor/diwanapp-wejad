
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X } from "lucide-react";

export interface SupportingFile {
  name: string;
  file: File | null;
}

interface SupportingFilesSectionProps {
  files: SupportingFile[];
  onFileChange: (index: number, field: keyof SupportingFile, value: any) => void;
  onAddFile: () => void;
  onRemoveFile: (index: number) => void;
}

export const SupportingFilesSection = ({
  files,
  onFileChange,
  onAddFile,
  onRemoveFile,
}: SupportingFilesSectionProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-right">الملفات الداعمة للفكرة</h3>
        <Button type="button" onClick={onAddFile} variant="outline" size="sm">
          إضافة ملف
        </Button>
      </div>

      {files.map((file, index) => (
        <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start border rounded-lg p-4">
          <div className="space-y-2">
            <label className="text-right block text-sm font-medium">
              اسم الملف
            </label>
            <Input
              value={file.name}
              onChange={(e) => onFileChange(index, "name", e.target.value)}
              className="text-right"
              placeholder="اسم الملف"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-right block text-sm font-medium">
              الملف المرفق
            </label>
            <div className="flex gap-2">
              <Input
                type="file"
                onChange={(e) => {
                  const selectedFile = e.target.files?.[0];
                  if (selectedFile) {
                    onFileChange(index, "file", selectedFile);
                  }
                }}
                className="text-right"
                accept="application/pdf,image/*,.doc,.docx,.xls,.xlsx"
                required
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => onRemoveFile(index)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
