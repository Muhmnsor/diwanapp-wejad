
import { formatRelative } from "date-fns";
import { arSA } from "date-fns/locale";
import { TaskComment } from "../types/taskComment";
import { FileIcon, User } from "lucide-react";

interface CommentItemProps {
  comment: TaskComment;
}

export const CommentItem = ({ comment }: CommentItemProps) => {
  const formattedDate = comment.created_at
    ? formatRelative(new Date(comment.created_at), new Date(), {
        locale: arSA,
      })
    : "الآن";

  return (
    <div className="border rounded-lg p-3 bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div className="text-sm font-medium">
            مستخدم
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{formattedDate}</div>
      </div>

      <div className="text-sm mt-1">{comment.content}</div>

      {comment.attachment_url && (
        <div className="mt-3 border rounded p-2 bg-muted/40 flex items-center gap-2">
          <FileIcon className="h-4 w-4 text-primary" />
          <a
            href={comment.attachment_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            {comment.attachment_name || "مرفق"}
          </a>
        </div>
      )}
    </div>
  );
};
