import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  Users, 
  Building2, 
  Loader2,
  MessageCircle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface WorkflowStep {
  id: string;
  step_name: string;
  step_type: string;
  approver_type: string;
  approver_id: string;
  instructions?: string;
  is_required: boolean;
  step_order: number;
  status?: string;
  approver_name?: string;
  approved_at?: string;
  approver_comments?: string;
}

interface WorkflowStatusViewProps {
  correspondenceId: string;
  onApprove?: (stepId: string) => void;
  onReject?: (stepId: string) => void;
}

export const WorkflowStatusView: React.FC<WorkflowStatusViewProps> = ({
  correspondenceId,
  onApprove,
  onReject
}) => {
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
  const [workflowName, setWorkflowName] = useState("");
  const [currentStepId, setCurrentStepId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetchWorkflowStatus();
    fetchCurrentUser();
  }, [correspondenceId]);

  const fetchCurrentUser = async () => {
    const { data } = await supabase.auth.getUser();
    if (data && data.user) {
      setCurrentUser(data.user);
    }
  };

  const fetchWorkflowStatus = async () => {
    setLoading(true);
    setError(null);

    try {
      // جلب المعاملة والمسار المرتبط بها
      const { data: correspondenceData, error: corrError } = await supabase
        .from('correspondence')
        .select('workflow_id, current_step_id')
        .eq('id', correspondenceId)
        .single();

      if (corrError) throw corrError;

      if (!correspondenceData?.workflow_id) {
        setError("لا يوجد مسار سير عمل مرتبط بهذه المعاملة");
        setLoading(false);
        return;
      }

      // جلب تفاصيل المسار
      const { data: workflowData, error: workflowError } = await supabase
        .from('workflow_definitions')
        .select('id, name')
        .eq('id', correspondenceData.workflow_id)
        .single();

      if (workflowError) throw workflowError;
      
      setWorkflowName(workflowData.name);
      setCurrentStepId(correspondenceData.current_step_id);

      // جلب خطوات المسار
      const { data: stepsData, error: stepsError } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_id', correspondenceData.workflow_id)
        .order('step_order', { ascending: true });

      if (stepsError) throw stepsError;

      // جلب حالة الموافقات
      const { data: approvalsData, error: approvalsError } = await supabase
        .from('workflow_approvals')
        .select('step_id, status, approved_at, approver_id, comments')
        .eq('correspondence_id', correspondenceId);

      if (approvalsError) throw approvalsError;

      // جلب معلومات المعتمدين
      const userIds = stepsData
        .filter(step => step.approver_type === 'user')
        .map(step => step.approver_id);

      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, display_name')
        .in('id', userIds);

      const { data: rolesData } = await supabase
        .from('roles')
        .select('id, name');

      const { data: departmentsData } = await supabase
        .from('departments')
        .select('id, name');

      // دمج البيانات
      const enhancedSteps = stepsData.map(step => {
        // البحث عن حالة الموافقة
        const approval = approvalsData?.find(a => a.step_id === step.id);

        // تحديد اسم المعتمد حسب النوع
        let approverName = 'غير محدد';
        if (step.approver_type === 'user') {
          approverName = usersData?.find(u => u.id === step.approver_id)?.display_name || 'غير محدد';
        } else if (step.approver_type === 'role') {
          approverName = rolesData?.find(r => r.id === step.approver_id)?.name || 'غير محدد';
        } else if (step.approver_type === 'department') {
          approverName = departmentsData?.find(d => d.id === step.approver_id)?.name || 'غير محدد';
        }

        return {
          ...step,
          status: approval?.status || 'pending',
          approved_at: approval?.approved_at,
          approver_name: approverName,
          approver_comments: approval?.comments
        };
      });

      setWorkflowSteps(enhancedSteps);
    } catch (error) {
      console.error("Error fetching workflow status:", error);
      setError("حدث خطأ أثناء جلب حالة سير العمل");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            تمت الموافقة
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <AlertCircle className="h-3 w-3 mr-1" />
            مرفوض
          </Badge>
        );
      case 'pending':
      default:
        return (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
            <Clock className="h-3 w-3 mr-1" />
            في انتظار الموافقة
          </Badge>
        );
    }
  };

  const getApproverIcon = (approverType: string) => {
    switch (approverType) {
      case 'user':
        return <User className="h-4 w-4 text-primary" />;
      case 'role':
        return <Users className="h-4 w-4 text-primary" />;
      case 'department':
        return <Building2 className="h-4 w-4 text-primary" />;
      default:
        return null;
    }
  };

  const isCurrentUserApprover = (step: WorkflowStep) => {
    if (!currentUser) return false;
    
    // مباشرة للمستخدم
    if (step.approver_type === 'user' && step.approver_id === currentUser.id) {
      return true;
    }
    
    // عن طريق الدور
    // هنا يجب التحقق من أدوار المستخدم (ستحتاج لإضافة منطق للتحقق من أدوار المستخدم)
    
    return false;
  };

  const canApprove = (step: WorkflowStep) => {
    return (
      step.id === currentStepId && 
      step.status === 'pending' && 
      isCurrentUserApprover(step)
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="mr-2">جاري تحميل حالة سير العمل...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{workflowName || "سير العمل"}</CardTitle>
        <CardDescription>
          حالة سير العمل الحالية للمعاملة
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {workflowSteps.map((step, index) => (
            <div key={step.id} className="relative">
              {/* خط عمودي يربط بين الخطوات */}
              {index < workflowSteps.length - 1 && (
                <div 
                  className={`absolute top-8 bottom-0 right-4 w-0.5 ${
                    step.status === 'approved' ? 'bg-green-300' : 'bg-gray-200'
                  }`} 
                />
              )}
              
              <div className="flex">
                {/* دائرة الحالة */}
                <div className="relative flex-none w-8">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'approved' 
                        ? 'bg-green-100 text-green-700 border-2 border-green-400' 
                        : step.status === 'rejected'
                          ? 'bg-red-100 text-red-700 border-2 border-red-400'
                          : step.id === currentStepId
                            ? 'bg-blue-100 text-blue-700 border-2 border-blue-400'
                            : 'bg-gray-100 text-gray-500 border-2 border-gray-300'
                    }`}
                  >
                    {step.step_order}
                  </div>
                </div>
                
                <div className="flex-1 mr-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-base">{step.step_name}</h4>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        {getApproverIcon(step.approver_type)}
                        <span className="mr-1">{step.approver_name}</span>
                      </div>
                    </div>
                    <div>
                      {getStatusBadge(step.status)}
                    </div>
                  </div>
                  
                  {step.approved_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.status === 'approved' ? 'تمت الموافقة في:' : 'تم الرفض في:'} {new Date(step.approved_at).toLocaleString('ar-SA')}
                    </p>
                  )}
                  
                  {step.approver_comments && (
                    <div className="mt-2 p-2 bg-muted rounded text-sm">
                      <div className="flex items-center text-muted-foreground mb-1">
                        <MessageCircle className="h-3 w-3 ml-1" />
                        <span>تعليق:</span>
                      </div>
                      {step.approver_comments}
                    </div>
                  )}
                  
                  {canApprove(step) && (
                    <div className="mt-3 flex gap-2">
                      <Button 
                        variant="default" 
                        size="sm" 
                        onClick={() => onApprove && onApprove(step.id)}
                      >
                        <CheckCircle className="h-4 w-4 ml-1" />
                        موافقة
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => onReject && onReject(step.id)}
                      >
                        <AlertCircle className="h-4 w-4 ml-1" />
                        رفض
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              
              {index < workflowSteps.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
          
          {workflowSteps.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              لا توجد خطوات في سير العمل
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

