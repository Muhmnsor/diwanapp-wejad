
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { toast } from "sonner";

export const LogsTab = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>سجلات النظام</CardTitle>
        <CardDescription>عرض وتحليل سجلات التطبيق</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="bg-black text-white p-4 rounded-md font-mono text-sm h-[300px] overflow-auto space-y-2">
          <div className="text-green-400">[INFO] {new Date().toISOString()} - بدء تشغيل التطبيق</div>
          <div className="text-blue-400">[DEBUG] {new Date().toISOString()} - تهيئة الاتصال بقاعدة البيانات</div>
          <div className="text-blue-400">[DEBUG] {new Date().toISOString()} - تحميل إعدادات المستخدم</div>
          <div className="text-yellow-400">[WARN] {new Date().toISOString()} - استجابة بطيئة من طلب الواجهة</div>
          <div className="text-blue-400">[DEBUG] {new Date().toISOString()} - تحميل البيانات من الذاكرة المؤقتة</div>
          <div className="text-red-400">[ERROR] {new Date().toISOString()} - فشل تحميل الصورة: network timeout</div>
          <div className="text-blue-400">[DEBUG] {new Date().toISOString()} - محاولة إعادة تحميل الصورة</div>
          <div className="text-green-400">[INFO] {new Date().toISOString()} - تم تسجيل دخول المستخدم</div>
          <div className="text-blue-400">[DEBUG] {new Date().toISOString()} - تحديث رمز المصادقة</div>
          <div className="text-green-400">[INFO] {new Date().toISOString()} - تحميل واجهة المستخدم اكتمل</div>
        </div>
        
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => toast.success("تم تنزيل السجلات")}>
            تنزيل السجلات
          </Button>
          <Button variant="outline" onClick={() => toast.success("تم مسح السجلات")}>
            مسح السجلات
          </Button>
          <Button variant="outline" onClick={() => toast.success("تم تحديث السجلات")}>
            <Activity className="h-4 w-4 ml-2" />
            تحديث
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
