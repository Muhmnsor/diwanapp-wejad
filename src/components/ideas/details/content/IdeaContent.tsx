
import { Separator } from "@/components/ui/separator";
import { IdeaMetadata } from "@/components/ideas/details/IdeaMetadata";
import { IdeaDetails } from "@/components/ideas/details/IdeaDetails";
import { VoteSection } from "@/components/ideas/voting/VoteSection";
import { CommentList } from "@/components/ideas/comments/CommentList";
import { Vote, Idea, Comment } from "../types";
import { useState } from "react";

interface IdeaContentProps {
  idea: Idea;
  votes: Vote[];
  comments: Comment[];
  onVote: (type: 'up' | 'down') => Promise<void>;
  onAddComment: (content: string, parentId?: string, file?: File) => Promise<void>;
  isSubmitting: boolean;
}

export const IdeaContent = ({
  idea,
  votes,
  comments,
  onVote,
  onAddComment,
  isSubmitting
}: IdeaContentProps) => {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  const handleCommentFocus = () => {
    setIsDetailsOpen(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <IdeaMetadata 
        id={idea.id} 
        created_by={idea.created_by} 
        created_at={idea.created_at} 
        status={idea.status} 
        title={idea.title} 
        discussion_period={idea.discussion_period} 
      />
      <Separator className="my-2" />
      <div className="space-y-4">
        <IdeaDetails 
          idea={idea} 
          isOpen={isDetailsOpen} 
          onOpenChange={setIsDetailsOpen} 
        />
        <div className="space-y-4 my-0">
          <VoteSection votes={votes} onVote={onVote} />
          <CommentList 
            comments={comments} 
            onAddComment={onAddComment} 
            isSubmitting={isSubmitting} 
            onCommentFocus={handleCommentFocus}
            ideaCreatedAt={idea.created_at}
            ideaDiscussionPeriod={idea.discussion_period}
          />
        </div>
      </div>
    </div>
  );
};
