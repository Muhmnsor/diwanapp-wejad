
import { RequestDetails } from "../types/request.types";
import { useAuthStore } from "@/store/refactored-auth";

/**
 * Check if the current user is an approver for the given request
 */
export const isCurrentApprover = (requestDetails: RequestDetails | null, userId: string | undefined, isAdmin: boolean): boolean => {
  if (!requestDetails || !userId) {
    console.log("لا تتوفر بيانات كافية للتحقق من صلاحية المعتمد");
    return false;
  }
  
  console.log("التحقق من صلاحية الموافقة للمستخدم:", userId);
  
  // Admin users always have approval rights
  if (isAdmin) {
    console.log("المستخدم مدير، لديه صلاحية الاعتماد");
    return true;
  }

  // If the request has no current step, it cannot be approved
  if (!requestDetails.current_step || !requestDetails.current_step.id) {
    console.log("لا توجد خطوة حالية للطلب");
    return false;
  }
  
  // Direct approach: check if user is the requester (can't approve their own request)
  if (requestDetails.request?.requester_id === userId) {
    console.log("المستخدم هو مقدم الطلب، لا يمكنه الموافقة عليه");
    return false;
  }
  
  // Check if user has a direct approval record for the current step
  const hasDirectApproval = requestDetails.approvals?.some(
    (approval) => 
      approval.approver?.id === userId && 
      approval.status === "pending" &&
      approval.step?.id === requestDetails.current_step?.id
  );
  
  if (hasDirectApproval) {
    console.log("المستخدم له سجل موافقة مباشر للخطوة الحالية");
    return true;
  }
  
  // Check if user has a role-based approval record
  const userRole = useAuthStore.getState().user?.role;
  const hasRoleApproval = userRole && requestDetails.approvals?.some(
    (approval) => 
      approval.assignment_type === 'role' &&
      approval.status === "pending" &&
      approval.step?.id === requestDetails.current_step?.id
  );
  
  if (hasRoleApproval) {
    console.log("المستخدم له صلاحية موافقة معتمدة على الدور الوظيفي");
    return true;
  }
  
  console.log("المستخدم ليس له صلاحية الموافقة على الطلب");
  return false;
};
