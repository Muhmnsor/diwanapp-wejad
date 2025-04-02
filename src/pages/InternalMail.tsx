
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { Card } from "@/components/ui/card";
import { Inbox } from "lucide-react";

const InternalMail = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center">البريد الداخلي</h1>
        
        <Card className="p-12 max-w-xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <Inbox className="h-24 w-24 text-primary opacity-50" />
          </div>
          <h2 className="text-2xl font-semibold">هذه الميزة تحت التطوير</h2>
          <p className="text-gray-600">
            نعمل حالياً على تطوير نظام البريد الداخلي. سيكون متاحاً قريباً.
          </p>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default InternalMail;
