
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RequestsOverview } from "./RequestsOverview";
import { AllRequestsTable } from "./AllRequestsTable";
import { useAllRequests } from "../hooks/useAllRequests";
import { useAuthStore } from "@/store/refactored-auth";
import { RequestDetail } from "../RequestDetail";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Loader2 } from "lucide-react";

export const AdminRequestsManager = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.isAdmin || user?.role === 'developer' || user?.role === 'admin';
  
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const { requests, isLoading, error, refreshRequests } = useAllRequests();
  
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
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>غير مصرح</AlertTitle>
        <AlertDescription>
          ليس لديك صلاحية الوصول إلى هذه الصفحة. يجب أن تكون مشرفًا للوصول إلى لوحة الإدارة.
        </AlertDescription>
      </Alert>
    );
  }

  // If there's an error loading the data
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>خطأ في تحميل البيانات</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
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
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="all-requests">جميع الطلبات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <RequestsOverview />
        </TabsContent>
        
        <TabsContent value="all-requests">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>جاري تحميل الطلبات...</span>
            </div>
          ) : (
            <AllRequestsTable 
              requests={requests}
              isLoading={isLoading}
              onViewRequest={handleViewRequest}
              onRefresh={refreshRequests}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
