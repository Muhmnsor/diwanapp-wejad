
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { TaskComment } from "../types/taskComment";
import { User } from "lucide-react";

interface CommentItemProps {
  comment: TaskComment;
}

// Helper function to render mentions in text
const renderTextWithMentions = (text: string) => {
  // Match @username patterns
  const mentionRegex = /@(\S+)/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = mentionRegex.exec(text)) !== null) {
    // Add text before the mention
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    
    // Add the mention with styling
    parts.push(
      <span key={match.index} className="text-primary font-medium">
        {match[0]}
      </span>
    );
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add any remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }
  
  return parts.length ? parts : text;
};

export const CommentItem = ({ comment }: CommentItemProps) => {
  const formattedDate = formatDistanceToNow(new Date(comment.created_at), {
    addSuffix: true,
    locale: ar
  });
  
  // الحصول على اسم المستخدم من البيانات المرتبطة أو استخدام "مستخدم" إذا لم يكن موجودًا
  const userName = comment.profiles?.display_name || comment.profiles?.email || "مستخدم";
  
  // حرف للأفاتار
  const userInitial = userName ? userName.charAt(0).toUpperCase() : "U";

  return (
    <div className="flex gap-3">
      <Avatar className="h-9 w-9 flex-shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary">
          {userInitial}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="bg-muted/50 rounded-xl p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-base">{userName}</span>
            <span className="text-muted-foreground text-xs">{formattedDate}</span>
          </div>
          <p className="text-base whitespace-pre-wrap">{renderTextWithMentions(comment.content)}</p>
        </div>
      </div>
    </div>
  );
};
