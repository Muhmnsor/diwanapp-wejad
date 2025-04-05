
import React from 'react';
import { Message } from './InternalMailApp';
import { Paperclip, ArrowLeft, Star, StarOff, Trash, Reply, CornerUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';

interface MailViewProps {
  message: Message | undefined;
  isLoading: boolean;
  onBack: () => void;
  folder: string;
}

export const MailView: React.FC<MailViewProps> = ({ message, isLoading, onBack, folder }) => {
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-4 py-2 border-b flex justify-between items-center">
          <Button variant="ghost" size="icon" disabled>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" disabled>
              <Star className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" disabled>
              <Trash className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" disabled>
              <Reply className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="p-4 flex-1 overflow-auto">
          <div className="flex justify-between items-start mb-6">
            <Skeleton className="h-7 w-3/4 mb-3" />
            <Skeleton className="h-5 w-24" />
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-5 w-32 mb-1" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </div>
    );
  }
  
  if (!message) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center">
        <div className="bg-muted/30 p-6 rounded-full mb-4">
          <svg className="h-10 w-10 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">اختر رسالة لعرضها</h3>
        <p className="text-muted-foreground mt-2">اضغط على رسالة من القائمة لعرض محتواها</p>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b flex justify-between items-center bg-background">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon">
            {message.isStarred ? (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            ) : (
              <StarOff className="h-4 w-4" />
            )}
          </Button>
          <Button variant="ghost" size="icon">
            <Trash className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Reply className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <CornerUpRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="p-4 flex-1 overflow-auto">
        <h2 className="text-xl font-semibold mb-1">{message.subject}</h2>
        <div className="text-xs text-muted-foreground mb-4">
          {formatDate(new Date(message.date))}
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary">
            {message.sender.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{message.sender.name}</div>
            <div className="text-xs text-muted-foreground">{message.sender.email}</div>
          </div>
        </div>
        
        {message.recipients.length > 0 && (
          <div className="mb-4">
            <div className="text-sm text-muted-foreground">إلى: 
              {message.recipients.map((recipient) => (
                <span key={recipient.id} className="ml-1 mr-1">{recipient.name}</span>
              ))}
            </div>
          </div>
        )}
        
        <Separator className="my-4" />
        
        <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: message.content }} />
        
        {message.attachments.length > 0 && (
          <>
            <Separator className="my-4" />
            <div>
              <h3 className="text-sm font-medium mb-2">المرفقات ({message.attachments.length})</h3>
              <div className="space-y-2">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="flex items-center gap-2 p-2 rounded-md border">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{attachment.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {Math.round(attachment.size / 1024)} KB
                      </div>
                    </div>
                    <a href={attachment.path} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                      تحميل
                    </a>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
