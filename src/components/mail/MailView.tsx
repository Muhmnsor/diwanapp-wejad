
import React from 'react';
import { ArrowLeft, Star, StarOff, Trash2, Forward, Reply, ReplyAll, Download, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Message } from './InternalMailApp';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { useMessageOperations } from '@/hooks/mail/useMessageOperations';

interface MailViewProps {
  message?: Message;
  isLoading: boolean;
  onBack: () => void;
  folder: string;
}

export const MailView: React.FC<MailViewProps> = ({ 
  message, 
  isLoading,
  onBack,
  folder
}) => {
  const { toast } = useToast();
  const { toggleStar, deleteMessage } = useMessageOperations();

  if (isLoading) {
    return (
      <div className="h-full p-4 flex flex-col">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-4" />
        <div className="flex justify-between mb-6">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="flex-1 ml-3">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
        <Separator className="my-4" />
        <div className="space-y-3 flex-1">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    );
  }

  if (!message) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-muted/30 p-6 rounded-full mb-4">
          <svg className="h-12 w-12 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">لم يتم اختيار أي رسالة</h3>
        <p className="text-muted-foreground mt-2">يرجى اختيار رسالة لعرض محتواها</p>
      </div>
    );
  }

  const handleToggleStar = () => {
    toggleStar.mutate({ 
      messageId: message.id, 
      isStarred: !message.isStarred 
    });
  };

  const handleDelete = () => {
    deleteMessage.mutate({ 
      messageId: message.id, 
      folder: folder 
    }, {
      onSuccess: () => {
        onBack();
      }
    });
  };

  const handleDownloadAttachment = async (attachment: { path: string; name: string; }) => {
    try {
      const { data, error } = await supabase.storage
        .from('mail_attachments')
        .download(attachment.path);
        
      if (error) throw error;
      
      // إنشاء رابط تنزيل وتنزيل الملف
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      
      // تنظيف
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "تم التنزيل",
        description: `تم تنزيل ${attachment.name} بنجاح`,
      });
    } catch (error) {
      console.error("Error downloading attachment:", error);
      toast({
        title: "فشل التنزيل",
        description: "حدث خطأ أثناء تنزيل المرفق",
        variant: "destructive",
      });
    }
  };

  const formattedDate = message.date ? 
    format(new Date(message.date), 'dd MMMM yyyy, HH:mm', { locale: ar }) : 
    '';

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-medium">{message.subject || 'بدون موضوع'}</h2>
        </div>
        <div className="flex space-x-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleToggleStar}
          >
            {message.isStarred ? (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleDelete}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>
      
      <div className="flex justify-between mb-4">
        <div className="flex">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {message.sender.name.charAt(0).toUpperCase()}
          </div>
          <div className="mr-3">
            <div className="font-medium">{message.sender.name}</div>
            <div className="text-sm text-muted-foreground">{message.sender.email}</div>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">{formattedDate}</div>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {message.recipients
          .filter(r => r.type === 'to')
          .map((recipient, idx) => (
            <Badge key={idx} variant="outline" className="text-sm">
              {recipient.name}
            </Badge>
          ))
        }
        {message.recipients
          .filter(r => r.type === 'cc')
          .length > 0 && (
          <div className="text-xs text-muted-foreground flex gap-1 items-center">
            <span>نسخة إلى:</span>
            {message.recipients
              .filter(r => r.type === 'cc')
              .map((recipient, idx) => (
                <Badge key={idx} variant="secondary" className="text-xs">
                  {recipient.name}
                </Badge>
              ))
            }
          </div>
        )}
      </div>

      <Separator className="my-4" />
      
      <div className="flex-1 overflow-y-auto mb-4">
        <div 
          className="prose max-w-none prose-img:my-4" 
          dangerouslySetInnerHTML={{ __html: message.content || 'لا يوجد محتوى' }}
        />
      </div>
      
      {message.attachments && message.attachments.length > 0 && (
        <>
          <Separator className="my-4" />
          <div className="mb-4">
            <h3 className="font-medium mb-2">المرفقات</h3>
            <div className="flex flex-wrap gap-2">
              {message.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center border rounded-lg p-2 bg-muted/20"
                >
                  <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{attachment.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 h-6 w-6"
                    onClick={() => handleDownloadAttachment(attachment)}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
      
      <Separator className="my-4" />
      
      <div className="flex gap-2 justify-end">
        <Button variant="outline" size="sm">
          <Reply className="h-3 w-3 ml-1" />
          رد
        </Button>
        <Button variant="outline" size="sm">
          <ReplyAll className="h-3 w-3 ml-1" />
          رد للجميع
        </Button>
        <Button variant="outline" size="sm">
          <Forward className="h-3 w-3 ml-1" />
          إعادة توجيه
        </Button>
      </div>
    </div>
  );
};
