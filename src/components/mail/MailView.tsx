
import React from "react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { ArrowLeft, Star, StarOff, Trash, Reply, Forward, Download, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { Message } from "./InternalMailApp";
import { Skeleton } from "@/components/ui/skeleton";

interface MailViewProps {
  message?: Message;
  isLoading: boolean;
  onBack: () => void;
  folder?: string;
}

export const MailView: React.FC<MailViewProps> = ({ 
  message, 
  isLoading, 
  onBack,
  folder
}) => {
  if (isLoading) {
    return (
      <div className="h-full p-4 md:p-6 space-y-4 bg-white">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Skeleton className="h-8 w-56" />
        </div>
        <div className="space-y-3 mt-4">
          <Skeleton className="h-4 w-3/4" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
        <Skeleton className="h-[200px] w-full mt-4" />
      </div>
    );
  }

  if (!message) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-white">
        <div className="bg-muted/30 p-6 rounded-full mb-4">
          <svg className="h-10 w-10 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">اختر رسالة لعرضها</h3>
        <p className="text-muted-foreground mt-2">حدد رسالة من القائمة لعرض محتواها</p>
      </div>
    );
  }

  // تنسيق التاريخ
  const formattedDate = format(new Date(message.date), "PPP p", { locale: ar });

  // تحديد لون خلفية شارة المستلم
  const getRecipientBgColor = (type: string = 'to') => {
    switch (type) {
      case 'cc':
        return 'bg-blue-100 text-blue-700';
      case 'bcc':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  // تحديد نص نوع المستلم
  const getRecipientTypeText = (type: string = 'to') => {
    switch (type) {
      case 'cc':
        return 'نسخة';
      case 'bcc':
        return 'نسخة مخفية';
      default:
        return 'إلى';
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      {/* شريط الإجراءات */}
      <div className="flex items-center justify-between border-b p-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="md:hidden">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon">
            {message.isStarred ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
          </Button>
          <Button variant="ghost" size="icon">
            <Trash className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Reply className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Forward className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Printer className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* محتوى الرسالة */}
      <div className="p-4 md:p-6 flex-1 overflow-y-auto">
        {/* عنوان الرسالة */}
        <h2 className="text-xl font-semibold mb-4">{message.subject}</h2>

        {/* معلومات المرسل والتاريخ */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center`}>
              {message.sender.avatar ? (
                <img src={message.sender.avatar} alt={message.sender.name} className="w-full h-full rounded-full" />
              ) : (
                <span className="font-semibold text-primary">{message.sender.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <div className="mr-3">
              <div className="font-medium">{message.sender.name}</div>
              <div className="text-sm text-muted-foreground">{message.sender.email}</div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground mt-2 md:mt-0">
            {formattedDate}
          </div>
        </div>

        {/* المستلمين */}
        {message.recipients.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">المستلمون:</p>
            <div className="flex flex-wrap gap-2">
              {message.recipients.map((recipient, index) => (
                <div key={index} className="flex items-center">
                  <span className={cn(
                    "inline-block py-1 px-2 rounded-full text-xs mr-1",
                    getRecipientBgColor(recipient.type)
                  )}>
                    {getRecipientTypeText(recipient.type)}
                  </span>
                  <span className="text-sm">{recipient.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* محتوى الرسالة */}
        <div className="prose prose-sm max-w-none mt-6">
          {message.content.includes('<') && message.content.includes('>') ? (
            <div dangerouslySetInnerHTML={{ __html: message.content }} />
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {/* المرفقات */}
        {message.attachments.length > 0 && (
          <div className="mt-8">
            <h3 className="font-medium mb-3">المرفقات ({message.attachments.length})</h3>
            <div className="space-y-2">
              {message.attachments.map((attachment) => (
                <div key={attachment.id} className="flex items-center p-2 rounded-lg border">
                  <div className="bg-muted p-2 rounded mr-3">
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{attachment.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {attachment.size > 0 ? `${(attachment.size / 1024).toFixed(2)} KB` : 'غير معروف'}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="ml-2">
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
