
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { Document, documentTypes } from "../types/document";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface EditDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document | null;
  onUpdate: () => void;
}

export const EditDocumentDialog = ({ open, onOpenChange, document, onUpdate }: EditDocumentDialogProps) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [updatedFields, setUpdatedFields] = useState<Partial<Document>>({});

  const handleFieldUpdate = (field: keyof Document, value: string) => {
    setUpdatedFields(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    try {
      setIsUpdating(true);
      const { error } = await supabase
        .from('documents')
        .update({
          name: updatedFields.name || document.name,
          type: updatedFields.type || document.type,
          expiry_date: updatedFields.expiry_date || document.expiry_date,
          issuer: updatedFields.issuer || document.issuer,
        })
        .eq('id', document.id);

      if (error) throw error;

      toast.success('تم تحديث المستند بنجاح');
      onOpenChange(false);
      onUpdate();
      
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('حدث خطأ أثناء تحديث المستند');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!document) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" dir="rtl">
        <DialogHeader>
          <DialogTitle>تعديل المستند</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <Label htmlFor="name">اسم المستند</Label>
            <Input
              id="name"
              defaultValue={document.name}
              onChange={(e) => handleFieldUpdate('name', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="type">نوع المستند</Label>
            <Select 
              defaultValue={document.type}
              onValueChange={(value) => handleFieldUpdate('type', value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="اختر نوع المستند" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="expiry_date">تاريخ الانتهاء</Label>
            <Input
              id="expiry_date"
              type="date"
              defaultValue={document.expiry_date}
              onChange={(e) => handleFieldUpdate('expiry_date', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="issuer">جهة الإصدار</Label>
            <Input
              id="issuer"
              defaultValue={document.issuer}
              onChange={(e) => handleFieldUpdate('issuer', e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              إلغاء
            </Button>
            <Button type="submit" disabled={isUpdating}>
              {isUpdating ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
