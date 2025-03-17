
import React from "react";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MessageSquare,
  InfoIcon 
} from "lucide-react";
import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Approval {
  id: string;
  status: string;
  comments?: string;
  approved_at: string;
  created_at: string;
  approver: {
    id: string;
    display_name: string;
    email: string;
  };
  step?: {
    id: string;
    step_name: string;
    step_type?: string;
  };
}

interface ApprovalHistoryListProps {
  approvals: Approval[];
}

export const ApprovalHistoryList = ({ approvals }: ApprovalHistoryListProps) => {
  if (!approvals || approvals.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        لا توجد سجلات موافقات لهذا الطلب
      </div>
    );
  }

  // Sort approvals by created_at
  const sortedApprovals = [...approvals].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  return (
    <div className="space-y-3">
      {sortedApprovals.map((approval) => (
        <Card key={approval.id} className="border-r-4 overflow-hidden" 
          style={{ 
            borderRightColor: approval.status === 'approved' 
              ? '#10b981' 
              : approval.status === 'rejected' 
                ? '#ef4444' 
                : '#6b7280'
          }}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4 space-x-reverse">
                <div className="mt-0.5">
                  {approval.status === 'approved' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : approval.status === 'rejected' ? (
                    <XCircle className="h-5 w-5 text-red-500" />
                  ) : approval.status === 'pending' ? (
                    <Clock className="h-5 w-5 text-gray-500" />
                  ) : approval.step?.step_type === 'opinion' ? (
                    <InfoIcon className="h-5 w-5 text-blue-500" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-gray-500" />
                  )}
                </div>
                <div>
                  <p className="font-medium">
                    <span>
                      {approval.approver?.display_name || approval.approver?.email || "مستخدم غير معروف"}
                    </span>
                    <span className="mx-1">
                      {approval.status === 'approved' 
                        ? 'وافق على' 
                        : approval.status === 'rejected' 
                          ? 'رفض' 
                          : approval.step?.step_type === 'opinion'
                            ? 'أبدى رأيه على'
                            : 'فحص'}
                    </span>
                    <span>
                      {approval.step?.step_name || "الطلب"}
                    </span>
                  </p>
                  
                  {approval.comments && (
                    <div className="mt-2 p-2 bg-muted/50 rounded-md">
                      <p className="text-sm whitespace-pre-wrap">{approval.comments}</p>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground mt-2">
                    {approval.approved_at && format(new Date(approval.approved_at), 'PPpp', { locale: ar })}
                  </p>
                </div>
              </div>
              
              {approval.step?.step_type === 'opinion' && (
                <div className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                  رأي
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
