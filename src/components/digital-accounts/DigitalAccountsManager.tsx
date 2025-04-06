
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountsList } from "@/components/digital-accounts/AccountsList";
import { AccountForm } from "@/components/digital-accounts/AccountForm";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const DigitalAccountsManager = () => {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">الحسابات الرقمية</h2>
        {!showAddForm && (
          <Button 
            onClick={() => setShowAddForm(true)} 
            className="flex items-center gap-2"
          >
            <PlusCircle className="h-4 w-4" />
            <span>إضافة حساب جديد</span>
          </Button>
        )}
      </div>
      
      {showAddForm && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <h3 className="text-lg font-medium mb-4">إضافة حساب جديد</h3>
          <AccountForm 
            onSuccess={() => setShowAddForm(false)}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">جميع الحسابات</TabsTrigger>
          <TabsTrigger value="social">منصات التواصل الاجتماعي</TabsTrigger>
          <TabsTrigger value="apps">التطبيقات والخدمات</TabsTrigger>
          <TabsTrigger value="email">البريد الإلكتروني</TabsTrigger>
          <TabsTrigger value="financial">الحسابات المالية</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <AccountsList category="all" />
        </TabsContent>
        
        <TabsContent value="social">
          <AccountsList category="social" />
        </TabsContent>
        
        <TabsContent value="apps">
          <AccountsList category="apps" />
        </TabsContent>
        
        <TabsContent value="email">
          <AccountsList category="email" />
        </TabsContent>
        
        <TabsContent value="financial">
          <AccountsList category="financial" />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DigitalAccountsManager;
