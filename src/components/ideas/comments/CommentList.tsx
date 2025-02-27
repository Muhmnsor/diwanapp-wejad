
import { useState, useEffect, useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { CommentForm } from "./components/CommentForm";
import { CommentItem } from "./components/CommentItem";
import type { Comment, CommentListProps } from "./types";
import { isDiscussionActive } from "../details/utils/countdownUtils";

export const CommentList = ({
  comments,
  onAddComment,
  isSubmitting,
  onCommentFocus,
  ideaCreatedAt,
  ideaDiscussionPeriod
}: CommentListProps) => {
  const [newCommentText, setNewCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const scrollViewportRef = useRef<HTMLDivElement>(null);
  const discussionActive = isDiscussionActive(ideaDiscussionPeriod, ideaCreatedAt);

  useEffect(() => {
    if (scrollViewportRef.current) {
      scrollViewportRef.current.scrollTop = scrollViewportRef.current.scrollHeight;
    }
  }, [comments]);

  const getCommentReplies = (commentId: string) => {
    return comments.filter(c => c.parent_id === commentId).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const getRootComments = () => {
    return comments.filter(c => !c.parent_id).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
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
    
    if (!discussionActive) {
      toast.error('انتهت فترة المناقشة. لا يمكن إضافة تعليقات جديدة.');
      return;
    }
    
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

  const handleCancelReply = () => {
    setReplyTo(null);
    setNewCommentText("");
    setSelectedFile(null);
  };

  const renderComment = (commentItem: Comment, level: number = 0) => {
    const replies = getCommentReplies(commentItem.id);
    const isReplyBeingAdded = replyTo === commentItem.id;
    return <div key={commentItem.id} className="relative" dir="rtl">
        <CommentItem comment={commentItem} level={level} onReply={() => {
          if (!discussionActive) {
            toast.error('انتهت فترة المناقشة. لا يمكن إضافة ردود جديدة.');
            return;
          }
          
          if (isReplyBeingAdded) {
            handleCancelReply();
          } else {
            setReplyTo(commentItem.id);
            setNewCommentText('');
            setSelectedFile(null);
          }
        }} isReplyBeingAdded={isReplyBeingAdded} />

        {isReplyBeingAdded && <div className="mt-2 mr-10">
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
              isDiscussionActive={discussionActive}
            />
          </div>}

        {replies.length > 0 && <div className="border-r border-border mr-4">
            {replies.map(reply => renderComment(reply, level + 1))}
          </div>}
      </div>;
  };

  const rootComments = getRootComments();
  const hasComments = rootComments.length > 0;
  
  // تحديد ارتفاع منطقة التعليقات بناءً على عدد التعليقات
  const getScrollAreaHeight = () => {
    if (!hasComments) {
      return 'h-[150px]'; // ارتفاع مصغر عندما لا توجد تعليقات
    }
    
    const commentCount = comments.length;
    if (commentCount <= 3) {
      return 'h-[250px]'; // ارتفاع صغير لعدد قليل من التعليقات
    }
    
    return 'h-[400px]'; // الارتفاع الأقصى للتعليقات الكثيرة
  };

  return <div dir="rtl" className="bg-[#F2FCE2] p-4 rounded-lg border border-green-100 shadow-sm">
      <h2 className="text-lg font-semibold mb-3">المناقشات</h2>
      
      <div className="space-y-1">
        <ScrollArea dir="ltr" className={`pr-4 -mr-4 shadow-[inset_0_12px_8px_-10px_rgba(0,0,0,0.1),inset_0_-12px_8px_-10px_rgba(0,0,0,0.1)] rounded-2xl px-[15px] mx-[4px] bg-white ${getScrollAreaHeight()}`}>
          <div className="h-full" ref={scrollViewportRef}>
            {hasComments ? (
              rootComments.map(comment => renderComment(comment))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4 text-primary/20" />
                <p className="text-lg font-medium mb-2">لا توجد مناقشات بعد</p>
                <p className="text-sm">كن أول من يشارك برأيه وأفكاره!</p>
              </div>
            )}
          </div>
        </ScrollArea>

        {!replyTo && <div className="flex gap-2 pt-3 mt-3 border-t">
            <CommentForm 
              text={newCommentText} 
              onTextChange={setNewCommentText} 
              selectedFile={selectedFile} 
              onFileChange={handleFileChange} 
              onFileRemove={() => setSelectedFile(null)} 
              onSubmit={handleAddComment} 
              isSubmitting={isSubmitting} 
              onFocus={onCommentFocus}
              isDiscussionActive={discussionActive}
            />
          </div>}
      </div>
    </div>;
};
