import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface FileUploadStepProps {
  currentFile: string;
  onFileSelect: (file: File) => void;
  dragActive: boolean;
  onDrag: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const FileUploadStep = ({
  currentFile,
  onFileSelect,
  dragActive,
  onDrag,
  onDrop
}: FileUploadStepProps) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type !== 'application/pdf') {
        toast.error('يجب أن يكون الملف بصيغة PDF');
        return;
      }
      console.log('File selected:', file);
      onFileSelect(file);
      toast.success('تم رفع الملف بنجاح');
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="space-y-2">
        <Label>ملف القالب</Label>
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive ? 'border-primary bg-primary/5' : 'border-border'
          }`}
          onDragEnter={onDrag}
          onDragLeave={onDrag}
          onDragOver={onDrag}
          onDrop={onDrop}
        >
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              اسحب وأفلت الملف هنا أو
            </p>
            <Input
              id="template_file"
              type="file"
              accept=".pdf"
              className="max-w-[200px]"
              onChange={handleFileChange}
            />
            {currentFile && (
              <p className="text-sm text-muted-foreground mt-2">
                الملف الحالي: {currentFile}
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};