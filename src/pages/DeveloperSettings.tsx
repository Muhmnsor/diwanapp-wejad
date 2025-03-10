import { TopHeader } from "@/components/layout/TopHeader";
import { Footer } from "@/components/layout/Footer";
import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DeveloperSettings = () => {
  // Scroll to top when page loads
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <TopHeader />
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold mb-8">إعدادات المطور</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>إعدادات المطور</CardTitle>
            <CardDescription>إعدادات وأدوات خاصة بالمطورين</CardDescription>
          </CardHeader>
          <CardContent>
            <p>تحت التطوير</p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default DeveloperSettings;
