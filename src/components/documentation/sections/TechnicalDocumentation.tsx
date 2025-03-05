
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

export const TechnicalDocumentation = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>التوثيق التقني</CardTitle>
          <CardDescription>
            معلومات تقنية حول بنية النظام والتقنيات المستخدمة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">التقنيات المستخدمة</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>التقنية</TableHead>
                  <TableHead>الإصدار</TableHead>
                  <TableHead>الاستخدام</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>React</TableCell>
                  <TableCell>^18.3.1</TableCell>
                  <TableCell>مكتبة بناء واجهات المستخدم</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>TypeScript</TableCell>
                  <TableCell>^4.9.5</TableCell>
                  <TableCell>لغة البرمجة المستخدمة</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Supabase</TableCell>
                  <TableCell>^2.47.2</TableCell>
                  <TableCell>قاعدة البيانات والمصادقة</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Tailwind CSS</TableCell>
                  <TableCell>^3.3.3</TableCell>
                  <TableCell>إطار عمل التنسيق</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>React Router</TableCell>
                  <TableCell>^6.26.2</TableCell>
                  <TableCell>إدارة التنقل</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Lucide React</TableCell>
                  <TableCell>^0.462.0</TableCell>
                  <TableCell>مكتبة الأيقونات</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>React Query</TableCell>
                  <TableCell>^5.56.2</TableCell>
                  <TableCell>إدارة حالات الطلبات</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Sonner</TableCell>
                  <TableCell>^1.4.0</TableCell>
                  <TableCell>مكتبة الإشعارات</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Recharts</TableCell>
                  <TableCell>^2.12.7</TableCell>
                  <TableCell>عرض الرسوم البيانية</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Zustand</TableCell>
                  <TableCell>^5.0.2</TableCell>
                  <TableCell>إدارة حالة التطبيق</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-4">هيكل المشروع</h3>
            <div className="space-y-2">
              <div className="border rounded-md p-3">
                <code className="text-sm">
                  <div><Badge variant="outline" className="mr-2">📁</Badge> src/</div>
                  <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> components/ - مكونات التطبيق المختلفة</div>
                  <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> events/ - مكونات الفعاليات</div>
                  <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> projects/ - مكونات المشاريع</div>
                  <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> tasks/ - مكونات المهام</div>
                  <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> layout/ - مكونات التخطيط العام</div>
                  <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> ui/ - مكونات واجهة المستخدم الأساسية</div>
                  <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> settings/ - مكونات الإعدادات</div>
                  <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> documentation/ - مكونات التوثيق</div>
                  <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> pages/ - صفحات التطبيق</div>
                  <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> hooks/ - الدوال الخطافية</div>
                  <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> integrations/ - تكامل مع الخدمات الخارجية</div>
                  <div className="mr-12"><Badge variant="outline" className="mr-2">📁</Badge> supabase/ - تكامل مع Supabase</div>
                  <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> store/ - مخازن حالة التطبيق</div>
                  <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> lib/ - مكتبات مساعدة</div>
                  <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> utils/ - دوال مساعدة</div>
                  <div className="mr-6"><Badge variant="outline" className="mr-2">📁</Badge> types/ - التعريفات النمطية</div>
                </code>
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div>
            <h3 className="text-lg font-semibold mb-4">متطلبات التثبيت</h3>
            <div className="space-y-2">
              <div className="border rounded-md p-3 bg-muted">
                <p className="mb-2">متطلبات البيئة:</p>
                <code className="text-sm block bg-card p-2 rounded">
                  Node.js &gt;= 18.x<br />
                  npm &gt;= 9.x
                </code>
                <p className="my-2">تثبيت التبعيات:</p>
                <code className="text-sm block bg-card p-2 rounded">
                  npm install
                </code>
                <p className="my-2">تشغيل التطبيق في بيئة التطوير:</p>
                <code className="text-sm block bg-card p-2 rounded">
                  npm run dev
                </code>
                <p className="my-2">بناء التطبيق للإنتاج:</p>
                <code className="text-sm block bg-card p-2 rounded">
                  npm run build
                </code>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
