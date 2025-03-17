
import { PaperclipIcon } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RequestAttachment {
  id: string;
  file_name: string;
  uploader?: {
    display_name?: string;
    email?: string;
  };
}

interface RequestAttachmentsTabProps {
  attachments: RequestAttachment[];
}

export const RequestAttachmentsTab = ({ attachments }: RequestAttachmentsTabProps) => {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="text-center py-8" dir="rtl">
        <p className="text-muted-foreground">لا توجد مرفقات</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4" dir="rtl">
      {attachments.map((attachment) => (
        <Card key={attachment.id}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <PaperclipIcon className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">{attachment.file_name}</p>
                <p className="text-sm text-muted-foreground">
                  تم الرفع بواسطة: {attachment.uploader?.display_name || attachment.uploader?.email || "غير معروف"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end p-4 pt-0">
            <Button variant="outline" size="sm">
              تنزيل الملف
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};
