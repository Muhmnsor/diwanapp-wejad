import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Trash2 } from "lucide-react";
import Image from "@/components/ui/image";

interface PhotoCardProps {
  photo: { url: string; description: string };
  index: number;
  onDelete: () => void;
  onDescriptionChange: (description: string) => void;
}

export const PhotoCard = ({
  photo,
  index,
  onDelete,
  onDescriptionChange,
}: PhotoCardProps) => {
  return (
    <Card className="p-4 space-y-4">
      <div className="relative aspect-video">
        <Image
          src={photo.url}
          alt={`صورة ${index + 1}`}
          className="rounded-md object-cover"
        />
      </div>
      
      <div className="space-y-2">
        <Input
          placeholder="وصف الصورة"
          value={photo.description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
        
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