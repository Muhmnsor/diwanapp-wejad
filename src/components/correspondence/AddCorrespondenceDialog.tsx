
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

interface AddCorrespondenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'incoming' | 'outgoing' | 'letter'; // نوع المعاملة
}

export const AddCorrespondenceDialog: React.FC<AddCorrespondenceDialogProps> = ({ 
  isOpen, 
  onClose,
  type 
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const getDialogTitle = () => {
    switch (type) {
      case 'incoming':
        return 'إضافة معاملة واردة';
      case 'outgoing':
        return 'إضافة معاملة صادرة';
      case 'letter':
        return 'إضافة خطاب';
      default:
        return 'إضافة معاملة';
    }
  };

  const { register, handleSubmit: handleFormSubmit, setValue, formState: { errors } } = useForm<CorrespondenceFormData>();

const onSubmit = async (data: CorrespondenceFormData) => {
  try {
    // إضافة سجل المعاملة
    const { data: correspondence, error: corrError } = await supabase
      .from('correspondence')
      .insert([{
        ...data,
        type,
        created_by: auth.uid()
      }])
      .select()
      .single();

    if (corrError) throw corrError;

    // رفع المرفقات إن وجدت
    if (files.length > 0) {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${correspondence.id}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `correspondence/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        // ربط المرفق بالمعاملة
        await supabase.from('correspondence_attachments').insert([{
          correspondence_id: correspondence.id,
          file_path: filePath,
          file_name: file.name,
          file_size: file.size,
          uploaded_by: auth.uid()
        }]);
      }
    }

    // إضافة سجل في تاريخ المعاملة
    await supabase.from('correspondence_history').insert([{
      correspondence_id: correspondence.id,
      action_type: 'create',
      action_details: 'تم إنشاء المعاملة',
      action_by: auth.uid()
    }]);

    onClose();
  } catch (error) {
    console.error('Error adding correspondence:', error);
  }
};

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "تم الإضافة بنجاح",
      description: "تمت إضافة المعاملة بنجاح في النظام.",
    });
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
          <DialogDescription>
            أدخل بيانات المعاملة بالتفصيل، وأرفق الملفات المطلوبة.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">موضوع المعاملة</Label>
              <Input id="subject" placeholder="أدخل موضوع المعاملة" required />
            </div>
            
            <div>
              <Label htmlFor="date">تاريخ المعاملة</Label>
              <Input id="date" type="date" required />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {type === 'incoming' ? (
              <>
                <div>
                  <Label htmlFor="sender">الجهة المرسلة</Label>
                  <Input id="sender" placeholder="الجهة المرسلة" required />
                </div>
                
                <div>
                  <Label htmlFor="recipient">موجهة إلى</Label>
                  <Select>
                    <SelectTrigger id="recipient">
                      <SelectValue placeholder="اختر المستلم" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general_manager">المدير العام</SelectItem>
                      <SelectItem value="hr_manager">مدير الموارد البشرية</SelectItem>
                      <SelectItem value="projects_manager">مدير المشاريع</SelectItem>
                      <SelectItem value="finance_manager">المدير المالي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="sender">الجهة المرسلة</Label>
                  <Select>
                    <SelectTrigger id="sender">
                      <SelectValue placeholder="اختر المرسل" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general_manager">المدير العام</SelectItem>
                      <SelectItem value="hr_manager">مدير الموارد البشرية</SelectItem>
                      <SelectItem value="projects_manager">مدير المشاريع</SelectItem>
                      <SelectItem value="finance_manager">المدير المالي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="recipient">الجهة المستلمة</Label>
                  <Input id="recipient" placeholder="الجهة المستلمة" required />
                </div>
              </>
            )}
          </div>
          
          <div>
            <Label htmlFor="status">حالة المعاملة</Label>
            <Select>
              <SelectTrigger id="status">
                <SelectValue placeholder="اختر حالة المعاملة" />
              </SelectTrigger>
              <SelectContent>
                {type === 'incoming' && (
                  <>
                    <SelectItem value="in_process">قيد المعالجة</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="pending">معلق</SelectItem>
                  </>
                )}
                {type === 'outgoing' && (
                  <>
                    <SelectItem value="sent">مرسل</SelectItem>
                    <SelectItem value="in_preparation">قيد الإعداد</SelectItem>
                  </>
                )}
                {type === 'letter' && (
                  <>
                    <SelectItem value="approved">معتمد</SelectItem>
                    <SelectItem value="draft">مسودة</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="content">محتوى المعاملة</Label>
            <Textarea id="content" placeholder="أدخل محتوى المعاملة" rows={5} required />
          </div>
          
          <div>
            <Label>المرفقات</Label>
            <div className="mt-2 p-4 border border-dashed rounded-md">
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted rounded-md">
                    <div className="text-sm font-medium">{file.name} ({(file.size / 1024).toFixed(2)} KB)</div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeFile(index)} 
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      إزالة
                    </Button>
                  </div>
                ))}
                
                <div className="flex items-center justify-center p-4">
                  <label htmlFor="file-upload" className="cursor-pointer flex items-center text-primary">
                    <PlusCircle className="h-4 w-4 mr-2" />
                    <span>إضافة مرفق</span>
                    <input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} multiple />
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {type !== 'incoming' && (
            <div>
              <Label htmlFor="notes">ملاحظات إضافية</Label>
              <Textarea id="notes" placeholder="أية ملاحظات إضافية" />
            </div>
          )}
          
          <DialogFooter className="mt-6 gap-2 sm:justify-start">
            <Button type="submit">إضافة المعاملة</Button>
            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
