
export interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id?: string;
  parent_id?: string | null;
  idea_id?: string;
  user_name?: string;
  user_email?: string;
  display_name?: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
  attachment_name?: string | null;
}

export interface CommentListProps {
  comments: Comment[];
  onAddComment: (content: string, parentId?: string, file?: File) => Promise<void>;
  isSubmitting: boolean;
  onCommentFocus?: () => void;
  ideaCreatedAt: string;
  ideaDiscussionPeriod?: string;
}
