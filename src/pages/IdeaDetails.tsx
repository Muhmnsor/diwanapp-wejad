
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useParams } from "react-router-dom";
import { IdeaMetadata } from "@/components/ideas/details/IdeaMetadata";
import { IdeaContent } from "@/components/ideas/details/content/IdeaContent";
import { VoteSection } from "@/components/ideas/voting/VoteSection";
import { CommentList } from "@/components/ideas/comments/CommentList";
import { SecondaryHeader } from "@/components/ideas/details/navigation/SecondaryHeader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";

const IdeaDetails = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: idea, isLoading } = useQuery({
    queryKey: ['idea', id],
    queryFn: async () => {
      if (!id) throw new Error("ID is undefined");
      
      const { data, error } = await supabase
        .from('ideas')
        .select(`
          *,
          profiles (
            email
          )
        `)
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching idea:", error);
        throw error;
      }
      
      return {
        ...data,
        creator_email: data.profiles?.email || 'غير معروف'
      };
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopHeader />
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="space-y-6">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-[400px] w-full" />
          </div>
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
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-800">لم يتم العثور على الفكرة</h2>
            <p className="text-gray-600 mt-2">تأكد من الرابط واحاول مرة أخرى</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopHeader />
      <SecondaryHeader title="رجوع إلى قائمة الأفكار" />
      
      <main className="flex-1 container mx-auto px-4 py-8" dir="rtl">
        <div className="space-y-8 max-w-4xl mx-auto">
          <IdeaMetadata
            id={idea.id}
            created_by={idea.created_by}
            created_at={idea.created_at}
            status={idea.status}
            title={idea.title}
            discussion_period={idea.discussion_period}
          />
          
          <IdeaContent 
            problemStatement={idea.problem_statement}
            solution={idea.solution}
            benefits={idea.benefits}
            costs={idea.costs}
            requiredResources={idea.required_resources}
            executionTime={idea.execution_time}
            targetDepartments={idea.target_departments}
            similarIdeas={idea.similar_ideas}
            type={idea.type}
            opportunity={idea.opportunity}
            partners={idea.partners}
            supportingFiles={idea.supporting_files}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <CommentList ideaId={idea.id} />
            </div>
            
            <div className="md:col-span-1">
              <VoteSection 
                ideaId={idea.id}
                voteCount={idea.vote_count || 0}
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
