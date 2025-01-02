import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Trash2 } from "lucide-react";

interface PhotoCardProps {
  photo: {
    url: string;
    description: string;
  };
  index: number;
  onDelete: () => void;
  onDescriptionChange: (description: string) => void;
  placeholder?: string;
}

export const PhotoCard = ({
  photo,
  onDelete,
}: PhotoCardProps) => {
  return (
    <Card className="p-4 space-y-4">
      <div className="relative aspect-video">
        <img
          src={photo.url}
          alt="صورة النشاط"
          className="rounded-md object-cover w-full h-full"
        />
      </div>

      <div className="space-y-2">
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="w-full"
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          حذف الصورة
        </Button>
      </div>
    </Card>
  );
};