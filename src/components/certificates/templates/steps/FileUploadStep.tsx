import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload } from "lucide-react";

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
              onChange={(e) => {
                if (e.target.files?.[0]) {
                  console.log('File selected:', e.target.files[0]);
                  onFileSelect(e.target.files[0]);
                }
              }}
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