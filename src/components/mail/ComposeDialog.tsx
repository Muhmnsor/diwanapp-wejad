
import React, { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { UserSelect } from "./UserSelect";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

interface ComposeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipient?: string;
  initialSubject?: string;
  initialContent?: string;
  replyTo?: string;
}

const formSchema = z.object({
  to: z.array(z.string()).min(1, "يجب اختيار مستلم واحد على الأقل"),
  cc: z.array(z.string()).optional(),
  subject: z.string().min(1, "يجب إدخال عنوان للرسالة"),
  content: z.string().min(1, "يجب إدخال محتوى الرسالة"),
});

type FormValues = z.infer<typeof formSchema>;

export const ComposeDialog: React.FC<ComposeDialogProps> = ({
  isOpen,
  onClose,
  initialRecipient = "",
  initialSubject = "",
  initialContent = "",
  replyTo,
}) => {
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      to: initialRecipient ? [initialRecipient] : [],
      cc: [],
      subject: replyTo ? `رد: ${initialSubject}` : initialSubject,
      content: initialContent,
    },
  });

  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments((prev) => [...prev, ...newFiles]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      
      // احصل على معرف المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("يجب تسجيل الدخول لإرسال الرسائل");
      
      // إنشاء معرف جديد للرسالة
      const messageId = uuidv4();
      
      // إنشاء الرسالة
      const { error: messageError } = await supabase
        .from("internal_messages")
        .insert({
          id: messageId,
          subject: data.subject,
          content: data.content,
          sender_id: user.id,
          status: "sent",
          is_draft: false,
          has_attachments: attachments.length > 0,
          folder: "sent"
        });
      
      if (messageError) throw messageError;
      
      // إضافة المستلمين
      const recipients = [
        ...data.to.map(id => ({ 
          message_id: messageId,
          recipient_id: id,
          recipient_type: "to" as const
        })),
        ...(data.cc || []).map(id => ({ 
          message_id: messageId,
          recipient_id: id,
          recipient_type: "cc" as const
        }))
      ];
      
      if (recipients.length > 0) {
        const { error: recipientsError } = await supabase
          .from("internal_message_recipients")
          .insert(recipients);
          
        if (recipientsError) throw recipientsError;
      }
      
      // رفع المرفقات إذا وجدت
      if (attachments.length > 0) {
        for (const file of attachments) {
          const filePath = `${user.id}/${messageId}/${file.name}`;
          
          // رفع الملف إلى التخزين
          const { error: uploadError } = await supabase.storage
            .from("mail_attachments")
            .upload(filePath, file);
            
          if (uploadError) throw uploadError;
          
          // إضافة معلومات المرفق للقاعدة
          const { error: attachmentError } = await supabase
            .from("internal_message_attachments")
            .insert({
              message_id: messageId,
              file_name: file.name,
              file_path: filePath,
              file_type: file.type,
              file_size: file.size,
              uploaded_by: user.id
            });
            
          if (attachmentError) throw attachmentError;
        }
      }
      
      toast.success("تم إرسال الرسالة بنجاح");
      onClose();
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("حدث خطأ أثناء إرسال الرسالة");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>إنشاء رسالة جديدة</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="to"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>إلى</FormLabel>
                  <FormControl>
                    <UserSelect 
                      value={field.value} 
                      onChange={field.onChange}
                      placeholder="اختر المستلمين..." 
                      type="to"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="cc"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نسخة إلى</FormLabel>
                  <FormControl>
                    <UserSelect 
                      value={field.value || []} 
                      onChange={field.onChange}
                      placeholder="اختر مستلمي النسخة..." 
                      type="cc"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الموضوع</FormLabel>
                  <FormControl>
                    <Input placeholder="أدخل موضوع الرسالة" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>محتوى الرسالة</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="أدخل محتوى الرسالة هنا..." 
                      className="min-h-[200px]"
                      {...field} 
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            {/* المرفقات */}
            <div className="space-y-2">
              <div className="flex items-center">
                <label 
                  htmlFor="file-upload" 
                  className="flex items-center gap-2 text-sm text-primary cursor-pointer hover:text-primary/80"
                >
                  <Paperclip className="h-4 w-4" />
                  إضافة مرفقات
                </label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  onChange={handleAttachmentChange}
                  className="hidden"
                />
              </div>
              
              {attachments.length > 0 && (
                <div className="border rounded-md p-2 space-y-1">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                      <div className="text-sm truncate flex-1">{file.name}</div>
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
                إلغاء
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "جاري الإرسال..." : "إرسال"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
