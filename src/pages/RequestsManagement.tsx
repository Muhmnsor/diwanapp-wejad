
import React from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { NewRequestDialog } from "@/components/requests/NewRequestDialog";
import { RequestsPageHeader } from "@/components/requests/page/RequestsPageHeader";
import { RequestsPageContent } from "@/components/requests/page/RequestsPageContent";
import { useRequestsPage } from "@/components/requests/hooks/useRequestsPage";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

const RequestsManagement = () => {
  const navigate = useNavigate();
  const {
    isAuthenticated,
    user,
    activeTab,
    selectedRequestType,
    showNewRequestDialog,
    selectedRequestId,
    error,
    authChecking,
    incomingRequests,
    outgoingRequests,
    incomingLoading,
    outgoingLoading,
    fetchData,
    createRequest,
    isUploading,
    uploadProgress,
    submissionSuccess,
    submissionStep,
    handleNewRequest,
    handleSelectRequestType,
    handleTabChange,
    handleCreateRequest,
    handleViewRequest,
    handleCloseDetailView,
    handleLogin
  } = useRequestsPage();

  React.useEffect(() => {
    // Handle authentication and redirect if needed
    if (!authChecking && !isAuthenticated) {
      toast.error("يجب تسجيل الدخول لاستخدام نظام الطلبات");
      navigate("/login", { state: { returnUrl: "/requests" } });
    }
  }, [authChecking, isAuthenticated, navigate]);

  React.useEffect(() => {
    // Show toast notifications for errors
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleRefresh = () => {
    fetchData();
    toast.success("تم تحديث البيانات");
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <RequestsPageHeader 
          title="إدارة الطلبات"
          description="إدارة ومتابعة الطلبات والاستمارات والاعتمادات الواردة"
          onRefresh={handleRefresh}
        />
        
        {error && error.includes("recursion") && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4 ml-2" />
            <AlertDescription>
              <div className="flex flex-col">
                <p>حدث خطأ في نظام الصلاحيات. يرجى إعادة تحميل البيانات.</p>
                <Button
                  onClick={handleRefresh}
                  variant="outline"
                  size="sm"
                  className="mt-2 self-start"
                >
                  <RefreshCw className="h-4 w-4 ml-2" />
                  إعادة تحميل البيانات
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
        
        <RequestsPageContent 
          activeTab={activeTab}
          isAuthenticated={isAuthenticated}
          user={user}
          incomingRequests={incomingRequests || []}
          outgoingRequests={outgoingRequests || []}
          incomingLoading={incomingLoading}
          outgoingLoading={outgoingLoading}
          error={error}
          authChecking={authChecking}
          selectedRequestId={selectedRequestId}
          handleTabChange={handleTabChange}
          handleViewRequest={handleViewRequest}
          handleCloseDetailView={handleCloseDetailView}
          handleSelectRequestType={handleSelectRequestType}
          handleLogin={handleLogin}
        />
      </div>

      {selectedRequestType && (
        <NewRequestDialog
          isOpen={showNewRequestDialog}
          onClose={handleNewRequest}
          requestType={selectedRequestType}
          onSubmit={handleCreateRequest}
          isSubmitting={createRequest.isPending}
          isUploading={isUploading}
          uploadProgress={uploadProgress}
          submissionSuccess={submissionSuccess}
          error={error}
          submissionStep={submissionStep}
        />
      )}

      <Footer />
    </div>
  );
};

export default RequestsManagement;
