
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DocumentsTable from "@/components/documents/DocumentsTable";
import { DocumentStats } from "@/components/documents/DocumentStats";
import { DocumentControls } from "@/components/documents/DocumentControls";

const Documents = () => {
  const [activeTab, setActiveTab] = useState("documents");

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">إدارة المستندات</h1>
      
      <DocumentStats />
      
      <Tabs defaultValue="documents" className="w-full" onValueChange={setActiveTab}>
        <div className="w-full justify-start mb-6">
          <TabsList>
            <TabsTrigger value="documents">المستندات</TabsTrigger>
            <TabsTrigger value="templates">النماذج</TabsTrigger>
            <TabsTrigger value="subscriptions">الاشتراكات</TabsTrigger>
            <TabsTrigger value="archive">الأرشيف</TabsTrigger>
            <TabsTrigger value="digital-accounts">الحسابات الرقمية</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="documents">
          <DocumentControls />
          <DocumentsTable />
        </TabsContent>
        
        <TabsContent value="templates">
          <div className="p-4 text-center text-gray-500">
            محتوى النماذج سيظهر هنا
          </div>
        </TabsContent>
        
        <TabsContent value="subscriptions">
          <div className="p-4 text-center text-gray-500">
            محتوى الاشتراكات سيظهر هنا
          </div>
        </TabsContent>
        
        <TabsContent value="archive">
          <div className="p-4 text-center text-gray-500">
            محتوى الأرشيف سيظهر هنا
          </div>
        </TabsContent>
        
        <TabsContent value="digital-accounts">
          <div className="p-4 text-center text-gray-500">
            محتوى الحسابات الرقمية سيظهر هنا
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documents;
