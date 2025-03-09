
import React, { useState, useEffect } from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "react-router-dom";
import { RequestTypesList } from "@/components/requests/RequestTypesList";
import { RequestsTable } from "@/components/requests/RequestsTable";
import { AdminWorkflows } from "@/components/requests/AdminWorkflows";
import { NewRequestDialog } from "@/components/requests/NewRequestDialog";
import { RequestDetail } from "@/components/requests/RequestDetail";
import { useRequests } from "@/components/requests/hooks/useRequests";
import { RequestType } from "@/components/requests/types";
import { useAuthStore } from "@/store/authStore";

const RequestsManagement = () => {
  const { isAuthenticated } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<string>(searchParams.get("tab") || "incoming");
  const [selectedRequestType, setSelectedRequestType] = useState<RequestType | null>(null);
  const [showNewRequestDialog, setShowNewRequestDialog] = useState<boolean>(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  
  const { 
    incomingRequests, 
    outgoingRequests, 
    incomingLoading, 
    outgoingLoading,
    createRequest 
  } = useRequests();

  useEffect(() => {
    // Update the URL query parameter when the tab changes
    const tabParam = searchParams.get("tab");
    if (tabParam !== activeTab) {
      if (activeTab === "incoming") {
        searchParams.delete("tab");
      } else {
        searchParams.set("tab", activeTab);
      }
      setSearchParams(searchParams);
    }
  }, [activeTab, searchParams, setSearchParams]);

  // Handle tab changes from URL
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

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
      }
    });
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequestId(request.id);
  };

  const handleCloseDetailView = () => {
    setSelectedRequestId(null);
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
          selectedRequestId ? (
            <RequestDetail
              requestId={selectedRequestId}
              onClose={handleCloseDetailView}
            />
          ) : (
            <Tabs defaultValue={activeTab} value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="mb-6">
                <TabsTrigger value="incoming">الطلبات الواردة</TabsTrigger>
                <TabsTrigger value="outgoing">الطلبات الصادرة</TabsTrigger>
                <TabsTrigger value="approvals">الاعتمادات</TabsTrigger>
                <TabsTrigger value="forms">النماذج والاستمارات</TabsTrigger>
              </TabsList>
              
              <TabsContent value="incoming">
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">الطلبات الواردة</h2>
                  <Button onClick={() => setActiveTab("forms")}>
                    <Plus className="mr-2 h-4 w-4" />
                    تقديم طلب جديد
                  </Button>
                </div>
                <RequestsTable
                  requests={incomingRequests || []}
                  isLoading={incomingLoading}
                  type="incoming"
                  onViewRequest={handleViewRequest}
                  onApproveRequest={(request) => handleViewRequest(request)}
                  onRejectRequest={(request) => handleViewRequest(request)}
                />
              </TabsContent>
              
              <TabsContent value="outgoing">
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-xl font-semibold">الطلبات الصادرة</h2>
                  <Button onClick={() => setActiveTab("forms")}>
                    <Plus className="mr-2 h-4 w-4" />
                    تقديم طلب جديد
                  </Button>
                </div>
                <RequestsTable
                  requests={outgoingRequests || []}
                  isLoading={outgoingLoading}
                  type="outgoing"
                  onViewRequest={handleViewRequest}
                />
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
          )
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
