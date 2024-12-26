import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Table, TableBody } from "@/components/ui/table";
import { ReportTableRow } from "./components/ReportTableRow";
import { ReportDeleteDialog } from "./components/ReportDeleteDialog";

export interface ReportListItemProps {
  report: {
    id: string;
    event_id: string;
    report_text: string;
    detailed_description: string;
    event_duration: string;
    attendees_count: string;
    event_objectives: string;
    impact_on_participants: string;
    photos: Array<{ url: string; description: string }>;
    created_at: string;
  };
  onDownload: (report: any) => void;
}

export const ReportListItem = ({ report, onDownload }: ReportListItemProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: event } = useQuery({
    queryKey: ["event", report.event_id],
    queryFn: async () => {
      console.log("Fetching event details for report:", report.event_id);
      const { data, error } = await supabase
        .from("events")
        .select("title")
        .eq("id", report.event_id)
        .single();

      if (error) {
        console.error("Error fetching event:", error);
        throw error;
      }
      console.log("Event data fetched:", data);
      return data;
    },
  });

  const handleDelete = async () => {
    try {
      console.log("Deleting report:", report.id);
      const { error } = await supabase
        .from('event_reports')
        .delete()
        .eq('id', report.id);

      if (error) {
        console.error("Error deleting report:", error);
        toast.error("حدث خطأ أثناء حذف التقرير");
        return;
      }

      toast.success("تم حذف التقرير بنجاح");
      await queryClient.invalidateQueries({ queryKey: ['event-reports', report.event_id] });
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error in handleDelete:", error);
      toast.error("حدث خطأ أثناء حذف التقرير");
    }
  };

  const parsedPhotos = report.photos?.map(photo => {
    if (typeof photo === 'string') {
      try {
        return JSON.parse(photo);
      } catch {
        return { url: photo, description: '' };
      }
    }
    return photo;
  }) || [];

  console.log("Parsed photos:", parsedPhotos);

  return (
    <>
      <div className="border rounded-lg overflow-hidden bg-white">
        <Table>
          <TableBody>
            <ReportTableRow
              isOpen={isOpen}
              setIsOpen={setIsOpen}
              report={{ ...report, photos: parsedPhotos }}
              eventTitle={event?.title}
              onDownload={() => onDownload(report)}
              onDelete={() => setIsDeleteDialogOpen(true)}
            />
          </TableBody>
        </Table>
      </div>

      <ReportDeleteDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleDelete}
      />
    </>
  );
};