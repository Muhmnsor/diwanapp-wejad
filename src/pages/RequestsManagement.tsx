
import React from "react";
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Inbox } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const RequestsManagement = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">إدارة الطلبات</h1>
          <p className="text-gray-600 mt-2">إدارة ومتابعة الطلبات والاستمارات والاعتمادات الواردة</p>
        </div>
        
        <Tabs defaultValue="incoming">
          <TabsList className="mb-6">
            <TabsTrigger value="incoming">الطلبات الواردة</TabsTrigger>
            <TabsTrigger value="outgoing">الطلبات الصادرة</TabsTrigger>
            <TabsTrigger value="approvals">الاعتمادات</TabsTrigger>
            <TabsTrigger value="forms">النماذج والاستمارات</TabsTrigger>
          </TabsList>
          
          <TabsContent value="incoming">
            <Card className="w-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-2xl font-bold">نظام إدارة الطلبات والاعتمادات</CardTitle>
                <Inbox className="h-8 w-8 text-primary" />
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">نظام إدارة الطلبات والاعتمادات قيد التطوير</h3>
                  <p className="text-muted-foreground max-w-md">
                    سيتم إطلاق نظام إدارة الطلبات والاعتمادات قريباً. يمكنك من خلاله إدارة ومتابعة جميع الطلبات والاستمارات والاعتمادات الواردة بكفاءة عالية.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="outgoing">
            <Card className="w-full">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">الطلبات الصادرة قيد التطوير</h3>
                  <p className="text-muted-foreground max-w-md">
                    هذه الميزة قيد التطوير وستكون متاحة قريباً.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="approvals">
            <Card className="w-full">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">الاعتمادات قيد التطوير</h3>
                  <p className="text-muted-foreground max-w-md">
                    هذه الميزة قيد التطوير وستكون متاحة قريباً.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="forms">
            <Card className="w-full">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Inbox className="h-16 w-16 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">النماذج والاستمارات قيد التطوير</h3>
                  <p className="text-muted-foreground max-w-md">
                    هذه الميزة قيد التطوير وستكون متاحة قريباً.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <Footer />
    </div>
  );
};

export default RequestsManagement;
