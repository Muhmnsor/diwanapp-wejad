
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { Paperclip, Star, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  subject: string;
  sender: {
    name: string;
    id: string;
    avatar?: string;
  };
  content: string;
  attachments: any[];
  read: boolean;
  starred: boolean;
  date: string;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
  hasAttachments: boolean;
}

interface MailListProps {
  messages: Message[];
  selectedId?: string;
  onSelectMessage: (message: Message) => void;
}

export const MailList: React.FC<MailListProps> = ({ 
  messages, 
  selectedId,
  onSelectMessage 
}) => {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="bg-muted/30 p-6 rounded-full mb-4">
          <svg className="h-10 w-10 text-muted-foreground" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        </div>
        <h3 className="text-lg font-medium">لا توجد رسائل</h3>
        <p className="text-muted-foreground mt-2">هذا المجلد فارغ حالياً</p>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="px-4 py-3 border-b flex justify-between items-center bg-muted/20">
        <div className="text-sm font-medium">
          {messages.length} رسالة
        </div>
        <div className="flex gap-2">
          <button className="text-xs text-muted-foreground hover:text-foreground">تحديث</button>
        </div>
      </div>

      <ul className="divide-y">
        {messages.map((message) => (
          <li 
            key={message.id}
            className={cn(
              "px-4 py-3 hover:bg-muted/30 cursor-pointer transition-colors flex",
              !message.read && "bg-primary/5 font-medium",
              selectedId === message.id && "bg-muted"
            )}
            onClick={() => onSelectMessage(message)}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={cn("text-sm truncate max-w-[70%]", !message.read && "font-semibold")}>
                  {message.folder === "sent" ? message.recipients[0]?.name : message.sender.name}
                </span>
                <div className="flex items-center gap-1.5 shrink-0 text-xs text-muted-foreground">
                  {message.hasAttachments && <Paperclip className="h-3 w-3 text-muted-foreground" />}
                  {formatDistanceToNow(new Date(message.date), { addSuffix: true, locale: ar })}
                </div>
              </div>
              <div className="text-sm font-medium truncate">{message.subject}</div>
              <div className="text-xs text-muted-foreground truncate">
                {message.content.replace(/<[^>]*>?/gm, '').substring(0, 100)}...
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
