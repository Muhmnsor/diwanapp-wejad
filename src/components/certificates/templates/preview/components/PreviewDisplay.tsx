import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface PreviewDisplayProps {
  previewUrl: string | null;
  isLoading?: boolean;
}

export const PreviewDisplay = ({ previewUrl, isLoading }: PreviewDisplayProps) => {
  if (isLoading) {
    return (
      <Card className="aspect-video w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  if (!previewUrl) {
    return (
      <Card className="aspect-video w-full flex items-center justify-center text-muted-foreground">
        قم بتعبئة البيانات ثم اضغط على زر المعاينة
      </Card>
    );
  }

  return (
    <Card className="aspect-video w-full overflow-hidden rounded-lg border">
      <iframe 
        src={previewUrl} 
        className="h-full w-full"
        title="معاينة القالب"
      />
    </Card>
  );
};