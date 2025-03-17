
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
import { InfoIcon } from "lucide-react";

interface RequestApproval {
  id: string;
  step?: { 
    step_name?: string;
    step_type?: string;
  };
  approver?: { 
    display_name?: string; 
    email?: string;
    id?: string;
  };
  status: string;
  comments?: string;
  approved_at?: string;
}

interface RequestApprovalsTabProps {
  approvals: RequestApproval[];
}

export const RequestApprovalsTab = ({ approvals }: RequestApprovalsTabProps) => {
  if (!approvals || approvals.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">لا توجد موافقات حتى الآن</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>الخطوة</TableHead>
          <TableHead>نوع الخطوة</TableHead>
          <TableHead>المسؤول</TableHead>
          <TableHead>الحالة</TableHead>
          <TableHead>التعليقات</TableHead>
          <TableHead>تاريخ الإجراء</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {approvals.map((approval) => (
          <TableRow key={approval.id}>
            <TableCell>{approval.step?.step_name || "خطوة غير معروفة"}</TableCell>
            <TableCell>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="flex items-center">
                    {approval.step?.step_type === 'opinion' ? 
                      <Badge variant="secondary">رأي</Badge> : 
                      <Badge>قرار</Badge>}
                    <InfoIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{approval.step?.step_type === 'opinion' ? 
                         "خطوة لإبداء الرأي فقط، والانتقال للخطوة التالية تلقائي بعد إبداء الرأي" : 
                         "خطوة قرار تؤثر على سير الطلب"}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </TableCell>
            <TableCell>
              {approval.approver?.display_name || approval.approver?.email || "غير معروف"}
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
