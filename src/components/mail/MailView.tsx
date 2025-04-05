
import React from "react";
import { ArrowLeft, Star, Trash, Reply, Forward, Paperclip, Download } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Message } from "./InternalMailApp";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/avatar";

interface MailViewProps {
  message?: Message;
  isLoading?: boolean;
  onBack: () => void;
  folder: string;
}

export const MailView: React.FC<MailViewProps> = ({ 
  message, 
  isLoading = false,
  onBack,
  folder
}) => {
  // عندما لا تكون هناك رسالة محددة
  if (!message && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4 py-8 text-center">
        <div className="bg-muted/30 p-6 rounded-full mb-4">
          <svg className="h-12 w-12 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
          </svg>
        </div>
        <h3 className="text-xl font-medium mb-2">اختر رسالة لعرضها</h3>
        <p className="text-muted-foreground">حدد رسالة من القائمة لعرض محتواها هنا</p>
      </div>
    );
  }

  // عندما تكون هناك عملية تحميل جارية
  if (isLoading) {
    return (
      <div className="h-full p-4">
        <div className="flex items-center mb-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="ml-4 space-y-2">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-3 w-[150px]" />
          </div>
        </div>
        <Skeleton className="h-4 w-3/4 mb-8" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
    );
  }

  // عرض تفاصيل الرسالة
  return (
    <div className="h-full flex flex-col">
      <div className="border-b px-4 py-3 flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1"></div>
        <Button variant="ghost" size="icon">
          <Star className={`h-5 w-5 ${message.isStarred ? "fill-yellow-400 text-yellow-400" : ""}`} />
        </Button>
        <Button variant="ghost" size="icon">
          <Trash className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Reply className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon">
          <Forward className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">{message.subject}</h2>
          
          <div className="flex items-start gap-3 mb-6">
            <Avatar className="h-10 w-10">
              <div className="bg-primary text-primary-foreground rounded-full w-full h-full flex items-center justify-center text-lg font-semibold">
                {message.sender.name?.charAt(0) || '?'}
              </div>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex justify-between">
                <div>
                  <div className="font-medium">{message.sender.name}</div>
                  <div className="text-sm text-muted-foreground">{message.sender.email}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(message.date), { addSuffix: true, locale: ar })}
                </div>
              </div>
              
              <div className="mt-1 text-sm text-muted-foreground">
                إلى:{" "}
                {message.recipients
                  .filter(r => r.type === 'to')
                  .map(r => r.name)
                  .join(", ")}
                
                {message.recipients.some(r => r.type === 'cc') && (
                  <div>
                    نسخة:{" "}
                    {message.recipients
                      .filter(r => r.type === 'cc')
                      .map(r => r.name)
                      .join(", ")}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* محتوى الرسالة */}
          <div 
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: message.content }}
          />
          
          {/* المرفقات */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-8 border-t pt-4">
              <h3 className="font-medium flex items-center gap-2 mb-3">
                <Paperclip className="h-4 w-4" /> المرفقات ({message.attachments.length})
              </h3>
              <div className="space-y-2">
                {message.attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center justify-between p-2 border rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="bg-muted p-2 rounded">
                        <Paperclip className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="font-medium text-sm">{attachment.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.round(attachment.size / 1024)} KB
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
