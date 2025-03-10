
import { Comment } from "../types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, CornerDownLeft } from "lucide-react";
import { CommentAttachment } from "./CommentAttachment";
import { formatTime12Hour } from "@/utils/dateTimeUtils";
import { parseDate } from "@/utils/dateUtils";

interface CommentItemProps {
  comment: Comment;
  level?: number;
  onReply: () => void;
  isReplyBeingAdded: boolean;
}

const formatCommentDate = (dateStr: string): string => {
  const commentDate = parseDate(dateStr);
  if (!commentDate) return '';
  
  const now = new Date();
  const isToday = 
    commentDate.getDate() === now.getDate() &&
    commentDate.getMonth() === now.getMonth() &&
    commentDate.getFullYear() === now.getFullYear();
  
  if (isToday) {
    // إذا كان التعليق من اليوم نفسه، نعرض الوقت فقط
    const hours = commentDate.getHours().toString().padStart(2, '0');
    const minutes = commentDate.getMinutes().toString().padStart(2, '0');
    return formatTime12Hour(`${hours}:${minutes}`);
  } else {
    // إذا كان التعليق من يوم آخر، نعرض التاريخ بالتقويم الميلادي
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    };
    return commentDate.toLocaleDateString('ar', options);
  }
};

export const CommentItem = ({
  comment,
  level = 0,
  onReply,
  isReplyBeingAdded
}: CommentItemProps) => {
  // Use display_name as highest priority, then user_name, then user_email, then fallback to "مستخدم"
  const displayName = comment.display_name || comment.user_name || comment.user_email || 'مستخدم';
  
  return (
    <div className={`py-2 px-3 hover:bg-muted/50 transition-colors ${level > 0 ? 'mr-8' : ''}`}>
      <div className="flex gap-2">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-right">
          <div className="flex items-center gap-1 mb-0.5 justify-start">
            <span className="font-medium">{displayName}</span>
            <span className="text-xs text-muted-foreground">
              {formatCommentDate(comment.created_at)}
            </span>
          </div>
          <p className="text-foreground mb-1 leading-normal text-sm text-right">{comment.content}</p>
          <CommentAttachment comment={comment} />
          <div className="flex gap-2 justify-end">
            <Button 
              variant="ghost" 
              size="sm"
              className="hover:bg-primary/10 rounded-full h-6 px-2 text-muted-foreground hover:text-primary text-xs"
              onClick={onReply}
            >
              <CornerDownLeft className="ml-1 h-3 w-3" />
              {isReplyBeingAdded ? 'إلغاء' : 'رد'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
