
import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { SecondaryHeader } from "@/components/ideas/details/navigation/SecondaryHeader";
import { IdeaContent } from "@/components/ideas/details/content/IdeaContent";
import { Idea, Comment, Vote } from "@/components/ideas/details/types";

const IdeaDetails = () => {
  const { id } = useParams();
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
      
      return {
        ...data,
        similar_ideas: data.similar_ideas || [],
        supporting_files: data.supporting_files || [],
        duration: data.duration || '',
        idea_type: data.idea_type || 'تطويرية'
      } as Idea;
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
      <SecondaryHeader />
      <main className="flex-1 container mx-auto px-4 py-8" dir="rtl">
        <IdeaContent 
          idea={idea}
          votes={votes}
          comments={comments}
          onVote={handleVote}
          onAddComment={handleAddComment}
          isSubmitting={isSubmitting}
        />
      </main>
      <Footer />
    </div>
  );
};

export default IdeaDetails;
