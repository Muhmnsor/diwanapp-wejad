
import { useState, useEffect } from "react";
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
import { Eye, CheckCircle, XCircle, Info, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestFilters } from "./RequestFilters";
import { RequestStatusBadge } from "./StatusBadge";
import { Request } from "../../types/request.types";
import { getStepTypeLabel, getStepTypeBadgeClass } from "../../utils/requestFormatters";

interface IncomingRequestsListProps {
  requests: Request[];
  isLoading: boolean;
  onViewRequest: (request: Request) => void;
  onApproveRequest: (request: Request) => void;
  onRejectRequest: (request: Request) => void;
}

export const IncomingRequestsList = ({
  requests,
  isLoading,
  onViewRequest,
  onApproveRequest,
  onRejectRequest,
}: IncomingRequestsListProps) => {
  const [filteredRequests, setFilteredRequests] = useState<Request[]>(requests);
  
  // Apply filters to requests
  const handleFilterChange = (filters: { status?: string; priority?: string; search?: string }) => {
    let filtered = [...requests];
    
    if (filters.status) {
      filtered = filtered.filter(req => req.status === filters.status);
    }
    
    if (filters.priority) {
      filtered = filtered.filter(req => req.priority === filters.priority);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(req => 
        req.title.toLowerCase().includes(searchLower) || 
        (req.requester?.display_name?.toLowerCase() || "").includes(searchLower)
      );
    }
    
    setFilteredRequests(filtered);
  };

  // Update filtered requests when original requests change
  useEffect(() => {
    setFilteredRequests(requests);
  }, [requests]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <span className="mr-2">جاري تحميل الطلبات...</span>
      </div>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
        <Info className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium">لا توجد طلبات</h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          لا توجد طلبات واردة تحتاج إلى موافقة
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RequestFilters onFilterChange={handleFilterChange} />
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">عنوان الطلب</TableHead>
              <TableHead className="text-right">نوع الطلب</TableHead>
              <TableHead className="text-right">نوع الإجراء</TableHead>
              <TableHead className="text-right">الحالة</TableHead>
              <TableHead className="text-right">مقدم الطلب</TableHead>
              <TableHead className="text-right">تاريخ الإنشاء</TableHead>
              <TableHead className="text-right">الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((request) => (
              <TableRow key={request.id}>
                <TableCell className="font-medium">{request.title}</TableCell>
                <TableCell>
                  {(request as any).request_type?.name || "غير محدد"}
                </TableCell>
                <TableCell>
                  {(request as any).step_type && (
                    <span className={`px-2 py-1 text-xs rounded-full border ${getStepTypeBadgeClass((request as any).step_type)}`}>
                      {getStepTypeLabel((request as any).step_type)}
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <RequestStatusBadge status={request.status} />
                </TableCell>
                <TableCell>
                  {request.requester?.display_name || "غير معروف"}
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
                    {request.status === "pending" && (
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
                    )}
                    {request.status === "pending" && (
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
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
