import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, RefreshCw } from "lucide-react";
import { useAsanaSync } from "@/hooks/useAsanaSync";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AsanaSyncSettingsProps {
  departmentId: string;
}

export const AsanaSyncSettings = ({ departmentId }: AsanaSyncSettingsProps) => {
  const {
    syncStatus,
    isLoading,
    isSyncing,
    updateSyncSettings,
    triggerSync
  } = useAsanaSync(departmentId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  const handleSyncEnabledChange = (enabled: boolean) => {
    updateSyncSettings({
      ...syncStatus,
      sync_enabled: enabled
    });
  };

  const handleIntervalChange = (value: string) => {
    updateSyncSettings({
      ...syncStatus,
      sync_interval: parseInt(value)
    });
  };

  const handleCommentsChange = (enabled: boolean) => {
    updateSyncSettings({
      ...syncStatus,
      sync_comments: enabled
    });
  };

  const handleAttachmentsChange = (enabled: boolean) => {
    updateSyncSettings({
      ...syncStatus,
      sync_attachments: enabled
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">إعدادات المزامنة مع Asana</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => triggerSync()}
          disabled={isSyncing || !syncStatus?.sync_enabled}
        >
          {isSyncing ? (
            <Loader2 className="h-4 w-4 animate-spin ml-2" />
          ) : (
            <RefreshCw className="h-4 w-4 ml-2" />
          )}
          مزامنة يدوية
        </Button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">تفعيل المزامنة التلقائية</label>
          <Switch
            checked={syncStatus?.sync_enabled}
            onCheckedChange={handleSyncEnabledChange}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">فترة المزامنة</label>
          <Select
            value={String(syncStatus?.sync_interval)}
            onValueChange={handleIntervalChange}
            disabled={!syncStatus?.sync_enabled}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">كل 5 دقائق</SelectItem>
              <SelectItem value="15">كل 15 دقيقة</SelectItem>
              <SelectItem value="30">كل 30 دقيقة</SelectItem>
              <SelectItem value="60">كل ساعة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">مزامنة التعليقات</label>
          <Switch
            checked={syncStatus?.sync_comments}
            onCheckedChange={handleCommentsChange}
            disabled={!syncStatus?.sync_enabled}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">مزامنة المرفقات</label>
          <Switch
            checked={syncStatus?.sync_attachments}
            onCheckedChange={handleAttachmentsChange}
            disabled={!syncStatus?.sync_enabled}
          />
        </div>
      </div>

      {syncStatus?.last_sync && (
        <p className="text-sm text-gray-500 mt-4">
          آخر مزامنة: {new Date(syncStatus.last_sync).toLocaleString('ar-SA')}
        </p>
      )}
    </Card>
  );
};