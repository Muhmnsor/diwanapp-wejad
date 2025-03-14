
import React from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCaption,
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
import { ArrowDown, Eye, CheckCircle, XCircle, Info, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestStatusBadge } from "./detail/RequestStatusBadge";
import { RequestPriorityBadge } from "./detail/RequestPriorityBadge";
import { getStepTypeLabel, getStepTypeBadgeClass } from "./workflow/utils";
import { DeleteRequestDialog } from "./dialogs/DeleteRequestDialog";
import { supabase } from "@/integrations/supabase/client";

interface RequestsTableProps {
  requests: any[];
  isLoading: boolean;
  type: "incoming" | "outgoing";
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
  onRejectRequest,
}: RequestsTableProps) => {
  const [requestToDelete, setRequestToDelete] = React.useState<any | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [deletableRequests, setDeletableRequests] = React.useState<Record<string, boolean>>({});
  
  // Only run this check for outgoing requests
  React.useEffect(() => {
    if (type !== "outgoing" || requests.length === 0) return;
    
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
    
    checkDeletionPermissions();
  }, [requests, type]);
  
  // Handle delete button click
  const handleDeleteClick = (request: any) => {
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

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
        <Info className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">لا توجد طلبات</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          {type === "incoming"
            ? "لا توجد طلبات واردة تحتاج إلى موافقة"
            : "لم تقم بإرسال أي طلبات بعد"}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-right">عنوان الطلب</TableHead>
            <TableHead className="text-right">نوع الطلب</TableHead>
            {type === "incoming" && (
              <TableHead className="text-right">نوع الإجراء</TableHead>
            )}
            <TableHead className="text-right">الحالة</TableHead>
            <TableHead className="text-right">الأولوية</TableHead>
            <TableHead className="text-right">تاريخ الإنشاء</TableHead>
            <TableHead className="text-right">الإجراءات</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">{request.title}</TableCell>
              <TableCell>
                {request.request_type?.name || "غير محدد"}
              </TableCell>
              {type === "incoming" && (
                <TableCell>
                  {request.step_type && (
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStepTypeBadgeClass(request.step_type)}`}>
                      {getStepTypeLabel(request.step_type)}
                    </span>
                  )}
                </TableCell>
              )}
              <TableCell>
                <RequestStatusBadge status={request.status} />
              </TableCell>
              <TableCell>
                <RequestPriorityBadge priority={request.priority} />
              </TableCell>
              <TableCell>
                {format(new Date(request.created_at), "yyyy-MM-dd")}
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
                  {type === "incoming" &&
                    request.status === "pending" &&
                    onApproveRequest &&
                    onRejectRequest && (
                      <>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
                                onClick={() => onApproveRequest(request)}
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>الموافقة على الطلب</p>
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
                                onClick={() => onRejectRequest(request)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>رفض الطلب</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </>
                    )}
                  
                  {/* Delete button (only for outgoing requests with permission) */}
                  {type === "outgoing" && deletableRequests[request.id] && (
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
