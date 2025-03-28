
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
      <TabsContent value="dashboard" className="mt-6">
        <DashboardTab />
      </TabsContent>
      
      <TabsContent value="categories" className="mt-6">
        <CategoriesTab />
      </TabsContent>
      
      {hasAdminRole && (
        <TabsContent value="all-meetings" className="mt-6">
          <AllMeetingsTab />
        </TabsContent>
      )}
    </>
  );
};
