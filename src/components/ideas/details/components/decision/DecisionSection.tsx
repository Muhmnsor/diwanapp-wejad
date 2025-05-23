
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Edit, Trash } from "lucide-react";
import { AssigneeItem, Decision, DecisionProps } from "./types";
import { DecisionForm } from "./DecisionForm";
import { DecisionDisplay } from "./DecisionDisplay";
import { DecisionDeleteDialog } from "./DecisionDeleteDialog";
import { useAuthStore } from "@/store/authStore";

export const DecisionSection = ({ 
  ideaId, 
  status, 
  isAdmin = false, 
  onStatusChange,
  ideaTitle = "",
  decision 
}: DecisionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState<string>(decision?.status || "pending_decision");
  const [reason, setReason] = useState<string>(decision?.reason || "");
  const [timeline, setTimeline] = useState<string>(decision?.timeline || "");
  const [budget, setBudget] = useState<string>(decision?.budget || "");
  const [localDecision, setLocalDecision] = useState<Decision | null>(decision || null);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [assignees, setAssignees] = useState<AssigneeItem[]>([]);
  
  // تحقق من صلاحيات المستخدم
  const { user } = useAuthStore();
  const canManageDecisions = user?.isAdmin || user?.role === 'admin';
  
  console.log("DecisionSection - لقطة الحالة الكاملة:", { 
    ideaId, 
    status, 
    isAdmin, 
    hasExistingDecision: Boolean(localDecision?.id),  
    decisionFullDetails: localDecision,
    ideaStatus: status,
    userRole: user?.role,
    canManageDecisions
  });
  
  const hasDecision = Boolean(localDecision?.id);
  
  useEffect(() => {
    // تحديث البيانات المحلية عند تغير بيانات القرار من الأب
    if (decision) {
      setLocalDecision(decision);
      setNewStatus(decision.status || "pending_decision");
      setReason(decision.reason || "");
      setTimeline(decision.timeline || "");
      setBudget(decision.budget || "");
      
      if (decision.assignee) {
        try {
          const parsedAssignees = JSON.parse(decision.assignee);
          if (Array.isArray(parsedAssignees)) {
            setAssignees(parsedAssignees);
          }
        } catch (e) {
          console.log("Cannot parse assignee data:", decision.assignee);
        }
      }
    } else {
      // إذا كان القرار null، يجب تحديث الحالة المحلية أيضًا
      setLocalDecision(null);
    }
  }, [decision]);
  
  useEffect(() => {
    const fetchLatestDecision = async () => {
      if (!hasDecision && ideaId) {
        console.log("Fetching decision directly for idea:", ideaId);
        try {
          const { data, error } = await supabase
            .from('idea_decisions')
            .select('*')
            .eq('idea_id', ideaId)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
            
          if (error) {
            if (error.code !== 'PGRST116') {
              console.error("Error fetching decision:", error);
            } else {
              console.log("No decision found for idea:", ideaId);
            }
            return;
          }
          
          console.log("Directly fetched decision:", data);
          
          if (data) {
            setNewStatus(data.status || "pending_decision");
            setReason(data.reason);
            setTimeline(data.timeline || "");
            setBudget(data.budget || "");
            setLocalDecision(data);
            
            if (data.assignee) {
              try {
                const parsedAssignees = JSON.parse(data.assignee);
                if (Array.isArray(parsedAssignees)) {
                  setAssignees(parsedAssignees);
                  console.log("تم تحميل قائمة المكلفين مباشرة:", parsedAssignees);
                }
              } catch (e) {
                console.log("Cannot parse assignee data:", data.assignee);
              }
            }
          }
        } catch (error) {
          console.error("Unexpected error fetching decision:", error);
        }
      }
    };
    
    fetchLatestDecision();
  }, [ideaId, hasDecision]);
  
  const handleDeleteDecision = async () => {
    if (!localDecision?.id) {
      console.error("No decision ID found for deletion");
      toast.error("لا يوجد قرار للحذف");
      return;
    }
    
    setIsDeleting(true);
    
    try {
      console.log("Starting deletion process for decision:", localDecision.id);
      
      // تحديث حالة الفكرة إلى قيد المناقشة
      const { error: ideaError } = await supabase
        .from("ideas")
        .update({ status: "under_review" })
        .eq("id", ideaId);
        
      if (ideaError) {
        console.error("Error updating idea status:", ideaError);
        throw ideaError;
      }
      
      console.log("Successfully updated idea status to under_review");
      
      // حذف القرار من قاعدة البيانات
      const { error: deleteError } = await supabase
        .from("idea_decisions")
        .delete()
        .eq("id", localDecision.id);
        
      if (deleteError) {
        console.error("Error deleting decision:", deleteError);
        throw deleteError;
      }
      
      console.log("Successfully deleted decision");
      
      // تحديث الحالة المحلية
      setLocalDecision(null);
      setAssignees([]);
      setReason("");
      setTimeline("");
      setBudget("");
      setNewStatus("under_review");
      
      toast.success("تم حذف القرار بنجاح");
      
      // إبلاغ المكون الأب بالتغييرات
      if (onStatusChange) {
        onStatusChange();
      }
      
    } catch (error) {
      console.error("Error during decision deletion process:", error);
      toast.error("حدث خطأ أثناء حذف القرار");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };
  
  const handleSubmitDecision = async (
    newStatus: string,
    newReason: string,
    newTimeline: string,
    newBudget: string,
    assigneesList: AssigneeItem[]
  ) => {
    if (!newReason) {
      toast.error("يجب إدخال سبب القرار");
      return;
    }
    
    setIsSubmitting(true);
    console.log("Starting decision submission process");
    
    try {
      const assigneesData = assigneesList.length > 0 ? JSON.stringify(assigneesList) : null;
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const newDecisionData = {
        idea_id: ideaId,
        status: newStatus,
        reason: newReason,
        assignee: assigneesData,
        timeline: newTimeline || null,
        budget: newBudget || null,
        created_by: user?.id || null
      };
      
      console.log("Submitting new decision data:", newDecisionData);
      
      const { data: newDecision, error: insertError } = await supabase
        .from("idea_decisions")
        .insert([newDecisionData])
        .select("*")
        .single();
        
      if (insertError) {
        console.error("Error creating decision:", insertError);
        throw insertError;
      }
      
      console.log("New decision created:", newDecision);
      
      // تحديث حالة الفكرة لتعكس القرار الجديد
      const { error: ideaError } = await supabase
        .from("ideas")
        .update({ status: newStatus })
        .eq("id", ideaId);
          
      if (ideaError) {
        console.error("Error updating idea status:", ideaError);
        throw ideaError;
      }
        
      console.log("Successfully updated idea status to", newStatus);
      
      // تحديث الحالة المحلية
      if (newDecision) {
        setLocalDecision(newDecision);
        setNewStatus(newStatus);
        setReason(newReason);
        setTimeline(newTimeline);
        setBudget(newBudget);
        setAssignees(assigneesList);
      }
      
      toast.success("تم حفظ القرار بنجاح");
      setIsEditing(false);
      
      // إبلاغ المكون الأب بالتغييرات
      if (onStatusChange) {
        onStatusChange();
      }
      
    } catch (error) {
      console.error("Error in decision submission:", error);
      toast.error("حدث خطأ أثناء حفظ القرار");
    } finally {
      setIsSubmitting(false);
    }
  };

  // تحديث المنطق للسماح فقط للمدراء باتخاذ القرارات
  const showDecisionForm = !hasDecision || (canManageDecisions && isEditing);

  console.log("DecisionSection - قرار العرض:", {
    hasDecision,
    isAdmin,
    isEditing,
    showDecisionForm,
    canManageDecisions,
    decisionStatus: localDecision?.status || "غير محدد"
  });

  const hasContent = hasDecision || reason;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            {ideaTitle || (hasDecision ? "القرار المتخذ" : "اتخاذ القرار")}
          </CardTitle>
          
          {hasDecision && canManageDecisions && !isEditing && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="text-xs flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
              >
                <Edit size={14} />
                تعديل القرار
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDeleteDialog(true)}
                className="text-xs flex items-center gap-1 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                <Trash size={14} />
                حذف القرار
              </Button>
            </div>
          )}
        </div>
        <CardDescription>
          {hasDecision 
            ? "تفاصيل القرار المتخذ بشأن هذه الفكرة" 
            : "اتخذ قرارًا بشأن هذه الفكرة"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {showDecisionForm ? (
          <DecisionForm
            ideaId={ideaId}
            initialStatus={newStatus}
            initialReason={reason}
            initialTimeline={timeline}
            initialBudget={budget}
            assignees={assignees}
            isEditing={isEditing}
            onSave={handleSubmitDecision}
            onCancel={() => setIsEditing(false)}
          />
        ) : hasContent ? (
          <DecisionDisplay
            decision={localDecision}
            status={newStatus}
            reason={reason}
            assignees={assignees}
            timeline={timeline}
            budget={budget}
          />
        ) : canManageDecisions ? (
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-3">لم يتم اتخاذ قرار بشأن هذه الفكرة بعد.</p>
            <Button onClick={() => setIsEditing(true)}>إضافة قرار جديد</Button>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">لم يتم اتخاذ قرار بشأن هذه الفكرة بعد.</p>
          </div>
        )}
      </CardContent>

      <DecisionDeleteDialog
        open={showDeleteDialog}
        isDeleting={isDeleting}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDeleteDecision}
      />
    </Card>
  );
};
