import { TableCell, TableRow } from "@/components/ui/table";
import { ProjectActivityReport } from "@/types/projectActivityReport";
import { ReportTableActions } from "./ReportTableActions";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import JSZip from "jszip";

interface ReportTableRowProps {
  report: ProjectActivityReport;
}

export const ReportTableRow = ({ report }: ReportTableRowProps) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      console.log('Deleting report:', report.id);

      const { error } = await supabase
        .from('project_activity_reports')
        .delete()
        .eq('id', report.id);

      if (error) {
        console.error('Error deleting report:', error);
        toast.error('حدث خطأ أثناء حذف التقرير');
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: ['project-activity-reports', report.project_id]
      });
      toast.success('تم حذف التقرير بنجاح');
    } catch (error) {
      console.error('Error in delete handler:', error);
      toast.error('حدث خطأ أثناء حذف التقرير');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownload = async () => {
    try {
      console.log('Downloading report:', report);
      toast.info('جاري تحضير الملف...');

      const zip = new JSZip();

      const reportContent = `تقرير النشاط

اسم البرنامج: ${report.program_name || 'غير محدد'}
اسم التقرير: ${report.report_name}
التاريخ: ${new Date(report.created_at).toLocaleDateString('ar')}

نص التقرير:
${report.report_text}

التفاصيل:
${report.detailed_description || ''}

معلومات النشاط:
- المدة: ${report.activity_duration || 'غير محدد'}
- عدد المشاركين: ${report.attendees_count || 'غير محدد'}

الأهداف:
${report.activity_objectives || 'غير محدد'}

الأثر على المشاركين:
${report.impact_on_participants || 'غير محدد'}

الصور المرفقة:
${report.photos?.map((photo, index) => {
  const parsedPhoto = typeof photo === 'string' ? JSON.parse(photo) : photo;
  return `${index + 1}. ${parsedPhoto.description || `صورة ${index + 1}`}`;
}).join('\n') || 'لا توجد صور مرفقة'}`;

      zip.file('تقرير-النشاط.txt', reportContent);

      const imagesFolder = zip.folder("الصور");
      if (!imagesFolder) throw new Error('Failed to create images folder');

      if (report.photos && report.photos.length > 0) {
        const downloadPromises = report.photos.map(async (photo, index) => {
          const parsedPhoto = typeof photo === 'string' ? JSON.parse(photo) : photo;
          if (!parsedPhoto.url) {
            console.log(`Skipping empty photo at index ${index}`);
            return;
          }

          try {
            console.log(`Downloading image ${index + 1}:`, parsedPhoto.url);
            const response = await fetch(parsedPhoto.url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const blob = await response.blob();
            const extension = parsedPhoto.url.split('.').pop() || 'jpg';
            const fileName = `صورة-${index + 1}-${parsedPhoto.description || ''}.${extension}`;
            
            imagesFolder.file(fileName, blob);
          } catch (error) {
            console.error(`Error downloading image ${index}:`, error);
          }
        });

        await Promise.all(downloadPromises);
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `تقرير-${report.report_name}-${new Date(report.created_at).toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تحميل التقرير بنجاح');
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('حدث خطأ أثناء تحميل التقرير');
    }
  };

  return (
    <TableRow>
      <TableCell className="text-right w-1/3">
        {report.report_name}
      </TableCell>
      <TableCell className="text-right w-1/3">
        {report.profiles?.email || 'غير معروف'}
      </TableCell>
      <TableCell className="text-right w-1/3">
        {new Date(report.created_at).toLocaleDateString('ar')}
      </TableCell>
      <TableCell className="text-center w-[100px]">
        <ReportTableActions
          onDelete={handleDelete}
          onDownload={handleDownload}
          isDeleting={isDeleting}
        />
      </TableCell>
    </TableRow>
  );
};