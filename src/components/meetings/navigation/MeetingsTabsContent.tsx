
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { DashboardTab } from "../content/DashboardTab";
import { CategoriesTab } from "../content/CategoriesTab";
import { AllMeetingsTab } from "../content/AllMeetingsTab";

interface MeetingsTabsContentProps {
  hasAdminRole: boolean;
  activeTab: string;
}

export const MeetingsTabsContent = ({ hasAdminRole, activeTab }: MeetingsTabsContentProps) => {
  return (
    <>
      <TabsContent value="dashboard" forceMount={activeTab === "dashboard"}>
        <DashboardTab />
      </TabsContent>
      
      <TabsContent value="categories" forceMount={activeTab === "categories"}>
        <CategoriesTab />
      </TabsContent>
      
      {hasAdminRole && (
        <TabsContent value="all-meetings" forceMount={activeTab === "all-meetings"}>
          <AllMeetingsTab />
        </TabsContent>
      )}
    </>
  );
};
