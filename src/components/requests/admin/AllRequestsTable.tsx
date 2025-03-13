
import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Eye,
  Trash2,
  Search,
  Info,
  RefreshCw,
  FileText,
  SlidersHorizontal,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { RequestStatusBadge } from "../detail/RequestStatusBadge";
import { RequestPriorityBadge } from "../detail/RequestPriorityBadge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Request } from "../hooks/useAllRequests";

interface AllRequestsTableProps {
  requests: Request[];
  isLoading: boolean;
  onViewRequest: (request: any) => void;
  onRefresh: () => void;
  filterByStatus: (status: string | null) => void;
  statusFilter: string | null;
}

export const AllRequestsTable = ({
  requests,
  isLoading,
  onViewRequest,
  onRefresh,
  filterByStatus,
  statusFilter,
}: AllRequestsTableProps) => {
  const [filterText, setFilterText] = useState("");
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const filteredRequests = requests.filter(request => {
    const searchTerm = filterText.toLowerCase();
    return (
      request.title?.toLowerCase().includes(searchTerm) ||
      request.request_type?.name?.toLowerCase().includes(searchTerm) ||
      request.status?.toLowerCase().includes(searchTerm) ||
      request.priority?.toLowerCase().includes(searchTerm) ||
      request.requester?.display_name?.toLowerCase().includes(searchTerm) ||
      request.requester?.email?.toLowerCase().includes(searchTerm)
    );
  });
  
  const handleDeleteRequest = async () => {
    if (!selectedRequest) return;
    
    setIsDeleting(true);
    try {
      // Step 1: Delete request approvals
      const { error: approvalsError } = await supabase
        .from('request_approvals')
        .delete()
        .eq('request_id', selectedRequest.id);
      
      if (approvalsError) throw approvalsError;
      
      // Step 2: Delete request attachments
      const { error: attachmentsError } = await supabase
        .from('request_attachments')
        .delete()
        .eq('request_id', selectedRequest.id);
      
      if (attachmentsError) throw attachmentsError;
      
      // Step 3: Delete the request
      const { error: requestError } = await supabase
        .from('requests')
        .delete()
        .eq('id', selectedRequest.id);
      
      if (requestError) throw requestError;
      
      toast.success("تم حذف الطلب بنجاح");
      onRefresh();
    } catch (error: any) {
      console.error("Error deleting request:", error);
      toast.error(`حدث خطأ أثناء حذف الطلب: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedRequest(null);
    }
  };
  
  const handleDeleteClick = (request: any) => {
    setSelectedRequest(request);
    setIsDeleteDialogOpen(true);
  };
  
  const handleExportCsv = () => {
    // Convert requests to CSV
    if (!filteredRequests.length) {
      toast.error("لا توجد بيانات للتصدير");
      return;
    }
    
    try {
      // Headers
      const headers = [
        "عنوان الطلب",
        "نوع الطلب",
        "مقدم الطلب",
        "البريد الإلكتروني",
        "الحالة",
        "الأولوية",
        "تاريخ الإنشاء"
      ];
      
      // Map data
      const csvRows = filteredRequests.map(request => [
        request.title,
        request.request_type?.name || "غير محدد",
        request.requester?.display_name || "غير معروف",
        request.requester?.email || "غير معروف",
        getStatusTranslation(request.status),
        getPriorityTranslation(request.priority),
        format(new Date(request.created_at), "yyyy-MM-dd")
      ]);
      
      // Create CSV content
      const csvContent = [
        headers.join(","),
        ...csvRows.map(row => row.join(","))
      ].join("\n");
      
      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `طلبات-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("تم تصدير البيانات بنجاح");
    } catch (error: any) {
      console.error("Error exporting data:", error);
      toast.error("حدث خطأ أثناء تصدير البيانات");
    }
  };
  
  // Helper functions for translation
  const getStatusTranslation = (status: string) => {
    switch (status) {
      case 'pending': return 'قيد الانتظار';
      case 'completed': return 'مكتمل';
      case 'rejected': return 'مرفوض';
      case 'in_progress': return 'قيد التنفيذ';
      default: return status;
    }
  };
  
  const getPriorityTranslation = (priority: string) => {
    switch (priority) {
      case 'low': return 'منخفضة';
      case 'medium': return 'متوسطة';
      case 'high': return 'عالية';
      case 'urgent': return 'عاجلة';
      default: return priority;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
        <Info className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">لا توجد طلبات</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          لم يتم العثور على أي طلبات في النظام
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-auto">
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث في الطلبات..."
            className="pl-4 pr-10 w-full md:w-64"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Select
            value={statusFilter || ''}
            onValueChange={(value) => filterByStatus(value || null)}
          >
            <SelectTrigger className="w-full md:w-32">
              <SelectValue placeholder="جميع الحالات" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>تصفية حسب الحالة</SelectLabel>
                <SelectItem value="">جميع الحالات</SelectItem>
                <SelectItem value="pending">قيد الانتظار</SelectItem>
                <SelectItem value="completed">مكتمل</SelectItem>
                <SelectItem value="rejected">مرفوض</SelectItem>
                <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>خيارات</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={handleExportCsv}>
                  <Download className="ml-2 h-4 w-4" />
                  <span>تصدير CSV</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onRefresh}>
                  <RefreshCw className="ml-2 h-4 w-4" />
                  <span>تحديث البيانات</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 ml-2" />
            تحديث
          </Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">عنوان الطلب</TableHead>
                <TableHead className="text-right">نوع الطلب</TableHead>
                <TableHead className="text-right">مقدم الطلب</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">الأولوية</TableHead>
                <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                <TableHead className="text-right">الخطوة الحالية</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">{request.title}</TableCell>
                  <TableCell>
                    {request.request_type?.name || "غير محدد"}
                  </TableCell>
                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="text-right">
                          {request.requester?.display_name || request.requester?.email || "غير معروف"}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{request.requester?.email || "لا يوجد بريد إلكتروني"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                  <TableCell>
                    <RequestStatusBadge status={request.status} />
                  </TableCell>
                  <TableCell>
                    <RequestPriorityBadge priority={request.priority} />
                  </TableCell>
                  <TableCell>
                    {request.created_at ? format(new Date(request.created_at), "yyyy-MM-dd") : "-"}
                  </TableCell>
                  <TableCell>
                    {request.current_step ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="text-right">
                            {request.current_step.step_name}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>نوع الخطوة: {
                              request.current_step.step_type === 'decision' ? 'قرار' :
                              request.current_step.step_type === 'opinion' ? 'رأي' :
                              request.current_step.step_type
                            }</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onViewRequest(request)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>عرض تفاصيل الطلب</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                              onClick={() => handleDeleteClick(request)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>حذف الطلب</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {filteredRequests.length > 0 && (
          <div className="py-2 px-4 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
            <span>عدد النتائج: {filteredRequests.length}</span>
            {statusFilter && <span className="mr-2">حالة التصفية: {getStatusTranslation(statusFilter)}</span>}
            {filterText && <span className="mr-2">البحث: "{filterText}"</span>}
          </div>
        )}
      </div>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>هل أنت متأكد من حذف هذا الطلب؟</AlertDialogTitle>
            <AlertDialogDescription>
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف الطلب والبيانات المرتبطة به بشكل نهائي.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>إلغاء</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRequest}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  جاري الحذف...
                </>
              ) : (
                "حذف"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
