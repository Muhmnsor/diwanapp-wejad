
import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Inbox, Loader2 } from "lucide-react";

const InternalMail = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow" dir="rtl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Inbox className="h-6 w-6 text-primary" />
            البريد الداخلي
          </h1>
          <p className="text-muted-foreground">إدارة البريد الداخلي للمؤسسة</p>
        </div>
        
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center justify-center py-12">
            <Inbox className="h-16 w-16 text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold mb-2">نظام البريد الداخلي</h2>
            <p className="text-gray-500 max-w-md mb-6">
              سيتم إطلاق نظام البريد الداخلي قريباً. هذه الصفحة قيد التطوير حالياً.
            </p>
          </div>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default InternalMail;
