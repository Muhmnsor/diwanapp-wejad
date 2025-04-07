import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserSelect } from "./UserSelect";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";  // Updated to use the correct import path
import { Attachment } from "./InternalMailApp";
import { Paperclip, X } from "lucide-react";

interface ComposeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    type?: "new" | "reply" | "forward";
    to?: any[];
    cc?: any[];
    bcc?: any[];
    subject?: string;
    content?: string;
    attachments?: Attachment[];
  };
}

export const ComposeDialog: React.FC<ComposeDialogProps> = ({
  isOpen,
  onClose,
  initialData
}) => {
  const [to, setTo] = useState<any[]>([]);
  const [cc, setCc] = useState<any[]>([]);
  const [bcc, setBcc] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // استجلاب بيانات المستخدم الحالي
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
          
        if (profileData) {
          setCurrentUser({
            id: user.id,
            name: profileData.display_name || user.email,
            email: user.email
          });
        }
      }
    };
    
    fetchCurrentUser();
  }, []);

  // تعبئة البيانات الأولية
  useEffect(() => {
    if (initialData) {
      if (initialData.to) {
        setTo(initialData.to);
        
        // عرض حقول النسخ إذا كانت موجودة
        if (initialData.cc && initialData.cc.length > 0) {
          setCc(initialData.cc);
          setShowCc(true);
        }
        
        if (initialData.bcc && initialData.bcc.length > 0) {
          setBcc(initialData.bcc);
          setShowBcc(true);
        }
      }
      
      if (initialData.subject) {
        setSubject(initialData.subject);
      }
      
      if (initialData.content) {
        setContent(initialData.content);
      }
      
      if (initialData.attachments) {
        setExistingAttachments(initialData.attachments);
      }
    }
  }, [initialData, isOpen]);

  // إعادة ضبط النموذج عند الإغلاق
  const handleClose = () => {
    setTo([]);
    setCc([]);
    setBcc([]);
    setSubject("");
    setContent("");
    setShowCc(false);
    setShowBcc(false);
    setAttachments([]);
    setExistingAttachments([]);
    onClose();
  };

  // معالجة إضافة المرفقات
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  // حذف مرفق
  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // حذف مرفق موجود
  const handleRemoveExistingAttachment = (index: number) => {
    setExistingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // إرسال الرسالة
  const handleSend = async () => {
    if (!currentUser) {
      toast({
        title: "خطأ",
        description: "يجب تسجيل الدخول أولا",
        variant: "destructive"
      });
      return;
    }
    
    if (to.length === 0) {
      toast({
        title: "خطأ",
        description: "يجب تحديد مستلم واحد على الأقل",
        variant: "destructive"
      });
      return;
    }
    
    if (!subject) {
      toast({
        title: "خطأ",
        description: "يجب إدخال موضوع الرسالة",
        variant: "destructive"
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      // إنشاء الرسالة في قاعدة البيانات
      const { data: messageData, error: messageError } = await supabase
        .from("internal_messages")
        .insert({
          subject,
          content,
          sender_id: currentUser.id,
          folder: "sent",
          is_draft: false,
          has_attachments: attachments.length > 0 || existingAttachments.length > 0
        })
        .select()
        .single();
        
      if (messageError) throw messageError;
      
      // إضافة المستلمين
      const recipientPromises = [];
      
      // إضافة المستلمين الرئيسيين
      for (const recipient of to) {
        recipientPromises.push(
          supabase.from("internal_message_recipients").insert({
            message_id: messageData.id,
            recipient_id: recipient.id,
            recipient_type: "to"
          })
        );
      }
      
      // إضافة المستلمين بنسخة
      for (const recipient of cc) {
        recipientPromises.push(
          supabase.from("internal_message_recipients").insert({
            message_id: messageData.id,
            recipient_id: recipient.id,
            recipient_type: "cc"
          })
        );
      }
      
      // إضافة المستلمين بنسخة مخفية
      for (const recipient of bcc) {
        recipientPromises.push(
          supabase.from("internal_message_recipients").insert({
            message_id: messageData.id,
            recipient_id: recipient.id,
            recipient_type: "bcc"
          })
        );
      }
      
      await Promise.all(recipientPromises);
      
      // معالجة المرفقات الجديدة
      if (attachments.length > 0) {
        for (const file of attachments) {
          // رفع الملف إلى التخزين
          const fileExt = file.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('mail_attachments')
            .upload(fileName, file); // Fixed: using fileName instead of undefined filePath
            
          if (uploadError) throw uploadError;
          
          // تسجيل المرفق في قاعدة البيانات
          await supabase.from("internal_message_attachments").insert({
            message_id: messageData.id,
            file_name: file.name,
            file_size: file.size,
            file_type: file.type,
            file_path: uploadData.path
          });
        }
      }
      
      // إضافة المرفقات الموجودة
      if (existingAttachments.length > 0) {
        for (const attachment of existingAttachments) {
          await supabase.from("internal_message_attachments").insert({
            message_id: messageData.id,
            file_name: attachment.name,
            file_size: attachment.size,
            file_type: attachment.type,
            file_path: attachment.path
          });
        }
      }
      
      toast({
        title: "تم إرسال الرسالة بنجاح",
        description: "تم إرسال الرسالة إلى المستلمين",
      });
      
      handleClose();
      
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "حدث خطأ",
        description: "تعذر إرسال الرسالة، يرجى المحاولة مرة أخرى",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle>إنشاء رسالة جديدة</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor="to">إلى</Label>
              <div className="flex text-xs gap-2">
                {!showCc && (
                  <button 
                    type="button" 
                    onClick={() => setShowCc(true)}
                    className="text-primary hover:underline"
                  >
                    إضافة نسخة
                  </button>
                )}
                {!showBcc && (
                  <button 
                    type="button" 
                    onClick={() => setShowBcc(true)}
                    className="text-primary hover:underline"
                  >
                    إضافة نسخة مخفية
                  </button>
                )}
              </div>
            </div>
            <UserSelect 
              value={to} 
              onChange={setTo} 
              placeholder="اختر المستلمين..."
              className="mt-1"
            />
          </div>
          
          {showCc && (
            <div>
              <Label htmlFor="cc">نسخة</Label>
              <UserSelect
                value={cc}
                onChange={setCc}
                placeholder="اختر المستلمين للنسخة..."
                className="mt-1"
              />
            </div>
          )}
          
          {showBcc && (
            <div>
              <Label htmlFor="bcc">نسخة مخفية</Label>
              <UserSelect
                value={bcc}
                onChange={setBcc}
                placeholder="اختر المستلمين للنسخة المخفية..."
                className="mt-1"
              />
            </div>
          )}
          
          <div>
            <Label htmlFor="subject">الموضوع</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="أدخل موضوع الرسالة"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="content">محتوى الرسالة</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="اكتب رسالتك هنا..."
              className="h-60 mt-1"
            />
          </div>
          
          <div>
            <Label>المرفقات</Label>
            <div className="mt-1 space-y-2">
              {/* عرض المرفقات الموجودة */}
              {existingAttachments.map((attachment, index) => (
                <div key={`existing-${index}`} className="flex items-center bg-gray-50 p-2 rounded border">
                  <Paperclip className="ml-2 h-4 w-4 text-gray-500" />
                  <span className="flex-1 text-sm truncate">
                    {attachment.name} ({Math.round(attachment.size / 1024)} KB)
                  </span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveExistingAttachment(index)}
                    className="h-auto p-0 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              {/* عرض المرفقات الجديدة */}
              {attachments.map((file, index) => (
                <div key={`new-${index}`} className="flex items-center bg-gray-50 p-2 rounded border">
                  <Paperclip className="ml-2 h-4 w-4 text-gray-500" />
                  <span className="flex-1 text-sm truncate">
                    {file.name} ({Math.round(file.size / 1024)} KB)
                  </span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveAttachment(index)}
                    className="h-auto p-0 w-6"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              
              <div className="flex items-center">
                <Label 
                  htmlFor="file-upload" 
                  className="cursor-pointer bg-gray-50 text-primary hover:bg-gray-100 transition px-3 py-1 text-sm rounded"
                >
                  إضافة مرفق
                </Label>
                <Input 
                  id="file-upload" 
                  type="file" 
                  onChange={handleFileChange} 
                  className="hidden"
                  multiple
                />
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={handleClose} variant="outline" disabled={isSending}>
            إلغاء
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? "جارٍ الإرسال..." : "إرسال"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
