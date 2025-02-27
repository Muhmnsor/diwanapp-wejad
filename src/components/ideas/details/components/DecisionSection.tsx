import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { formatDate } from "@/utils/dateUtils";
import { CheckCircle, Clock, Edit, Plus, Trash, XCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { getStatusClass, getStatusDisplay } from "../utils/statusUtils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface DecisionSectionProps {
  ideaId: string;
  status: string;
  isAdmin?: boolean; 
  onStatusChange?: () => void;
  decision?: {
    id?: string;
    status: string;
    reason: string;
    assignee?: string;
    timeline?: string;
    budget?: string;
    created_at?: string;
    created_by?: string;
    created_by_name?: string;
  };
}

interface AssigneeItem {
  id: string;
  name: string;
  responsibility: string;
}

export const DecisionSection = ({ 
  ideaId, 
  status, 
  isAdmin = false, 
  onStatusChange,
  decision 
}: DecisionSectionProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newStatus, setNewStatus] = useState<string>(decision?.status || "pending_decision");
  const [reason, setReason] = useState<string>(decision?.reason || "");
  const [timeline, setTimeline] = useState<string>(decision?.timeline || "");
  const [budget, setBudget] = useState<string>(decision?.budget || "");
  const [localDecision, setLocalDecision] = useState(decision);
  
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [assignees, setAssignees] = useState<AssigneeItem[]>([]);
  const [newAssigneeName, setNewAssigneeName] = useState("");
  const [newAssigneeResponsibility, setNewAssigneeResponsibility] = useState("");
  
  console.log("DecisionSection - لقطة الحالة الكاملة:", { 
    ideaId, 
    status, 
    isAdmin, 
    hasExistingDecision: Boolean(decision?.id),  
    decisionFullDetails: decision,
    ideaStatus: status,
    localDecision
  });
  
  const hasDecision = Boolean(localDecision?.id);
  
  useEffect(() => {
    setLocalDecision(decision);
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
            setNewStatus(data.status);
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
  
  const handleAddAssignee = () => {
    if (!newAssigneeName || !newAssigneeResponsibility) {
      toast.error("يرجى إدخال اسم المكلف والمهمة");
      return;
    }
    
    const newAssignee: AssigneeItem = {
      id: crypto.randomUUID(),
      name: newAssigneeName,
      responsibility: newAssigneeResponsibility
    };
    
    setAssignees([...assignees, newAssignee]);
    setNewAssigneeName("");
    setNewAssigneeResponsibility("");
  };
  
  const handleRemoveAssignee = (id: string) => {
    setAssignees(assignees.filter(item => item.id !== id));
  };
  
  const handleDeleteDecision = async () => {
    if (!localDecision?.id) {
      toast.error("لا يوجد قرار للحذف");
      return;
    }
    
    setIsDeleting(true);
    
    try {
      console.log("Deleting decision:", localDecision.id);
      
      const { error } = await supabase
        .from("idea_decisions")
        .delete()
        .eq("id", localDecision.id);
        
      if (error) {
        console.error("Error deleting decision:", error);
        throw error;
      }
      
      const { error: ideaError } = await supabase
        .from("ideas")
        .update({ status: "under_review" })
        .eq("id", ideaId);
        
      if (ideaError) {
        console.error("Error updating idea status:", ideaError);
        throw ideaError;
      }
      
      setLocalDecision(undefined);
      setAssignees([]);
      setReason("");
      setTimeline("");
      setBudget("");
      setNewStatus("pending_decision");
      
      toast.success("تم حذف القرار بنجاح");
      
      if (onStatusChange) {
        onStatusChange();
      }
      
    } catch (error) {
      console.error("Error during decision deletion:", error);
      toast.error("حدث خطأ أثناء حذف القرار");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };
  
  const handleSubmitDecision = async () => {
    if (!reason) {
      toast.error("يجب إدخال سبب القرار");
      return;
    }
    
    setIsSubmitting(true);
    console.log("Submitting decision...");
    
    try {
      const assigneesData = assignees.length > 0 ? JSON.stringify(assignees) : null;
      console.log("Assignees data:", assigneesData);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      const newDecisionData = {
        idea_id: ideaId,
        status: newStatus,
        reason,
        assignee: assigneesData,
        timeline: timeline || null,
        budget: budget || null,
        created_by: user?.id || null
      };
      
      console.log("Decision data to save:", newDecisionData);
      
      const { data: newDecision, error: insertError } = await supabase
        .from("idea_decisions")
        .insert([newDecisionData])
        .select("*")
        .single();
        
      if (insertError) {
        console.error("Error creating decision:", insertError);
        throw insertError;
      }
      
      console.log("New decision created successfully:", newDecision);
      
      if (status !== newStatus) {
        console.log("Updating idea status from", status, "to", newStatus);
        const { error: ideaError } = await supabase
          .from("ideas")
          .update({ status: newStatus })
          .eq("id", ideaId);
          
        if (ideaError) {
          console.error("Error updating idea status:", ideaError);
          throw ideaError;
        }
        
        console.log("Idea status updated successfully to:", newStatus);
      }
      
      if (newDecision) {
        setLocalDecision(newDecision);
      }
      
      toast.success("تم حفظ القرار بنجاح");
      
      setIsEditing(false);
      
      if (onStatusChange) {
        onStatusChange();
      }
      
    } catch (error) {
      console.error("Error saving decision:", error);
      toast.error("حدث خطأ أثناء حفظ القرار");
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (localDecision?.assignee) {
      try {
        const parsedAssignees = JSON.parse(localDecision.assignee);
        if (Array.isArray(parsedAssignees)) {
          setAssignees(parsedAssignees);
          console.log("تم تحميل قائمة المكلفين بنجاح:", parsedAssignees);
        }
      } catch (e) {
        console.log("Cannot parse assignee data, might be old format:", localDecision.assignee);
      }
    }
  }, [localDecision]);

  useEffect(() => {
    if (localDecision) {
      setNewStatus(localDecision.status || "pending_decision");
      setReason(localDecision.reason || "");
      setTimeline(localDecision.timeline || "");
      setBudget(localDecision.budget || "");
    }
  }, [localDecision]);

  const showDecisionForm = !hasDecision || (isAdmin && isEditing);

  console.log("DecisionSection - قرار العرض:", {
    hasDecision,
    isAdmin,
    isEditing,
    showDecisionForm,
    decisionStatus: localDecision?.status || "غير محدد"
  });

  const hasContent = hasDecision || reason;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            {hasDecision ? "القرار المتخذ" : "اتخاذ القرار"}
          </CardTitle>
          
          {hasDecision && isAdmin && !isEditing && (
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsEditing(true)}
                className="text-xs flex items-center gap-1"
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
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="decision-status">حالة القرار</Label>
              <Select 
                value={newStatus} 
                onValueChange={setNewStatus}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر حالة القرار" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approved">موافقة</SelectItem>
                  <SelectItem value="rejected">رفض</SelectItem>
                  <SelectItem value="needs_modification">تحتاج تعديل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">سبب القرار / ملاحظات</Label>
              <Textarea 
                id="reason" 
                placeholder="أدخل سبب القرار أو أي ملاحظات"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            {newStatus === 'approved' && (
              <>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>المكلفون بالتنفيذ</Label>
                    
                    {assignees.length > 0 && (
                      <div className="border rounded-md overflow-hidden mb-2">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              <th className="py-2 px-4 text-center">الاسم</th>
                              <th className="py-2 px-4 text-center">المهمة</th>
                              <th className="py-2 px-4 text-center w-16">حذف</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assignees.map((item) => (
                              <tr key={item.id} className="border-t">
                                <td className="py-2 px-4 text-center">{item.name}</td>
                                <td className="py-2 px-4 text-center">{item.responsibility}</td>
                                <td className="py-2 px-4 text-center">
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => handleRemoveAssignee(item.id)}
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                                  >
                                    <Trash size={16} />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                      <div className="sm:col-span-5">
                        <Input 
                          placeholder="اسم المكلف"
                          value={newAssigneeName}
                          onChange={(e) => setNewAssigneeName(e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-5">
                        <Input 
                          placeholder="المهمة أو المسؤولية"
                          value={newAssigneeResponsibility}
                          onChange={(e) => setNewAssigneeResponsibility(e.target.value)}
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <Button 
                          type="button" 
                          onClick={handleAddAssignee}
                          className="w-full"
                          variant="outline"
                        >
                          <Plus size={16} className="ml-1" />
                          إضافة
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="timeline">الإطار الزمني المقترح</Label>
                    <Input 
                      id="timeline" 
                      placeholder="مثال: 3 أشهر، أسبوعين، ..."
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="budget">الميزانية المقترحة</Label>
                    <Input 
                      id="budget" 
                      placeholder="الميزانية المقترحة للتنفيذ (إن وجدت)"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}
            
            <div className="flex justify-between">
              {isEditing && (
                <Button 
                  variant="outline" 
                  onClick={() => setIsEditing(false)}
                >
                  إلغاء
                </Button>
              )}
              <Button 
                className={isEditing ? "ml-3" : "w-full"} 
                onClick={handleSubmitDecision} 
                disabled={isSubmitting || !reason}
              >
                {isSubmitting ? "جاري الحفظ..." : hasDecision ? "تحديث القرار" : "حفظ القرار"}
              </Button>
            </div>
          </div>
        ) : hasContent ? (
          <div className="space-y-4">
            <div className="rounded-md p-3 border bg-muted/10">
              <div className="flex items-center mb-3">
                <span className="font-semibold ml-2">حالة القرار:</span>
                <span className={`px-2 py-0.5 rounded-full text-sm ${getStatusClass(localDecision?.status || newStatus)}`}>
                  {getStatusDisplay(localDecision?.status || newStatus)}
                </span>
                <span className="mr-3 text-gray-600 text-sm">
                  تم اتخاذ القرار في {localDecision?.created_at ? formatDate(localDecision.created_at) : 'تاريخ غير معروف'}
                </span>
              </div>
              
              <Separator className="my-3" />
              
              <div className="space-y-3 text-right">
                <div>
                  <h4 className="font-semibold mb-1">السبب / الملاحظات:</h4>
                  <p className="text-gray-700 whitespace-pre-line">{localDecision?.reason || reason}</p>
                </div>
                
                {(localDecision?.status === 'approved' || newStatus === 'approved') && (
                  <>
                    {assignees.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-right">المكلفون بالتنفيذ:</h4>
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-muted">
                              <tr>
                                <th className="py-2 px-4 text-center">الاسم</th>
                                <th className="py-2 px-4 text-center">المهمة</th>
                              </tr>
                            </thead>
                            <tbody>
                              {assignees.map((item) => (
                                <tr key={item.id} className="border-t">
                                  <td className="py-2 px-4 text-center">{item.name}</td>
                                  <td className="py-2 px-4 text-center">{item.responsibility}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {(timeline || localDecision?.timeline) && (
                      <div className="text-right">
                        <h4 className="font-semibold mb-1">الإطار الزمني المقترح:</h4>
                        <p className="text-gray-700">{localDecision?.timeline || timeline}</p>
                      </div>
                    )}
                    
                    {(budget || localDecision?.budget) && (
                      <div className="text-right">
                        <h4 className="font-semibold mb-1">الميزانية المقترحة:</h4>
                        <p className="text-gray-700">{localDecision?.budget || budget}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ) : isAdmin ? (
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

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا القرار؟</AlertDialogTitle>
            <AlertDialogDescription>
              سيتم حذف القرار بشكل نهائي وستعود حالة الفكرة إلى "قيد المراجعة".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex flex-row-reverse justify-start gap-2 sm:justify-start">
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteDecision}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? "جاري الحذف..." : "حذف"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};
