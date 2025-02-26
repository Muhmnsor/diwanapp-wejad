
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
    mutationFn: async ({ content, parentId, file }: { content: string; parentId?: string; file?: File }) => {
      try {
        console.log("Starting comment submission with:", { content, hasFile: !!file });
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("يجب تسجيل الدخول لإضافة تعليق");
        }

        let attachmentUrl = null;
        let attachmentType = null;
        let attachmentName = null;

        if (file) {
          try {
            console.log("Starting file upload process");
            const fileExt = file.name.split('.').pop();
            const fileName = `${crypto.randomUUID()}.${fileExt}`;

            console.log("Attempting to upload file:", { fileName, type: file.type, size: file.size });

            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('attachments')
              .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
              });

            if (uploadError) {
              console.error("Upload error details:", uploadError);
              throw new Error(`فشل في رفع الملف: ${uploadError.message}`);
            }

            console.log("File upload successful, getting public URL");
            
            const { data } = supabase.storage
              .from('attachments')
              .getPublicUrl(fileName);

            attachmentUrl = data.publicUrl;
            attachmentType = file.type;
            attachmentName = file.name;

            console.log("File metadata prepared:", {
              url: attachmentUrl,
              type: attachmentType,
              name: attachmentName
            });
          } catch (uploadError) {
            console.error("File upload process failed:", uploadError);
            throw new Error("فشل في معالجة الملف المرفق");
          }
        }

        console.log("Preparing to insert comment with attachment:", {
          hasAttachment: !!attachmentUrl,
          attachmentType,
          attachmentName
        });

        const { data, error } = await supabase
          .from('idea_comments')
          .insert([
            {
              idea_id: id,
              content,
              parent_id: parentId,
              user_id: user.id,
              attachment_url: attachmentUrl,
              attachment_type: attachmentType,
              attachment_name: attachmentName
            }
          ])
          .select()
          .single();

        if (error) {
          console.error("Comment insertion error:", error);
          throw error;
        }

        console.log("Comment successfully added:", data);
        return data;
      } catch (error) {
        console.error("Complete error details:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', id] });
      toast.success("تم إضافة التعليق بنجاح");
    },
    onError: (error) => {
      console.error("Comment mutation error:", error);
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء إضافة التعليق");
    }
  });

  const voteMutation = useMutation({
    mutationFn: async (voteType: 'up' | 'down') => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("يجب تسجيل الدخول للتصويت");
      }

      const { data, error } = await supabase
        .from('idea_votes')
        .insert([
          {
            idea_id: id,
            vote_type: voteType,
            user_id: user.id
          }
        ]);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['votes', id] });
      toast.success("تم تسجيل تصويتك بنجاح");
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "حدث خطأ أثناء التصويت");
    }
  });

  const handleAddComment = async (content: string, parentId?: string, file?: File) => {
    setIsSubmitting(true);
    try {
      console.log("handleAddComment called with:", { content, parentId, hasFile: !!file });
      await addCommentMutation.mutateAsync({ content, parentId, file });
    } catch (error) {
      console.error("Error in handleAddComment:", error);
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
