
import React, { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";
import { Progress } from "@/components/ui/progress";
import { RequestError } from "@/components/requests/dialogs/RequestError";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RequestsManagement = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "incoming";
  const [selectedRequestType, setSelectedRequestType] = useState<RequestType | null>(null);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState<boolean>(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);
  
  const { 
    incomingRequests, 
    outgoingRequests, 
    incomingLoading, 
    outgoingLoading,
    createRequest,
    isUploading,
    uploadProgress,
    submissionSuccess,
    detailedError,
    submissionStep
  } = useRequests();

  // Check session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        setAuthChecking(true);
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session check error:", sessionError);
          setError("حدث خطأ أثناء التحقق من حالة تسجيل الدخول");
        }
        
        if (!session) {
          console.log("No active session");
          setError("يرجى تسجيل الدخول لاستخدام نظام الطلبات");
        }
      } catch (err) {
        console.error("Error checking session:", err);
        setError("حدث خطأ غير متوقع");
      } finally {
        setAuthChecking(false);
      }
    };
    
    checkSession();
  }, []);

  useEffect(() => {
    // If we have a detailed error from the request creation process, show it
    if (detailedError) {
      setError(detailedError);
    }
  }, [detailedError]);

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

  const handleTabChange = (value: string) => {
    setSearchParams({ tab: value });
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
    if (authChecking) {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <p className="mb-4 text-muted-foreground">جاري التحقق من حالة تسجيل الدخول...</p>
          <Progress value={100} className="w-64 h-2 animate-pulse" />
        </div>
      );
    }

    if (selectedRequestId) {
      return (
        <RequestDetail
          requestId={selectedRequestId}
          onClose={handleCloseDetailView}
        />
      );
    }

    if (!isAuthenticated) {
      return <WelcomeCard />;
    }

    return (
      <>
        <RequestError error={error} />
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="incoming">الطلبات الواردة</TabsTrigger>
            <TabsTrigger value="outgoing">الطلبات الصادرة</TabsTrigger>
            <TabsTrigger value="forms">تقديم طلب جديد</TabsTrigger>
            {user?.isAdmin && <TabsTrigger value="approvals">إدارة سير العمل</TabsTrigger>}
          </TabsList>
          
          <TabsContent value="incoming">
            <IncomingRequestsTab 
              requests={incomingRequests || []}
              isLoading={incomingLoading}
              error={error}
              onViewRequest={handleViewRequest}
            />
          </TabsContent>
          
          <TabsContent value="outgoing">
            <OutgoingRequestsTab 
              requests={outgoingRequests || []}
              isLoading={outgoingLoading}
              error={error}
              onViewRequest={handleViewRequest}
            />
          </TabsContent>
          
          <TabsContent value="forms">
            <FormsTab onSelectType={handleSelectRequestType} />
          </TabsContent>
          
          <TabsContent value="approvals">
            <AdminWorkflows />
          </TabsContent>
        </Tabs>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
          <p className="text-gray-600 mt-2">إدارة ومتابعة الطلبات والاستمارات والاعتمادات الواردة</p>
        </div>
        
        {renderContent()}
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
