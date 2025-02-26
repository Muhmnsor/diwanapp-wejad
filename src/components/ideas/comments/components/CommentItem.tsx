
import { Comment } from "../types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, CornerDownLeft } from "lucide-react";
import { CommentAttachment } from "./CommentAttachment";

interface CommentItemProps {
  comment: Comment;
  level?: number;
  onReply: () => void;
  isReplyBeingAdded: boolean;
}

export const CommentItem = ({
  comment,
  level = 0,
  onReply,
  isReplyBeingAdded
}: CommentItemProps) => {
  return (
    <div className={`py-2 px-3 hover:bg-muted/50 transition-colors ${level > 0 ? 'mr-8' : ''}`}>
      <div className="flex gap-2 shadow-[inset_0_8px_6px_-6px_rgba(0,0,0,0.1)]">
        <Avatar className="h-8 w-8">
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 text-right">
          <div className="flex items-center gap-1 mb-0.5 justify-start">
            <span className="font-medium">{comment.user_email || 'مستخدم'}</span>
            <span className="text-xs text-muted-foreground">
              {new Date(comment.created_at).toLocaleDateString('ar-SA')}
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
