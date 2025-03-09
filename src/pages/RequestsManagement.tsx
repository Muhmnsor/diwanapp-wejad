
import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox } from "lucide-react";

const RequestsManagement = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
          <p className="text-gray-600 mt-2">إدارة ومتابعة الطلبات والاستمارات الواردة</p>
        </div>
        
        <Card className="w-full">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-2xl font-bold">نظام إدارة الطلبات</CardTitle>
            <Inbox className="h-8 w-8 text-primary" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">نظام إدارة الطلبات قيد التطوير</h3>
              <p className="text-muted-foreground max-w-md">
                سيتم إطلاق نظام إدارة الطلبات قريباً. يمكنك من خلاله إدارة ومتابعة جميع الطلبات والاستمارات الواردة بكفاءة عالية.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default RequestsManagement;
