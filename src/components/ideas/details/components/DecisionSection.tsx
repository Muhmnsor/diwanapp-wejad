
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
  
  // إضافة قائمة المكلفين
  const [assignees, setAssignees] = useState<AssigneeItem[]>([]);
  const [newAssigneeName, setNewAssigneeName] = useState("");
  const [newAssigneeResponsibility, setNewAssigneeResponsibility] = useState("");
  
  // إضافة سجلات تشخيص محسنة
  console.log("DecisionSection - لقطة الحالة الكاملة:", { 
    ideaId, 
    status, 
    isAdmin, 
    hasExistingDecision: Boolean(decision?.id),  
    decisionFullDetails: decision,
    ideaStatus: status,
    localDecision
  });
  
  // تحديد إذا كان هناك قرار تم اتخاذه بالفعل
  const hasDecision = Boolean(localDecision?.id);
  
  // تحديث المتغير المحلي عندما تتغير البيانات الخارجية
  useEffect(() => {
    setLocalDecision(decision);
  }, [decision]);
  
  // تحميل بيانات القرار مباشرة من قاعدة البيانات إذا لم تكن متوفرة
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
            if (error.code !== 'PGRST116') { // Not found error code
              console.error("Error fetching decision:", error);
            } else {
              console.log("No decision found for idea:", ideaId);
            }
            return;
          }
          
          console.log("Directly fetched decision:", data);
          
          // تحديث القيم
          if (data) {
            setNewStatus(data.status);
            setReason(data.reason);
            setTimeline(data.timeline || "");
            setBudget(data.budget || "");
            setLocalDecision(data);
            
            // تحديث المكلفين إذا كانوا متوفرين
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
  
  const handleSubmitDecision = async () => {
    if (!reason) {
      toast.error("يجب إدخال سبب القرار");
      return;
    }
    
    setIsSubmitting(true);
    console.log("Submitting decision...");
    
    try {
      // إعداد بيانات المكلفين كسلسلة نصية JSON
      const assigneesData = assignees.length > 0 ? JSON.stringify(assignees) : null;
      console.log("Assignees data:", assigneesData);
      
      // الحصول على معرف المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      
      // إعداد بيانات القرار
      const decisionData = {
        idea_id: ideaId,
        status: newStatus,
        reason,
        assignee: assigneesData,
        timeline: timeline || null,
        budget: budget || null,
        created_by: user?.id || null
      };
      
      console.log("Decision data to save:", decisionData);
      
      let dbOperation;
      let dbError;
      let savedDecision;
      
      if (localDecision?.id) {
        // تحديث القرار الحالي
        console.log("Updating existing decision with ID:", localDecision.id);
        const { data, error } = await supabase
          .from("idea_decisions")
          .update(decisionData)
          .eq("id", localDecision.id)
          .select()
          .single();
          
        dbError = error;
        savedDecision = data;
      } else {
        // إضافة قرار جديد
        console.log("Creating new decision");
        const { data, error } = await supabase
          .from("idea_decisions")
          .insert([decisionData])
          .select()
          .single();
          
        dbError = error;
        savedDecision = data;
      }
      
      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }
      
      console.log("Decision saved successfully:", savedDecision);
      
      // تحديث حالة الفكرة
      console.log("Updating idea status:", newStatus);
      const { error: ideaError } = await supabase
        .from("ideas")
        .update({ status: newStatus })
        .eq("id", ideaId);
        
      if (ideaError) {
        console.error("Error updating idea status:", ideaError);
        throw ideaError;
      }
      
      // تحديث البيانات المحلية على الفور
      if (savedDecision) {
        setLocalDecision(savedDecision);
      }
      
      toast.success("تم حفظ القرار بنجاح");
      
      // انتهاء وضع التحرير
      setIsEditing(false);
      
      // تحديث الواجهة بعد حفظ القرار
      if (onStatusChange) {
        console.log("Calling onStatusChange callback");
        onStatusChange();
      }
      
    } catch (error) {
      console.error("Error saving decision:", error);
      toast.error("حدث خطأ أثناء حفظ القرار");
    } finally {
      setIsSubmitting(false);
    }
  };

  // عند تحميل البيانات، تحقق مما إذا كان هناك مكلفين في صيغة JSON
  useEffect(() => {
    if (localDecision?.assignee) {
      try {
        // محاولة تحليل البيانات كـ JSON
        const parsedAssignees = JSON.parse(localDecision.assignee);
        if (Array.isArray(parsedAssignees)) {
          setAssignees(parsedAssignees);
          console.log("تم تحميل قائمة المكلفين بنجاح:", parsedAssignees);
        }
      } catch (e) {
        // إذا لم تكن صيغة JSON صحيحة، قد تكون بيانات قديمة
        console.log("Cannot parse assignee data, might be old format:", localDecision.assignee);
      }
    }
  }, [localDecision]);

  // تحديث القيم عندما تتغير بيانات القرار
  useEffect(() => {
    if (localDecision) {
      setNewStatus(localDecision.status || "pending_decision");
      setReason(localDecision.reason || "");
      setTimeline(localDecision.timeline || "");
      setBudget(localDecision.budget || "");
    }
  }, [localDecision]);

  // عرض نموذج القرار فقط إذا لم يكن هناك قرار أو كان المستخدم مشرفاً ويقوم بالتحرير
  const showDecisionForm = !hasDecision || (isAdmin && isEditing);

  console.log("DecisionSection - قرار العرض:", {
    hasDecision,
    isAdmin,
    isEditing,
    showDecisionForm,
    decisionStatus: localDecision?.status || "غير محدد"
  });

  // تحديد ما إذا كان يجب عرض المحتوى بناءً على وجود بيانات
  const hasContent = hasDecision || reason;

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            {hasDecision ? "القرار المتخذ" : "اتخاذ القرار"}
          </CardTitle>
          
          {hasDecision && isAdmin && !isEditing && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsEditing(true)}
              className="text-xs flex items-center gap-1"
            >
              <Edit size={14} />
              تعديل القرار
            </Button>
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
          // عرض نموذج اتخاذ القرار
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
                    
                    {/* جدول المكلفين */}
                    {assignees.length > 0 && (
                      <div className="border rounded-md overflow-hidden mb-2">
                        <table className="w-full text-sm">
                          <thead className="bg-muted">
                            <tr>
                              <th className="py-2 px-4 text-right">الاسم</th>
                              <th className="py-2 px-4 text-right">المهمة</th>
                              <th className="py-2 px-4 text-center w-16">حذف</th>
                            </tr>
                          </thead>
                          <tbody>
                            {assignees.map((item) => (
                              <tr key={item.id} className="border-t">
                                <td className="py-2 px-4">{item.name}</td>
                                <td className="py-2 px-4">{item.responsibility}</td>
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
                    
                    {/* نموذج إضافة مكلف جديد */}
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
          // عرض تفاصيل القرار الحالي
          <div className="space-y-4">
            <div className="rounded-md p-3 border bg-muted/10">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">حالة القرار:</span>
                  <span className={`px-2 py-0.5 rounded-full text-sm ${getStatusClass(localDecision?.status || newStatus)}`}>
                    {getStatusDisplay(localDecision?.status || newStatus)}
                  </span>
                </div>
                <div className="text-gray-600 text-sm">
                  تم اتخاذ القرار في {localDecision?.created_at ? formatDate(localDecision.created_at) : 'تاريخ غير معروف'}
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-1">السبب / الملاحظات:</h4>
                  <p className="text-gray-700 whitespace-pre-line">{localDecision?.reason || reason}</p>
                </div>
                
                {(localDecision?.status === 'approved' || newStatus === 'approved') && (
                  <>
                    {assignees.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">المكلفون بالتنفيذ:</h4>
                        <div className="border rounded-md overflow-hidden">
                          <table className="w-full text-sm">
                            <thead className="bg-muted">
                              <tr>
                                <th className="py-2 px-4 text-right">الاسم</th>
                                <th className="py-2 px-4 text-right">المهمة</th>
                              </tr>
                            </thead>
                            <tbody>
                              {assignees.map((item) => (
                                <tr key={item.id} className="border-t">
                                  <td className="py-2 px-4">{item.name}</td>
                                  <td className="py-2 px-4">{item.responsibility}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                    
                    {(timeline || localDecision?.timeline) && (
                      <div>
                        <h4 className="font-semibold mb-1">الإطار الزمني المقترح:</h4>
                        <p className="text-gray-700">{localDecision?.timeline || timeline}</p>
                      </div>
                    )}
                    
                    {(budget || localDecision?.budget) && (
                      <div>
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
          // عرض رسالة للمشرفين إذا لم يكن هناك قرار بعد
          <div className="text-center py-4">
            <p className="text-muted-foreground mb-3">لم يتم اتخاذ قرار بشأن هذه الفكرة بعد.</p>
            <Button onClick={() => setIsEditing(true)}>إضافة قرار جديد</Button>
          </div>
        ) : (
          // عرض رسالة للمستخدمين العاديين
          <div className="text-center py-4">
            <p className="text-muted-foreground">لم يتم اتخاذ قرار بشأن هذه الفكرة بعد.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
