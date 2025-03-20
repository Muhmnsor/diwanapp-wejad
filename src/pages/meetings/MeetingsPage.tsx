
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { MeetingsHeader } from "@/components/meetings/navigation/MeetingsHeader";
import { MeetingsTabsContent } from "@/components/meetings/navigation/MeetingsTabsContent";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Tabs } from "@/components/ui/tabs";

const MeetingsPage = () => {
  const navigate = useNavigate();
  const { hasAdminRole } = useUserRoles();
  const [activeTab, setActiveTab] = useState("dashboard");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <MeetingsHeader hasAdminRole={hasAdminRole} activeTab={activeTab} />
        
        <div className="container mx-auto px-4 py-6 flex-grow">
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight">إدارة الاجتماعات</h1>
            <p className="text-muted-foreground">
              إدارة ومتابعة الاجتماعات والمهام والقرارات
            </p>
          </div>
          
          <MeetingsTabsContent hasAdminRole={hasAdminRole} activeTab={activeTab} />
        </div>
      </Tabs>
      
      <Footer />
    </div>
  );
};

export default MeetingsPage;
