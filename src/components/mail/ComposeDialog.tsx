
import React, { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, X, Paperclip, PlusCircle, MinusCircle, Save } from "lucide-react";
import { UserSelect } from "@/components/mail/UserSelect";
import { useMessageOperations } from "@/hooks/mail/useMessageOperations";
import { Message } from "./InternalMailApp";

interface ComposeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: {
    type: 'new' | 'reply' | 'forward' | 'draft';
    message?: Message;
  };
}

export const ComposeDialog: React.FC<ComposeDialogProps> = ({
  isOpen,
  onClose,
  initialData
}) => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [recipientsTo, setRecipientsTo] = useState<string[]>([]);
  const [recipientsCc, setRecipientsCc] = useState<string[]>([]);
  const [recipientsBcc, setRecipientsBcc] = useState<string[]>([]);
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const [draftId, setDraftId] = useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { sendMessage, saveDraft } = useMessageOperations();

  // تهيئة البيانات بناءً على نوع الرسالة
  useEffect(() => {
    if (initialData && isOpen) {
      if (initialData.type === 'reply' && initialData.message) {
        setSubject(`رد على: ${initialData.message.subject}`);
        setRecipientsTo([initialData.message.sender.id]);
        setContent(`
          <br/>
          <br/>
          <blockquote style="padding-right: 1rem; border-right: 4px solid #e5e7eb; margin-right: 0; color: #6b7280;">
            في ${new Date(initialData.message.date).toLocaleString('ar-EG')}, كتب ${initialData.message.sender.name}:
            <br/>
            ${initialData.message.content}
          </blockquote>
        `);
      } else if (initialData.type === 'forward' && initialData.message) {
        setSubject(`إعادة توجيه: ${initialData.message.subject}`);
        setContent(`
          <br/>
          <br/>
          ---------- رسالة معاد توجيهها ----------<br/>
          من: ${initialData.message.sender.name}<br/>
          تاريخ: ${new Date(initialData.message.date).toLocaleString('ar-EG')}<br/>
          الموضوع: ${initialData.message.subject}<br/>
          إلى: ${initialData.message.recipients.filter(r => r.type === 'to').map(r => r.name).join(', ')}<br/>
          <br/>
          ${initialData.message.content}
        `);
      } else if (initialData.type === 'draft' && initialData.message) {
        setSubject(initialData.message.subject);
        setContent(initialData.message.content);
        
        // تعيين المستلمين
        const toRecipients = initialData.message.recipients.filter(r => r.type === 'to').map(r => r.id);
        const ccRecipients = initialData.message.recipients.filter(r => r.type === 'cc').map(r => r.id);
        const bccRecipients = initialData.message.recipients.filter(r => r.type === 'bcc').map(r => r.id);
        
        setRecipientsTo(toRecipients);
        
        if (ccRecipients.length > 0) {
          setRecipientsCc(ccRecipients);
          setShowCc(true);
        }
        
        if (bccRecipients.length > 0) {
          setRecipientsBcc(bccRecipients);
          setShowBcc(true);
        }
        
        setDraftId(initialData.message.id);
      } else {
        // رسالة جديدة
        resetForm();
      }
    }
  }, [initialData, isOpen]);

  const resetForm = () => {
    setSubject("");
    setContent("");
    setAttachments([]);
    setRecipientsTo([]);
    setRecipientsCc([]);
    setRecipientsBcc([]);
    setShowCc(false);
    setShowBcc(false);
    setDraftId(undefined);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSend = async () => {
    // تنسيق المستلمين
    const recipientIds = [
      ...recipientsTo.map(id => ({ id, type: 'to' as const })),
      ...recipientsCc.map(id => ({ id, type: 'cc' as const })),
      ...recipientsBcc.map(id => ({ id, type: 'bcc' as const })),
    ];
    
    sendMessage.mutate({
      subject,
      content,
      recipientIds,
      attachments
    }, {
      onSuccess: () => {
        handleClose();
      }
    });
  };

  const handleSaveDraft = async () => {
    setIsSaving(true);
    
    // تنسيق المستلمين
    const recipientIds = [
      ...recipientsTo.map(id => ({ id, type: 'to' as const })),
      ...recipientsCc.map(id => ({ id, type: 'cc' as const })),
      ...recipientsBcc.map(id => ({ id, type: 'bcc' as const })),
    ];
    
    saveDraft.mutate({
      draftId,
      subject,
      content,
      recipientIds
    }, {
      onSuccess: (data) => {
        if (data?.draftId) {
          setDraftId(data.draftId);
        }
        setIsSaving(false);
      },
      onError: () => {
        setIsSaving(false);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>إنشاء رسالة جديدة</span>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-1">
          <div className="space-y-4 p-1">
            <div>
              <Label>إلى</Label>
              <div className="flex items-center">
                <UserSelect
                  value={recipientsTo}
                  onChange={setRecipientsTo}
                  placeholder="اختر المستلمين..."
                  type="to"
                  className="flex-1"
                />
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  className="mr-2"
                  onClick={() => setShowCc(!showCc)}
                >
                  {showCc ? "إخفاء نسخة" : "إضافة نسخة"}
                </Button>
              </div>
            </div>
            
            {showCc && (
              <div>
                <Label>نسخة</Label>
                <div className="flex items-center">
                  <UserSelect
                    value={recipientsCc}
                    onChange={setRecipientsCc}
                    placeholder="اختر المستلمين للنسخة..."
                    type="cc"
                    className="flex-1"
                  />
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="mr-2"
                    onClick={() => setShowBcc(!showBcc)}
                  >
                    {showBcc ? "إخفاء نسخة مخفية" : "إضافة نسخة مخفية"}
                  </Button>
                </div>
              </div>
            )}
            
            {showBcc && (
              <div>
                <Label>نسخة مخفية</Label>
                <UserSelect
                  value={recipientsBcc}
                  onChange={setRecipientsBcc}
                  placeholder="اختر المستلمين للنسخة المخفية..."
                  type="bcc"
                  className="w-full"
                />
              </div>
            )}
            
            <div>
              <Label>الموضوع</Label>
              <Input 
                placeholder="أدخل موضوع الرسالة" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
              />
            </div>
            
            <div>
              <Textarea 
                placeholder="محتوى الرسالة..." 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                className="min-h-[200px]" 
              />
            </div>
            
            {attachments.length > 0 && (
              <div>
                <Label>المرفقات</Label>
                <div className="space-y-2 mt-2">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex items-center">
                        <Paperclip className="h-4 w-4 ml-2 text-muted-foreground" />
                        <span className="text-sm truncate max-w-[250px]">{file.name}</span>
                        <span className="text-xs text-muted-foreground mr-2">
                          ({file.size < 1024 * 1024
                            ? `${(file.size / 1024).toFixed(1)} KB`
                            : `${(file.size / (1024 * 1024)).toFixed(1)} MB`})
                        </span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => removeAttachment(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex justify-between mt-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center"
            >
              <Paperclip className="h-4 w-4 ml-2" />
              إضافة مرفقات
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            
            {showCc ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCc(false);
                  setRecipientsCc([]);
                }}
              >
                <MinusCircle className="h-4 w-4 ml-2" />
                إزالة نسخة
              </Button>
            ) : (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowCc(true)}
              >
                <PlusCircle className="h-4 w-4 ml-2" />
                إضافة نسخة
              </Button>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={isSaving || sendMessage.isPending}
            >
              {isSaving ? (
                <>
                  <span className="animate-spin ml-2">⏳</span>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 ml-2" />
                  حفظ كمسودة
                </>
              )}
            </Button>
            <Button
              type="button"
              onClick={handleSend}
              disabled={recipientsTo.length === 0 || !subject || !content || sendMessage.isPending}
            >
              {sendMessage.isPending ? (
                <>
                  <span className="animate-spin ml-2">⏳</span>
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 ml-2" />
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
