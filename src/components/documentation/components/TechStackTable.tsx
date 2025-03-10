
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const TechStackTable = () => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>التقنية</TableHead>
          <TableHead>الإصدار</TableHead>
          <TableHead>الاستخدام</TableHead>
          <TableHead>المسار</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell>React</TableCell>
          <TableCell>^18.3.1</TableCell>
          <TableCell>مكتبة بناء واجهات المستخدم</TableCell>
          <TableCell><code>src/App.tsx</code></TableCell>
        </TableRow>
        <TableRow>
          <TableCell>TypeScript</TableCell>
          <TableCell>^4.9.5</TableCell>
          <TableCell>لغة البرمجة المستخدمة</TableCell>
          <TableCell><code>src/types/</code></TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Supabase</TableCell>
          <TableCell>^2.47.2</TableCell>
          <TableCell>قاعدة البيانات والمصادقة</TableCell>
          <TableCell><code>src/integrations/supabase/</code></TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Tailwind CSS</TableCell>
          <TableCell>^3.3.3</TableCell>
          <TableCell>إطار عمل التنسيق</TableCell>
          <TableCell><code>tailwind.config.js</code></TableCell>
        </TableRow>
        <TableRow>
          <TableCell>React Router</TableCell>
          <TableCell>^6.26.2</TableCell>
          <TableCell>إدارة التنقل</TableCell>
          <TableCell><code>src/AppRoutes.tsx</code></TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Lucide React</TableCell>
          <TableCell>^0.462.0</TableCell>
          <TableCell>مكتبة الأيقونات</TableCell>
          <TableCell><code>import from 'lucide-react'</code></TableCell>
        </TableRow>
        <TableRow>
          <TableCell>React Query</TableCell>
          <TableCell>^5.56.2</TableCell>
          <TableCell>إدارة حالات الطلبات</TableCell>
          <TableCell><code>src/hooks/useQuery.tsx</code></TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Sonner</TableCell>
          <TableCell>^1.4.0</TableCell>
          <TableCell>مكتبة الإشعارات</TableCell>
          <TableCell><code>import from 'sonner'</code></TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Recharts</TableCell>
          <TableCell>^2.12.7</TableCell>
          <TableCell>عرض الرسوم البيانية</TableCell>
          <TableCell><code>src/components/charts/</code></TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Zustand</TableCell>
          <TableCell>^5.0.2</TableCell>
          <TableCell>إدارة حالة التطبيق</TableCell>
          <TableCell><code>src/store/</code></TableCell>
        </TableRow>
        <TableRow>
          <TableCell>PDF-Lib</TableCell>
          <TableCell>^1.17.1</TableCell>
          <TableCell>إنشاء وتعديل ملفات PDF</TableCell>
          <TableCell><code>src/components/certificates/</code></TableCell>
        </TableRow>
        <TableRow>
          <TableCell>XLSX</TableCell>
          <TableCell>^0.18.5</TableCell>
          <TableCell>تصدير البيانات إلى Excel</TableCell>
          <TableCell><code>src/components/admin/ExportButton.tsx</code></TableCell>
        </TableRow>
        <TableRow>
          <TableCell>html-to-image</TableCell>
          <TableCell>^1.11.11</TableCell>
          <TableCell>تحويل HTML إلى صور</TableCell>
          <TableCell><code>src/utils/exportUtils.ts</code></TableCell>
        </TableRow>
        <TableRow>
          <TableCell>JSZip</TableCell>
          <TableCell>^3.10.1</TableCell>
          <TableCell>ضغط الملفات</TableCell>
          <TableCell><code>src/components/ideas/details/</code></TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};
