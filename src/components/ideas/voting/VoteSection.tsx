
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface Vote {
  vote_type: 'up' | 'down';
  user_id: string;
  idea_id: string;
}

interface VoteSectionProps {
  votes: Vote[];
  onVote: (type: 'up' | 'down') => Promise<void>;
}

export const VoteSection = ({ votes, onVote }: VoteSectionProps) => {
  const upVotes = votes.filter(v => v.vote_type === 'up').length;
  const downVotes = votes.filter(v => v.vote_type === 'down').length;

  return (
    <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onVote('up')}
        >
          <ThumbsUp className="ml-2 h-4 w-4" />
          مؤيد ({upVotes})
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onVote('down')}
        >
          <ThumbsDown className="ml-2 h-4 w-4" />
          معارض ({downVotes})
        </Button>
      </div>
    </div>
  );
};
