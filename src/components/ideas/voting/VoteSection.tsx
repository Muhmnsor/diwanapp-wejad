
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [currentUserVote, setCurrentUserVote] = useState<'up' | 'down' | null>(null);
  const upVotes = votes.filter(v => v.vote_type === 'up').length;
  const downVotes = votes.filter(v => v.vote_type === 'down').length;

  useEffect(() => {
    const getCurrentUserVote = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const userVote = votes.find(v => v.user_id === user.id);
        if (userVote) {
          setCurrentUserVote(userVote.vote_type);
        }
      }
    };

    getCurrentUserVote();
  }, [votes]);

  const handleVote = async (type: 'up' | 'down') => {
    try {
      // إذا كان نفس الزر المضغوط سابقاً، فهذا يعني إلغاء التصويت
      if (currentUserVote === type) {
        setCurrentUserVote(null);
      } else {
        setCurrentUserVote(type);
      }
      await onVote(type);
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('حدث خطأ في عملية التصويت');
    }
  };

  return (
    <div className="flex justify-between items-center bg-muted p-4 rounded-lg">
      <div className="flex gap-4">
        <Button 
          variant={currentUserVote === 'up' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleVote('up')}
          className={currentUserVote === 'up' ? 'bg-green-600 hover:bg-green-700' : ''}
        >
          <ThumbsUp className="ml-2 h-4 w-4" />
          مؤيد ({upVotes})
        </Button>
        <Button 
          variant={currentUserVote === 'down' ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleVote('down')}
          className={currentUserVote === 'down' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          <ThumbsDown className="ml-2 h-4 w-4" />
          معارض ({downVotes})
        </Button>
      </div>
    </div>
  );
};
