
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AttachmentExpandButtonProps {
  showAll: boolean;
  setShowAll: (showAll: boolean) => void;
  totalCount: number;
}

export const AttachmentExpandButton = ({
  showAll,
  setShowAll,
  totalCount
}: AttachmentExpandButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-full text-xs flex items-center justify-center gap-1"
      onClick={() => setShowAll(!showAll)}
    >
      {showAll ? (
        <>
          <span>عرض أقل</span>
          <ChevronUp className="h-3.5 w-3.5" />
        </>
      ) : (
        <>
          <span>عرض الكل ({totalCount})</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </>
      )}
    </Button>
  );
};
