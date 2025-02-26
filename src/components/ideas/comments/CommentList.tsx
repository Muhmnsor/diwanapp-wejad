
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { CommentForm } from "./components/CommentForm";
import { CommentItem } from "./components/CommentItem";
import type { Comment, CommentListProps } from "./types";

export const CommentList = ({ comments, onAddComment, isSubmitting, onCommentFocus }: CommentListProps) => {
  const [newCommentText, setNewCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [comments]);

  const getCommentReplies = (commentId: string) => {
    return comments
      .filter(c => c.parent_id === commentId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const getRootComments = () => {
    return comments
      .filter(c => !c.parent_id)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ];

      if (!allowedTypes.includes(file.type)) {
        toast.error('نوع الملف غير مدعوم. الرجاء اختيار صورة، PDF، Word أو Excel.');
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الملف يجب أن لا يتجاوز 5 ميجابايت');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;

    try {
      await onAddComment(newCommentText, replyTo, selectedFile || undefined);
      setNewCommentText("");
      setSelectedFile(null);
      setReplyTo(null);
    } catch (error) {
      console.error("Error adding comment:", error);
      toast.error('حدث خطأ في إضافة التعليق');
    }
  };

  const renderComment = (commentItem: Comment, level: number = 0) => {
    const replies = getCommentReplies(commentItem.id);
    const isReplyBeingAdded = replyTo === commentItem.id;

    return (
      <div key={commentItem.id} className="relative" dir="rtl">
        <CommentItem
          comment={commentItem}
          level={level}
          onReply={() => {
            if (isReplyBeingAdded) {
              setReplyTo(null);
            } else {
              setReplyTo(commentItem.id);
              setNewCommentText('');
              setSelectedFile(null);
            }
          }}
          isReplyBeingAdded={isReplyBeingAdded}
        />

        {isReplyBeingAdded && (
          <div className="mt-2 mr-10">
            <CommentForm
              text={newCommentText}
              onTextChange={setNewCommentText}
              selectedFile={selectedFile}
              onFileChange={handleFileChange}
              onFileRemove={() => setSelectedFile(null)}
              onSubmit={handleAddComment}
              isSubmitting={isSubmitting}
              placeholder="اكتب ردك هنا..."
              inputId="reply-file"
              submitLabel="رد"
            />
          </div>
        )}

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
        <ScrollArea className="h-[400px] pr-4 -mr-4" dir="ltr">
          <div className="h-full" ref={scrollViewportRef}>
            {getRootComments().map(comment => renderComment(comment))}
          </div>
        </ScrollArea>

        {!replyTo && (
          <div className="flex gap-2 pt-3 mt-3 border-t">
            <CommentForm
              text={newCommentText}
              onTextChange={setNewCommentText}
              selectedFile={selectedFile}
              onFileChange={handleFileChange}
              onFileRemove={() => setSelectedFile(null)}
              onSubmit={handleAddComment}
              isSubmitting={isSubmitting}
              onFocus={onCommentFocus}
            />
          </div>
        )}
      </div>
    </div>
  );
};
