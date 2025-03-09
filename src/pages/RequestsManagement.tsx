
import React, { useState } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useSearchParams } from "react-router-dom";
import { AdminWorkflows } from "@/components/requests/AdminWorkflows";
import { NewRequestDialog } from "@/components/requests/NewRequestDialog";
import { RequestDetail } from "@/components/requests/RequestDetail";
import { useRequests } from "@/components/requests/hooks/useRequests";
import { RequestType } from "@/components/requests/types";
import { useAuthStore } from "@/store/authStore";
import { WelcomeCard } from "@/components/requests/tabs/WelcomeCard";
import { IncomingRequestsTab } from "@/components/requests/tabs/IncomingRequestsTab";
import { OutgoingRequestsTab } from "@/components/requests/tabs/OutgoingRequestsTab";
import { FormsTab } from "@/components/requests/tabs/FormsTab";

const RequestsManagement = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "incoming";
  const [selectedRequestType, setSelectedRequestType] = useState<RequestType | null>(null);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState<boolean>(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { 
    incomingRequests, 
    outgoingRequests, 
    incomingLoading, 
    outgoingLoading,
    createRequest,
    isUploading,
    submissionSuccess,
  } = useRequests();

  const handleNewRequest = () => {
    setShowNewRequestDialog(false);
    setSelectedRequestType(null);
    setError(null);
  };

  const handleSelectRequestType = (requestType: RequestType) => {
    setSelectedRequestType(requestType);
    setShowNewRequestDialog(true);
    setError(null);
  };

  const handleCreateRequest = (formData: any) => {
    if (!user) {
      setError("يجب تسجيل الدخول لإنشاء طلب جديد");
      return;
    }
    
    setError(null);
    createRequest.mutate(formData, {
      onSuccess: () => {
        // Don't close dialog immediately to allow user to see success message
        setTimeout(() => {
          handleNewRequest();
        }, 2000);
      },
      onError: (err: any) => {
        console.error("Error creating request:", err);
        setError(err.message || "حدث خطأ أثناء إنشاء الطلب");
      }
    });
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequestId(request.id);
  };

  const handleCloseDetailView = () => {
    setSelectedRequestId(null);
  };

  // Render content based on the active tab
  const renderContent = () => {
    if (selectedRequestId) {
      return (
        <RequestDetail
          requestId={selectedRequestId}
          onClose={handleCloseDetailView}
        />
      );
    }

    switch (activeTab) {
      case "incoming":
        return (
          <IncomingRequestsTab 
            requests={incomingRequests || []}
            isLoading={incomingLoading}
            error={error}
            onViewRequest={handleViewRequest}
          />
        );
        
      case "outgoing":
        return (
          <OutgoingRequestsTab 
            requests={outgoingRequests || []}
            isLoading={outgoingLoading}
            error={error}
            onViewRequest={handleViewRequest}
          />
        );
        
      case "approvals":
        return <AdminWorkflows />;
        
      case "forms":
        return <FormsTab onSelectType={handleSelectRequestType} />;
        
      default:
        return (
          <IncomingRequestsTab 
            requests={incomingRequests || []}
            isLoading={incomingLoading}
            error={error}
            onViewRequest={handleViewRequest}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
          <p className="text-gray-600 mt-2">إدارة ومتابعة الطلبات والاستمارات والاعتمادات الواردة</p>
        </div>
        
        {isAuthenticated ? (
          renderContent()
        ) : (
          <WelcomeCard />
        )}
      </div>

      {selectedRequestType && (
        <NewRequestDialog
          isOpen={showNewRequestDialog}
          onClose={handleNewRequest}
          requestType={selectedRequestType}
          onSubmit={handleCreateRequest}
          isSubmitting={createRequest.isPending}
          isUploading={isUploading}
          submissionSuccess={submissionSuccess}
        />
      )}

      <Footer />
    </div>
  );
};

export default RequestsManagement;
