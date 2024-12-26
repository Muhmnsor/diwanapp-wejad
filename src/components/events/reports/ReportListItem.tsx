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

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-4 border rounded-lg p-4">
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
  );
};