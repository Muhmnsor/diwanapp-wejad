import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { CertificateTemplateFields } from "./CertificateTemplateFields";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";

interface CertificateTemplateFormProps {
  template?: any;
  isLoading: boolean;
  onSubmit: (formData: any, selectedFile: File | null) => void;
  onCancel: () => void;
}

export const CertificateTemplateForm = ({
  template,
  isLoading,
  onSubmit,
  onCancel
}: CertificateTemplateFormProps) => {
  const [formData, setFormData] = useState({
    name: template?.name || '',
    description: template?.description || '',
    template_file: template?.template_file || '',
    fields: template?.fields || {},
    language: template?.language || 'ar',
    orientation: template?.orientation || 'portrait',
    page_size: template?.page_size || 'A4',
    font_family: template?.font_family || 'Arial'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      console.log('File dropped:', e.dataTransfer.files[0]);
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">اسم القالب</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            className="text-right"
            placeholder="أدخل اسم القالب"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">وصف القالب</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="text-right min-h-[100px]"
            placeholder="أدخل وصفاً للقالب"
          />
        </div>

        <div className="space-y-2">
          <Label>ملف القالب</Label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
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
                    setSelectedFile(e.target.files[0]);
                  }
                }}
              />
              {formData.template_file && (
                <p className="text-sm text-muted-foreground mt-2">
                  الملف الحالي: {formData.template_file}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="orientation">اتجاه الصفحة</Label>
            <select
              id="orientation"
              value={formData.orientation}
              onChange={(e) => setFormData({ ...formData, orientation: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="portrait">عمودي</option>
              <option value="landscape">أفقي</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="page_size">حجم الصفحة</Label>
            <select
              id="page_size"
              value={formData.page_size}
              onChange={(e) => setFormData({ ...formData, page_size: e.target.value })}
              className="w-full p-2 border rounded-md"
            >
              <option value="A4">A4</option>
              <option value="Letter">Letter</option>
              <option value="Legal">Legal</option>
            </select>
          </div>
        </div>
      </Card>

      <CertificateTemplateFields
        fields={formData.fields}
        onChange={(fields) => setFormData({ ...formData, fields })}
      />

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          إلغاء
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'جاري الحفظ...' : template ? 'تحديث' : 'إضافة'}
        </Button>
      </div>
    </form>
  );
};