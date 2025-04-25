
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

interface CustomFormBuilderProps {
  onSave: () => void;
  initialData?: any;
}

export const CustomFormBuilder: React.FC<CustomFormBuilderProps> = ({ onSave, initialData }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [fields, setFields] = useState<any[]>(initialData?.fields || []);

  const handleSaveForm = async () => {
    if (!title.trim()) {
      toast.error('يجب إدخال عنوان للنموذج');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('custom_forms')
        .insert({
          title,
          description,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // إضافة الحقول
      const fieldPromises = fields.map((field) => 
        supabase.from('form_fields').insert({
          form_id: data.id,
          label: field.label,
          type: field.type,
          required: field.required || false
        })
      );

      await Promise.all(fieldPromises);

      toast.success('تم حفظ النموذج بنجاح');
      onSave();
    } catch (error) {
      console.error('خطأ في حفظ النموذج:', error);
      toast.error('حدث خطأ أثناء حفظ النموذج');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block mb-2">عنوان النموذج</label>
        <Input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="أدخل عنوان النموذج"
        />
      </div>

      <div>
        <label className="block mb-2">وصف النموذج (اختياري)</label>
        <Textarea 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="أدخل وصفًا للنموذج"
        />
      </div>

      {/* TODO: إضافة مكون لإدارة حقول النموذج */}

      <div className="flex justify-end space-x-2">
        <Button variant="outline">إلغاء</Button>
        <Button onClick={handleSaveForm}>حفظ النموذج</Button>
      </div>
    </div>
  );
};
