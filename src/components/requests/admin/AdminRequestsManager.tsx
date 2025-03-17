
import { useState, useEffect } from "react";
import { RequestsOverview } from "./RequestsOverview";
import { useAllRequests } from "../hooks/useAllRequests";
import { useAuthStore } from "@/store/refactored-auth";
import { RequestDetail } from "../RequestDetail";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EnhancedRequestsTable } from "../tables/EnhancedRequestsTable";

export const AdminRequestsManager = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.isAdmin || user?.role === 'developer' || user?.role === 'admin';
  
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const { 
    requests, 
    isLoading, 
    error,
    refreshRequests, 
    filterByStatus, 
    statusFilter 
  } = useAllRequests();
  
  // Auto-refresh on mount to ensure we have the latest data
  useEffect(() => {
    refreshRequests();
  }, []);
  
  const handleViewRequest = (request: any) => {
    setSelectedRequestId(request.id);
  };
  
  const handleCloseDetailView = () => {
    setSelectedRequestId(null);
    refreshRequests();
  };
  
  // Only show admin content to admins
  if (!isAdmin) {
    return (
      <div className="p-6 bg-red-50 rounded-lg">
        <h2 className="text-xl font-semibold text-red-600 mb-2">غير مصرح</h2>
        <p className="text-red-600">
          ليس لديك صلاحية الوصول إلى هذه الصفحة. يجب أن تكون مشرفًا للوصول إلى لوحة الإدارة.
        </p>
      </div>
    );
  }
  
  // If a request is selected, show its details
  if (selectedRequestId) {
    return (
      <RequestDetail
        requestId={selectedRequestId}
        onClose={handleCloseDetailView}
      />
    );
  }
  
  // Show error state if there's an error
  if (error) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ في تحميل البيانات</AlertTitle>
        <AlertDescription>
          {error}
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2" 
            onClick={refreshRequests}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            إعادة المحاولة
          </Button>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-4">نظرة عامة</h2>
        <RequestsOverview />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">جميع الطلبات</h2>
        <EnhancedRequestsTable 
          requests={requests}
          isLoading={isLoading}
          onViewRequest={handleViewRequest}
          onRefresh={refreshRequests}
          filterByStatus={filterByStatus}
          statusFilter={statusFilter}
        />
      </div>
    </div>
  );
};
