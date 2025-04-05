
import React from "react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  CornerUpLeft, 
  CornerUpRight, 
  Trash2, 
  Star,
  Download,
  File,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  subject: string;
  sender: {
    name: string;
    id: string;
    avatar?: string;
  };
  recipients: {
    name: string;
    id: string;
    type: 'to' | 'cc' | 'bcc';
  }[];
  content: string;
  attachments: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
  }[];
  read: boolean;
  starred: boolean;
  labels: string[];
  date: string;
  folder: 'inbox' | 'sent' | 'drafts' | 'trash';
  hasAttachments: boolean;
}

interface MailViewProps {
  message: Message;
  onClose: () => void;
  onReply: () => void;
}

export const MailView: React.FC<MailViewProps> = ({ 
  message, 
  onClose,
  onReply
}) => {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/20">
        <h3 className="text-lg font-medium truncate">{message.subject}</h3>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-10 w-10">
                {message.sender.avatar ? (
                  <AvatarImage src={message.sender.avatar} alt={message.sender.name} />
                ) : (
                  <AvatarFallback>{message.sender.name.charAt(0)}</AvatarFallback>
                )}
              </Avatar>
              <div>
                <div className="font-medium">{message.sender.name}</div>
                <div className="text-sm text-muted-foreground">
                  إلى: {message.recipients.filter(r => r.type === 'to').map(r => r.name).join(', ')}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {format(new Date(message.date), 'PPpp', { locale: ar })}
                </div>
              </div>
            </div>
            <div className="flex gap-1">
              {message.labels.map(label => (
                <Badge key={label} variant="outline" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          </div>

          <div className="prose prose-sm max-w-none mt-6 text-foreground">
            <div dangerouslySetInnerHTML={{ __html: message.content }} />
          </div>

          {message.attachments.length > 0 && (
            <div className="mt-8 border-t pt-4">
              <h4 className="text-sm font-medium mb-3">المرفقات ({message.attachments.length})</h4>
              <div className="grid grid-cols-2 gap-3">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="border rounded-md p-3 flex items-center gap-3">
                    <div className="bg-muted rounded-md p-2 flex-shrink-0">
                      <File className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t bg-muted/20">
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onReply} className="flex items-center gap-1">
            <CornerUpLeft className="h-4 w-4" />
            رد
          </Button>
          <Button variant="secondary" className="flex items-center gap-1">
            <CornerUpRight className="h-4 w-4" />
            إعادة توجيه
          </Button>
          <Button variant="ghost" className="flex items-center gap-1 ml-auto">
            <Star className="h-4 w-4" />
          </Button>
          <Button variant="ghost" className="flex items-center gap-1 text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
