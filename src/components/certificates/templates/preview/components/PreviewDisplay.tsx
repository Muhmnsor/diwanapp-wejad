
import { Card } from "@/components/ui/card";
import { Loader2, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface PreviewDisplayProps {
  previewUrl: string | null;
  isLoading?: boolean;
  isGenerating?: boolean;
  onRefresh?: () => void;
}

export const PreviewDisplay = ({ 
  previewUrl, 
  isLoading,
  isGenerating,
  onRefresh 
}: PreviewDisplayProps) => {
  const [isFrameLoading, setIsFrameLoading] = useState(true);

  useEffect(() => {
    if (previewUrl) {
      setIsFrameLoading(true);
    }
  }, [previewUrl]);

  if (isLoading) {
    return (
      <Card className="aspect-video w-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </Card>
    );
  }

  if (!previewUrl) {
    return (
      <Card className="aspect-video w-full flex flex-col items-center justify-center gap-4 p-4 text-muted-foreground">
        <div className="text-center">
          قم بتعبئة البيانات ثم اضغط على زر المعاينة
        </div>
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="text-xs flex items-center gap-1 text-primary hover:underline"
          >
            <RefreshCw className="h-3 w-3" /> تحديث المعاينة
          </button>
        )}
      </Card>
    );
  }

  return (
    <div className="relative">
      {isFrameLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {isGenerating && (
        <div className="absolute top-2 right-2 z-20">
          <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-md flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" /> 
            جاري إنشاء المعاينة...
          </span>
        </div>
      )}

      <Card className="aspect-video w-full overflow-hidden rounded-lg border">
        <iframe 
          src={previewUrl} 
          className="h-full w-full"
          title="معاينة القالب"
          onLoad={() => setIsFrameLoading(false)}
        />
      </Card>
    </div>
  );
};
