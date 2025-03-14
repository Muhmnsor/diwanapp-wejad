
import { Clock, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface RequestWorkflowCardProps {
  workflow: any;
  currentStep: any;
  requestId: string;
}

export const RequestWorkflowCard = ({ workflow, currentStep, requestId }: RequestWorkflowCardProps) => {
  const [workflowSteps, setWorkflowSteps] = useState<any[]>([]);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWorkflowDetails = async () => {
      if (!workflow?.id) {
        setLoading(false);
        return;
      }

      try {
        // Fetch all steps for this workflow
        const { data: steps, error: stepsError } = await supabase
          .from('workflow_steps')
          .select('*')
          .eq('workflow_id', workflow.id)
          .order('step_order', { ascending: true });

        if (stepsError) throw stepsError;

        // Fetch approvals for this request
        const { data: approvalData, error: approvalsError } = await supabase
          .from('request_approvals')
          .select('*, approver:profiles(display_name, email)')
          .eq('request_id', requestId);

        if (approvalsError) throw approvalsError;

        setWorkflowSteps(steps || []);
        setApprovals(approvalData || []);
      } catch (error) {
        console.error("Error fetching workflow details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflowDetails();
  }, [workflow?.id, requestId]);

  // Helper to get step status based on approvals and current step
  const getStepStatus = (stepId: string) => {
    if (currentStep?.id === stepId) {
      return "current";
    }

    const stepApprovals = approvals.filter(approval => approval.step_id === stepId);
    if (stepApprovals.length > 0) {
      const approved = stepApprovals.some(approval => approval.status === "approved");
      const rejected = stepApprovals.some(approval => approval.status === "rejected");
      
      if (rejected) return "rejected";
      if (approved) return "completed";
      return "pending";
    }

    // If no approvals and not current, check if it's before or after current step
    if (currentStep && workflowSteps.length > 0) {
      const currentStepIndex = workflowSteps.findIndex(step => step.id === currentStep.id);
      const thisStepIndex = workflowSteps.findIndex(step => step.id === stepId);
      
      if (currentStepIndex === -1 || thisStepIndex === -1) return "pending";
      
      return thisStepIndex < currentStepIndex ? "completed" : "pending";
    }

    return "pending";
  };

  // Helper to get approvers display name for a step
  const getStepApprovers = (stepId: string) => {
    const stepApprovals = approvals.filter(approval => approval.step_id === stepId);
    if (stepApprovals.length === 0) return "";

    return stepApprovals.map(approval => 
      approval.approver?.display_name || approval.approver?.email || "مستخدم"
    ).join(", ");
  };

  // Get step type label
  const getStepTypeLabel = (stepType: string) => {
    switch (stepType) {
      case 'decision': return 'قرار';
      case 'approval': return 'موافقة';
      case 'review': return 'مراجعة';
      case 'signature': return 'توقيع';
      case 'opinion': return 'رأي';
      case 'notification': return 'إشعار';
      default: return stepType;
    }
  };

  // Get status icon based on step status
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'current':
        return <Clock className="h-5 w-5 text-primary animate-pulse" />;
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-300" />;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>مسار العمل</CardTitle>
        <CardDescription>
          {workflow?.name || "لا يوجد مسار عمل محدد"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {workflow && workflow.id ? (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <h4 className="font-medium mb-2">الخطوة الحالية</h4>
              {currentStep && currentStep.id ? (
                <>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span className="font-medium">{currentStep.step_name || "غير محدد"}</span>
                  </div>
                  {currentStep.instructions && (
                    <p className="text-sm text-muted-foreground mt-2 border-r-2 border-primary pr-3 py-1">
                      {currentStep.instructions}
                    </p>
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span>لا توجد خطوة حالية محددة</span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h4 className="font-medium mb-3">جميع خطوات سير العمل</h4>
              {loading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : workflowSteps.length > 0 ? (
                <div className="space-y-3">
                  {workflowSteps.map((step, index) => {
                    const status = getStepStatus(step.id);
                    
                    return (
                      <div 
                        key={step.id} 
                        className={`relative p-3 border rounded-md ${
                          status === 'current' ? 'bg-primary/5 border-primary' : 
                          status === 'completed' ? 'bg-green-50 border-green-200' : 
                          status === 'rejected' ? 'bg-red-50 border-red-200' : 
                          'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(status)}
                            <div>
                              <div className="font-medium flex items-center gap-2">
                                <span>{step.step_name}</span>
                                <Badge variant="outline" className="text-xs">
                                  {getStepTypeLabel(step.step_type)}
                                </Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {status === 'completed' && (
                                  <span className="text-green-600">تمت الموافقة بواسطة: {getStepApprovers(step.id)}</span>
                                )}
                                {status === 'rejected' && (
                                  <span className="text-red-600">تم الرفض بواسطة: {getStepApprovers(step.id)}</span>
                                )}
                                {status === 'current' && (
                                  <span className="text-primary">قيد الانتظار</span>
                                )}
                                {status === 'pending' && index > 0 && (
                                  <span className="text-gray-500">في انتظار الخطوات السابقة</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {step.step_order !== undefined && `خطوة ${step.step_order}`}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>لا توجد خطوات محددة لمسار العمل</p>
                </div>
              )}
            </div>

            <div className="mt-4">
              <Badge variant="outline" className="bg-primary/10">
                {workflow.description || "مسار عمل" }
              </Badge>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">لا يوجد مسار عمل محدد لهذا الطلب</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
