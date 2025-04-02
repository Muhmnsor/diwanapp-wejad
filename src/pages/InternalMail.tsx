
import React from "react";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Inbox } from "lucide-react";

const InternalMail = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">البريد الداخلي</h1>
        </div>

        <Card className="p-8 text-center">
          <Inbox className="h-16 w-16 text-primary mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-4">نظام البريد الداخلي</h2>
          <p className="text-gray-600 mb-4">
            مرحبًا بك في نظام البريد الداخلي. هنا يمكنك إدارة الرسائل الداخلية والمراسلات بين أعضاء الفريق.
          </p>
          <p className="text-gray-500">
            سيتم تفعيل هذه الميزة قريبًا.
          </p>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default InternalMail;
