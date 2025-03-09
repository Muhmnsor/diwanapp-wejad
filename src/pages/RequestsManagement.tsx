
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
import { useRequests } from "@/components/requests/hooks/useRequests";
import { RequestType } from "@/components/requests/types";
import { useAuthStore } from "@/store/authStore";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const RequestsManagement = () => {
  const { isAuthenticated } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "incoming";
  const [selectedRequestType, setSelectedRequestType] = useState<RequestType | null>(null);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState<boolean>(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  
  const { 
    incomingRequests, 
    outgoingRequests, 
    incomingLoading, 
    outgoingLoading,
    incomingError,
    outgoingError,
    refetchIncomingRequests,
    refetchOutgoingRequests,
    createRequest 
  } = useRequests();

  // Update tab when it changes
  const handleTabChange = (value: string) => {
    searchParams.set("tab", value);
    setSearchParams(searchParams);
  };

  // Refresh outgoing requests when switching to that tab
  useEffect(() => {
    if (activeTab === "outgoing") {
      console.log("Refreshing outgoing requests due to tab change");
      refetchOutgoingRequests();
    } else if (activeTab === "incoming") {
      refetchIncomingRequests();
    }
  }, [activeTab, refetchOutgoingRequests, refetchIncomingRequests]);

  const handleNewRequest = () => {
    setShowNewRequestDialog(false);
    setSelectedRequestType(null);
  };

  const handleSelectRequestType = (requestType: RequestType) => {
    setSelectedRequestType(requestType);
    setShowNewRequestDialog(true);
  };

  const handleCreateRequest = (formData: any) => {
    createRequest.mutate(formData, {
      onSuccess: () => {
        handleNewRequest();
        // Force refresh outgoing requests
        setTimeout(() => refetchOutgoingRequests(), 500);
      }
    });
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequestId(request.id);
  };

  const handleCloseDetailView = () => {
    setSelectedRequestId(null);
    // Refresh data when returning from detail view
    if (activeTab === "incoming") {
      refetchIncomingRequests();
    } else if (activeTab === "outgoing") {
      refetchOutgoingRequests();
    }
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

    return (
      <Tabs defaultValue={activeTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="incoming">الطلبات الواردة</TabsTrigger>
          <TabsTrigger value="outgoing">الطلبات الصادرة</TabsTrigger>
          <TabsTrigger value="forms">تقديم طلب جديد</TabsTrigger>
          <TabsTrigger value="approvals">إدارة انواع الطلبات</TabsTrigger>
        </TabsList>

        <TabsContent value="incoming">
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">الطلبات الواردة</h2>
              <p className="text-muted-foreground mt-1">قائمة الطلبات التي تنتظر موافقتك</p>
            </div>
            <RequestsTable
              requests={incomingRequests || []}
              isLoading={incomingLoading}
              error={incomingError}
              type="incoming"
              onViewRequest={handleViewRequest}
              onApproveRequest={(request) => handleViewRequest(request)}
              onRejectRequest={(request) => handleViewRequest(request)}
              onRefresh={refetchIncomingRequests}
            />
          </div>
        </TabsContent>
          
        <TabsContent value="outgoing">
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold">الطلبات الصادرة</h2>
              <p className="text-muted-foreground mt-1">قائمة الطلبات التي قمت بتقديمها</p>
            </div>
            <RequestsTable
              requests={outgoingRequests || []}
              isLoading={outgoingLoading}
              error={outgoingError}
              type="outgoing"
              onViewRequest={handleViewRequest}
              onRefresh={refetchOutgoingRequests}
            />
          </div>
        </TabsContent>
          
        <TabsContent value="approvals">
          <AdminWorkflows />
        </TabsContent>
          
        <TabsContent value="forms">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">تقديم طلب جديد</h2>
            <p className="mb-6 text-muted-foreground">
              اختر نوع الطلب الذي ترغب في تقديمه من القائمة أدناه
            </p>
            <RequestTypesList onSelectType={handleSelectRequestType} />
          </div>
        </TabsContent>
      </Tabs>
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
        
        {isAuthenticated ? (
          renderContent()
        ) : (
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
        )}
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

      <Footer />
    </div>
  );
};

export default RequestsManagement;
