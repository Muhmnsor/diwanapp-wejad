
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CornerDownLeft, MessageSquare, User } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  idea_id: string;
  parent_id: string | null;
}

interface CommentListProps {
  comments: Comment[];
  onAddComment: (content: string, parentId?: string) => Promise<void>;
  isSubmitting: boolean;
  onCommentFocus?: () => void;
}

export const CommentList = ({ comments, onAddComment, isSubmitting, onCommentFocus }: CommentListProps) => {
  const [newCommentText, setNewCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const getCommentReplies = (commentId: string) => {
    return comments.filter(c => c.parent_id === commentId);
  };

  const getRootComments = () => {
    return comments.filter(c => !c.parent_id);
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;
    await onAddComment(newCommentText, replyTo);
    setNewCommentText("");
    setReplyTo(null);
  };

  const renderComment = (commentItem: Comment, level: number = 0) => {
    const replies = getCommentReplies(commentItem.id);
    const isReplyBeingAdded = replyTo === commentItem.id;

    return (
      <div key={commentItem.id} className="relative" dir="rtl">
        <div className={`py-2 px-3 hover:bg-muted/50 transition-colors ${level > 0 ? 'mr-8' : ''}`}>
          <div className="flex gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-1 mb-0.5">
                <span className="font-medium">مستخدم</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(commentItem.created_at).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <p className="text-foreground mb-1 leading-normal text-sm">{commentItem.content}</p>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-primary/10 rounded-full h-6 px-2 text-muted-foreground hover:text-primary text-xs"
                  onClick={() => {
                    if (isReplyBeingAdded) {
                      setReplyTo(null);
                    } else {
                      setReplyTo(commentItem.id);
                      setNewCommentText('');
                    }
                  }}
                >
                  <CornerDownLeft className="ml-1 h-3 w-3" />
                  {isReplyBeingAdded ? 'إلغاء' : 'رد'}
                </Button>
              </div>
            </div>
          </div>

          {isReplyBeingAdded && (
            <div className="mt-2 mr-10">
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="اكتب ردك هنا..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="min-h-[80px] resize-none border-b focus-visible:ring-0 rounded-none px-0 text-right"
                  />
                  <div className="flex justify-start mt-1">
                    <Button 
                      onClick={handleAddComment}
                      disabled={isSubmitting || !newCommentText.trim()}
                      className="rounded-full"
                      size="sm"
                    >
                      <MessageSquare className="ml-1 h-3 w-3" />
                      رد
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {replies.length > 0 && (
          <div className="border-r border-border mr-4">
            {replies.map(reply => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div dir="rtl">
      <h2 className="text-lg font-semibold mb-3">التعليقات</h2>
      
      <div className="space-y-1">
        <div>
          {getRootComments().map(comment => renderComment(comment))}
        </div>

        {!replyTo && (
          <div className="flex gap-2 pt-3 mt-3 border-t">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="شارك برأيك..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onFocus={onCommentFocus}
                className="min-h-[80px] resize-none border-b focus-visible:ring-0 rounded-none px-0 text-right"
              />
              <div className="flex justify-start mt-1">
                <Button 
                  onClick={handleAddComment}
                  disabled={isSubmitting || !newCommentText.trim()}
                  className="rounded-full"
                  size="sm"
                >
                  تعليق
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
