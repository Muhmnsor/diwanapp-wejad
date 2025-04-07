
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { UserSelect } from "./UserSelect";
import { Send, Paperclip, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";

interface ComposeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any;
}

export const ComposeDialog = ({ isOpen, onClose, initialData }: ComposeDialogProps) => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipients, setRecipients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Reset form when dialog opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Pre-fill data if provided (e.g. for reply or forward)
        setSubject(initialData.subject || "");
        setContent(initialData.content || "");
        setRecipients(initialData.recipients || []);
      } else {
        // Clear form for new message
        setSubject("");
        setContent("");
        setRecipients([]);
        setAttachments([]);
      }
    }
  }, [isOpen, initialData]);

  const handleSend = async () => {
    if (!subject.trim()) {
      toast({
        title: "حقل الموضوع مطلوب",
        description: "يرجى إدخال موضوع للرسالة",
        variant: "destructive",
      });
      return;
    }

    if (!recipients.length) {
      toast({
        title: "يجب تحديد مستلم واحد على الأقل",
        description: "يرجى تحديد مستلم للرسالة",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const messageId = uuidv4();
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      // Upload attachments if any
      let uploadedAttachments = [];
      if (attachments.length > 0) {
        for (const file of attachments) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${messageId}-${Date.now()}.${fileExt}`;
          const filePath = `${messageId}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('mail-attachments')
            .upload(filePath, file);
            
          if (uploadError) {
            console.error("Error uploading attachment:", uploadError);
            toast({
              title: "خطأ في رفع المرفقات",
              description: uploadError.message,
              variant: "destructive",
            });
            setLoading(false);
            return;
          }
          
          const { data: fileData } = supabase.storage
            .from('mail-attachments')
            .getPublicUrl(filePath);
            
          uploadedAttachments.push({
            file_name: file.name,
            file_path: filePath,
            file_size: file.size,
            file_type: file.type,
            url: fileData.publicUrl
          });
        }
      }

      // Create the message
      const { error: messageError } = await supabase
        .from('internal_messages')
        .insert({
          id: messageId,
          subject,
          content,
          sender_id: userId,
          has_attachments: attachments.length > 0,
          is_draft: false
        });

      if (messageError) throw messageError;
      
      // Add message recipients
      const recipientsData = recipients.map(recipient => ({
        message_id: messageId,
        recipient_id: recipient.id,
        recipient_type: 'to'
      }));
      
      const { error: recipientsError } = await supabase
        .from('internal_message_recipients')
        .insert(recipientsData);
        
      if (recipientsError) throw recipientsError;

      // Add attachments if any
      if (uploadedAttachments.length > 0) {
        const attachmentsData = uploadedAttachments.map(att => ({
          message_id: messageId,
          file_name: att.file_name,
          file_path: att.file_path,
          file_size: att.file_size,
          file_type: att.file_type
        }));
        
        const { error: attachmentsError } = await supabase
          .from('internal_message_attachments')
          .insert(attachmentsData);
          
        if (attachmentsError) throw attachmentsError;
      }
      
      toast({
        title: "تم إرسال الرسالة بنجاح",
        description: "تم إرسال الرسالة إلى المستلمين بنجاح",
      });
      
      onClose();
    } catch (error: any) {
      console.error("Error sending message:", error);
      toast({
        title: "خطأ في إرسال الرسالة",
        description: error.message || "حدث خطأ أثناء محاولة إرسال الرسالة",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };
  
  const removeAttachment = (index: number) => {
    setAttachments(prev => {
      const newAttachments = [...prev];
      newAttachments.splice(index, 1);
      return newAttachments;
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !loading && !open && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>رسالة جديدة</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label>إلى</Label>
            <UserSelect
              value={recipients}
              onChange={setRecipients}
              placeholder="اختر المستلمين..."
            />
          </div>
          
          <div>
            <Label htmlFor="subject">الموضوع</Label>
            <Input
              id="subject"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="أدخل موضوع الرسالة"
            />
          </div>
          
          <div>
            <Label htmlFor="content">محتوى الرسالة</Label>
            <Textarea
              id="content"
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="min-h-[200px]"
            />
          </div>
          
          <div>
            <Label className="mb-2 block">المرفقات</Label>
            <div className="flex items-center mb-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="flex items-center gap-2"
              >
                <Paperclip className="h-4 w-4" />
                إضافة مرفقات
              </Button>
              <input
                id="file-upload"
                type="file"
                className="hidden"
                onChange={handleFileChange}
                multiple
              />
            </div>
            
            {attachments.length > 0 && (
              <div className="mt-2 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm truncate max-w-[300px]">{file.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={onClose} className="ml-2" disabled={loading}>
              إلغاء
            </Button>
            <Button onClick={handleSend} disabled={loading} className="flex items-center gap-2">
              {loading ? "جاري الإرسال..." : (
                <>
                  <Send className="h-4 w-4" />
                  إرسال
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
