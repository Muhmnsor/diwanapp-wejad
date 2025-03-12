
import React, { useState, useEffect } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { RequestTypesList } from "@/components/requests/RequestTypesList";
import { RequestsTable } from "@/components/requests/RequestsTable";
import { AdminWorkflows } from "@/components/requests/AdminWorkflows";
import { NewRequestDialog } from "@/components/requests/NewRequestDialog";
import { RequestDetail } from "@/components/requests/RequestDetail";
import { RequestType } from "@/components/requests/types";
import { useAuthStore } from "@/store/refactored-auth";
import { toast } from "sonner";
import { useRequestsEnhanced } from "@/components/requests/hooks/useRequestsEnhanced";
import { RequestsWrapper } from "@/components/requests/RequestsWrapper";
import { validateRequestWorkflow } from "@/components/requests/utils/workflowHelpers";
import { RequestApproveDialog } from "@/components/requests/detail/RequestApproveDialog";
import { RequestRejectDialog } from "@/components/requests/detail/RequestRejectDialog";

const RequestsManagement = () => {
  const { isAuthenticated, user } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "incoming";
  const [selectedRequestType, setSelectedRequestType] = useState<RequestType | null>(null);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState<boolean>(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [requestToAction, setRequestToAction] = useState<any>(null);
  
  const { 
    incomingRequests, 
    outgoingRequests, 
    incomingLoading, 
    outgoingLoading,
    createRequest,
    approveRequest,
    rejectRequest,
    isRefreshing
  } = useRequestsEnhanced();

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setSearchParams(searchParams);
    } else if (!tabFromUrl) {
      searchParams.set("tab", activeTab);
      setSearchParams(searchParams);
    }
  }, [searchParams, setSearchParams, activeTab]);

  const handleNewRequest = () => {
    setShowNewRequestDialog(false);
    setSelectedRequestType(null);
  };

  const handleSelectRequestType = async (requestType: RequestType) => {
    setSelectedRequestType(requestType);
    setShowNewRequestDialog(true);
    
    if (requestType.id) {
      const isValid = await validateRequestWorkflow(requestType.id);
      if (!isValid) {
        console.warn("Request type has workflow configuration issues:", requestType.id);
      }
    }
  };

  const handleCreateRequest = (formData: any) => {
    console.log("Submitting request:", formData);
    
    createRequest.mutate(formData, {
      onSuccess: (data) => {
        console.log("Request created successfully:", data);
        toast.success("تم إنشاء الطلب بنجاح");
        handleNewRequest();
        
        setTimeout(() => {
          const currentTab = searchParams.get("tab") || "incoming";
          searchParams.set("tab", currentTab === "outgoing" ? "outgoing-refresh" : "outgoing");
          setSearchParams(searchParams);
          
          setTimeout(() => {
            searchParams.set("tab", currentTab);
            setSearchParams(searchParams);
          }, 100);
        }, 500);
      },
      onError: (error) => {
        console.error("Error creating request:", error);
        toast.error(`حدث خطأ أثناء إنشاء الطلب: ${error.message || "خطأ غير معروف"}`);
      }
    });
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequestId(request.id);
  };

  const handleApproveRequest = (request: any) => {
    setRequestToAction(request);
    setIsApproveDialogOpen(true);
  };

  const handleRejectRequest = (request: any) => {
    setRequestToAction(request);
    setIsRejectDialogOpen(true);
  };

  const handleApproveConfirm = (comments: string) => {
    if (!requestToAction) return;
    
    approveRequest.mutate(
      { 
        requestId: requestToAction.id, 
        stepId: requestToAction.current_step_id,
        comments 
      }, 
      {
        onSuccess: () => {
          toast.success("تم الموافقة على الطلب بنجاح");
          setIsApproveDialogOpen(false);
          setRequestToAction(null);
          
          // Refresh the incoming requests list
          const currentTab = searchParams.get("tab") || "incoming";
          searchParams.set("tab", currentTab === "incoming" ? "incoming-refresh" : "incoming");
          setSearchParams(searchParams);
          
          setTimeout(() => {
            searchParams.set("tab", currentTab);
            setSearchParams(searchParams);
          }, 100);
        },
        onError: (error) => {
          toast.error(`حدث خطأ أثناء الموافقة على الطلب: ${error.message || "خطأ غير معروف"}`);
        }
      }
    );
  };

  const handleRejectConfirm = (comments: string) => {
    if (!requestToAction) return;
    
    rejectRequest.mutate(
      { 
        requestId: requestToAction.id,
        stepId: requestToAction.current_step_id,
        comments 
      }, 
      {
        onSuccess: () => {
          toast.success("تم رفض الطلب بنجاح");
          setIsRejectDialogOpen(false);
          setRequestToAction(null);
          
          // Refresh the incoming requests list
          const currentTab = searchParams.get("tab") || "incoming";
          searchParams.set("tab", currentTab === "incoming" ? "incoming-refresh" : "incoming");
          setSearchParams(searchParams);
          
          setTimeout(() => {
            searchParams.set("tab", currentTab);
            setSearchParams(searchParams);
          }, 100);
        },
        onError: (error) => {
          toast.error(`حدث خطأ أثناء رفض الطلب: ${error.message || "خطأ غير معروف"}`);
        }
      }
    );
  };

  const handleCloseDetailView = () => {
    setSelectedRequestId(null);
    const currentTab = searchParams.get("tab") || "incoming";
    
    searchParams.set("tab", currentTab === "incoming" ? "incoming-refresh" : "incoming");
    setSearchParams(searchParams);
    
    setTimeout(() => {
      searchParams.set("tab", currentTab);
      setSearchParams(searchParams);
    }, 100);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "incoming":
      case "incoming-refresh":
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">الطلبات الواردة</h2>
            </div>
            <RequestsTable
              requests={incomingRequests || []}
              isLoading={incomingLoading}
              type="incoming"
              onViewRequest={handleViewRequest}
              onApproveRequest={handleApproveRequest}
              onRejectRequest={handleRejectRequest}
            />
          </div>
        );
      case "outgoing":
      case "outgoing-refresh":
        return (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">الطلبات الصادرة</h2>
            </div>
            <RequestsTable
              requests={outgoingRequests || []}
              isLoading={outgoingLoading || isRefreshing}
              type="outgoing"
              onViewRequest={handleViewRequest}
            />
          </div>
        );
      case "forms":
        return (
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">تقديم طلب جديد</h2>
            <p className="mb-6 text-muted-foreground">
              اختر نوع الطلب الذي ترغب في تقديمه من القائمة أدناه
            </p>
            <RequestTypesList onSelectType={handleSelectRequestType} />
          </div>
        );
      case "approvals":
        if (user?.isAdmin) {
          return <AdminWorkflows />;
        }
        return null;
      default:
        return null;
    }
  };

  return (
    <RequestsWrapper>
      {!isAuthenticated ? (
        <div className="min-h-screen flex flex-col" dir="rtl">
          <TopHeader />
          <div className="container mx-auto px-4 py-8 flex-grow">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
              <p className="text-gray-600 mt-2">إدارة ومتابعة الطلبات والاستمارات والاعتمادات الواردة</p>
            </div>
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-2xl font-bold">نظام إدارة الطلبات والاعتمادات</CardTitle>
                <FileText className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">الرجاء تسجيل الدخول للوصول إلى نظام الطلبات</h3>
                  <p className="text-muted-foreground max-w-md">
                    عليك تسجيل الدخول أولاً للتمكن من استخدام نظام إدارة الطلبات والاعتمادات.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
          <Footer />
        </div>
      ) : selectedRequestId ? (
        <div className="min-h-screen flex flex-col" dir="rtl">
          <TopHeader />
          <div className="container mx-auto px-4 py-8 flex-grow">
            <div className="mb-8">
              <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
              <p className="text-gray-600 mt-2">إدارة ومتابعة الطلبات والاستمارات والاعتمادات الواردة</p>
            </div>
            <RequestDetail
              requestId={selectedRequestId}
              onClose={handleCloseDetailView}
            />
          </div>
          <Footer />
        </div>
      ) : (
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
            />
          )}

          <RequestApproveDialog
            requestId={requestToAction?.id || ""}
            stepId={requestToAction?.current_step_id}
            isOpen={isApproveDialogOpen}
            onOpenChange={setIsApproveDialogOpen}
          />

          <RequestRejectDialog
            requestId={requestToAction?.id || ""}
            stepId={requestToAction?.current_step_id}
            isOpen={isRejectDialogOpen}
            onOpenChange={setIsRejectDialogOpen}
          />

          <Footer />
        </div>
      )}
    </RequestsWrapper>
  );
};

export default RequestsManagement;
