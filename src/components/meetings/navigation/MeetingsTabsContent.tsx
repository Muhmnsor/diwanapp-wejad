
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { DashboardTab } from "../content/DashboardTab";
import { CategoriesTab } from "../content/CategoriesTab";
import { AllMeetingsTab } from "../content/AllMeetingsTab";

interface MeetingsTabsContentProps {
  hasAdminRole: boolean;
}

export const MeetingsTabsContent = ({ hasAdminRole }: MeetingsTabsContentProps) => {
  return (
    <>
      <TabsContent value="dashboard">
        <DashboardTab />
      </TabsContent>
      
      <TabsContent value="categories">
        <CategoriesTab />
      </TabsContent>
      
      {hasAdminRole && (
        <TabsContent value="all-meetings">
          <AllMeetingsTab />
        </TabsContent>
      )}
    </>
  );
};
