
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { InfoIcon, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RequestApproval {
  id: string;
  step?: { 
    step_name?: string;
    approver_type?: string; 
    id?: string;
  };
  approver?: { 
    display_name?: string; 
    email?: string;
    id?: string;
  };
  status: string;
  comments?: string;
  approved_at?: string;
  assignment_type?: string;
}

interface RequestApprovalsTabProps {
  approvals: RequestApproval[];
}

export const RequestApprovalsTab = ({ approvals }: RequestApprovalsTabProps) => {
  // تسجيل عدد سجلات الموافقات وبياناتها للتتبع والتصحيح
  console.log("=== بيانات الموافقات في الطلب ===");
  console.log("عدد سجلات الموافقات:", approvals?.length || 0);
  
  if (approvals && approvals.length > 0) {
    console.log("بيانات أول سجل موافقة:", JSON.stringify(approvals[0], null, 2));
    
    // تحقق من وجود موافقات بدون معلومات الخطوة
    const approvalsWithoutStep = approvals.filter(a => !a.step || !a.step.id);
    if (approvalsWithoutStep.length > 0) {
      console.warn("⚠️ يوجد", approvalsWithoutStep.length, "موافقات بدون معلومات الخطوة:");
      console.warn(approvalsWithoutStep);
    }
    
    // تحقق من وجود موافقات بدون معلومات المعتمد
    const approvalsWithoutApprover = approvals.filter(
      a => (!a.approver || !a.approver.id) && a.step?.approver_type === 'user'
    );
    if (approvalsWithoutApprover.length > 0) {
      console.warn("⚠️ يوجد", approvalsWithoutApprover.length, "موافقات بنوع معتمد 'مستخدم' بدون معلومات المعتمد:");
      console.warn(approvalsWithoutApprover);
    }
    
    // تحليل أنواع الموافقات (مستخدم/دور)
    const userApprovals = approvals.filter(a => a.step?.approver_type === 'user');
    const roleApprovals = approvals.filter(a => a.step?.approver_type === 'role');
    console.log("موافقات المستخدمين:", userApprovals.length);
    console.log("موافقات الأدوار:", roleApprovals.length);
  }
  
  // تحقق من وجود البيانات
  if (!approvals || approvals.length === 0) {
    return (
      <div className="space-y-4">
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            لم يتم العثور على أي موافقات مرتبطة بهذا الطلب. قد يشير هذا إلى مشكلة في تكوين سير العمل.
          </AlertDescription>
        </Alert>
        <div className="text-center py-8">
          <p className="text-muted-foreground">لا توجد موافقات حتى الآن</p>
        </div>
      </div>
    );
  }

  // ترتيب الموافقات حسب ترتيب الخطوات إذا كان متوفرًا
  const sortedApprovals = [...approvals].sort((a, b) => {
    // محاولة الترتيب حسب خطوة سير العمل إذا كانت البيانات متوفرة
    const stepOrderA = a.step?.step_name ? parseInt(a.step.step_name.split(' ')[0] || '0') : 0;
    const stepOrderB = b.step?.step_name ? parseInt(b.step.step_name.split(' ')[0] || '0') : 0;
    
    if (stepOrderA !== stepOrderB) return stepOrderA - stepOrderB;
    
    // في حالة تعذر الترتيب بالخطوة، نستخدم تاريخ الموافقة إن وجد
    if (a.approved_at && b.approved_at) {
      return new Date(a.approved_at).getTime() - new Date(b.approved_at).getTime();
    }
    
    // إذا كان أحدهما فقط لديه تاريخ الموافقة
    if (a.approved_at) return -1;
    if (b.approved_at) return 1;
    
    return 0;
  });

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الخطوة</TableHead>
          <TableHead>نوع المعتمد</TableHead>
          <TableHead>المسؤول</TableHead>
          <TableHead>نوع التعيين</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead>التعليقات</TableHead>
          <TableHead>تاريخ الإجراء</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sortedApprovals.map((approval) => (
          <TableRow key={approval.id}>
            <TableCell>{approval.step?.step_name || "خطوة غير معروفة"}</TableCell>
            <TableCell>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center">
                    {approval.step?.approver_type === 'user' ? "مستخدم" : 
                     approval.step?.approver_type === 'role' ? "دور وظيفي" : 
                     "غير معروف"}
                    <InfoIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{approval.step?.approver_type === 'user' ? 
                         "موافقة مستخدم محدد" : 
                         "موافقة مستندة إلى الدور الوظيفي"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
            <TableCell>
              {approval.approver?.display_name || approval.approver?.email || 
               (approval.step?.approver_type === 'role' ? "أي مستخدم بالدور المحدد" : "غير معروف")}
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {approval.assignment_type === 'direct' ? "مباشر" : 
                 approval.assignment_type === 'role' ? "بالدور" : 
                 "غير محدد"}
              </Badge>
            </TableCell>
            <TableCell>
              {approval.status === "approved" ? 
                <Badge variant="success">تمت الموافقة</Badge> : 
                approval.status === "rejected" ?
                <Badge variant="destructive">مرفوض</Badge> :
                <Badge variant="outline">معلق</Badge>}
            </TableCell>
            <TableCell>{approval.comments || "-"}</TableCell>
            <TableCell>
              {approval.approved_at ? format(new Date(approval.approved_at), "yyyy-MM-dd") : "-"}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
