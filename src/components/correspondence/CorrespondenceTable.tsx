import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Download, Paperclip, Share, Clock, CheckCircle, AlertCircle, Send, Edit, CheckSquare, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Mail {
  id: string;
  number: string;
  subject: string;
  sender: string;
  recipient: string;
  date: string;
  status: string;
  type: string;
  hasAttachments: boolean;
}

interface CorrespondenceTableProps {
  mails: Mail[];
  onView: (mail: Mail) => void;
  onDownload: (mail: Mail) => void;
  onDistribute?: (mail: Mail) => void;
}

export const CorrespondenceTable: React.FC<CorrespondenceTableProps> = ({ 
  mails, 
  onView,
  onDownload,
  onDistribute
}) => {
  // Function to get badge variant based on status
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'قيد المعالجة':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'مكتمل':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'معلق':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'مرسل':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'قيد الإعداد':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'معتمد':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'مسودة':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">رقم المعاملة</TableHead>
            <TableHead>الموضوع</TableHead>
            <TableHead>المرسل</TableHead>
            <TableHead>المستلم</TableHead>
            <TableHead>التاريخ</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead className="text-left">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mails.map((mail) => (
            <TableRow key={mail.id}>
              <TableCell>{mail.number}</TableCell>
              <TableCell className="relative">
                <div className="flex items-center">
                  <span>{mail.subject}</span>
                  {mail.hasAttachments && (
                    <Paperclip className="h-4 w-4 mr-2 text-muted-foreground" />
                  )}
                </div>
              </TableCell>
              <TableCell>{mail.sender}</TableCell>
              <TableCell>{mail.recipient}</TableCell>
              <TableCell>{mail.date}</TableCell>
              <TableCell>
                <Badge className={`${getStatusBadge(mail.status)} border font-medium flex items-center gap-1`}>
                  {mail.status === 'قيد المعالجة' && <Clock className="h-3 w-3" />}
                  {mail.status === 'مكتمل' && <CheckCircle className="h-3 w-3" />}
                  {mail.status === 'معلق' && <AlertCircle className="h-3 w-3" />}
                  {mail.status === 'مرسل' && <Send className="h-3 w-3" />}
                  {mail.status === 'قيد الإعداد' && <Edit className="h-3 w-3" />}
                  {mail.status === 'معتمد' && <CheckSquare className="h-3 w-3" />}
                  {mail.status === 'مسودة' && <FileText className="h-3 w-3" />}
                  <span>{mail.status}</span>
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2 space-x-reverse">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onView(mail)}
                    className="text-primary hover:text-primary hover:bg-primary/10"
                    title="عرض التفاصيل"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {mail.hasAttachments && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDownload(mail)}
                      className="text-primary hover:text-primary hover:bg-primary/10"
                      title="تنزيل المرفقات"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-600 hover:bg-blue-100"
                    title="توزيع المعاملة"
                    onClick={() => onDistribute && onDistribute(mail)}
                  >
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
