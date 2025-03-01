
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Users, Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const UsersManagement = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center">إدارة المستخدمين</h1>
        <Card className="w-full max-w-3xl mx-auto">
          <CardContent className="p-8 flex flex-col items-center justify-center">
            <Loader className="h-16 w-16 text-primary animate-spin mb-4" />
            <h2 className="text-2xl font-semibold mb-2">قيد التطوير</h2>
            <p className="text-muted-foreground text-center">
              هذه الصفحة قيد التطوير حالياً. سيتم إطلاقها قريباً مع مجموعة كاملة من الميزات.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default UsersManagement;
