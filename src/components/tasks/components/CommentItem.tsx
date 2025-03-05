import { formatRelative } from "date-fns";
import { arSA } from "date-fns/locale";
import { TaskComment } from "../types/taskComment";
import { FileIcon, User, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
interface CommentItemProps {
  comment: TaskComment;
}
export const CommentItem = ({
  comment
}: CommentItemProps) => {
  const formattedDate = comment.created_at ? formatRelative(new Date(comment.created_at), new Date(), {
    locale: arSA
  }) : "الآن";

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
  return <div className="border-b border-border/40 last:border-0 px-[17px] py-[4px]">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-3 w-3 text-primary" />
          </div>
          <div className="text-xs font-medium">
            {userName}
          </div>
        </div>
        <div className="text-[11px] text-muted-foreground">{formattedDate}</div>
      </div>

      <div className="text-xs mt-1 pr-7.5">{comment.content}</div>

      {comment.attachment_url && <div className="mt-2 border-r-2 border-primary/20 pr-2 mr-1 text-xs">
          <div className="flex items-center gap-1.5">
            <FileIcon className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs flex-1 truncate">
              {comment.attachment_name || "مرفق"}
            </span>
            <Button variant="ghost" size="sm" className="h-5 w-5 p-0 ml-1" onClick={() => handleDownload(comment.attachment_url!, comment.attachment_name || 'attachment')} title="تنزيل الملف">
              <Download className="h-3 w-3" />
            </Button>
          </div>
        </div>}
    </div>;
};