
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
      
      <div className="container mx-auto px-4 py-6 flex-grow">
        <Tabs defaultValue="dashboard">
          <MeetingsHeader hasAdminRole={hasAdminRole} />
          <MeetingsTabsContent hasAdminRole={hasAdminRole} />
        </Tabs>
      </div>
      
      <Footer />
    </div>
  );
};

export default MeetingsPage;
