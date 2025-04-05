
import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Send,
  Paperclip, 
  X,
  Minus,
  Trash2,
  Minimize2,
  Maximize2
} from "lucide-react";
import { Input } from "@/components/ui/input";

interface ComposeMailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSend: (mail: any) => void;
  replyTo?: any;
}

export const ComposeMailDialog: React.FC<ComposeMailDialogProps> = ({
  isOpen,
  onClose,
  onSend,
  replyTo
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  
  const [mailData, setMailData] = useState({
    to: replyTo ? [replyTo.sender.name] : [],
    cc: [],
    bcc: [],
    subject: replyTo ? `رد: ${replyTo.subject}` : '',
    content: replyTo 
      ? `<p><br/><br/>-------- الرسالة الأصلية --------<br/>من: ${replyTo.sender.name}<br/>التاريخ: ${new Date(replyTo.date).toLocaleDateString('ar')}<br/>الموضوع: ${replyTo.subject}<br/><br/>${replyTo.content}</p>`
      : '',
    attachments: []
  });

  const [toInput, setToInput] = useState('');
  const [ccInput, setCcInput] = useState('');
  const [bccInput, setBccInput] = useState('');
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);

  const handleAddRecipient = (e: React.KeyboardEvent, type: 'to' | 'cc' | 'bcc') => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value.trim();
      if (value) {
        setMailData(prev => ({
          ...prev,
          [type]: [...prev[type], value]
        }));
        
        switch (type) {
          case 'to': setToInput(''); break;
          case 'cc': setCcInput(''); break;
          case 'bcc': setBccInput(''); break;
        }
      }
    }
  };

  const handleRemoveRecipient = (index: number, type: 'to' | 'cc' | 'bcc') => {
    setMailData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // في تنفيذ حقيقي، يمكن رفع المرفقات إلى الخادم هنا
    // For this demo, we'll just add local file metadata
    const newAttachments = Array.from(files).map(file => ({
      id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file) // For preview only
    }));
    
    setMailData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const handleRemoveAttachment = (id: string) => {
    setMailData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((attachment: any) => attachment.id !== id)
    }));
  };

  const handleSend = () => {
    if (mailData.to.length === 0) {
      alert('يرجى إضافة مستلم واحد على الأقل');
      return;
    }
    
    if (!mailData.subject) {
      if (!confirm('هل تريد إرسال الرسالة بدون عنوان؟')) {
        return;
      }
    }
    
    onSend(mailData);
    setMailData({
      to: [],
      cc: [],
      bcc: [],
      subject: '',
      content: '',
      attachments: []
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <Dialog open={isOpen && !isMinimized} onOpenChange={(open) => {
      if (!open) onClose();
    }}>
      <DialogContent className="sm:max-w-[750px] h-[80vh] flex flex-col p-0" dir="rtl">
        <DialogHeader className="px-4 py-2 border-b flex flex-row items-center">
          <DialogTitle>رسالة جديدة</DialogTitle>
          <div className="ml-auto flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)}>
              <Minimize2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-4 space-y-4">
            <div className="space-y-4">
              {/* Recipients */}
              <div className="flex flex-wrap items-center border-b pb-2">
                <span className="w-12 text-sm text-muted-foreground">إلى:</span>
                <div className="flex-1 flex flex-wrap items-center gap-1">
                  {mailData.to.map((recipient, index) => (
                    <div key={index} className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs flex items-center gap-1">
                      <span>{recipient}</span>
                      <button onClick={() => handleRemoveRecipient(index, 'to')}>
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  <input
                    type="text"
                    value={toInput}
                    onChange={(e) => setToInput(e.target.value)}
                    onKeyDown={(e) => handleAddRecipient(e, 'to')}
                    className="flex-1 bg-transparent border-none outline-none text-sm"
                    placeholder="أضف مستلمين..."
                  />
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-auto py-0 px-2 text-xs ml-2"
                  onClick={() => setShowCc(!showCc)}
                >
                  {showCc ? 'إخفاء نسخة' : 'نسخة'}
                </Button>
              </div>
              
              {/* CC */}
              {showCc && (
                <div className="flex flex-wrap items-center border-b pb-2">
                  <span className="w-12 text-sm text-muted-foreground">نسخة:</span>
                  <div className="flex-1 flex flex-wrap items-center gap-1">
                    {mailData.cc.map((recipient, index) => (
                      <div key={index} className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs flex items-center gap-1">
                        <span>{recipient}</span>
                        <button onClick={() => handleRemoveRecipient(index, 'cc')}>
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      value={ccInput}
                      onChange={(e) => setCcInput(e.target.value)}
                      onKeyDown={(e) => handleAddRecipient(e, 'cc')}
                      className="flex-1 bg-transparent border-none outline-none text-sm"
                      placeholder="أضف نسخة..."
                    />
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-auto py-0 px-2 text-xs ml-2"
                    onClick={() => setShowBcc(!showBcc)}
                  >
                    {showBcc ? 'إخفاء نسخة مخفية' : 'نسخة مخفية'}
                  </Button>
                </div>
              )}
              
              {/* BCC */}
              {showBcc && (
                <div className="flex flex-wrap items-center border-b pb-2">
                  <span className="w-12 text-sm text-muted-foreground">نسخة مخفية:</span>
                  <div className="flex-1 flex flex-wrap items-center gap-1">
                    {mailData.bcc.map((recipient, index) => (
                      <div key={index} className="bg-secondary text-secondary-foreground rounded-full px-2 py-0.5 text-xs flex items-center gap-1">
                        <span>{recipient}</span>
                        <button onClick={() => handleRemoveRecipient(index, 'bcc')}>
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      value={bccInput}
                      onChange={(e) => setBccInput(e.target.value)}
                      onKeyDown={(e) => handleAddRecipient(e, 'bcc')}
                      className="flex-1 bg-transparent border-none outline-none text-sm"
                      placeholder="أضف نسخة مخفية..."
                    />
                  </div>
                </div>
              )}
              
              {/* Subject */}
              <div className="flex items-center border-b pb-2">
                <span className="w-12 text-sm text-muted-foreground">الموضوع:</span>
                <Input
                  value={mailData.subject}
                  onChange={(e) => setMailData(prev => ({ ...prev, subject: e.target.value }))}
                  className="flex-1 border-none focus-visible:ring-0 focus-visible:ring-offset-0 pl-0 ml-0"
                  placeholder="أضف موضوعاً..."
                />
              </div>
            </div>
            
            {/* Email Body */}
            <div className="flex-1 min-h-[300px]">
              <textarea
                value={mailData.content}
                onChange={(e) => setMailData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full h-full min-h-[300px] border-none resize-none focus:outline-none text-sm"
                placeholder="اكتب رسالتك هنا..."
              />
            </div>
            
            {/* Attachments */}
            {mailData.attachments.length > 0 && (
              <div className="border-t pt-3">
                <h5 className="text-sm font-medium mb-2">المرفقات</h5>
                <div className="grid grid-cols-2 gap-2">
                  {mailData.attachments.map((attachment: any) => (
                    <div key={attachment.id} className="flex items-center gap-2 text-sm bg-muted/30 p-2 rounded">
                      <span className="truncate flex-1">{attachment.name}</span>
                      <span className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</span>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                      >
                        <X className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-3 border-t flex items-center gap-2">
          <Button type="button" onClick={handleSend} className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            إرسال
          </Button>
          
          <Button
            type="button"
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="h-4 w-4" />
            إرفاق
          </Button>
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleAttachment}
          />
          
          <Button 
            type="button"
            variant="ghost"
            className="text-destructive flex items-center gap-2 ml-auto"
            onClick={onClose}
          >
            <Trash2 className="h-4 w-4" />
            حذف
          </Button>
        </div>
      </DialogContent>
      
      {isMinimized && (
        <div 
          className="fixed bottom-0 right-4 w-72 bg-background rounded-t-md shadow-lg border z-50"
          dir="rtl"
        >
          <div className="flex items-center justify-between p-3 border-b cursor-pointer"
               onClick={() => setIsMinimized(false)}>
            <h4 className="text-sm font-medium truncate">
              {mailData.subject || 'رسالة جديدة'}
            </h4>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </Dialog>
  );
};
