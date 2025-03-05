
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { File, Download, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";

interface Attachment {
  id: string;
  task_id: string;
  file_url: string;
  file_name: string;
  file_type: string | null;
  attachment_category: string;
  created_by: string | null;
  created_at: string;
}

interface AttachmentItemProps {
  attachment: Attachment;
  showCategory?: boolean;
  canDelete: boolean;
  onDelete: (id: string) => Promise<void>;
}

export const AttachmentItem = ({
  attachment,
  showCategory = true,
  canDelete,
  onDelete
}: AttachmentItemProps) => {
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'creator':
        return 'منشئ المهمة';
      case 'assignee':
        return 'المكلف';
      case 'comment':
        return 'تعليق';
      default:
        return category;
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'creator':
        return 'bg-blue-100 text-blue-800';
      case 'assignee':
        return 'bg-green-100 text-green-800';
      case 'comment':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownload = () => {
    window.open(attachment.file_url, '_blank');
  };

  return (
    <div className="flex items-center justify-between bg-gray-50 p-2 rounded-md text-sm border border-gray-100">
      <div className="flex items-center min-w-0">
        <File className="h-4 w-4 ml-2 text-gray-500 shrink-0" />
        <span className="truncate max-w-[150px]">{attachment.file_name}</span>
        
        {showCategory && attachment.attachment_category && (
          <Badge 
            variant="outline" 
            className={`mr-2 text-xs ${getCategoryColor(attachment.attachment_category)}`}
          >
            {getCategoryLabel(attachment.attachment_category)}
          </Badge>
        )}
      </div>
      
      <div className="flex items-center gap-1 shrink-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="text-xs text-gray-500 ml-2">
                {formatDistanceToNow(new Date(attachment.created_at), { 
                  addSuffix: true,
                  locale: ar 
                })}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>تم الرفع {new Date(attachment.created_at).toLocaleString('ar')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <a 
          href={attachment.file_url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-1 hover:bg-gray-200 rounded-full transition-colors"
        >
          <Download className="h-4 w-4 text-gray-600" />
        </a>
        
        {canDelete && (
          <Button
            variant="ghost" 
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onDelete(attachment.id)}
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </Button>
        )}
      </div>
    </div>
  );
};
