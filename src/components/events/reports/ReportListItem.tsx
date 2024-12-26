import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  CollapsibleTrigger,
  CollapsibleContent,
  Collapsible,
} from "@/components/ui/collapsible";
import { ReportHeader } from "./components/ReportHeader";
import { ReportContent } from "./components/ReportContent";
import { ReportPhotos } from "./components/ReportPhotos";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import JSZip from 'jszip';
import jsPDF from 'jspdf';

interface ReportListItemProps {
  report: {
    id: string;
    created_at: string;
    report_text: string;
    detailed_description: string;
    event_duration: string;
    attendees_count: string;
    event_objectives: string;
    impact_on_participants: string;
    photos: Array<{ url: string; description: string }>;
    event_id: string;
  };
  eventTitle?: string;
}

export const ReportListItem = ({
  report,
  eventTitle,
}: ReportListItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      console.log('Attempting to delete report:', report.id);
      
      const { error } = await supabase
        .from('event_reports')
        .delete()
        .eq('id', report.id);

      if (error) {
        console.error('Error deleting report:', error);
        toast.error('حدث خطأ أثناء حذف التقرير');
        return;
      }

      console.log('Report deleted successfully');
      await queryClient.invalidateQueries({
        queryKey: ['event-reports', report.event_id]
      });
      toast.success('تم حذف التقرير بنجاح');
    } catch (error) {
      console.error('Error in delete handler:', error);
      toast.error('حدث خطأ أثناء حذف التقرير');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      toast.info('جاري تحضير ملف PDF...');
      const doc = new jsPDF();
      
      // Add title
      doc.setFont("helvetica", "bold");
      doc.setFontSize(20);
      doc.text("تقرير الفعالية", 200, 20, { align: 'right' });
      
      // Add date
      doc.setFontSize(12);
      doc.text(`التاريخ: ${new Date(report.created_at).toLocaleDateString('ar')}`, 200, 30, { align: 'right' });
      
      // Add report content
      doc.setFont("helvetica", "normal");
      doc.text("نص التقرير:", 200, 40, { align: 'right' });
      doc.text(report.report_text, 200, 50, { align: 'right', maxWidth: 180 });
      
      let yPosition = 70;
      
      // Add details
      doc.text("التفاصيل:", 200, yPosition, { align: 'right' });
      yPosition += 10;
      doc.text(report.detailed_description, 200, yPosition, { align: 'right', maxWidth: 180 });
      
      yPosition += 30;
      
      // Add event info
      doc.text("معلومات الفعالية:", 200, yPosition, { align: 'right' });
      yPosition += 10;
      doc.text(`مدة الفعالية: ${report.event_duration}`, 200, yPosition, { align: 'right' });
      yPosition += 10;
      doc.text(`عدد المشاركين: ${report.attendees_count}`, 200, yPosition, { align: 'right' });
      
      yPosition += 20;
      
      // Add objectives
      doc.text("الأهداف:", 200, yPosition, { align: 'right' });
      yPosition += 10;
      doc.text(report.event_objectives, 200, yPosition, { align: 'right', maxWidth: 180 });
      
      yPosition += 30;
      
      // Add impact
      doc.text("الأثر على المشاركين:", 200, yPosition, { align: 'right' });
      yPosition += 10;
      doc.text(report.impact_on_participants, 200, yPosition, { align: 'right', maxWidth: 180 });
      
      // Add photos if available
      if (report.photos?.length) {
        doc.addPage();
        doc.text("الصور المرفقة:", 200, 20, { align: 'right' });
        
        for (let i = 0; i < report.photos.length; i++) {
          const photo = report.photos[i];
          try {
            const response = await fetch(photo.url);
            const blob = await response.blob();
            const base64 = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onloadend = () => resolve(reader.result);
              reader.readAsDataURL(blob);
            });
            
            doc.addImage(base64 as string, 'JPEG', 20, 40 + (i * 100), 170, 90);
            doc.text(photo.description || `صورة ${i + 1}`, 200, 35 + (i * 100), { align: 'right' });
            
            if ((i + 1) % 2 === 0 && i < report.photos.length - 1) {
              doc.addPage();
            }
          } catch (error) {
            console.error(`Error adding image ${i}:`, error);
          }
        }
      }
      
      doc.save(`تقرير-الفعالية-${new Date(report.created_at).toISOString().split('T')[0]}.pdf`);
      toast.success('تم تحميل التقرير بنجاح');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('حدث خطأ أثناء تحضير ملف PDF');
    }
  };

  const handleDownloadImages = async () => {
    if (!report.photos?.length) {
      toast.error('لا توجد صور مرفقة في هذا التقرير');
      return;
    }

    try {
      toast.info('جاري تحضير ملف الصور...');
      const zip = new JSZip();
      const imagesFolder = zip.folder("صور-التقرير");

      // Download all images
      const downloadPromises = report.photos.map(async (photo, index) => {
        try {
          const response = await fetch(photo.url);
          const blob = await response.blob();
          const extension = photo.url.split('.').pop() || 'jpg';
          const fileName = `صورة-${index + 1}-${photo.description || ''}.${extension}`;
          imagesFolder?.file(fileName, blob);
        } catch (error) {
          console.error(`Error downloading image ${index}:`, error);
        }
      });

      await Promise.all(downloadPromises);

      // Generate and download zip file
      const content = await zip.generateAsync({ type: "blob" });
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `صور-التقرير-${new Date(report.created_at).toISOString().split('T')[0]}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.success('تم تحميل الصور بنجاح');
    } catch (error) {
      console.error('Error creating zip file:', error);
      toast.error('حدث خطأ أثناء تحميل الصور');
    }
  };

  return (
    <TableRow className="hover:bg-muted/0">
      <TableCell className="p-4">
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon">
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                  </Button>
                </CollapsibleTrigger>
                {eventTitle && (
                  <div className="text-sm font-medium">{eventTitle}</div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  {new Date(report.created_at).toLocaleDateString('ar')}
                </div>
                <ReportHeader
                  createdAt={report.created_at}
                  onDelete={handleDelete}
                  onDownloadPDF={handleDownloadPDF}
                  onDownloadImages={handleDownloadImages}
                  isDeleting={isDeleting}
                  eventTitle={eventTitle}
                />
              </div>
            </div>

            <CollapsibleContent>
              <div className="space-y-6 pt-4">
                <ReportContent report={report} />
                <Separator />
                <ReportPhotos photos={report.photos} />
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </TableCell>
    </TableRow>
  );
};