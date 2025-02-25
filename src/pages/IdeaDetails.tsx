
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight } from "lucide-react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { useState } from "react";
import { CommentList } from "@/components/ideas/comments/CommentList";
import { VoteSection } from "@/components/ideas/voting/VoteSection";
import { IdeaMetadata } from "@/components/ideas/details/IdeaMetadata";
import { IdeaDetails } from "@/components/ideas/details/IdeaDetails";

interface Idea {
  id: string;
  title: string;
  description: string;
  status: string;
  category: string | null;
  created_at: string;
  created_by: string;
  discussion_period: string;
  opportunity: string;
  problem: string;
  benefits: string;
  required_resources: string;
  contributing_departments: { name: string; contribution: string }[];
  expected_costs: { item: string; quantity: number; total_cost: number }[];
  expected_partners: { name: string; contribution: string }[];
  proposed_execution_date: string;
}

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  idea_id: string;
  parent_id: string | null;
}

interface Vote {
  vote_type: 'up' | 'down';
  user_id: string;
  idea_id: string;
}

const IdeaDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: idea, isLoading: isIdeaLoading } = useQuery({
    queryKey: ['idea', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('ideas')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Idea;
    }
  });

  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ['comments', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('idea_comments')
        .select('*')
        .eq('idea_id', id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Comment[];
    }
  });

  const { data: votes = [], isLoading: isVotesLoading } = useQuery({
    queryKey: ['votes', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('idea_votes')
        .select('*')
        .eq('idea_id', id);

      if (error) throw error;
      return data as Vote[];
    }
  });

  const addCommentMutation = useMutation({
    mutationFn: async ({ content, parentId }: { content: string; parentId?: string }) => {
      const { data, error } = await supabase
        .from('idea_comments')
        .insert([
          {
            idea_id: id,
            content,
            parent_id: parentId,
            user_id: 'temp-user-id'
          }
        ]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      toast.success("تم إضافة التعليق بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء إضافة التعليق");
    }
  });

  const voteMutation = useMutation({
    mutationFn: async (voteType: 'up' | 'down') => {
      const { data, error } = await supabase
        .from('idea_votes')
        .insert([
          {
            idea_id: id,
            vote_type: voteType,
            user_id: 'temp-user-id'
          }
        ]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes', id] });
      toast.success("تم تسجيل تصويتك بنجاح");
    },
    onError: () => {
      toast.error("حدث خطأ أثناء التصويت");
    }
  });

  const handleAddComment = async (content: string, parentId?: string) => {
    setIsSubmitting(true);
    try {
      await addCommentMutation.mutateAsync({ content, parentId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVote = async (type: 'up' | 'down') => {
    await voteMutation.mutateAsync(type);
  };

  if (isIdeaLoading || isCommentsLoading || isVotesLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">جاري التحميل...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!idea) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="text-center py-12">لم يتم العثور على الفكرة</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <main className="flex-1 container mx-auto px-4 py-8" dir="rtl">
        <div className="max-w-4xl mx-auto">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate('/ideas')}
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى القائمة
          </Button>

          <IdeaMetadata {...idea} />

          <Separator className="my-6" />

          <div className="space-y-8">
            <IdeaDetails idea={idea} />

            <div className="space-y-6">
              <VoteSection votes={votes} onVote={handleVote} />
              <CommentList 
                comments={comments}
                onAddComment={handleAddComment}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default IdeaDetails;
