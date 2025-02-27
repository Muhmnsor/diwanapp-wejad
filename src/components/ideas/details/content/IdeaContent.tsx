
import { Separator } from "@/components/ui/separator";
import { IdeaMetadata } from "@/components/ideas/details/IdeaMetadata";
import { IdeaDetails } from "@/components/ideas/details/IdeaDetails";
import { VoteSection } from "@/components/ideas/voting/VoteSection";
import { CommentList } from "@/components/ideas/comments/CommentList";
import { DecisionSection } from "@/components/ideas/details/components/DecisionSection";
import { Vote, Idea, Comment } from "../types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const [isAdmin, setIsAdmin] = useState(false);
  const [decision, setDecision] = useState<any>(null);
  const [isLoadingDecision, setIsLoadingDecision] = useState(true);
  
  const handleCommentFocus = () => {
    setIsDetailsOpen(false);
  };

  // التحقق مما إذا كان المستخدم مديرًا
  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('user_roles')
            .select('role_id(name)')
            .eq('user_id', user.id);
            
          if (error) throw error;
          
          // التحقق من وجود دور المدير
          const isUserAdmin = data.some(role => 
            role.role_id && typeof role.role_id === 'object' && 'name' in role.role_id && role.role_id.name === 'admin'
          );
          
          setIsAdmin(isUserAdmin);
        }
      } catch (error) {
        console.error("Error checking user role:", error);
        setIsAdmin(false);
      }
    };
    
    checkUserRole();
  }, []);
  
  // جلب بيانات القرار إن وجد
  useEffect(() => {
    const fetchDecision = async () => {
      setIsLoadingDecision(true);
      try {
        const { data, error } = await supabase
          .from('idea_decisions')
          .select(`
            *,
            created_by_name:created_by(email)
          `)
          .eq('idea_id', idea.id)
          .maybeSingle();
          
        if (error) throw error;
        
        setDecision(data);
      } catch (error) {
        console.error("Error fetching decision:", error);
        toast.error("حدث خطأ أثناء جلب بيانات القرار");
      } finally {
        setIsLoadingDecision(false);
      }
    };
    
    fetchDecision();
  }, [idea.id]);
  
  // تحديث بيانات القرار بعد التغيير
  const handleDecisionStatusChange = async () => {
    try {
      // إعادة تحميل بيانات الفكرة
      const { data: updatedIdea, error: ideaError } = await supabase
        .from("ideas")
        .select("*")
        .eq("id", idea.id)
        .single();
        
      if (ideaError) throw ideaError;
      
      // تحديث بيانات القرار
      const { data: updatedDecision, error: decisionError } = await supabase
        .from('idea_decisions')
        .select(`
          *,
          created_by_name:created_by(email)
        `)
        .eq('idea_id', idea.id)
        .maybeSingle();
        
      if (decisionError) throw decisionError;
      
      // تحديث البيانات
      if (updatedIdea) {
        Object.assign(idea, updatedIdea);
      }
      
      setDecision(updatedDecision);
      
      toast.success("تم تحديث بيانات القرار بنجاح");
    } catch (error) {
      console.error("Error updating decision data:", error);
      toast.error("حدث خطأ أثناء تحديث بيانات القرار");
    }
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
        {/* عرض قسم القرار فقط إذا كانت الفكرة في مرحلة القرار أو ما بعدها */}
        {(idea.status === 'pending_decision' || 
         idea.status === 'approved' || 
         idea.status === 'rejected' || 
         idea.status === 'needs_modification') && !isLoadingDecision && (
          <DecisionSection 
            ideaId={idea.id}
            status={idea.status}
            isAdmin={isAdmin}
            decision={decision}
            onStatusChange={handleDecisionStatusChange}
          />
        )}
        
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
