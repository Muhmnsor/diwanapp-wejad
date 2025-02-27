
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
  
  // إضافة قائمة المكلفين
  const [assignees, setAssignees] = useState<AssigneeItem[]>([]);
  const [newAssigneeName, setNewAssigneeName] = useState("");
  const [newAssigneeResponsibility, setNewAssigneeResponsibility] = useState("");
  
  // إضافة سجلات للتشخيص
  console.log("DecisionSection props:", { ideaId, status, isAdmin, decision });
  
  // تحديد إذا كان هناك قرار تم اتخاذه بالفعل
  const hasDecision = Boolean(decision?.id);
  
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
      
      // إعداد بيانات المكلفين كسلسلة نصية JSON
      const assigneesData = assignees.length > 0 ? JSON.stringify(assignees) : null;
      console.log("Assignees data:", assigneesData);
      
      // الحصول على معرف المستخدم الحالي
      const { data: { user } } = await supabase.auth.getUser();
      
      // إضافة قرار جديد أو تحديث القرار الحالي
      const decisionData = {
        idea_id: ideaId,
        status: newStatus,
        reason,
        assignee: assigneesData, // استخدام المكلفين الجدد فقط
        timeline: timeline || null,
        budget: budget || null,
        created_by: user?.id || null
      };
      
      console.log("Decision data to save:", decisionData);
      
      let dbError;
      
      if (decision?.id) {
        // تحديث القرار الحالي
        console.log("Updating existing decision with ID:", decision.id);
        const { error } = await supabase
          .from("idea_decisions")
          .update(decisionData)
          .eq("id", decision.id);
          
        dbError = error;
      } else {
        // إضافة قرار جديد
        console.log("Creating new decision");
        const { data, error } = await supabase
          .from("idea_decisions")
          .insert([decisionData])
          .select();
          
        console.log("Insert result:", { data, error });
        dbError = error;
      }
      
      if (dbError) {
        console.error("Database error:", dbError);
        throw dbError;
      }
      
      console.log("Decision saved successfully");
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
    if (decision?.assignee) {
      try {
        // محاولة تحليل البيانات كـ JSON
        const parsedAssignees = JSON.parse(decision.assignee);
        if (Array.isArray(parsedAssignees)) {
          setAssignees(parsedAssignees);
        }
      } catch (e) {
        // إذا لم تكن صيغة JSON صحيحة، قد تكون بيانات قديمة
        console.log("Cannot parse assignee data, might be old format");
      }
    }
  }, [decision]);

  // عرض نموذج القرار فقط إذا لم يكن هناك قرار أو كان المستخدم مشرفاً ويقوم بالتحرير
  const showDecisionForm = !hasDecision || (isAdmin && isEditing);

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
        ) : (
          // عرض تفاصيل القرار الحالي
          <div className="space-y-4">
            <div className="rounded-md p-3 border">
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold">حالة القرار:</span>
                  <span className={`px-2 py-0.5 rounded-full text-sm ${getStatusClass(decision?.status || 'pending_decision')}`}>
                    {getStatusDisplay(decision?.status || 'pending_decision')}
                  </span>
                </div>
                <div className="text-gray-600 text-sm">
                  تم اتخاذ القرار في {decision?.created_at ? formatDate(decision.created_at) : 'تاريخ غير معروف'}
                </div>
              </div>
              
              <Separator className="my-3" />
              
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-1">السبب / الملاحظات:</h4>
                  <p className="text-gray-700 whitespace-pre-line">{decision?.reason}</p>
                </div>
                
                {decision?.status === 'approved' && (
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
                    
                    {timeline && (
                      <div>
                        <h4 className="font-semibold mb-1">الإطار الزمني المقترح:</h4>
                        <p className="text-gray-700">{timeline}</p>
                      </div>
                    )}
                    
                    {budget && (
                      <div>
                        <h4 className="font-semibold mb-1">الميزانية المقترحة:</h4>
                        <p className="text-gray-700">{budget}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
