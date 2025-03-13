
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestsOverview } from "./RequestsOverview";
import { AllRequestsTable } from "./AllRequestsTable";
import { useAllRequests } from "../hooks/useAllRequests";
import { useAuthStore } from "@/store/refactored-auth";
import { RequestDetail } from "../RequestDetail";

export const AdminRequestsManager = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.isAdmin || user?.role === 'developer' || user?.role === 'admin';
  
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const { 
    requests, 
    isLoading, 
    refreshRequests, 
    filterByStatus, 
    statusFilter 
  } = useAllRequests();
  
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
  
  return (
    <div className="space-y-4">
      <Tabs defaultValue="all-requests" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all-requests">جميع الطلبات</TabsTrigger>
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <RequestsOverview />
        </TabsContent>
        
        <TabsContent value="all-requests">
          <AllRequestsTable 
            requests={requests}
            isLoading={isLoading}
            onViewRequest={handleViewRequest}
            onRefresh={refreshRequests}
            filterByStatus={filterByStatus}
            statusFilter={statusFilter}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
