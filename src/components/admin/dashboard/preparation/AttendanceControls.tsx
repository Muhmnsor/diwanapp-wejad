import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, UserCheck } from "lucide-react";
import { BarcodeDialog } from "./scanner/BarcodeDialog";
import { GroupDialog } from "./dialogs/GroupDialog";

interface AttendanceControlsProps {
  onBarcodeScanned: (code: string) => void;
  onGroupAction: (status: 'present' | 'absent') => void;
}

export const AttendanceControls: FC<AttendanceControlsProps> = ({
  onBarcodeScanned,
  onGroupAction,
}) => {
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);

  return (
    <div className="flex gap-2 mb-4">
      <Button
        variant="outline"
        onClick={() => setShowBarcodeDialog(true)}
        className="flex-1"
      >
        <QrCode className="h-4 w-4 ml-2" />
        تحضير بالباركود
      </Button>
      <Button
        variant="outline"
        onClick={() => setShowGroupDialog(true)}
        className="flex-1"
      >
        <UserCheck className="h-4 w-4 ml-2" />
        تحضير جماعي
      </Button>

      <BarcodeDialog
        open={showBarcodeDialog}
        onOpenChange={setShowBarcodeDialog}
        onBarcodeScanned={onBarcodeScanned}
      />

      <GroupDialog
        open={showGroupDialog}
        onOpenChange={setShowGroupDialog}
        onGroupAction={onGroupAction}
      />
    </div>
  );
};