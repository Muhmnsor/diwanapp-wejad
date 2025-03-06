
import { useEffect, useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { UsersList } from "@/components/admin/users/UsersList";
import { StatsOverview } from "@/components/admin/dashboard/StatsOverview";
import { RecentEvents } from "@/components/admin/dashboard/RecentEvents";
import { NewRegistrations } from "@/components/admin/dashboard/NewRegistrations";
import { UpcomingEvents } from "@/components/admin/dashboard/UpcomingEvents";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationTester } from "@/components/notifications/NotificationTester";
import { DraftProjectTester } from "@/components/admin/dashboard/DraftProjectTester";

const AdminDashboard = () => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1">
        <AdminHeader title="لوحة التحكم" />
        <main className="p-6">
          <Tabs defaultValue="overview" dir="rtl" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
              <TabsTrigger value="tools">أدوات الاختبار</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <StatsOverview />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <RecentEvents />
                <NewRegistrations />
              </div>
              <UpcomingEvents />
            </TabsContent>
            
            <TabsContent value="tools" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <NotificationTester />
                <DraftProjectTester />
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
