
import React from "react";
import { useNavigate } from "react-router-dom";
import { AdminHeader } from "@/components/layout/AdminHeader";
import { Footer } from "@/components/layout/Footer";
import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const MeetingsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col" dir="rtl">
      <AdminHeader />
      
      <div className="container mx-auto px-4 py-8 flex-grow flex justify-center items-center">
        <Card className="w-full max-w-2xl mx-auto text-center">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">تطبيق إدارة الاجتماعات</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 py-8">
            <div className="flex justify-center">
              <Construction className="h-32 w-32 text-amber-500" />
            </div>
            <h2 className="text-3xl font-bold text-gray-700 mt-4">قيد التطوير</h2>
            <p className="text-lg text-gray-600">
              نعمل حالياً على تطوير نظام متكامل لإدارة الاجتماعات والمهام. سيكون متاحاً قريباً.
            </p>
            <div className="border-t border-b border-gray-200 py-4 my-4">
              <p className="text-gray-500">المميزات القادمة:</p>
              <ul className="text-right pr-8 space-y-2 mt-2">
                <li>• إدارة مواعيد الاجتماعات والجدولة</li>
                <li>• تسجيل المشاركين وإدارة الحضور</li>
                <li>• إضافة محاضر الاجتماعات</li>
                <li>• متابعة المهام والقرارات</li>
                <li>• إرسال تنبيهات وإشعارات</li>
              </ul>
            </div>
            <p className="text-primary font-medium">تابعونا للتحديثات القادمة</p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={() => navigate("/admin/dashboard")}
              className="px-6"
            >
              العودة إلى لوحة التحكم
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      <Footer />
    </div>
  );
};

export default MeetingsPage;
