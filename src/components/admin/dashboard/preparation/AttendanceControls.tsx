import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, UserCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AttendanceControlsProps {
  onBarcodeScanned: (code: string) => void;
  onGroupAttendance: (status: 'present' | 'absent') => void;
}

export const AttendanceControls: FC<AttendanceControlsProps> = ({ 
  onBarcodeScanned,
  onGroupAttendance
}) => {
  const [showBarcodeDialog, setShowBarcodeDialog] = useState(false);
  const [showGroupDialog, setShowGroupDialog] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');

  const handleBarcodeSubmit = () => {
    if (barcodeInput.trim()) {
      onBarcodeScanned(barcodeInput.trim());
      setBarcodeInput('');
      setShowBarcodeDialog(false);
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#1A1F2C]">تحضير المشاركين</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowBarcodeDialog(true)}
          >
            <QrCode className="h-4 w-4 ml-2" />
            تحضير بالباركود
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowGroupDialog(true)}
          >
            <UserCheck className="h-4 w-4 ml-2" />
            تحضير جماعي
          </Button>
        </div>
      </div>

      {/* Barcode Dialog */}
      <Dialog open={showBarcodeDialog} onOpenChange={setShowBarcodeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تحضير بالباركود</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>رقم الباركود</Label>
              <Input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="ادخل رقم الباركود"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleBarcodeSubmit();
                  }
                }}
              />
            </div>
            <Button onClick={handleBarcodeSubmit} className="w-full">
              تحضير
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Group Attendance Dialog */}
      <Dialog open={showGroupDialog} onOpenChange={setShowGroupDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تحضير جماعي</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              سيتم تطبيق الإجراء على جميع المشاركين الذين لم يتم تحضيرهم بعد
            </p>
            <div className="flex gap-2">
              <Button
                onClick={() => {
                  onGroupAttendance('present');
                  setShowGroupDialog(false);
                }}
                className="flex-1"
                variant="outline"
              >
                تحضير الجميع
              </Button>
              <Button
                onClick={() => {
                  onGroupAttendance('absent');
                  setShowGroupDialog(false);
                }}
                className="flex-1"
                variant="outline"
              >
                تغييب الجميع
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};