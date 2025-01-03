import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

interface SignatureFormProps {
  signature?: any;
  isLoading: boolean;
  onSubmit: (formData: any, selectedFile: File | null) => void;
  onCancel: () => void;
}

export const SignatureForm = ({
  signature,
  isLoading,
  onSubmit,
  onCancel
}: SignatureFormProps) => {
  const [formData, setFormData] = useState({
    name: signature?.name || '',
    position: signature?.position || '',
    signature_image: signature?.signature_image || '',
    is_active: signature?.is_active ?? true
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData, selectedFile);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">الاسم</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="position">المنصب</Label>
        <Input
          id="position"
          value={formData.position}
          onChange={(e) => setFormData({ ...formData, position: e.target.value })}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="signature_image">صورة التوقيع</Label>
        <Input
          id="signature_image"
          type="file"
          accept="image/*"
          onChange={(e) => {
            if (e.target.files?.[0]) {
              console.log('Signature file selected:', e.target.files[0]);
              setSelectedFile(e.target.files[0]);
            }
          }}
        />
        {formData.signature_image && (
          <p className="text-sm text-muted-foreground">
            الملف الحالي: {formData.signature_image}
          </p>
        )}
      </div>

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
          {isLoading ? 'جاري الحفظ...' : signature ? 'تحديث' : 'إضافة'}
        </Button>
      </div>
    </form>
  );
};