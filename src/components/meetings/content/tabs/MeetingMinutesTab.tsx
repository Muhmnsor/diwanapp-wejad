
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Save } from "lucide-react";

interface MeetingMinutesTabProps {
  meetingId: string;
}

export const MeetingMinutesTab: React.FC<MeetingMinutesTabProps> = ({ meetingId }) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>محضر الاجتماع</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center py-4">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-2">إعداد محضر الاجتماع</h3>
            <p className="text-gray-500 mb-6">
              قم بتسجيل محضر الاجتماع ليتم حفظه ومشاركته مع المشاركين.
              سيتم تطوير هذه الميزة قريباً لتشمل إمكانيات إضافية.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="minutes-content" className="block text-sm font-medium text-gray-700 mb-1">
                محتوى المحضر
              </label>
              <Textarea
                id="minutes-content"
                placeholder="اكتب محضر الاجتماع هنا..."
                className="resize-y min-h-[200px]"
              />
            </div>

            <div>
              <label htmlFor="minutes-decisions" className="block text-sm font-medium text-gray-700 mb-1">
                القرارات المتخذة
              </label>
              <Textarea
                id="minutes-decisions"
                placeholder="اكتب القرارات المتخذة خلال الاجتماع..."
                className="resize-y min-h-[150px]"
              />
            </div>

            <div>
              <label htmlFor="minutes-notes" className="block text-sm font-medium text-gray-700 mb-1">
                ملاحظات إضافية
              </label>
              <Textarea
                id="minutes-notes"
                placeholder="أي ملاحظات إضافية..."
                className="resize-y"
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end pt-4">
        <Button variant="outline" className="ml-2">
          معاينة
        </Button>
        <Button disabled>
          <Save className="h-4 w-4 ml-1" />
          حفظ المحضر
        </Button>
      </CardFooter>
    </Card>
  );
};
