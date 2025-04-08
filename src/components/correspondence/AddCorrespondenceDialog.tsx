
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AddCorrespondenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'incoming' | 'outgoing' | 'letter';
}

export const AddCorrespondenceDialog: React.FC<AddCorrespondenceDialogProps> = ({
  isOpen,
  onClose,
  type,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const { toast } = useToast();

  const getDialogTitle = () => {
    switch (type) {
      case 'incoming':
        return 'إضافة معاملة واردة';
      case 'outgoing':
        return 'إضافة معاملة صادرة';
      case 'letter':
        return 'إضافة خطاب';
      default:
        return 'إضافة معاملة جديدة';
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles) {
      const fileArray = Array.from(selectedFiles);
      setFiles((prev) => [...prev, ...fileArray]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  
  // الحصول على البيانات من النموذج
  const formData = new FormData(e.currentTarget);
  
  try {
    // إنشاء كائن المعاملة
    const correspondenceData = {
      subject: formData.get('subject') as string,
      date: formData.get('date') as string,
      sender: type === 'incoming' 
        ? formData.get('sender') as string 
        : formData.get('sender_select') as string,
      recipient: type === 'incoming' 
        ? formData.get('recipient_select') as string 
        : formData.get('recipient') as string,
      status: formData.get('status') as string,
      content: formData.get('content') as string,
      type: type,
      notes: type !== 'incoming' ? formData.get('notes') as string : undefined
    };
    
    // إضافة المعاملة إلى قاعدة البيانات
    const { data: newCorrespondence, error } = await supabase
      .from('correspondence')
      .insert([correspondenceData])
      .select()
      .single();
      
    if (error) throw error;
    
    // إضافة المرفقات إذا وجدت
    if (files.length > 0) {
      for (const file of files) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${newCorrespondence.id}_${Date.now()}.${fileExt}`;
        const filePath = `correspondence/${fileName}`;
        
        // رفع الملف
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, file);
          
        if (uploadError) throw uploadError;
        
        // إضافة بيانات المرفق
        await supabase.from('correspondence_attachments').insert([{
          correspondence_id: newCorrespondence.id,
          file_name: file.name,
          file_path: filePath,
          file_size: file.size,
        }]);
      }
    }
    
    toast({
      title: "تمت إضافة المعاملة بنجاح",
      description: "تمت إضافة المعاملة وجميع المرفقات بنجاح.",
    });
    
    onClose();
  } catch (error) {
    console.error('Error adding correspondence:', error);
    toast({
      variant: "destructive",
      title: "حدث خطأ",
      description: "لم نتمكن من إضافة المعاملة. الرجاء المحاولة مرة أخرى.",
    });
  }
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
                    <SelectItem value="قيد المعالجة">قيد المعالجة</SelectItem>
                    <SelectItem value="مكتمل">مكتمل</SelectItem>
                    <SelectItem value="معلق">معلق</SelectItem>
                  </>
                )}
                {type === 'outgoing' && (
                  <>
                    <SelectItem value="مرسل">مرسل</SelectItem>
                    <SelectItem value="قيد الإعداد">قيد الإعداد</SelectItem>
                  </>
                )}
                {type === 'letter' && (
                  <>
                    <SelectItem value="معتمد">معتمد</SelectItem>
                    <SelectItem value="مسودة">مسودة</SelectItem>
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
