
import React from "react";
import { AdminWorkflows } from "@/components/requests/AdminWorkflows";
import { RequestDetail } from "@/components/requests/RequestDetail";
import { WelcomeCard } from "@/components/requests/tabs/WelcomeCard";
import { IncomingRequestsTab } from "@/components/requests/tabs/IncomingRequestsTab";
import { OutgoingRequestsTab } from "@/components/requests/tabs/OutgoingRequestsTab";
import { FormsTab } from "@/components/requests/tabs/FormsTab";
import { RequestError } from "@/components/requests/dialogs/RequestError";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface RequestsPageContentProps {
  activeTab: string;
  isAuthenticated: boolean;
  user: any;
  incomingRequests: any[];
  outgoingRequests: any[];
  incomingLoading: boolean;
  outgoingLoading: boolean;
  error: string | null;
  authChecking: boolean;
  selectedRequestId: string | null;
  handleTabChange: (value: string) => void;
  handleViewRequest: (request: any) => void;
  handleCloseDetailView: () => void;
  handleSelectRequestType: (requestType: any) => void;
  handleLogin: () => void;
}

export const RequestsPageContent: React.FC<RequestsPageContentProps> = ({
  activeTab,
  isAuthenticated,
  user,
  incomingRequests,
  outgoingRequests,
  incomingLoading,
  outgoingLoading,
  error,
  authChecking,
  selectedRequestId,
  handleTabChange,
  handleViewRequest,
  handleCloseDetailView,
  handleSelectRequestType,
  handleLogin
}) => {
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
    return (
      <div className="p-6 border rounded-lg bg-white shadow-sm">
        <h2 className="text-xl font-bold mb-4">يجب تسجيل الدخول</h2>
        <p className="mb-6 text-gray-600">يرجى تسجيل الدخول لاستخدام نظام الطلبات والاعتمادات</p>
        <Button onClick={handleLogin} className="w-full">تسجيل الدخول</Button>
      </div>
    );
  }

  return (
    <>
      <RequestError error={error} showDetails={true} />
      
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
