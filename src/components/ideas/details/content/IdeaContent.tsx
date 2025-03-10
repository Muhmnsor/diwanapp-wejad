import { IdeaMetadata } from "@/components/ideas/details/IdeaMetadata";
import { IdeaDetails } from "@/components/ideas/details/IdeaDetails";
import { VoteSection } from "@/components/ideas/voting/VoteSection";
import { CommentList } from "@/components/ideas/comments/CommentList";
import { DecisionSection } from "@/components/ideas/details/components/decision/DecisionSection";
import { Vote, Idea, Comment } from "../types";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { populateExistingDisplayNames } from "@/components/ideas/comments/migration/populateExistingDisplayNames";

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

  // Run the migration for display names only once when the component loads
  useEffect(() => {
    populateExistingDisplayNames();
  }, []);

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
          console.log("User admin status:", isUserAdmin);
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
        console.log("Fetching decision data for idea:", idea.id);
        
        // استعلام مباشر لجلب أحدث قرار
        const { data, error } = await supabase
          .from('idea_decisions')
          .select('*')
          .eq('idea_id', idea.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
          
        if (error) {
          console.error("Error fetching decision:", error);
          throw error;
        }
        
        console.log("Decision data fetched:", data);
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
      console.log("Refreshing decision data after update");
      setIsLoadingDecision(true);
      
      // إعادة تحميل بيانات الفكرة لتحديث الحالة
      const { data: updatedIdea, error: ideaError } = await supabase
        .from("ideas")
        .select("*")
        .eq("id", idea.id)
        .single();
        
      if (ideaError) {
        console.error("Error fetching updated idea:", ideaError);
        throw ideaError;
      }
      
      // تحديث بيانات الفكرة في المكون
      if (updatedIdea) {
        // تحديث حالة الفكرة محليًا
        Object.assign(idea, updatedIdea);
        console.log("Updated idea status:", updatedIdea.status);
      }
      
      // إعادة تحميل بيانات القرار
      const { data: refreshedDecision, error: decisionError } = await supabase
        .from('idea_decisions')
        .select('*')
        .eq('idea_id', idea.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
        
      if (decisionError) {
        console.error("Error fetching updated decision:", decisionError);
        throw decisionError;
      }
      
      // تحديث القرار المحلي (قد يكون null إذا تم حذف القرار)
      setDecision(refreshedDecision);
      console.log("Decision updated:", refreshedDecision);
      
      toast.success("تم تحديث بيانات الفكرة والقرار بنجاح");
    } catch (error) {
      console.error("Error updating decision data:", error);
      toast.error("حدث خطأ أثناء تحديث بيانات القرار");
    } finally {
      setIsLoadingDecision(false);
    }
  };

  // إضافة سجل للتحقق من البيانات
  console.log("IdeaContent - بيانات الفكرة:", { 
    ideaId: idea.id, 
    ideaStatus: idea.status, 
    ideaTitle: idea.title, 
    hasDecision: Boolean(decision?.id),
    decision,
    isAdmin
  });

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
      <div className="space-y-4">
        <IdeaDetails 
          idea={idea} 
          isOpen={isDetailsOpen} 
          onOpenChange={setIsDetailsOpen} 
        />
        <div className="space-y-4 my-0">
          {/* قسم المناقشات */}
          <CommentList 
            comments={comments} 
            onAddComment={onAddComment} 
            isSubmitting={isSubmitting} 
            onCommentFocus={handleCommentFocus}
            ideaCreatedAt={idea.created_at}
            ideaDiscussionPeriod={idea.discussion_period}
          />
          
          {/* تم نقل قسم التصويت ليكون بعد المناقشات وقبل القرار */}
          <VoteSection votes={votes} onVote={onVote} />
          
          {/* قسم القرار */}
          {!isLoadingDecision && (
            <DecisionSection 
              ideaId={idea.id}
              status={idea.status}
              isAdmin={isAdmin}
              decision={decision}
              onStatusChange={handleDecisionStatusChange}
              ideaTitle={idea.title}
            />
          )}
        </div>
      </div>
    </div>
  );
};
