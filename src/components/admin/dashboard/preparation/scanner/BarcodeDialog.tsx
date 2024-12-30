import { FC, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Keyboard } from "lucide-react";
import { QRScanner } from "./QRScanner";
import { ManualInput } from "./ManualInput";

interface BarcodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBarcodeScanned: (code: string) => void;
}

export const BarcodeDialog: FC<BarcodeDialogProps> = ({
  open,
  onOpenChange,
  onBarcodeScanned,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');

  const handleBarcodeSubmit = () => {
    if (barcodeInput.trim()) {
      onBarcodeScanned(barcodeInput);
      setBarcodeInput('');
      onOpenChange(false);
    }
  };

  const handleScan = (code: string) => {
    onBarcodeScanned(code);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <QRScanner onScan={handleScan} />
          ) : (
            <ManualInput
              value={barcodeInput}
              onChange={setBarcodeInput}
              onSubmit={handleBarcodeSubmit}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};