
import { Badge } from "@/components/ui/badge";

export const ProjectStructure = () => {
  return (
    <div className="border rounded-md p-3 mb-4">
      <code className="text-sm">
        <div><Badge variant="outline" className="mr-2">📁</Badge> src/</div>
        
        {/* Core Components */}
        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> components/ - مكونات التطبيق المختلفة</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> activities/ - مكونات الأنشطة والفعاليات</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> admin/ - مكونات لوحة التحكم</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> certificates/ - مكونات إدارة الشهادات</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> dashboard/ - مكونات لوحة القيادة</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> developer/ - أدوات المطور</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> documentation/ - مكونات التوثيق</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> events/ - مكونات الفعاليات</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> finance/ - المكونات المالية</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> ideas/ - مكونات إدارة الأفكار</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> layout/ - مكونات التخطيط العام</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> projects/ - مكونات المشاريع</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> requests/ - مكونات الطلبات</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> settings/ - مكونات الإعدادات</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> tasks/ - مكونات المهام</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> ui/ - مكونات واجهة المستخدم الأساسية</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> users/ - مكونات إدارة المستخدمين</div>
        
        {/* Core App Files */}
        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> pages/ - صفحات التطبيق</div>
        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> hooks/ - الدوال الخطافية</div>
        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> integrations/ - تكامل مع الخدمات الخارجية</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> supabase/ - تكامل مع Supabase</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> whatsapp/ - تكامل مع WhatsApp</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> asana/ - تكامل مع Asana</div>
        
        {/* State Management */}
        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> store/ - مخازن حالة التطبيق</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> authStore.ts - إدارة المصادقة</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> eventStore.ts - إدارة الفعاليات</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> financeStore.ts - إدارة الموارد المالية</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> portfolioStore.ts - إدارة المحافظ</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> notificationsStore.ts - إدارة الإشعارات</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📄</Badge> documentsStore.ts - إدارة المستندات</div>
        
        {/* Utils and Types */}
        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> utils/ - دوال مساعدة</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> export/ - تصدير البيانات</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> files/ - إدارة الملفات</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> print/ - الطباعة</div>
        <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> reports/ - التقارير</div>
        <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> types/ - التعريفات النمطية</div>
      </code>
    </div>
  );
};
