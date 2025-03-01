
import { FC, useState } from "react";
import { Download } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SupportingFile {
  name: string;
  file_path: string;
}

interface IdeaSupportingFilesSectionProps {
  files: SupportingFile[];
}

export const IdeaSupportingFilesSection: FC<IdeaSupportingFilesSectionProps> = ({ files }) => {
  const [downloadingFile, setDownloadingFile] = useState<string | null>(null);

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      setDownloadingFile(fileName);
      console.log("=== محاولة تنزيل ملف ===");
      console.log("اسم الملف:", fileName);
      console.log("مسار الملف:", filePath);
      
      // نحتاج فقط اسم الملف من المسار الكامل
      const filePathParts = filePath.split('/');
      const actualFileName = filePathParts[filePathParts.length - 1];
      
      console.log("اسم الملف الفعلي المستخدم للتنزيل:", actualFileName);
      
      // تحقق من نوع الملف (للتتبع)
      const isPDF = fileName.toLowerCase().endsWith('.pdf');
      console.log("هل الملف بتنسيق PDF؟", isPDF);
      
      // طريقة 1: جلب عنوان URL العام
      try {
        console.log("محاولة الحصول على URL عام للملف...");
        const { data: urlData } = supabase.storage
          .from('idea-files')
          .getPublicUrl(actualFileName);
          
        if (urlData?.publicUrl) {
          console.log("تم الحصول على URL عام:", urlData.publicUrl);
          
          const fetchResponse = await fetch(urlData.publicUrl);
          
          if (fetchResponse.ok) {
            console.log("تم جلب البيانات بنجاح");
            console.log("نوع المحتوى:", fetchResponse.headers.get('content-type'));
            
            const blob = await fetchResponse.blob();
            
            if (blob && blob.size > 0) {
              console.log("تم تنزيل الملف بنجاح، حجم الملف:", blob.size);
              
              // إنشاء رابط للتحميل
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = fileName;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
              
              toast.success('تم تحميل الملف بنجاح');
              setDownloadingFile(null);
              return;
            }
          } else {
            console.warn("فشل جلب البيانات من URL العام:", fetchResponse.status);
          }
        } else {
          console.warn("لم يتم الحصول على URL عام صالح");
        }
      } catch (publicUrlError) {
        console.warn("خطأ في محاولة التنزيل باستخدام URL عام:", publicUrlError);
      }
      
      // طريقة 2: التنزيل المباشر
      console.log("محاولة التنزيل المباشر للملف...");
      const { data, error } = await supabase.storage
        .from('idea-files')
        .download(actualFileName);

      if (error) {
        console.error('خطأ في تنزيل الملف:', error);
        
        // محاولة تنزيل الملف باستخدام المسار الكامل
        console.log("محاولة التنزيل باستخدام المسار الكامل:", filePath);
        const { data: fullPathData, error: fullPathError } = await supabase.storage
          .from('idea-files')
          .download(filePath);
          
        if (fullPathError) {
          console.error('خطأ في تنزيل الملف بالمسار الكامل:', fullPathError);
          toast.error('حدث خطأ أثناء تحميل الملف');
          setDownloadingFile(null);
          return;
        }
        
        if (!fullPathData) {
          console.error('لم يتم استلام بيانات الملف');
          toast.error('الملف غير موجود');
          setDownloadingFile(null);
          return;
        }
        
        console.log("تم تنزيل الملف باستخدام المسار الكامل بنجاح");
        console.log("نوع المحتوى:", fullPathData.type);
        console.log("حجم الملف:", fullPathData.size);
        
        // إنشاء رابط للتحميل
        const url = window.URL.createObjectURL(fullPathData);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('تم تحميل الملف بنجاح');
        setDownloadingFile(null);
        return;
      }

      if (!data) {
        console.error('لم يتم استلام بيانات الملف');
        toast.error('الملف غير موجود');
        setDownloadingFile(null);
        return;
      }
      
      console.log("تم تنزيل الملف بنجاح من التنزيل المباشر");
      console.log("نوع المحتوى:", data.type);
      console.log("حجم الملف:", data.size);

      // إنشاء رابط للتحميل
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تحميل الملف بنجاح');
    } catch (error) {
      console.error('خطأ في عملية التنزيل:', error);
      toast.error('حدث خطأ أثناء تحميل الملف');
    } finally {
      setDownloadingFile(null);
    }
  };

  return (
    <section className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">الملفات الداعمة</h3>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg">
          <thead>
            <tr className="bg-gray-100 rounded-t-lg">
              <th className="p-3 text-right text-gray-800 border-b first:rounded-tr-lg">اسم الملف</th>
              <th className="p-3 text-center text-gray-800 border-b last:rounded-tl-lg">التحميل</th>
            </tr>
          </thead>
          <tbody>
            {(!files || files.length === 0) ? (
              <tr>
                <td colSpan={2} className="p-4 text-center text-gray-500">
                  لا توجد ملفات داعمة
                </td>
              </tr>
            ) : (
              files.map((file, index) => (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-3 text-gray-700">{file.name}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDownload(file.file_path, file.name)}
                      className="text-gray-600 hover:text-gray-700 hover:underline text-sm inline-flex items-center gap-1"
                      disabled={downloadingFile === file.name}
                    >
                      <Download className="h-4 w-4" />
                      {downloadingFile === file.name ? 'جاري التحميل...' : 'تحميل الملف'}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};
