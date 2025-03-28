
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { MeetingsSecondaryHeader } from "@/components/meetings/navigation/MeetingsSecondaryHeader";
import { MeetingsTabsContent } from "@/components/meetings/navigation/MeetingsTabsContent";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Tabs } from "@/components/ui/tabs";

const MeetingsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasAdminRole } = useUserRoles();
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Update active tab based on URL query parameter
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const tabParam = query.get('tab');
    
    if (tabParam && ['dashboard', 'categories', 'all-meetings'].includes(tabParam)) {
      setActiveTab(tabParam);
    } else if (!tabParam && location.pathname === "/admin/meetings") {
      setActiveTab("dashboard");
    }
  }, [location]);
  
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    const query = new URLSearchParams(location.search);
    query.set('tab', tab);
    navigate(`${location.pathname}?${query.toString()}`);
  };
  
  return (
    <div className="min-h-screen flex flex-col rtl" dir="rtl">
      <AdminHeader />
      
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <MeetingsSecondaryHeader hasAdminRole={hasAdminRole} activeTab={activeTab} />
        
        <div className="container mx-auto px-4 py-6 flex-grow">
          <MeetingsTabsContent hasAdminRole={hasAdminRole} activeTab={activeTab} />
        </div>
      </Tabs>
      
      <Footer />
    </div>
  );
};

export default MeetingsPage;
