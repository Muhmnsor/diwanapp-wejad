
export interface Comment {
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

export interface CommentListProps {
  comments: Comment[];
  onAddComment: (content: string, parentId?: string, file?: File) => Promise<void>;
  isSubmitting: boolean;
  onCommentFocus?: () => void;
}
