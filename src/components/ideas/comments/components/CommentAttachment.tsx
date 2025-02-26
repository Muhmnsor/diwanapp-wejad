
import { FileText, Image as ImageIcon } from "lucide-react";
import { Comment } from "../types";

interface CommentAttachmentProps {
  comment: Comment;
}

export const CommentAttachment = ({ comment }: CommentAttachmentProps) => {
  if (!comment.attachment_url) {
    return null;
  }

  const isImage = comment.attachment_type?.startsWith('image/');
  const icon = isImage ? <ImageIcon className="h-4 w-4" /> : <FileText className="h-4 w-4" />;

  if (isImage) {
    return (
      <div className="mt-2">
        <a
          href={comment.attachment_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block"
        >
          <img 
            src={comment.attachment_url} 
            alt={comment.attachment_name || 'صورة مرفقة'} 
            className="rounded-lg max-h-[200px] object-cover"
          />
        </a>
      </div>
    );
  }

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
