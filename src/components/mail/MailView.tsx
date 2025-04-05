
import React from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { ArrowRight, Download, Paperclip, Star, StarOff, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Message } from "./InternalMailApp";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useMessageOperations } from "@/hooks/mail/useMessageOperations";
import { supabase } from "@/integrations/supabase/client";

interface MailViewProps {
  message?: Message;
  isLoading: boolean;
  onBack: () => void;
  folder: string;
}

export const MailView: React.FC<MailViewProps> = ({ message, isLoading, onBack, folder }) => {
  const { deleteMessage, toggleStar } = useMessageOperations();
  
  // تحميل المرفقات
  const handleDownloadAttachment = async (attachment: { path: string; name: string }) => {
    try {
      const { data, error } = await supabase.storage
        .from('mail_attachments')
        .download(attachment.path);
        
      if (error) throw error;
      
      // إنشاء رابط تنزيل
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading attachment:", err);
      alert("حدث خطأ أثناء تنزيل المرفق");
    }
  };

  // حذف الرسالة
  const handleDelete = () => {
    if (message) {
      deleteMessage.mutate({ messageId: message.id, folder });
      onBack();
    }
  };

  // تحديث حالة النجمة
  const handleToggleStar = () => {
    if (message) {
      toggleStar.mutate({ 
        messageId: message.id, 
        isStarred: !message.isStarred 
      });
    }
  };

  if (isLoading || !message) {
    return (
      <div className="flex flex-col h-full items-center justify-center p-8 bg-muted/10">
        {isLoading ? (
          <>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">جاري تحميل الرسالة...</p>
          </>
        ) : (
          <p className="text-muted-foreground text-center">
            اختر رسالة لعرض محتواها
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="border-b p-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowRight className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2 rtl:space-x-reverse">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleToggleStar}
          >
            {message.isStarred ? (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleDelete}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <h1 className="text-xl font-semibold mb-4">{message.subject}</h1>
        
        <div className="flex items-start mb-6">
          <Avatar className="mx-2">
            <AvatarFallback>
              {message.sender.name.substring(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <div className="font-semibold">{message.sender.name}</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(message.date), 'PPp', { locale: ar })}
              </div>
            </div>
            
            <div className="text-xs text-muted-foreground mb-2">
              {message.sender.email && <span>من: {message.sender.email}</span>}
              
              {message.recipients.length > 0 && (
                <div className="mt-1">
                  إلى:{' '}
                  {message.recipients
                    .filter(r => r.type === 'to' || !r.type)
                    .map(r => r.name || r.email)
                    .join('، ')}
                </div>
              )}
              
              {message.recipients.filter(r => r.type === 'cc').length > 0 && (
                <div className="mt-1">
                  نسخة:{' '}
                  {message.recipients
                    .filter(r => r.type === 'cc')
                    .map(r => r.name || r.email)
                    .join('، ')}
                </div>
              )}
              
              {message.recipients.filter(r => r.type === 'bcc').length > 0 && (
                <div className="mt-1">
                  نسخة مخفية:{' '}
                  {message.recipients
                    .filter(r => r.type === 'bcc')
                    .map(r => r.name || r.email)
                    .join('، ')}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div 
          className="prose max-w-none" 
          dangerouslySetInnerHTML={{ __html: message.content }}
        />
        
        {message.attachments.length > 0 && (
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <Paperclip className="h-4 w-4 mr-1" />
              المرفقات ({message.attachments.length})
            </h3>
            <div className="space-y-2">
              {message.attachments.map((attachment) => (
                <div 
                  key={attachment.id}
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex items-center truncate">
                    <div className="h-8 w-8 flex items-center justify-center bg-muted rounded-md mr-2">
                      <Paperclip className="h-4 w-4" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(attachment.size / 1024).toFixed(2)} كيلوبايت
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDownloadAttachment(attachment)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
