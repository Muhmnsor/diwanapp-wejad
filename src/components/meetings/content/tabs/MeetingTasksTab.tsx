
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ClipboardList } from "lucide-react";

interface MeetingTasksTabProps {
  meetingId: string;
}

export const MeetingTasksTab: React.FC<MeetingTasksTabProps> = ({ meetingId }) => {
  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle>مهام الاجتماع</CardTitle>
        <Button variant="outline" size="sm">
          <PlusCircle className="h-4 w-4 ml-1" />
          إضافة مهمة
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8" dir="rtl">
          <ClipboardList className="h-12 w-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium mb-2">مهام الاجتماع</h3>
          <p className="text-gray-500 mb-6">
            ستتمكن قريباً من إضافة وإدارة المهام المرتبطة بهذا الاجتماع
            وربطها مع نظام إدارة المهام.
          </p>
          <Button variant="outline" disabled>
            <PlusCircle className="h-4 w-4 ml-1" />
            إضافة مهمة جديدة
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
