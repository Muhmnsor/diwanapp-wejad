import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InvoicesTable } from "./InvoicesTable";
import { VouchersTable } from "./VouchersTable";
import { FileInvoice, Receipt } from "lucide-react";

export const InvoicesVouchersTab = () => {
  const [activeTab, setActiveTab] = useState("invoices");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-primary text-right">الفواتير وسندات الصرف</h2>
        <div className="flex gap-2">
          {/* سيتم إضافة الأزرار هنا */}
        </div>
      </div>

      <Tabs 
        defaultValue="invoices" 
        value={activeTab} 
        onValueChange={setActiveTab} 
        className="w-full"
      >
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
          <TabsTrigger value="invoices" className="flex items-center gap-2">
            <FileInvoice className="h-4 w-4" />
            <span>الفواتير</span>
          </TabsTrigger>
          <TabsTrigger value="vouchers" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            <span>سندات الصرف</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-4">
          <InvoicesTable />
        </TabsContent>

        <TabsContent value="vouchers" className="space-y-4">
          <VouchersTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

