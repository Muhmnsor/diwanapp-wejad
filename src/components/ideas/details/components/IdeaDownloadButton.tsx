
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import { IdeaExportDialog } from "./export/IdeaExportDialog";

interface IdeaDownloadButtonProps {
  ideaId: string;
  ideaTitle: string;
}

export const IdeaDownloadButton = ({ ideaId, ideaTitle }: IdeaDownloadButtonProps) => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsExportDialogOpen(true)}
        size="sm"
        variant="outline" 
        className="text-xs flex items-center gap-1 text-blue-600 border-blue-200 hover:bg-blue-50 hover:text-blue-700"
      >
        <FileDown size={14} />
        تصدير الفكرة
      </Button>

      <IdeaExportDialog
        open={isExportDialogOpen}
        onOpenChange={setIsExportDialogOpen}
        ideaId={ideaId}
        ideaTitle={ideaTitle}
      />
    </>
  );
};
