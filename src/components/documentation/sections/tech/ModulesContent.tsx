
import { SubsystemTable } from "./SubsystemTable";
import { CodeBlock } from "../../components/CodeBlock";

export const ModulesContent = () => {
  return (
    <div className="space-y-6">
      <div className="bg-muted p-4 rounded-md mb-6">
        <h3 className="text-base font-semibold mb-2">تفاعل الوحدات الرئيسية</h3>
        <p className="text-sm mb-2">توضح الصورة التالية كيفية تفاعل الوحدات الرئيسية في النظام:</p>
        <div className="border-2 border-dashed border-primary/30 rounded-md p-4 text-center text-muted-foreground">
          مخطط تفاعل الوحدات الرئيسية (يتم تحميله من مخزن الملفات)
        </div>
      </div>
      
      <div>
        <h4 className="font-medium mb-2">إدارة الملفات</h4>
        <div className="bg-card p-3 rounded-md mb-3">
          <p className="text-sm">
            نظام متكامل لإدارة الملفات ومعالجتها وتخزينها بطريقة آمنة وفعالة.
          </p>
        </div>
        <SubsystemTable
          title=""
          description=""
          items={[
            {
              component: "أنواع الملفات المدعومة",
              details: [
                "مستندات: PDF, DOCX, TXT, RTF, ODT",
                "جداول بيانات: XLSX, CSV, ODS",
                "عروض تقديمية: PPTX, ODP",
                "صور: JPG, PNG, SVG, GIF, WEBP",
                "ملفات مضغوطة: ZIP, RAR (للتحميل فقط)"
              ]
            },
            {
              component: "حدود وقيود الملفات",
              details: [
                "الحد الأقصى لحجم الملف: 50 ميجابايت",
                "الحد الأقصى للملفات في المرفق الواحد: 10 ملفات",
                "الحد الأقصى للتخزين لكل مستخدم: 5 جيجابايت",
                "قيود تنزيل الملفات: 100 ملف في اليوم لكل مستخدم",
                "أنواع ملفات محظورة: EXE, BAT, COM, CMD"
              ]
            },
            {
              component: "آلية المعالجة والضغط",
              details: [
                "ضغط تلقائي للصور مع الحفاظ على الجودة",
                "تحويل المستندات إلى PDF للعرض المباشر",
                "استخراج البيانات الوصفية من الملفات",
                "فحص الملفات للتأكد من خلوها من البرامج الضارة",
                "توليد صور مصغرة للملفات للعرض السريع"
              ]
            },
            {
              component: "نظام النسخ الاحتياطي",
              details: [
                "نسخ احتياطي تلقائي يومي لجميع الملفات",
                "احتفاظ بنسخة لمدة 30 يوم للملفات المحذوفة",
                "استعادة الملفات من سلة المحذوفات",
                "نسخ احتياطي عند الطلب للملفات المهمة",
                "تصدير نسخ متعددة من الملفات الهامة"
              ]
            }
          ]}
          path=""
        />
        <div className="mt-2 mb-4">
          <h5 className="text-sm font-medium mb-2">مثال على استخدام وحدة الملفات:</h5>
          <CodeBlock
            code={`import { fileUploader } from '@/utils/files/uploader';

// رفع ملف واحد
const uploadSingleFile = async (file, category = 'documents') => {
  try {
    const result = await fileUploader.uploadFile({
      file,
      category,
      maxSize: 50 * 1024 * 1024, // 50MB
      allowedTypes: ['application/pdf', 'image/jpeg', 'image/png']
    });
    
    return result.fileUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw new Error('فشل في رفع الملف: ' + error.message);
  }
};

// رفع ملفات متعددة
const uploadMultipleFiles = async (files, category = 'attachments') => {
  try {
    const uploadPromises = Array.from(files).map(file => 
      fileUploader.uploadFile({
        file,
        category,
        generateThumbnail: true,
        compressImages: true
      })
    );
    
    const results = await Promise.all(uploadPromises);
    return results.map(r => ({ 
      url: r.fileUrl, 
      name: r.fileName,
      type: r.fileType,
      size: r.fileSize
    }));
  } catch (error) {
    console.error('Error uploading multiple files:', error);
    throw new Error('فشل في رفع الملفات: ' + error.message);
  }
};`}
            language="typescript"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          المسار: <code>src/utils/files/</code>
        </div>
      </div>
      
      <SubsystemTable
        title="معالجة التقارير"
        description="نظام شامل لإنشاء وتصدير وإدارة التقارير بمختلف الصيغ والأنواع."
        items={[
          {
            component: "قوالب التقارير المتاحة",
            details: [
              "تقارير إحصائية (رسوم بيانية وجداول)",
              "تقارير تفصيلية للمشاريع والفعاليات",
              "تقارير مالية (مصروفات، إيرادات، ميزانيات)",
              "تقارير أداء (مؤشرات، مقارنات، اتجاهات)",
              "تقارير تشغيلية (نشاط المستخدمين، استخدام النظام)"
            ]
          },
          {
            component: "خيارات التصدير",
            details: [
              "PDF: تقارير منسقة للطباعة والمشاركة",
              "Excel: بيانات مفصلة قابلة للتحليل",
              "CSV: تصدير البيانات الخام",
              "PNG/JPG: تصدير الرسوم البيانية كصور",
              "HTML: تقارير تفاعلية للعرض الإلكتروني"
            ]
          },
          {
            component: "معالجة البيانات الإحصائية",
            details: [
              "تجميع وتلخيص البيانات تلقائياً",
              "حساب المؤشرات والإحصاءات الرئيسية",
              "تحليل الاتجاهات والتنبؤات",
              "مقارنات مع فترات سابقة",
              "تصفية وفرز البيانات حسب معايير متعددة"
            ]
          }
        ]}
        path="src/utils/reports/"
      />
    </div>
  );
};
