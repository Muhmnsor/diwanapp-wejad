import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DigitalAccounts } from "@/components/digital-accounts/DigitalAccounts";

// Import any other document-related components you have
// e.g., import DocumentsList from "@/components/documents/DocumentsList";

const Documents = () => {
  const [activeTab, setActiveTab] = useState("digital-accounts");

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">إدارة الملفات والحسابات</h1>
      
      <Tabs defaultValue="digital-accounts" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="digital-accounts">الحسابات الرقمية</TabsTrigger>
          <TabsTrigger value="documents">المستندات</TabsTrigger>
          <TabsTrigger value="templates">النماذج</TabsTrigger>
        </TabsList>
        
        <TabsContent value="digital-accounts">
          <DigitalAccounts />
        </TabsContent>
        
        <TabsContent value="documents">
          {/* Place your documents component here */}
          <div className="p-4 text-center text-gray-500">
            قائمة المستندات
          </div>
        </TabsContent>
        
        <TabsContent value="templates">
          {/* Place your templates component here */}
          <div className="p-4 text-center text-gray-500">
            قائمة النماذج
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Documents;
