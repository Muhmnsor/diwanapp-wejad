import { FC, useState } from "react";
import { Button } from "@/components/ui/button";
import { QrCode, UserCheck, Camera, Keyboard } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

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
  const [isScanning, setIsScanning] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    let scanner: Html5QrcodeScanner | null = null;

    if (showBarcodeDialog && isScanning) {
      scanner = new Html5QrcodeScanner(
        "reader",
        { 
          fps: 10,
          qrbox: isMobile ? 250 : 300,
          aspectRatio: 1.0,
        },
        false
      );

      scanner.render((decodedText) => {
        console.log("Barcode scanned:", decodedText);
        onBarcodeScanned(decodedText);
        setShowBarcodeDialog(false);
        if (scanner) {
          scanner.clear();
        }
      }, (error) => {
        console.error("QR scan error:", error);
      });
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [showBarcodeDialog, isScanning, onBarcodeScanned, isMobile]);

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
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>تحضير بالباركود</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2 justify-center">
              <Button
                variant={isScanning ? "default" : "outline"}
                onClick={() => setIsScanning(true)}
                className="flex-1"
              >
                <Camera className="h-4 w-4 ml-2" />
                مسح بالكاميرا
              </Button>
              <Button
                variant={!isScanning ? "default" : "outline"}
                onClick={() => setIsScanning(false)}
                className="flex-1"
              >
                <Keyboard className="h-4 w-4 ml-2" />
                إدخال يدوي
              </Button>
            </div>

            {isScanning ? (
              <div id="reader" className="w-full" />
            ) : (
              <div className="space-y-2">
                <Label>رقم التسجيل</Label>
                <Input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder="ادخل رقم التسجيل"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleBarcodeSubmit();
                    }
                  }}
                />
                <Button onClick={handleBarcodeSubmit} className="w-full">
                  تحضير
                </Button>
              </div>
            )}
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