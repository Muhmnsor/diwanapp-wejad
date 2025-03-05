
import { Button } from "@/components/ui/button";

interface AttachmentExpandButtonProps {
  showAll: boolean;
  setShowAll: (show: boolean) => void;
  totalCount: number;
}

export const AttachmentExpandButton = ({ 
  showAll, 
  setShowAll, 
  totalCount 
}: AttachmentExpandButtonProps) => {
  return (
    <Button 
      variant="link" 
      size="sm" 
      className="text-xs" 
      onClick={() => setShowAll(!showAll)}
    >
      {showAll ? 'عرض أقل' : `عرض كل المرفقات (${totalCount})`}
    </Button>
  );
};
