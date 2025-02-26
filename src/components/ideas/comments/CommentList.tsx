
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CornerDownLeft, MessageSquare } from "lucide-react";

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
        <div className={`bg-muted p-4 rounded-lg ${level > 0 ? 'mr-8 border-r border-primary/20' : ''}`}>
          <p className="text-sm text-muted-foreground mb-2">
            {new Date(commentItem.created_at).toLocaleDateString('ar-SA')}
          </p>
          <p className="text-foreground mb-3">{commentItem.content}</p>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => {
              if (isReplyBeingAdded) {
                setReplyTo(null);
              } else {
                setReplyTo(commentItem.id);
                setNewCommentText('');
              }
            }}
          >
            <CornerDownLeft className="ml-2 h-4 w-4" />
            {isReplyBeingAdded ? 'إلغاء الرد' : 'رد'}
          </Button>

          {isReplyBeingAdded && (
            <div className="mt-4 flex gap-4">
              <Textarea
                placeholder="اكتب ردك هنا..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={handleAddComment}
                disabled={isSubmitting || !newCommentText.trim()}
              >
                <MessageSquare className="ml-2 h-4 w-4" />
                إضافة رد
              </Button>
            </div>
          )}
        </div>

        {replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {replies.map(reply => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">التعليقات</h2>
      
      <div className="space-y-4">
        {!replyTo && (
          <div className="flex gap-4">
            <Textarea
              placeholder="أضف تعليقك هنا..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              onFocus={onCommentFocus}
              className="flex-1"
            />
            <Button 
              onClick={handleAddComment}
              disabled={isSubmitting || !newCommentText.trim()}
            >
              <MessageSquare className="ml-2 h-4 w-4" />
              إضافة تعليق
            </Button>
          </div>
        )}

        <div className="space-y-6">
          {getRootComments().map(comment => renderComment(comment))}
        </div>
      </div>
    </div>
  );
};
