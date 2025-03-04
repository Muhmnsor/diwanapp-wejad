
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ar } from "date-fns/locale";
import { TaskComment } from "../types/taskComment";

interface CommentItemProps {
  comment: TaskComment;
}

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
    <div className="flex gap-2 sm:gap-3">
      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
        <AvatarFallback className="bg-primary/10 text-primary">
          {userInitial}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="bg-muted/50 rounded-lg sm:rounded-xl p-3 sm:p-4">
          <div className="flex justify-between items-center mb-1 sm:mb-2">
            <span className="font-medium text-sm sm:text-base">{userName}</span>
            <span className="text-muted-foreground text-xs">{formattedDate}</span>
          </div>
          <p className="text-sm sm:text-base whitespace-pre-wrap">{comment.content}</p>
        </div>
      </div>
    </div>
  );
};
