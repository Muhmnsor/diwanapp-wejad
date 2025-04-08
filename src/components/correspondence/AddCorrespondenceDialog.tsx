
import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle } from "lucide-react";
import { useForm, SubmitHandler } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAuthStore } from "@/store/authStore";

interface AddCorrespondenceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: "incoming" | "outgoing" | "letter";
}

interface CorrespondenceFormData {
  subject: string;
  date: string;
  sender: string;
  recipient: string;
  status: string;
  content: string;
  notes?: string;
}

export const AddCorrespondenceDialog: React.FC<AddCorrespondenceDialogProps> = ({
  isOpen,
  onClose,
  type,
}) => {
  const [files, setFiles] = useState<File[]>([]);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm<CorrespondenceFormData>();
  const { user } = useAuthStore();

  const getDialogTitle = () => {
    if (type === "incoming") return "إضافة معاملة واردة";
    if (type === "outgoing") return "إضافة معاملة صادرة";
    return "إضافة خطاب";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit: SubmitHandler<CorrespondenceFormData> = async (data) => {
    try {
      // Generate a correspondence number based on type
      const prefix = type === "incoming" ? "IN" : type === "outgoing" ? "OUT" : "LET";
      const timestamp = new Date().getTime().toString().substring(5);
      const number = `${prefix}-${timestamp}`;

      // Insert correspondence record
      const { data: correspondence, error: corrError } = await supabase
        .from('correspondence')
        .insert([{
          ...data,
          type,
          number,
          created_by: user?.id,
        }])
        .select()
        .single();

      if (corrError) throw corrError;

      // Upload files if any
      if (files.length > 0) {
        for (const file of files) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${correspondence.id}_${Math.random().toString(36).substring(2)}.${fileExt}`;
          const filePath = `correspondence/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          // Link attachment to correspondence
          await supabase.from('correspondence_attachments').insert([{
            correspondence_id: correspondence.id,
            file_path: filePath,
            file_name: file.name,
            file_size: file.size,
            uploaded_by: user?.id
          }]);
        }
      }

      // Add history record
      await supabase.from('correspondence_history').insert([{
        correspondence_id: correspondence.id,
        action_type: 'create',
        action_details: 'تم إنشاء المعاملة',
        action_by: user?.id
      }]);

      toast({
        title: "تمت الإضافة بنجاح",
        description: "تم إضافة المعاملة بنجاح",
      });

      // Reset form
      reset();
      setFiles([]);
      onClose();
    } catch (error) {
      console.error('Error adding correspondence:', error);
      toast({
        title: "حدث خطأ",
        description: "فشلت عملية إضافة المعاملة",
        variant: "destructive",
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
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subject">موضوع المعاملة</Label>
              <Input 
                id="subject" 
                {...register("subject", { required: "موضوع المعاملة مطلوب" })} 
                placeholder="أدخل موضوع المعاملة" 
              />
              {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject.message}</p>}
            </div>
            
            <div>
              <Label htmlFor="date">تاريخ المعاملة</Label>
              <Input 
                id="date" 
                type="date" 
                {...register("date", { required: "تاريخ المعاملة مطلوب" })} 
              />
              {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {type === 'incoming' ? (
              <>
                <div>
                  <Label htmlFor="sender">الجهة المرسلة</Label>
                  <Input 
                    id="sender" 
                    {...register("sender", { required: "الجهة المرسلة مطلوبة" })} 
                    placeholder="الجهة المرسلة" 
                  />
                  {errors.sender && <p className="text-red-500 text-xs mt-1">{errors.sender.message}</p>}
                </div>
                
                <div>
                  <Label htmlFor="recipient">موجهة إلى</Label>
                  <Select onValueChange={(value) => setValue("recipient", value)}>
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
                  {errors.recipient && <p className="text-red-500 text-xs mt-1">{errors.recipient.message}</p>}
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label htmlFor="sender">الجهة المرسلة</Label>
                  <Select onValueChange={(value) => setValue("sender", value)}>
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
                  {errors.sender && <p className="text-red-500 text-xs mt-1">{errors.sender.message}</p>}
                </div>
                
                <div>
                  <Label htmlFor="recipient">الجهة المستلمة</Label>
                  <Input 
                    id="recipient" 
                    {...register("recipient", { required: "الجهة المستلمة مطلوبة" })} 
                    placeholder="الجهة المستلمة" 
                  />
                  {errors.recipient && <p className="text-red-500 text-xs mt-1">{errors.recipient.message}</p>}
                </div>
              </>
            )}
          </div>
          
          <div>
            <Label htmlFor="status">حالة المعاملة</Label>
            <Select onValueChange={(value) => setValue("status", value)}>
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
            {errors.status && <p className="text-red-500 text-xs mt-1">{errors.status.message}</p>}
          </div>
          
          <div>
            <Label htmlFor="content">محتوى المعاملة</Label>
            <Textarea 
              id="content" 
              {...register("content", { required: "محتوى المعاملة مطلوب" })}
              placeholder="أدخل محتوى المعاملة" 
              rows={5} 
            />
            {errors.content && <p className="text-red-500 text-xs mt-1">{errors.content.message}</p>}
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
              <Textarea id="notes" {...register("notes")} placeholder="أية ملاحظات إضافية" />
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
