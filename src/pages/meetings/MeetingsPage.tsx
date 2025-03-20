
import React from "react";
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

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="w-full bg-white py-6 border-t border-b">
        <div className="container mx-auto px-4">
          <h1 className="text-2xl font-bold tracking-tight">إدارة الاجتماعات</h1>
          <p className="text-muted-foreground">
            إدارة ومتابعة الاجتماعات والمهام والقرارات
          </p>
        </div>
      </div>
      
      <MeetingsHeader hasAdminRole={hasAdminRole} />
      
      <Tabs defaultValue="dashboard" className="w-full">
        <div className="container mx-auto px-4 py-6 flex-grow">
          <MeetingsTabsContent hasAdminRole={hasAdminRole} />
        </div>
      </Tabs>
      
      <Footer />
    </div>
  );
};

export default MeetingsPage;
