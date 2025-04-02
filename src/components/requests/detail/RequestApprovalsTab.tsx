
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface Approval {
  id: string;
  approverName: string;
  approverAvatar: string;
  approvalDate: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
}

interface RequestApprovalsTabProps {
  approvals: Approval[];
}

export const RequestApprovalsTab: React.FC<RequestApprovalsTabProps> = ({ approvals }) => {
  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>الموظف</TableHead>
            <TableHead>تاريخ الموافقة</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>ملاحظات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {approvals.map((approval) => (
            <TableRow key={approval.id}>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Avatar>
                    <AvatarImage src={approval.approverAvatar} alt={approval.approverName} />
                    <AvatarFallback>{approval.approverName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{approval.approverName}</span>
                </div>
              </TableCell>
              <TableCell>{approval.approvalDate}</TableCell>
              <TableCell>
                {approval.status === 'approved' && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                    تمت الموافقة
                  </Badge>
                )}
                {approval.status === 'rejected' && (
                  <Badge variant="destructive">
                    مرفوض
                  </Badge>
                )}
                {approval.status === 'pending' && (
                  <Badge variant="secondary">
                    قيد الانتظار
                  </Badge>
                )}
              </TableCell>
              <TableCell>{approval.notes || 'لا يوجد'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
