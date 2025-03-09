
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Badge 
} from "@/components/ui/badge";
import { 
  Button 
} from "@/components/ui/button";
import { 
  Eye, 
  MoreHorizontal, 
  Check, 
  X 
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

interface RequestTableProps {
  requests: any[];
  isLoading: boolean;
  type: 'incoming' | 'outgoing';
  onViewRequest: (request: any) => void;
  onApproveRequest?: (request: any) => void;
  onRejectRequest?: (request: any) => void;
}

export const RequestsTable = ({ 
  requests, 
  isLoading, 
  type,
  onViewRequest,
  onApproveRequest,
  onRejectRequest
}: RequestTableProps) => {
  
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">مسودة</Badge>;
      case 'pending':
        return <Badge variant="secondary">قيد الانتظار</Badge>;
      case 'in_progress':
        return <Badge variant="default">قيد المعالجة</Badge>;
      case 'approved':
        return <Badge variant="success" className="bg-green-500 hover:bg-green-600">تمت الموافقة</Badge>;
      case 'rejected':
        return <Badge variant="destructive">مرفوض</Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-200">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const renderPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline">منخفضة</Badge>;
      case 'medium':
        return <Badge variant="secondary">متوسطة</Badge>;
      case 'high':
        return <Badge variant="default">عالية</Badge>;
      case 'urgent':
        return <Badge variant="destructive">عاجلة</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  if (isLoading) {
    return <div>جاري التحميل...</div>;
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">لا توجد طلبات</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">رقم الطلب</TableHead>
            <TableHead>العنوان</TableHead>
            <TableHead>نوع الطلب</TableHead>
            <TableHead>الحالة</TableHead>
            <TableHead>الأولوية</TableHead>
            <TableHead>تاريخ الإنشاء</TableHead>
            <TableHead className="text-left">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">
                {request.id.substring(0, 8)}
              </TableCell>
              <TableCell>{request.title}</TableCell>
              <TableCell>{request.request_type?.name || "غير معروف"}</TableCell>
              <TableCell>{renderStatusBadge(request.status)}</TableCell>
              <TableCell>{renderPriorityBadge(request.priority)}</TableCell>
              <TableCell>
                {format(new Date(request.created_at), "yyyy-MM-dd")}
              </TableCell>
              <TableCell>
                {type === 'incoming' ? (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => onViewRequest(request)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      عرض
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-700"
                      onClick={() => onApproveRequest && onApproveRequest(request)}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      موافقة
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700"
                      onClick={() => onRejectRequest && onRejectRequest(request)}
                    >
                      <X className="h-4 w-4 mr-2" />
                      رفض
                    </Button>
                  </div>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewRequest(request)}>
                        <Eye className="h-4 w-4 mr-2" />
                        عرض التفاصيل
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
