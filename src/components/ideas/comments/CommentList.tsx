
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
      <div key={commentItem.id} className="relative">
        <div className={`p-4 hover:bg-muted/50 transition-colors ${level > 0 ? 'mr-12' : ''}`}>
          <div className="flex gap-3">
            <Avatar>
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium">مستخدم</span>
                <span className="text-sm text-muted-foreground">
                  {new Date(commentItem.created_at).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <p className="text-foreground mb-3 leading-relaxed">{commentItem.content}</p>
              <div className="flex gap-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="hover:bg-primary/10 rounded-full h-8 px-3 text-muted-foreground hover:text-primary"
                  onClick={() => {
                    if (isReplyBeingAdded) {
                      setReplyTo(null);
                    } else {
                      setReplyTo(commentItem.id);
                      setNewCommentText('');
                    }
                  }}
                >
                  <CornerDownLeft className="ml-1 h-4 w-4" />
                  {isReplyBeingAdded ? 'إلغاء' : 'رد'}
                </Button>
              </div>
            </div>
          </div>

          {isReplyBeingAdded && (
            <div className="mt-4 mr-12">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarFallback>
                    <User className="h-5 w-5" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <Textarea
                    placeholder="اكتب ردك هنا..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="min-h-[100px] resize-none border-b focus-visible:ring-0 rounded-none px-0"
                  />
                  <div className="flex justify-start mt-2">
                    <Button 
                      onClick={handleAddComment}
                      disabled={isSubmitting || !newCommentText.trim()}
                      className="rounded-full"
                      size="sm"
                    >
                      <MessageSquare className="ml-2 h-4 w-4" />
                      رد
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {replies.length > 0 && (
          <div className="space-y-1 border-r border-border mr-6">
            {replies.map(reply => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-6">التعليقات</h2>
      
      <div className="space-y-6">
        {!replyTo && (
          <div className="flex gap-3">
            <Avatar>
              <AvatarFallback>
                <User className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="شارك برأيك..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                onFocus={onCommentFocus}
                className="min-h-[100px] resize-none border-b focus-visible:ring-0 rounded-none px-0"
              />
              <div className="flex justify-start mt-2">
                <Button 
                  onClick={handleAddComment}
                  disabled={isSubmitting || !newCommentText.trim()}
                  className="rounded-full"
                >
                  تعليق
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1 divide-y">
          {getRootComments().map(comment => renderComment(comment))}
        </div>
      </div>
    </div>
  );
};
