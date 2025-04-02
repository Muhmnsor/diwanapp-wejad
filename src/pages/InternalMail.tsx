
import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const InternalMail = () => {
  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8 text-center">البريد الداخلي</h1>
        <Card className="w-full max-w-3xl mx-auto">
          <CardContent className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-full flex justify-center mb-4">
              <Loader className="h-16 w-16 text-primary animate-spin" />
            </div>
            <h2 className="text-2xl font-semibold mb-2 w-full text-center">قيد التطوير</h2>
            <p className="text-muted-foreground w-full text-center">
              هذه الصفحة قيد التطوير حالياً. سيتم إطلاقها قريباً مع مجموعة كاملة من الميزات.
            </p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default InternalMail;
