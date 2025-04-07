import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Receipt, FileText } from "lucide-react";
import { InvoicesTable } from "./InvoicesTable";
import { VouchersTable } from "./VouchersTable";

export const InvoicesVouchersTab = () => {
  const [activeTab, setActiveTab] = useState("invoices");

  return (
    <div className="space-y-4">
      <Card>
        <Tabs defaultValue="invoices" value={activeTab} onValueChange={setActiveTab} className="w-full" dir="rtl">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="invoices" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>الفواتير</span>
            </TabsTrigger>
            <TabsTrigger value="vouchers" className="flex items-center gap-2">
              <Receipt className="h-4 w-4" />
              <span>سندات الصرف</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="invoices" className="px-4 pt-4 pb-2">
            <InvoicesTable />
          </TabsContent>

          <TabsContent value="vouchers" className="px-4 pt-4 pb-2">
            <VouchersTable />
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

