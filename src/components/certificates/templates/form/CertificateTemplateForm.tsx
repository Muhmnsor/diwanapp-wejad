import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { CertificateTemplateFields } from "../CertificateTemplateFields";

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
    language: template?.language || 'ar'
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, selectedFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">اسم القالب</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">وصف القالب</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="template_file">ملف القالب</Label>
        <Input
          id="template_file"
          type="file"
          accept=".pdf,.docx"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              console.log('File selected:', e.target.files[0]);
              setSelectedFile(e.target.files[0]);
            }
          }}
        />
        {formData.template_file && (
          <p className="text-sm text-muted-foreground">
            الملف الحالي: {formData.template_file}
          </p>
        )}
      </div>

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