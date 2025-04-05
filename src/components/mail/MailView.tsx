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
  X,
  Tag
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Message } from "./InternalMailApp";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { useLabelsManager } from "@/hooks/mail/useLabelsManager";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";

interface MailViewProps {
  message: Message;
  onClose: () => void;
  onReply: () => void;
  onDelete: () => void;
  onStar: () => void;
  isLoading?: boolean;
}

export const MailView: React.FC<MailViewProps> = ({ 
  message, 
  onClose,
  onReply,
  onDelete,
  onStar,
  isLoading = false
}) => {
  const { labels, addLabelToMessage, removeLabelFromMessage } = useLabelsManager();
  const { toast } = useToast();
  
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  const handleDownload = async (attachment: any) => {
    try {
      const { data, error } = await supabase.storage
        .from('mail_attachments')
        .download(attachment.path);
        
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.name;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading attachment:', error);
      toast({
        title: "فشل التنزيل",
        description: "حدث خطأ أثناء تنزيل المرفق",
        variant: "destructive"
      });
    }
  };
  
  const handleAddLabel = (labelId: string) => {
    addLabelToMessage.mutate({
      messageId: message.id,
      labelId
    });
  };
  
  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/20">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-8 w-8 rounded-full" />
        </div>
        <div className="flex-1 overflow-auto p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-48 mb-1" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          </div>
          <div className="space-y-4 mt-8">
            <Skeleton className="h-4 w-full max-w-xl" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-5/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-6 py-4 border-b flex items-center justify-between bg-muted/20">
        <h3 className="text-lg font-medium truncate">{message.subject}</h3>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onStar}
            className={message.isStarred ? "text-yellow-400 hover:text-yellow-500" : "text-muted-foreground hover:text-foreground"}
          >
            <Star className="h-4 w-4" fill={message.isStarred ? "currentColor" : "none"} />
          </Button>
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
                {message.recipients.filter(r => r.type === 'cc').length > 0 && (
                  <div className="text-sm text-muted-foreground">
                    نسخة: {message.recipients.filter(r => r.type === 'cc').map(r => r.name).join(', ')}
                  </div>
                )}
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-2">
                    <Tag className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>أضف تصنيفًا</DropdownMenuLabel>
                  {labels && labels.length > 0 ? (
                    labels.map(label => (
                      <DropdownMenuItem key={label.id} onClick={() => handleAddLabel(label.id)}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: label.color }}></div>
                          <span>{label.name}</span>
                        </div>
                      </DropdownMenuItem>
                    ))
                  ) : (
                    <DropdownMenuItem disabled>لا توجد تصنيفات</DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="prose prose-sm max-w-none mt-6 text-foreground">
            <div dangerouslySetInnerHTML={{ __html: message.content }} />
          </div>

          {message.attachments.length > 0 && (
            <div className="mt-8 border-t pt-4">
              <h4 className="text-sm font-medium mb-3">المرفقات ({message.attachments.length})</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {message.attachments.map((attachment) => (
                  <div key={attachment.id} className="border rounded-md p-3 flex items-center gap-3">
                    <div className="bg-muted rounded-md p-2 flex-shrink-0">
                      <File className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="flex-shrink-0"
                      onClick={() => handleDownload(attachment)}
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
          <Button 
            variant="ghost"
            size="icon"
            onClick={onStar}
            className={`flex items-center gap-1 ml-auto ${message.isStarred ? "text-yellow-400 hover:text-yellow-500" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Star className="h-4 w-4" fill={message.isStarred ? "currentColor" : "none"} />
          </Button>
          <Button variant="ghost" onClick={onDelete} className="flex items-center gap-1 text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};
