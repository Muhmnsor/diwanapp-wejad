
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CornerDownLeft, MessageSquare, User, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  idea_id: string;
  parent_id: string | null;
  user_email?: string;
  attachment_url?: string;
  attachment_type?: string;
  attachment_name?: string;
}

interface CommentListProps {
  comments: Comment[];
  onAddComment: (content: string, parentId?: string, file?: File) => Promise<void>;
  isSubmitting: boolean;
  onCommentFocus?: () => void;
}

export const CommentList = ({ comments, onAddComment, isSubmitting, onCommentFocus }: CommentListProps) => {
  const [newCommentText, setNewCommentText] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

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
      // التحقق من نوع الملف
      const allowedTypes = [
        'image/jpeg', 'image/png', 'image/gif',
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      ];

      if (!allowedTypes.includes(file.type)) {
        alert('نوع الملف غير مدعوم. الرجاء اختيار صورة، PDF، Word أو Excel.');
        return;
      }

      // التحقق من حجم الملف (5MB كحد أقصى)
      if (file.size > 5 * 1024 * 1024) {
        alert('حجم الملف يجب أن لا يتجاوز 5 ميجابايت');
        return;
      }

      setSelectedFile(file);
    }
  };

  const handleAddComment = async () => {
    if (!newCommentText.trim()) return;
    await onAddComment(newCommentText, replyTo, selectedFile || undefined);
    setNewCommentText("");
    setSelectedFile(null);
    setReplyTo(null);
  };

  const renderAttachment = (comment: Comment) => {
    if (!comment.attachment_url) return null;

    const isImage = comment.attachment_type?.startsWith('image/');
    const icon = isImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />;

    return (
      <a
        href={comment.attachment_url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 text-sm text-primary hover:underline mt-2"
      >
        {icon}
        <span>{comment.attachment_name || 'مرفق'}</span>
      </a>
    );
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
            <div className="flex-1 text-right">
              <div className="flex items-center gap-1 mb-0.5 justify-start">
                <span className="font-medium">{commentItem.user_email || 'مستخدم'}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(commentItem.created_at).toLocaleDateString('ar-SA')}
                </span>
              </div>
              <p className="text-foreground mb-1 leading-normal text-sm text-right">{commentItem.content}</p>
              {renderAttachment(commentItem)}
              <div className="flex gap-2 justify-end">
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
                      setSelectedFile(null);
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
                  <div className="flex justify-between items-center mt-2">
                    <div className="flex gap-2 items-center">
                      <input
                        type="file"
                        id="reply-file"
                        className="hidden"
                        onChange={handleFileChange}
                        accept="image/*,.pdf,.docx,.xlsx"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8"
                        onClick={() => document.getElementById('reply-file')?.click()}
                      >
                        <Paperclip className="h-4 w-4 ml-1" />
                        إضافة مرفق
                      </Button>
                      {selectedFile && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <span>{selectedFile.name}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={() => setSelectedFile(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
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
        <ScrollArea className="h-[400px] pr-4 -mr-4">
          <div>
            {getRootComments().map(comment => renderComment(comment))}
          </div>
        </ScrollArea>

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
              <div className="flex justify-between items-center mt-2">
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    id="comment-file"
                    className="hidden"
                    onChange={handleFileChange}
                    accept="image/*,.pdf,.docx,.xlsx"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8"
                    onClick={() => document.getElementById('comment-file')?.click()}
                  >
                    <Paperclip className="h-4 w-4 ml-1" />
                    إضافة مرفق
                  </Button>
                  {selectedFile && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <span>{selectedFile.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setSelectedFile(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
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
