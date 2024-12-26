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
import { downloadReportWithImages } from "./utils/downloadUtils";

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
    photos: string[];  // Updated type to match database storage format
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

  const handleDownload = async () => {
    try {
      toast.info('جاري تحضير الملف...');
      const success = await downloadReportWithImages(report, eventTitle);
      if (success) {
        toast.success('تم تحميل التقرير بنجاح');
      } else {
        toast.error('حدث خطأ أثناء تحميل التقرير');
      }
    } catch (error) {
      console.error('Error downloading report:', error);
      toast.error('حدث خطأ أثناء تحميل التقرير');
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
                  onDownload={handleDownload}
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