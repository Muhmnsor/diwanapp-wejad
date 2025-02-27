
import { FC } from "react";
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
  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      console.log("Attempting to download file:", filePath);
      
      // نحتاج فقط اسم الملف من المسار الكامل
      const filePathParts = filePath.split('/');
      const actualFileName = filePathParts[filePathParts.length - 1];
      
      const { data, error } = await supabase.storage
        .from('idea-files')
        .download(actualFileName);

      if (error) {
        console.error('Error downloading file:', error);
        toast.error('حدث خطأ أثناء تحميل الملف');
        return;
      }

      if (!data) {
        console.error('No file data received');
        toast.error('الملف غير موجود');
        return;
      }

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
      console.error('Error in download process:', error);
      toast.error('حدث خطأ أثناء تحميل الملف');
    }
  };

  return (
    <section className="bg-white p-4 rounded-lg border border-purple-100">
      <h3 className="text-base font-semibold mb-2 text-neutral-950">الملفات الداعمة</h3>
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-lg text-sm">
          <thead>
            <tr className="bg-gray-50 rounded-t-lg">
              <th className="p-2 text-right text-gray-800 border-b first:rounded-tr-lg">اسم الملف</th>
              <th className="p-2 text-center text-gray-800 border-b last:rounded-tl-lg">التحميل</th>
            </tr>
          </thead>
          <tbody>
            {(!files || files.length === 0) ? (
              <tr>
                <td colSpan={2} className="p-3 text-center text-gray-500">
                  لا توجد ملفات داعمة
                </td>
              </tr>
            ) : (
              files.map((file, index) => (
                <tr key={index} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                  <td className="p-2 text-gray-700">{file.name}</td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => handleDownload(file.file_path, file.name)}
                      className="text-gray-600 hover:text-gray-700 hover:underline text-xs inline-flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      تحميل الملف
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
