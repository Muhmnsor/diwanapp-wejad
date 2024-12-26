import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  CollapsibleTrigger,
  CollapsibleContent,
  Collapsible,
} from "@/components/ui/collapsible";
import { ReportHeader } from "./ReportHeader";
import { ReportContent } from "./ReportContent";
import { ReportPhotos } from "./ReportPhotos";
import { Separator } from "@/components/ui/separator";

interface ReportTableRowProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  report: {
    created_at: string;
    report_text: string;
    detailed_description: string;
    event_duration: string;
    attendees_count: string;
    event_objectives: string;
    impact_on_participants: string;
    photos: Array<{ url: string; description: string }>;
  };
  eventTitle?: string;
  onDownloadPDF: () => void;
  onDownloadImages: () => void;
  onDelete: () => void;
}

export const ReportTableRow = ({
  isOpen,
  setIsOpen,
  report,
  eventTitle,
  onDownloadPDF,
  onDownloadImages,
  onDelete,
}: ReportTableRowProps) => {
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
                  onDownloadPDF={onDownloadPDF}
                  onDownloadImages={onDownloadImages}
                  onDelete={onDelete}
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