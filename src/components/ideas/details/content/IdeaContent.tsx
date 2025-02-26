
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
  onAddComment: (content: string, parentId?: string) => Promise<void>;
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
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  const handleCommentFocus = () => {
    setIsDetailsOpen(false);
  };

  return <div className="max-w-4xl mx-auto">
      <IdeaMetadata {...idea} />

      <Separator className="my-[11px]" />

      <div className="space-y-8">
        <IdeaDetails idea={idea} isOpen={isDetailsOpen} onOpenChange={setIsDetailsOpen} />

        <div className="space-y-6">
          <VoteSection votes={votes} onVote={onVote} />
          <CommentList 
            comments={comments} 
            onAddComment={onAddComment} 
            isSubmitting={isSubmitting} 
            onCommentFocus={handleCommentFocus}
          />
        </div>
      </div>
    </div>;
};
