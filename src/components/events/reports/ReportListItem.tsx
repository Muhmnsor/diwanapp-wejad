import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportHeader } from "./components/ReportHeader";
import { ReportContent } from "./components/ReportContent";
import { ReportPhotos } from "./components/ReportPhotos";
import { ReportDeleteDialog } from "./components/ReportDeleteDialog";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table";

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
        throw error;
      }

      toast.success("تم حذف التقرير بنجاح");
      queryClient.invalidateQueries({ queryKey: ['event-reports'] });
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
            <TableRow className="hover:bg-muted/0">
              <TableCell className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon">
                        {isOpen ? <ChevronUp /> : <ChevronDown />}
                      </Button>
                    </CollapsibleTrigger>
                    <ReportHeader 
                      createdAt={report.created_at} 
                      onDownload={() => onDownload(report)}
                      onDelete={() => setIsDeleteDialogOpen(true)}
                      eventTitle={event?.title}
                    />
                  </div>
                </div>

                <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                  <CollapsibleContent>
                    <div className="space-y-6 pt-4">
                      <ReportContent report={report} />
                      <Separator />
                      <ReportPhotos photos={parsedPhotos} />
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </TableCell>
            </TableRow>
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