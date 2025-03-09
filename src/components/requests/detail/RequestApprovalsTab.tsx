
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

interface RequestApproval {
  id: string;
  step?: { step_name?: string };
  approver?: { display_name?: string; email?: string };
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
            <TableCell>{approval.approver?.display_name || approval.approver?.email || "غير معروف"}</TableCell>
            <TableCell>
              {approval.status === "approved" ? 
                <Badge variant="success">تمت الموافقة</Badge> : 
                <Badge variant="destructive">مرفوض</Badge>}
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
