
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Eye, RefreshCw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestStatusBadge } from "../detail/RequestStatusBadge";
import { RequestPriorityBadge } from "../detail/RequestPriorityBadge";
import { Request } from "../hooks/useAllRequests";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteRequestDialog } from "../dialogs/DeleteRequestDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

interface EnhancedRequestsTableProps {
  requests: Request[];
  isLoading: boolean;
  onViewRequest: (request: Request) => void;
  onRefresh: () => void;
  filterByStatus: (status: string | null) => void;
  statusFilter: string | null;
}

export const EnhancedRequestsTable = ({
  requests,
  isLoading,
  onViewRequest,
  onRefresh,
  filterByStatus,
  statusFilter,
}: EnhancedRequestsTableProps) => {
  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // State for delete dialog
  const [requestToDelete, setRequestToDelete] = useState<Request | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // State to store deletion permissions for each request
  const [deletableRequests, setDeletableRequests] = useState<Record<string, boolean>>({});
  
  // Calculate the requests to display based on pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRequests = requests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(requests.length / itemsPerPage);
  
  // Check which requests the user can delete
  React.useEffect(() => {
    const checkDeletionPermissions = async () => {
      const deletableMap: Record<string, boolean> = {};
      const requestIds = requests.map(r => r.id);
      
      // Check in batches of 10 to avoid too many concurrent requests
      for (let i = 0; i < requestIds.length; i += 10) {
        const batch = requestIds.slice(i, i + 10);
        
        await Promise.all(
          batch.map(async (id) => {
            try {
              const { data, error } = await supabase.rpc('can_delete_request', {
                p_request_id: id
              });
              
              if (!error) {
                deletableMap[id] = data;
              }
            } catch (error) {
              console.error(`Error checking delete permission for request ${id}:`, error);
            }
          })
        );
      }
      
      setDeletableRequests(deletableMap);
    };
    
    if (requests.length > 0) {
      checkDeletionPermissions();
    }
  }, [requests]);
  
  // Status filter options
  const statusOptions = [
    { value: null, label: "جميع الحالات" },
    { value: "pending", label: "قيد الانتظار" },
    { value: "in_progress", label: "قيد التنفيذ" },
    { value: "completed", label: "مكتمل" },
    { value: "rejected", label: "مرفوض" },
  ];

  const handleFilterChange = (value: string) => {
    filterByStatus(value === "all" ? null : value);
    setCurrentPage(1); // Reset to first page when filter changes
  };

  // Handle pagination
  const goToPage = (page: number) => {
    setCurrentPage(page);
  };
  
  // Handle delete button click
  const handleDeleteClick = (request: Request) => {
    setRequestToDelete(request);
    setShowDeleteDialog(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">تصفية حسب الحالة:</span>
          <Select
            value={statusFilter || "all"}
            onValueChange={handleFilterChange}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="اختر الحالة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الحالات</SelectItem>
              <SelectItem value="pending">قيد الانتظار</SelectItem>
              <SelectItem value="in_progress">قيد التنفيذ</SelectItem>
              <SelectItem value="completed">مكتمل</SelectItem>
              <SelectItem value="rejected">مرفوض</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm" onClick={onRefresh}>
          <RefreshCw className="h-4 w-4 ml-2" />
          تحديث
        </Button>
      </div>

      {currentRequests.length === 0 ? (
        <div className="bg-muted/20 rounded-lg p-8 text-center">
          <p className="text-lg font-medium">لا توجد طلبات</p>
          <p className="text-sm text-muted-foreground mt-2">
            لم يتم العثور على أي طلبات تطابق عوامل التصفية الحالية
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">عنوان الطلب</TableHead>
                  <TableHead className="text-right">نوع الطلب</TableHead>
                  <TableHead className="text-right">المستخدم</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                  <TableHead className="text-right">الأولوية</TableHead>
                  <TableHead className="text-right">تاريخ الإنشاء</TableHead>
                  <TableHead className="text-right">الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.title}</TableCell>
                    <TableCell>
                      {request.request_type?.name || "غير محدد"}
                    </TableCell>
                    <TableCell>
                      {request.requester?.display_name || request.requester?.email || "غير معروف"}
                    </TableCell>
                    <TableCell>
                      <RequestStatusBadge status={request.status} />
                    </TableCell>
                    <TableCell>
                      <RequestPriorityBadge priority={request.priority} />
                    </TableCell>
                    <TableCell>
                      {request.created_at
                        ? format(new Date(request.created_at), "yyyy-MM-dd")
                        : "غير محدد"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewRequest(request)}
                        >
                          <Eye className="h-4 w-4 ml-1" />
                          عرض
                        </Button>
                        
                        {deletableRequests[request.id] && (
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
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <div className="flex space-x-1 space-x-reverse">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  السابق
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </Button>
                  )
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      <div className="mt-2 text-sm text-muted-foreground">
        عرض {currentRequests.length} من إجمالي {requests.length} طلب
      </div>
      
      {/* Delete Dialog */}
      <DeleteRequestDialog
        isOpen={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        requestId={requestToDelete?.id || null}
        requestTitle={requestToDelete?.title}
      />
    </div>
  );
};
