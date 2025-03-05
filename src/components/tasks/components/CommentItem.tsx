
import { formatRelative } from "date-fns";
import { arSA } from "date-fns/locale";
import { TaskComment } from "../types/taskComment";
import { FileIcon, User, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentItemProps {
  comment: TaskComment;
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const formattedDate = comment.created_at
    ? formatRelative(new Date(comment.created_at), new Date(), {
        locale: arSA,
      })
    : "الآن";

  // استخدام اسم المستخدم المضاف من معالجة البيانات
  const userName = comment.user_name || "مستخدم";

  const handleDownload = (url: string, name: string) => {
    // Create a temporary anchor element
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = name || 'attachment';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="border rounded-lg p-3 bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="text-sm font-medium">
            {userName}
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{formattedDate}</div>
      </div>

      <div className="text-sm mt-1">{comment.content}</div>

      {comment.attachment_url && (
        <div className="mt-3 border rounded p-2 bg-muted/40 flex items-center gap-2">
          <FileIcon className="h-4 w-4 text-primary" />
          <span className="text-sm flex-1 truncate">
            {comment.attachment_name || "مرفق"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 ml-2"
            onClick={() => handleDownload(
              comment.attachment_url!, 
              comment.attachment_name || 'attachment'
            )}
            title="تنزيل الملف"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
};
